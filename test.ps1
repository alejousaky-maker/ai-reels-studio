# AI Reels Studio - test suite: Python unit/API tests, engine typecheck, UI typecheck + build, and (optional) a real
# render smoke test that produces a short MP4 and checks it with ffprobe.
#   powershell -ExecutionPolicy Bypass -File test.ps1            (fast, ~30 s)
#   powershell -ExecutionPolicy Bypass -File test.ps1 -Render    (+ real GPU render of the 13 s demo, ~1 min)
param([switch]$Render)
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$env:PATH = "$root\tools\node;$root\tools\git\cmd;$env:PATH"; $env:PYTHONUTF8 = "1"
$fail = 0
function T($name, [scriptblock]$b) { Write-Host "`n== $name" -ForegroundColor Cyan; & $b; if ($LASTEXITCODE -ne 0) { Write-Host "   FAILED: $name" -ForegroundColor Red; $script:fail++ } else { Write-Host "   passed" -ForegroundColor Green } }
T "pytest (story contract, schema, audio DSP, QA detectors, API security/persistence)" { & .venv\Scripts\python.exe -m pytest -q tests -p no:warnings }
T "engine typecheck (tsc)" { Push-Location engine\remotion; cmd /c "npx tsc --noEmit"; $c = $LASTEXITCODE; Pop-Location; $global:LASTEXITCODE = $c }
T "UI typecheck + build" { Push-Location app\frontend; cmd /c "npm run build >nul"; $c = $LASTEXITCODE; Pop-Location; $global:LASTEXITCODE = $c }
if ($Render) {
  T "real render smoke test (13 s demo storyboard, 540x960)" {
    Push-Location engine\remotion
    cmd /c "node_modules\.bin\esbuild src/videos/story/demo.ts --format=esm --outfile=..\..\work\demo.mjs --log-level=error"
    cmd /c "node -e ""import('file:///$($root -replace '\\','/')/work/demo.mjs').then(m=>require('fs').writeFileSync('../../work/demo_sb.json', JSON.stringify(m.DEMO_STORYBOARD)))"""
    cmd /c "node scripts/engine.mjs render ..\..\work\demo_sb.json ..\..\work\smoke.mp4 --scale 0.5 --crf 23" | Select-String '"done"|"error"'
    Pop-Location
    $p = ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,nb_frames -of csv=p=0 work\smoke.mp4
    Write-Host "   ffprobe: $p"
    $global:LASTEXITCODE = [int](("$p".Trim().TrimEnd(',')) -ne "h264,540,960,390")
  }
}
Write-Host ""
if ($fail) { Write-Host "$fail test group(s) failed" -ForegroundColor Red; exit 1 } else { Write-Host "All test groups passed" -ForegroundColor Green }
