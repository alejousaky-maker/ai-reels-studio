# AI Reels Studio - start the local app (backend + built UI) on http://127.0.0.1:8777 and open the browser.
# Ctrl+C or closing this window stops it. No administrator rights needed.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$py = Join-Path $root ".venv\Scripts\python.exe"
if (-not (Test-Path $py)) { Write-Host "The app is not installed yet. Running install.ps1 first..." -ForegroundColor Yellow; & (Join-Path $root "install.ps1"); if (-not $?) { exit 1 } }
if (-not (Test-Path (Join-Path $root "app\frontend\dist\index.html"))) { Write-Host "UI not built; running install.ps1..." -ForegroundColor Yellow; & (Join-Path $root "install.ps1") }
$env:PATH = "$root\tools\node;$root\tools\git\cmd;$env:PATH"
$env:REMOTION_TMP = "$root\work\remotion-tmp"
$env:PYTHONUTF8 = "1"
New-Item -ItemType Directory -Force "$root\logs", "$root\work\remotion-tmp" | Out-Null
# port 8777 (8765 is often taken by other local tools); if busy, reuse it only when it is our app, else try 8778/8779
$port = $null
foreach ($cand in 8777, 8778, 8779) {
  $busy = Get-NetTCPConnection -LocalPort $cand -State Listen -ErrorAction SilentlyContinue
  if (-not $busy) { $port = $cand; break }
  try { $h = Invoke-RestMethod "http://127.0.0.1:$cand/api/health" -TimeoutSec 2; if ($h.app -eq "ai-reels-studio") { Write-Host "AI Reels Studio is already running on port $cand - opening it." -ForegroundColor Green; Start-Process "http://127.0.0.1:$cand"; exit 0 } } catch {}
}
if (-not $port) { Write-Host "Ports 8777-8779 are used by other programs. Close one of them and try again." -ForegroundColor Red; exit 1 }
Write-Host "Starting AI Reels Studio on http://127.0.0.1:$port (local only)..." -ForegroundColor Cyan
$log = Join-Path $root "logs\backend.log"
$p = Start-Process -FilePath $py -ArgumentList @("-m", "uvicorn", "app.backend.main:app", "--host", "127.0.0.1", "--port", "$port", "--log-level", "warning") `
  -WorkingDirectory $root -RedirectStandardOutput $log -RedirectStandardError "$log.err" -PassThru -WindowStyle Hidden
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Milliseconds 500
  try { $r = Invoke-RestMethod "http://127.0.0.1:$port/api/health" -TimeoutSec 2; if ($r.ok) { break } } catch {}
  if ($p.HasExited) { Write-Host "The backend stopped. See logs\backend.log.err" -ForegroundColor Red; Get-Content "$log.err" -Tail 20; exit 1 }
}
Start-Process "http://127.0.0.1:$port"
Write-Host "Running. Keep this window open; press Ctrl+C (or close it) to stop." -ForegroundColor Green
try { while (-not $p.HasExited) { Start-Sleep -Seconds 1 } }
finally {
  if (-not $p.HasExited) { & taskkill /PID $p.Id /T /F | Out-Null }
  Write-Host "AI Reels Studio stopped."
}

