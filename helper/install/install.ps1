# Installs xray-db-helper and registers it as a Chrome/Edge native-messaging host.
#
#   install.ps1 [-Binary PATH] [-Version helper-vX.Y.Z]
#
# Without -Binary it downloads the release binary and verifies it against the
# release's SHA256SUMS before installing anything.
param(
  [string]$Binary = '',
  [string]$Version = ''
)
$ErrorActionPreference = 'Stop'

$XrayExtensionId = 'kjfoocnkoajdcjabnadfojdfaghpbeep'
$HostName = 'com.xray.db_helper'
$Repo = 'rahuldr07/xray-extension'

$arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'amd64' }
$installDir = Join-Path $env:LOCALAPPDATA 'XRAY'
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

$tmp = Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
try {
  if (-not $Binary) {
    $name = "xray-db-helper-windows-$arch.exe"
    if (-not $Version) {
      $releases = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases?per_page=100"
      $Version = ($releases | Where-Object { $_.tag_name -like 'helper-v*' } | Select-Object -First 1).tag_name
      if (-not $Version) { throw 'could not find a helper-v* release' }
    }
    $base = "https://github.com/$Repo/releases/download/$Version"
    Invoke-WebRequest "$base/$name" -OutFile (Join-Path $tmp $name)
    Invoke-WebRequest "$base/SHA256SUMS" -OutFile (Join-Path $tmp 'SHA256SUMS')
    $line = Get-Content (Join-Path $tmp 'SHA256SUMS') |
      Where-Object { ($_ -split '\s+')[1] -in @($name, "*$name") } | Select-Object -First 1
    if (-not $line) { throw "no checksum for $name in SHA256SUMS" }
    $want = ($line -split '\s+')[0].ToLower()
    $got = (Get-FileHash (Join-Path $tmp $name) -Algorithm SHA256).Hash.ToLower()
    if ($got -ne $want) { throw "checksum mismatch for ${name}: refusing to install" }
    $Binary = Join-Path $tmp $name
  }
  if (-not (Test-Path $Binary)) { throw "binary not found: $Binary" }

  $dest = Join-Path $installDir 'xray-db-helper.exe'
  Copy-Item $Binary $dest -Force

  $manifestPath = Join-Path $installDir "$HostName.json"
  $manifest = [ordered]@{
    name            = $HostName
    description     = 'XRAY database helper'
    path            = $dest
    type            = 'stdio'
    allowed_origins = @("chrome-extension://$XrayExtensionId/")
  }
  $manifest | ConvertTo-Json | Set-Content -Path $manifestPath -Encoding ascii

  foreach ($vendor in @('Google\Chrome', 'Microsoft\Edge')) {
    $key = "HKCU:\Software\$vendor\NativeMessagingHosts\$HostName"
    New-Item -Path $key -Force | Out-Null
    Set-ItemProperty -Path $key -Name '(default)' -Value $manifestPath
  }
  Write-Host "installed $dest"
} finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
