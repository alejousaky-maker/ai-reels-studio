# Security model

- **Local only**: the API binds to `127.0.0.1` (ports 8777-8779); CORS allows only localhost origins. No login, no remote access.
- **No shell with user text**: every external program (node, ffmpeg, ffprobe, taskkill) runs with an argument list
  (`subprocess` without `shell=True`). Project ids are validated with a strict regex before any path is built.
- **Path safety**: project files are served only if the resolved real path is inside that project's folder
  (tested against `../`, encoded traversal, absolute Windows/Unix paths).
- **Uploads**: extension allow-list (PNG/JPG/SVG/WAV/MP3/MP4/GLB/GLTF/TTF/OTF), magic-byte check, 200 MB limit,
  SVGs with scripts refused, glTF must parse as JSON, filenames sanitised and prefixed with a random id, SHA-256 recorded.
  Uploaded files are never executed or imported as code. A license/rights text is mandatory.
- **Secrets**: none are needed. No API keys are stored or logged. Paid services (ElevenLabs etc.) are not wired in.
- **Cancellation** kills the whole child-process tree (`taskkill /T`), so no orphan Chrome/ffmpeg keep running.
- **Cache cleaning** deletes only `work/remotion-tmp/*` and old `work/bundles/*` created by this app, and refuses while a job runs.
- **Publishing**: the app never uploads anything to YouTube/TikTok/Instagram or any other service.
- Downloads at install time are pinned; Node and the Kokoro model files are SHA-256 verified.
