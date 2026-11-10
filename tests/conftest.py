import os
import sys
import tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
_TMP = tempfile.mkdtemp(prefix="airs-test-")
# isolate the database and project folders BEFORE the app modules are imported
os.environ.setdefault("AIRS_DB", os.path.join(_TMP, "test.db"))
os.environ.setdefault("AIRS_PROJECTS", os.path.join(_TMP, "projects"))
os.environ.setdefault("AIRS_IMAGES", os.path.join(_TMP, "images"))
os.makedirs(os.environ["AIRS_PROJECTS"], exist_ok=True)
os.environ["PATH"] = os.path.join(ROOT, "tools", "node") + os.pathsep + os.environ.get("PATH", "")
