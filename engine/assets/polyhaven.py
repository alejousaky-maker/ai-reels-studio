"""Poly Haven as a permanent 3D asset library (CC0), through the official API only (https://api.polyhaven.com).

PolyHavenClient   GET /assets, /info/{id}, /files/{id}, /categories/{type} with our User-Agent, retries, timeouts.
AssetCatalog      the whole model index cached on disk (models/polyhaven/catalog.json, refreshed at most once a day),
                  searched locally by name / tags / categories (no extra API calls per search).
AssetCache        on-demand downloads (glTF 1k by default; FBX / BLEND when asked): every file size + MD5-checked
                  against the API, stored once per asset (instances reuse the same files), never the whole library.
AssetRegistry     models/polyhaven/registry.json: metadata of every downloaded model (real dimensions in metres,
                  categories, licence, credit, files) so any later video can reuse it by id.
Poly Haven terms: assets are CC0; we identify the app in the User-Agent and credit Poly Haven in credits.txt.

CLI:  python -m engine.assets.polyhaven sync | search <words> | get <id|url> [res] [fmt] | hdri <id> | list"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, "models", "polyhaven")
API = "https://api.polyhaven.com"
UA = {"User-Agent": "AIReelsStudio/0.12 (local video generator; assets credited to Poly Haven)"}
CREDIT = "3D models and HDRIs: Poly Haven (polyhaven.com), CC0"


class PolyHavenError(RuntimeError):
    pass


class PolyHavenClient:
    def __init__(self, retries: int = 3, timeout: int = 60):
        self.retries, self.timeout = retries, timeout

    def _raw(self, url: str) -> bytes:
        err = None
        for k in range(self.retries):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=self.timeout) as r:
                    return r.read()
            except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
                err = e
                time.sleep(1.5 * (k + 1))            # polite back-off, never hammer the service
        raise PolyHavenError(f"download failed after {self.retries} tries: {url} ({err})")

    def json(self, path: str):
        return json.loads(self._raw(API + path))

    def assets(self, kind: str = "models", categories: str | None = None) -> dict:
        return self.json(f"/assets?t={kind}" + (f"&categories={urllib.request.quote(categories)}" if categories else ""))

    def info(self, asset: str) -> dict:
        return self.json(f"/info/{asset}")

    def files(self, asset: str) -> dict:
        return self.json(f"/files/{asset}")

    def categories(self, kind: str = "models") -> dict:
        return self.json(f"/categories/{kind}")


def asset_id(ref: str) -> str:
    """'https://polyhaven.com/a/wooden_crate_01' / 'polyhaven.com/a/x?...' / 'x' -> 'x' (validated)"""
    m = re.search(r"polyhaven\.com/a/([A-Za-z0-9_\-]+)", ref)
    a = (m.group(1) if m else ref.strip()).lower()      # Poly Haven ids are lower-case
    if not re.fullmatch(r"[A-Za-z0-9_\-]{1,80}", a):
        raise PolyHavenError(f"not a Poly Haven asset id or link: {ref!r}")
    return a


class AssetCatalog:
    """the model index, cached locally; searched without hitting the API"""
    def __init__(self, client: PolyHavenClient | None = None):
        self.client = client or PolyHavenClient()
        self.path = os.path.join(LIB, "catalog.json")

    def sync(self, max_age_h: float = 24.0, force: bool = False) -> dict:
        if not force and os.path.exists(self.path) and time.time() - os.path.getmtime(self.path) < max_age_h * 3600:
            return self.load()
        raw = self.client.assets("models")
        cat = {k: {"name": v.get("name", k), "categories": v.get("categories", []), "tags": v.get("tags", []),
                   "dims_m": [round(d / 1000.0, 4) for d in (v.get("dimensions") or [])], "polycount": v.get("polycount"),
                   "thumb": v.get("thumbnail_url")} for k, v in raw.items()}
        os.makedirs(LIB, exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(cat, f)
        return cat

    def load(self) -> dict:
        if not os.path.exists(self.path):
            return self.sync()
        return json.load(open(self.path, encoding="utf-8"))

    def search(self, query: str, category: str | None = None, limit: int = 12) -> list[dict]:
        words = [w for w in re.findall(r"[a-z0-9]+", query.lower()) if len(w) > 1]
        out = []
        for k, v in self.load().items():
            if category and category not in v["categories"]:
                continue
            hay_name = (k + " " + v["name"]).lower()
            hay_tags = " ".join(v["tags"] + v["categories"]).lower()
            score = sum(3 if w in hay_name else 1 if w in hay_tags else 0 for w in words)
            if score:
                out.append({"id": k, "score": score, **v})
        out.sort(key=lambda r: (-r["score"], r["polycount"] or 1e9))
        return out[:limit]


class AssetRegistry:
    def __init__(self):
        self.path = os.path.join(LIB, "registry.json")

    def all(self) -> dict:
        return json.load(open(self.path, encoding="utf-8")) if os.path.exists(self.path) else {}

    def get(self, asset: str) -> dict | None:
        return self.all().get(asset)

    def put(self, asset: str, entry: dict):
        reg = self.all()
        reg[asset] = entry
        os.makedirs(LIB, exist_ok=True)
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(reg, f, indent=1)
        os.replace(tmp, self.path)


class AssetCache:
    """on-demand, verified downloads; one copy per asset/resolution/format"""
    def __init__(self, client: PolyHavenClient | None = None):
        self.client = client or PolyHavenClient()
        self.registry = AssetRegistry()

    def _save(self, url: str, dst: str, size: int | None, md5: str | None):
        if os.path.exists(dst) and (size is None or os.path.getsize(dst) == size):
            return
        data = self.client._raw(url)
        if size is not None and len(data) != size:
            raise PolyHavenError(f"size mismatch for {url}")
        if md5 and hashlib.md5(data).hexdigest() != md5:
            raise PolyHavenError(f"MD5 mismatch for {url}")
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst + ".part", "wb") as f:
            f.write(data)
        os.replace(dst + ".part", dst)

    def model(self, ref: str, res: str = "1k", fmt: str = "gltf") -> dict:
        """download (if needed) and register a model; returns its registry entry (path = the file to import)"""
        a = asset_id(ref)
        reg = self.registry.get(a)
        if reg and reg.get("res") == res and reg.get("format") == fmt and os.path.exists(os.path.join(ROOT, reg["path"])):
            return reg
        files = self.client.files(a)
        if fmt not in files:
            raise PolyHavenError(f"{a} has no {fmt} file (available: {', '.join(k for k in files if k in ('gltf', 'fbx', 'blend', 'usd'))})")
        by_res = files[fmt]
        r = res if res in by_res else sorted(by_res, key=lambda x: int(re.sub(r"\D", "", x) or 0))[0]
        main = by_res[r][fmt]
        dst_dir = os.path.join(LIB, a)
        for rel, meta in (main.get("include") or {}).items():
            p = os.path.normpath(os.path.join(dst_dir, rel))
            if not p.startswith(os.path.normpath(dst_dir)):
                raise PolyHavenError(f"unsafe path in {a}: {rel}")
            self._save(meta["url"], p, meta.get("size"), meta.get("md5"))
        ext = os.path.splitext(main["url"])[1]
        mainp = os.path.join(dst_dir, f"{a}_{r}{ext}")
        self._save(main["url"], mainp, main.get("size"), main.get("md5"))
        info = self.client.info(a)
        entry = {"id": a, "name": info.get("name", a), "source": "Poly Haven", "license": "CC0", "credit": CREDIT,
                 "url": f"https://polyhaven.com/a/{a}", "format": fmt, "res": r, "path": os.path.relpath(mainp, ROOT).replace("\\", "/"),
                 "dims_m": [round(d / 1000.0, 4) for d in (info.get("dimensions") or [])], "categories": info.get("categories", []),
                 "tags": info.get("tags", []), "polycount": info.get("polycount"), "downloaded": time.strftime("%Y-%m-%d %H:%M:%S")}
        self.registry.put(a, entry)
        return entry

    def hdri(self, ref: str, res: str = "1k") -> str:
        a = asset_id(ref)
        dst = os.path.join(LIB, "hdri", f"{a}_{res}.hdr")
        if os.path.exists(dst):
            return dst
        f = self.client.files(a)
        meta = f["hdri"][res if res in f["hdri"] else "1k"]["hdr"]
        self._save(meta["url"], dst, meta.get("size"), meta.get("md5"))
        return dst


def ensure(asset: str, res: str = "1k") -> str:
    """absolute path of a model, downloading it on first use (raises when Poly Haven does not have it)"""
    e = AssetCache().model(asset, res)
    return os.path.join(ROOT, e["path"])


def _main(argv: list[str]):
    if not argv:
        print(__doc__); return
    cmd, rest = argv[0], argv[1:]
    if cmd == "sync":
        print(len(AssetCatalog().sync(force=True)), "models indexed")
    elif cmd == "search":
        for r in AssetCatalog().search(" ".join(rest)):
            print(f"{r['id']:32s} {r['name']:30s} {','.join(r['categories'])[:40]:40s} {r['dims_m']}")
    elif cmd == "get":
        print(json.dumps(AssetCache().model(rest[0], *(rest[1:3])), indent=1))
    elif cmd == "hdri":
        print(AssetCache().hdri(rest[0]))
    elif cmd == "list":
        for k, v in AssetRegistry().all().items():
            print(f"{k:32s} {v['format']} {v['res']} {v['dims_m']}")


if __name__ == "__main__":
    _main(sys.argv[1:])
