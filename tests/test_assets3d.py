"""3D Asset Library: Poly Haven link parsing, local catalogue search, text -> physics spec, API validation (offline: no
downloads, no Blender)."""
import os

import pytest

from engine.assets import polyhaven as PH
from engine import physics as PX

CATALOG = os.path.join(PH.ROOT, "models", "polyhaven", "catalog.json") if hasattr(PH, "ROOT") else ""


@pytest.mark.parametrize("ref,want", [
    ("wooden_crate_01", "wooden_crate_01"),
    ("https://polyhaven.com/a/rubber_duck_toy", "rubber_duck_toy"),
    ("polyhaven.com/a/dirty_football?x=1", "dirty_football"),
    ("  Wooden_Table_02 ", "wooden_table_02"),
])
def test_asset_id_parses_ids_and_links(ref, want):
    assert PH.asset_id(ref) == want


@pytest.mark.parametrize("bad", ["", "../etc/passwd", "https://evil.com/a/x", "a b", "x" * 200])
def test_asset_id_rejects_bad_refs(bad):
    with pytest.raises(PH.PolyHavenError):
        PH.asset_id(bad)


def _have_catalog():
    try:
        return bool(PH.AssetCatalog().load())
    except Exception:
        return False


@pytest.mark.skipif(not _have_catalog(), reason="Poly Haven catalogue not synced yet")
def test_catalog_search_ranks_name_matches():
    hits = PH.AssetCatalog().search("wooden chair", limit=5)
    assert hits and all("chair" in (h["id"] + h["name"]).lower() for h in hits[:3])


@pytest.mark.skipif(not _have_catalog(), reason="Poly Haven catalogue not synced yet")
def test_from_text_builds_a_physics_spec():
    spec, notes = PX.from_text("A ball falls from a table, hits some boxes and returns to where it started")
    ids = [o["id"] for o in spec["objects"]]
    assert any("table" in i for i in ids) and any("football" in i for i in ids)
    assert sum("crate" in i for i in ids) == 3
    table = next(o for o in spec["objects"] if "table" in o["id"])
    assert table["body"] == "passive"
    presets = [e["preset"] for e in spec["events"]]
    assert "IMPULSE" in presets and "RETURN_TO_ORIGIN" in presets
    assert all(o.get("asset") or o.get("procedural") for o in spec["objects"])
    assert notes


@pytest.mark.skipif(not _have_catalog(), reason="Poly Haven catalogue not synced yet")
def test_from_text_spanish_and_fallback():
    spec, notes = PX.from_text("un vaso cae en cámara lenta")
    assert any(o.get("procedural") for o in spec["objects"])          # 'vaso' is not on Poly Haven -> stand-in, said in notes
    assert any("procedural" in n for n in notes)
    assert any(e["preset"] == "SLOW_MOTION_IMPACT" for e in spec["events"])


def test_api_validation():
    from fastapi.testclient import TestClient
    from app.backend.main import app
    c = TestClient(app)
    assert c.post("/api/assets3d/physics", json={}).status_code == 400
    assert c.post("/api/assets3d/physics", json={"text": "x", "quality": "ultra"}).status_code == 422
    assert c.get("/api/assets3d/clips/..%2f..%2fsecret/video").status_code == 404
    names = {p["name"] for p in c.get("/api/assets3d/presets").json()}
    assert {"FALL_AND_BOUNCE", "DOMINO_CHAIN", "RETURN_TO_ORIGIN", "SLOW_MOTION_IMPACT", "CAMERA_ORBIT"} <= names
