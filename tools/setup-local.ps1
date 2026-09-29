# One-time local setup for the hqrs1 science office on Windows 10/11.
# Run from the repo root in PowerShell:  powershell -ExecutionPolicy Bypass -File tools\setup-local.ps1
# Installs the free toolchain the office uses (Node 22, Python 3.11, Git, Playwright Chromium, Piper TTS,
# a static ffmpeg) and runs a smoke render so you know the pipeline works before opening Claude Code.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root
Write-Host "Office root: $root"

function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Winget($id) { winget install --id $id -e --accept-source-agreements --accept-package-agreements --silent | Out-Null }

if (-not (Have winget)) { Write-Host "winget is missing. Install 'App Installer' from the Microsoft Store, then re-run."; exit 1 }
if (-not (Have git))    { Write-Host "Installing Git";        Winget Git.Git }
if (-not (Have node))   { Write-Host "Installing Node.js 22"; Winget OpenJS.NodeJS.LTS }
if (-not (Have python)) { Write-Host "Installing Python 3.11"; Winget Python.Python.3.11 }
# Refresh PATH for this session after installs.
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Node $(node -v), $(python --version), $(git --version)"

Write-Host "Installing Node packages (three.js, Playwright) and the Chromium build Playwright renders with"
npm install --no-audit --no-fund
npm install --no-save playwright@1 | Out-Null
npx playwright install chromium

Write-Host "Installing Python packages (Piper TTS, onnxruntime, static ffmpeg)"
python -m pip install --upgrade pip | Out-Null
python -m pip install piper-tts onnxruntime imageio-ffmpeg

$ffmpeg = python -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())"
Write-Host "ffmpeg: $ffmpeg"
[System.Environment]::SetEnvironmentVariable("FFMPEG", $ffmpeg, "User")
$env:FFMPEG = $ffmpeg

Write-Host "Smoke test 1: carousel slide"
node production/carousel/render.mjs scripts/v2/carousel-youngest-planet-popout.json "$env:TEMP\hqrs1-carousel-test"

Write-Host "Smoke test 2: Piper voice (5 s)"
"The office is running on this machine." | python -m piper -m production/tools/piper/vits-piper-en_US-ryan-medium/en_US-ryan-medium.onnx -f "$env:TEMP\hqrs1-piper-test.wav"
Write-Host "Voice written to $env:TEMP\hqrs1-piper-test.wav"

Write-Host "Smoke test 3: one 3D plate"
node production/visuals/render-plate.mjs tilted-orbit "$env:TEMP\hqrs1-plate-test.png" --var view=wide --var tilt=136 --seed 21 --t 1.0
Write-Host "Plate written to $env:TEMP\hqrs1-plate-test.png"

Write-Host ""
Write-Host "Setup complete. Shell scripts under production/visuals/*.sh need Git Bash (installed with Git):"
Write-Host "  & 'C:\Program Files\Git\bin\bash.exe' production/visuals/render-seq.sh ..."
Write-Host "Next: open Claude Code in this folder and paste the prompt from HANDOFF.md."
