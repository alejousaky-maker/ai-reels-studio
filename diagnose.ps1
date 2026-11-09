# Writes logs\diagnostics.json (GPU/VRAM, RAM, CPU, disk, tools, models, local AI) and prints problems + fixes.
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$env:PATH = "$root\tools\node;$root\tools\git\cmd;$env:PATH"
if (-not (Test-Path ".venv\Scripts\python.exe")) { Write-Host "Not installed yet: run install.ps1"; exit 1 }
& .venv\Scripts\python.exe -m app.backend.diag
Write-Host "`nSaved to logs\diagnostics.json"
