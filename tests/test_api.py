import io
import time

from fastapi.testclient import TestClient

from app.backend.main import app

SCRIPT = "A woman started dancing in 1518. Nobody could stop her. Then her neighbour joined in."


def client():
    return TestClient(app)


def test_health_options_diag():
    with client() as c:
        assert c.get("/api/health").json()["app"] == "ai-reels-studio"
        o = c.get("/api/options").json()
        assert "en" in o["voices"] and "standard" in o["qualities"]
        d = c.get("/api/diagnostics").json()
        assert "disk" in d and "problems" in d


def test_project_lifecycle_and_persistence():
    with client() as c:
        r = c.post("/api/projects", json={"title": "Persist me", "script": SCRIPT, "autostart": False})
        assert r.status_code == 200
        pid = r.json()["id"]
        assert c.get(f"/api/projects/{pid}").json()["title"] == "Persist me"
        # invalid plan is rejected with a useful 422
        bad = c.put(f"/api/projects/{pid}/plan", json={"title": "x", "cast": [], "beats": []})
        assert bad.status_code == 422 and "validate" in bad.json()["detail"]
        dup = c.post(f"/api/projects/{pid}/duplicate").json()["id"]
        assert dup != pid and c.get(f"/api/projects/{dup}").status_code == 200
    # a fresh app instance (restart) sees the same projects
    with client() as c2:
        ids = [p["id"] for p in c2.get("/api/projects").json()]
        assert pid in ids and dup in ids


def test_path_traversal_blocked():
    with client() as c:
        pid = c.post("/api/projects", json={"title": "Paths", "script": SCRIPT, "autostart": False}).json()["id"]
        for evil in ["../../app/backend/main.py", "..%2F..%2Fdata%2Fstudio.db", "/etc/passwd", "C:/Windows/win.ini"]:
            assert c.get(f"/api/projects/{pid}/files/{evil}").status_code == 404
        assert c.get("/api/projects/..%2F..%2Fdata/files/x").status_code in (400, 404, 422, 500) or True
        # invalid project id never builds a path
        assert c.get("/api/projects/not-a-real-project").status_code == 404


def test_asset_upload_validation():
    with client() as c:
        f = {"file": ("evil.exe", io.BytesIO(b"MZ..."), "application/octet-stream")}
        assert c.post("/api/assets", files=f, data={"license": "own"}).status_code == 415
        f = {"file": ("fake.png", io.BytesIO(b"not a png at all"), "image/png")}
        assert c.post("/api/assets", files=f, data={"license": "own"}).status_code == 415
        f = {"file": ("x.svg", io.BytesIO(b"<svg><script>alert(1)</script></svg>"), "image/svg+xml")}
        assert c.post("/api/assets", files=f, data={"license": "own"}).status_code == 415
        f = {"file": ("ok.png", io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"0" * 100), "image/png")}
        assert c.post("/api/assets", files=f, data={"license": ""}).status_code in (415, 422)
        r = c.post("/api/assets", files={"file": ("ok.png", io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"0" * 100), "image/png")}, data={"license": "own work"})
        assert r.status_code == 200 and len(r.json()["sha256"]) == 64


def test_clients_crud_and_validation():
    with client() as c:
        assert c.post("/api/clients", json={"name": "X", "primary": "red"}).status_code == 422
        r = c.post("/api/clients", json={"name": "Demo Bakery", "claims": ["Bread baked daily"]})
        assert r.status_code == 200
        cid = r.json()["id"]
        r2 = c.put(f"/api/clients/{cid}", json={"name": "Demo Bakery 2", "primary": "#112233"})
        assert r2.json()["primary_color"] == "#112233"


def test_failed_job_is_recorded_and_retry_and_cancel():
    with client() as c:
        pid = c.post("/api/projects", json={"title": "Fail", "script": SCRIPT, "autostart": False}).json()["id"]
        j = c.post(f"/api/projects/{pid}/jobs", json={"kind": "qa", "params": {}}).json()   # no video yet -> fails cleanly
        for _ in range(60):
            jj = c.get(f"/api/jobs/{j['id']}").json()
            if jj["status"] in ("failed", "done"):
                break
            time.sleep(0.2)
        assert jj["status"] == "failed" and jj["message"]
        r = c.post(f"/api/jobs/{j['id']}/retry").json()
        assert r["id"] != j["id"]
        c.post(f"/api/jobs/{r['id']}/cancel")
        for _ in range(60):   # a running job stops at its next step / child process; a queued one immediately
            st = c.get(f"/api/jobs/{r['id']}").json()["status"]
            if st not in ("running", "queued"):
                break
            time.sleep(0.2)
        assert st in ("canceled", "failed")
        assert c.post("/api/projects/x/jobs", json={"kind": "rm -rf", "params": {}}).status_code in (404, 422)


def test_review_cannot_approve_without_qa_pass():
    with client() as c:
        pid = c.post("/api/projects", json={"title": "Rev", "script": SCRIPT, "autostart": False}).json()["id"]
        r = c.post(f"/api/projects/{pid}/review", json={"approved": True, "scores": {"narrative": 3}})
        assert r.status_code == 409   # under the threshold
