"""SQLite persistence with simple numbered migrations."""
from __future__ import annotations

import json
import os
import sqlite3
import threading
from datetime import datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DB = os.environ.get("AIRS_DB", os.path.join(ROOT, "data", "studio.db"))
_lock = threading.RLock()

MIGRATIONS = [
    """CREATE TABLE projects (id TEXT PRIMARY KEY, title TEXT, kind TEXT, lang TEXT, style TEXT, client_id TEXT, status TEXT,
        quality TEXT, duration REAL, created TEXT, updated TEXT, archived INTEGER DEFAULT 0, parent_id TEXT, params TEXT);
       CREATE TABLE jobs (id TEXT PRIMARY KEY, project_id TEXT, kind TEXT, status TEXT, progress REAL, step TEXT, message TEXT,
        params TEXT, result TEXT, error TEXT, created TEXT, started TEXT, finished TEXT, log TEXT);
       CREATE TABLE clients (id TEXT PRIMARY KEY, name TEXT, primary_color TEXT, secondary_color TEXT, text_color TEXT, tagline TEXT,
        font TEXT, cta TEXT, claims TEXT, logo TEXT, notes TEXT, created TEXT);
       CREATE TABLE assets (id TEXT PRIMARY KEY, client_id TEXT, kind TEXT, filename TEXT, path TEXT, license TEXT, source TEXT,
        sha256 TEXT, size INTEGER, created TEXT);
       CREATE TABLE reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT, video TEXT, approved INTEGER, scores TEXT,
        notes TEXT, created TEXT);""",
]


def now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def conn() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB, check_same_thread=False, timeout=10)
    c.row_factory = sqlite3.Row
    return c


def migrate():
    with _lock, conn() as c:
        c.execute("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT)")
        r = c.execute("SELECT v FROM meta WHERE k='schema'").fetchone()
        v = int(r["v"]) if r else 0
        for i in range(v, len(MIGRATIONS)):
            c.executescript(MIGRATIONS[i])
            c.execute("INSERT OR REPLACE INTO meta VALUES ('schema', ?)", (str(i + 1),))
        # jobs left running by a crash/stop are not running any more
        c.execute("UPDATE jobs SET status='failed', error='interrupted (app was closed during the job)', finished=? WHERE status IN ('running','queued')", (now(),))


def q(sql: str, args=(), one=False):
    with _lock, conn() as c:
        cur = c.execute(sql, args)
        rows = [dict(r) for r in cur.fetchall()]
    return (rows[0] if rows else None) if one else rows


def ex(sql: str, args=()):
    with _lock, conn() as c:
        c.execute(sql, args)


def row(d: dict | None, json_fields=("params", "result", "claims", "scores")) -> dict | None:
    if d is None:
        return None
    for k in json_fields:
        if k in d and isinstance(d[k], str) and d[k]:
            try:
                d[k] = json.loads(d[k])
            except Exception:  # noqa
                pass
    return d
