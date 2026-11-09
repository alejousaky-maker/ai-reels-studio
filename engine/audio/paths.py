import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODELS = os.environ.get("AIRS_MODELS", os.path.join(ROOT, "models"))
AUDIO_TEMPLATE = os.path.join(ROOT, "engine", "audio", "template")
