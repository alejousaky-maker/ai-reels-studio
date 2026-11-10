"""Ground the script in public facts: Wikipedia search + article intro in the video's language (fallback to English).
Only the topic text is sent (to *.wikipedia.org). Offline or no match -> returns None and the writer works without a source."""
from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request

UA = {"User-Agent": "AIReelsStudio/0.3 (local desktop app; fact lookup)"}


def _get(url: str, timeout: float = 8.0) -> dict:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return json.load(r)


def lookup(topic: str, lang: str = "es", max_chars: int = 3500) -> dict | None:
    for lg in ([lang, "en"] if lang != "en" else ["en"]):
        try:
            base = f"https://{lg}.wikipedia.org/w/api.php"
            q = urllib.parse.urlencode({"action": "query", "list": "search", "srsearch": topic, "srlimit": 3, "format": "json"})
            hits = _get(f"{base}?{q}").get("query", {}).get("search", [])
            if not hits:
                continue
            title = hits[0]["title"]
            q2 = urllib.parse.urlencode({"action": "query", "prop": "extracts", "explaintext": 1, "exsectionformat": "plain", "titles": title,
                                         "format": "json", "redirects": 1})
            pages = _get(f"{base}?{q2}").get("query", {}).get("pages", {})
            text = next(iter(pages.values()), {}).get("extract", "") or ""
            text = re.sub(r"\n{2,}", "\n", text).strip()
            if len(text) < 200:
                continue
            # keep the intro + the first sections (where the story usually is), cut at a sentence end
            cut = text[:max_chars]
            if len(text) > max_chars and "." in cut:
                cut = cut[: cut.rfind(".") + 1]
            return {"title": title, "lang": lg, "url": f"https://{lg}.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}", "text": cut}
        except Exception:  # noqa
            continue
    return None
