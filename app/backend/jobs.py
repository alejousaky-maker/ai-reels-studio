"""Persistent job queue with ONE worker: GPU stages never overlap (Remotion render, TTS, whisper run one at a time).
Jobs: queued -> running -> done / failed / canceled / awaiting_review. Cancel kills the child process tree."""
from __future__ import annotations

import json
import threading
import time
import traceback
import uuid

from . import db

_q: list[str] = []
_cv = threading.Condition()
_cancel: set[str] = set()
_procs: dict[str, object] = {}
HANDLERS: dict[str, callable] = {}  # type: ignore[valid-type]


def submit(project_id: str | None, kind: str, params: dict) -> dict:
    jid = uuid.uuid4().hex[:12]
    db.ex("INSERT INTO jobs (id, project_id, kind, status, progress, step, message, params, created, log) VALUES (?,?,?,?,?,?,?,?,?,?)",
          (jid, project_id, kind, "queued", 0.0, "", "waiting in queue", json.dumps(params), db.now(), ""))
    with _cv:
        _q.append(jid)
        _cv.notify()
    return get(jid)


def get(jid: str) -> dict | None:
    return db.row(db.q("SELECT * FROM jobs WHERE id=?", (jid,), one=True))


def cancel(jid: str) -> dict | None:
    j = get(jid)
    if not j:
        return None
    if j["status"] == "queued":
        with _cv:
            if jid in _q:
                _q.remove(jid)
        db.ex("UPDATE jobs SET status='canceled', finished=?, message='canceled before start' WHERE id=?", (db.now(), jid))
    elif j["status"] == "running":
        _cancel.add(jid)
        p = _procs.get(jid)
        if p is not None:
            from engine.pipeline import kill_tree
            try:
                kill_tree(p.pid)  # type: ignore[attr-defined]
            except Exception:  # noqa
                pass
    return get(jid)


class Ctx:
    def __init__(self, jid: str):
        self.jid = jid
        self._last = 0.0
        self.step = ""

    def progress(self, step: str, p: float, msg: str = ""):
        self.step = step
        now = time.time()
        line = f"[{time.strftime('%H:%M:%S')}] {step}: {msg}"
        if p < 0:
            db.ex("UPDATE jobs SET step=?, message=?, log=substr(log || ? || char(10), -20000) WHERE id=?", (step, msg, line, self.jid))
            return
        if now - self._last > 0.4 or p >= 1:
            self._last = now
            db.ex("UPDATE jobs SET step=?, progress=?, message=?, log=substr(log || ? || char(10), -20000) WHERE id=?",
                  (step, round(float(p), 4), msg, line, self.jid))

    def cancelled(self) -> bool:
        return self.jid in _cancel

    def register(self, p):
        _procs[self.jid] = p


def _worker():
    while True:
        with _cv:
            while not _q:
                _cv.wait()
            jid = _q.pop(0)
        j = get(jid)
        if not j or j["status"] != "queued":
            continue
        db.ex("UPDATE jobs SET status='running', started=?, message='started' WHERE id=?", (db.now(), jid))
        ctx = Ctx(jid)
        try:
            fn = HANDLERS[j["kind"]]
            res = fn(j["project_id"], j["params"] or {}, ctx)
            status = (res or {}).pop("_status", "done") if isinstance(res, dict) else "done"
            db.ex("UPDATE jobs SET status=?, progress=1, finished=?, result=?, message=? WHERE id=?",
                  (status, db.now(), json.dumps(res, default=str), "finished" if status == "done" else status, jid))
        except Exception as e:  # noqa
            from engine.pipeline import Cancelled
            if isinstance(e, Cancelled) or jid in _cancel:
                db.ex("UPDATE jobs SET status='canceled', finished=?, message='canceled by user (child processes stopped)' WHERE id=?", (db.now(), jid))
            else:
                tb = traceback.format_exc()[-4000:]
                db.ex("UPDATE jobs SET status='failed', finished=?, error=?, message=? WHERE id=?", (db.now(), tb, f"{type(e).__name__}: {str(e)[:400]}", jid))
        finally:
            _cancel.discard(jid)
            _procs.pop(jid, None)


def start():
    threading.Thread(target=_worker, daemon=True, name="job-worker").start()
