# Mirror the office to a local folder on the D: drive (Windows PowerShell).
# First run: clones the repository. Later runs: pulls the latest commits.
# Usage: right-click > Run with PowerShell, or:  powershell -ExecutionPolicy Bypass -File tools\sync-to-local.ps1
$target = "D:\hqrs1-science-office"
$repo   = "https://github.com/AKSVB/hqrs1-science-office.git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Host "Install Git for Windows first: https://git-scm.com/download/win"; exit 1 }
if (Test-Path (Join-Path $target ".git")) {
  git -C $target pull --ff-only
} else {
  New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
  git clone $repo $target
}
Write-Host "Office mirrored to $target"
