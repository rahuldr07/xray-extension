param(
  [string]$OutDir = "release"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$manifest = Get-Content "manifest.json" -Raw | ConvertFrom-Json
$version = $manifest.version
$stage = Join-Path $OutDir "xray-extension-$version"
$zip = Join-Path $OutDir "xray-extension-$version.zip"

$allowList = @(
  "manifest.json",
  "background.js",
  "window.html",
  "content",
  "devtools",
  "dist",
  "icons",
  "panel",
  "settings",
  "shared",
  "workers"
)

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
if (Test-Path $zip) { Remove-Item $zip -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

foreach ($item in $allowList) {
  if (-not (Test-Path $item)) { throw "Release allowlist item missing: $item" }
  Copy-Item $item -Destination $stage -Recurse -Force
}

$forbidden = @("node_modules", ".git", "src", "test", "docs", "output", "preview", "release")
foreach ($item in $forbidden) {
  if (Test-Path (Join-Path $stage $item)) { throw "Forbidden item copied into release: $item" }
}

Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -CompressionLevel Optimal
Write-Host "Packaged $zip"
