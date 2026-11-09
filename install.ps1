# AI Reels Studio - idempotent installer (safe to run again; skips what is already there). No administrator rights.
# Everything goes inside this folder: portable Node LTS, Python 3.12 venv (via uv), npm packages, Kenney CC0 models,
# Kokoro TTS model. Only FFmpeg and uv are installed per-user with winget if they are missing.
# Internet is needed only the first time. Downloads are pinned and hash-checked where the provider publishes hashes.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$NODE_VER = "v24.22.2"
$KOKORO = @(
  @{ f = "kokoro-v1.0.onnx"; sha = "7D5DF8ECF7D4B1878015A32686053FD0EEBE2BC377234608764CC0EF3636A6C5" },
  @{ f = "voices-v1.0.bin"; sha = "BCA610B8308E8D99F32E6FE4197E7EC01679264EFED0CAC9140FE9C29F1FBF7D" })
function Step($t) { Write-Host "`n== $t" -ForegroundColor Cyan }
function Ok($t) { Write-Host "   ok  $t" -ForegroundColor Green }
New-Item -ItemType Directory -Force tools, models, logs, data, projects, work\remotion-tmp, work\npm-cache, work\uv-cache | Out-Null

Step "Disk space"
$free = [math]::Round((Get-PSDrive ((Get-Item $root).PSDrive.Name)).Free / 1GB, 1)
if ($free -lt 15) { Write-Host "   Only $free GB free on this drive. Install on a drive with 15+ GB free (renders and caches grow)." -ForegroundColor Red; exit 1 }
Ok "$free GB free"

Step "Node.js $NODE_VER (portable, inside tools\node)"
if (-not (Test-Path "tools\node\node.exe")) {
  $z = "node-$NODE_VER-win-x64.zip"; $dl = "work\$z"
  curl.exe -sSL -o $dl "https://nodejs.org/dist/$NODE_VER/$z"
  $sum = ((curl.exe -sSL "https://nodejs.org/dist/$NODE_VER/SHASUMS256.txt") -split "`n" | Where-Object { $_ -match [regex]::Escape($z) }) -split '\s+' | Select-Object -First 1
  if ((Get-FileHash $dl -Algorithm SHA256).Hash.ToLower() -ne $sum) { throw "Node download hash mismatch" }
  Expand-Archive $dl tools -Force; Rename-Item "tools\node-$NODE_VER-win-x64" node; Remove-Item $dl
}
Ok (& tools\node\node.exe --version)
$env:PATH = "$root\tools\node;$env:PATH"; $env:npm_config_cache = "$root\work\npm-cache"

Step "FFmpeg"
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Write-Host "   FFmpeg not found: installing for this user with winget (Gyan.FFmpeg)..."
  winget install --id Gyan.FFmpeg -e --scope user --accept-source-agreements --silent
  Write-Host "   Close and reopen this window after the install so PATH includes ffmpeg, then run install.ps1 again." -ForegroundColor Yellow
  exit 1
}
Ok ((ffmpeg -version | Select-Object -First 1))

Step "Python 3.12 environment (.venv)"
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  Write-Host "   uv not found: installing for this user with winget (astral-sh.uv)..."
  winget install --id astral-sh.uv -e --scope user --accept-source-agreements --silent
  $env:PATH = "$env:USERPROFILE\.local\bin;$env:PATH"
}
$env:UV_CACHE_DIR = "$root\work\uv-cache"; $env:UV_PYTHON_INSTALL_DIR = "$root\tools\python"
if (-not (Test-Path ".venv\Scripts\python.exe")) { uv venv --python 3.12 .venv }
uv pip install --python .venv\Scripts\python.exe -r requirements.lock.txt --quiet
Ok (& .venv\Scripts\python.exe --version)

Step "Render engine (Remotion + three.js, pinned lockfile)"
Push-Location engine\remotion
if (-not (Test-Path node_modules\remotion)) { cmd /c "npm ci --no-audit --no-fund" }
Ok "npm packages"
cmd /c "node scripts/get-models.mjs"
Pop-Location

Step "Interface (React + Vite)"
Push-Location app\frontend
if (-not (Test-Path node_modules\react)) { cmd /c "npm ci --no-audit --no-fund" }
cmd /c "npm run build"
Pop-Location
Ok "UI built"

Step "Kokoro-82M voice model (Apache-2.0)"
New-Item -ItemType Directory -Force models\kokoro | Out-Null
foreach ($k in $KOKORO) {
  $p = "models\kokoro\$($k.f)"
  if (-not (Test-Path $p) -or (Get-FileHash $p).Hash -ne $k.sha) {
    curl.exe -sSL -o $p "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$($k.f)"
    if ((Get-FileHash $p).Hash -ne $k.sha) { Remove-Item $p; throw "hash mismatch for $($k.f)" }
  }
  Ok $k.f
}

Step "Speech alignment model (faster-whisper base, downloaded once)"
& .venv\Scripts\python.exe -c "import os,sys;sys.path.insert(0,'.');from engine.audio.align import _whisper;m=_whisper();print('   ok ', 'whisper ready' if m else 'whisper unavailable (fallback timing will be used)')"

Step "Diagnosis"
& .venv\Scripts\python.exe -m app.backend.diag | Out-Null
& .venv\Scripts\python.exe -c "import json;d=json.load(open('logs/diagnostics.json'));print('   GPU:', (d.get('gpu') or {}).get('name'), (d.get('gpu') or {}).get('vramMB'), 'MB');[print('   !', p['what'], '->', p['fix']) for p in d['problems']]"
Write-Host "`nInstall complete. Double-click start.bat to open AI Reels Studio." -ForegroundColor Green
