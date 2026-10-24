# Removes xray-db-helper, its host manifest and the registry entries.
$ErrorActionPreference = 'Stop'
$HostName = 'com.xray.db_helper'

foreach ($vendor in @('Google\Chrome', 'Microsoft\Edge')) {
  Remove-Item -Path "HKCU:\Software\$vendor\NativeMessagingHosts\$HostName" -Recurse -Force -ErrorAction SilentlyContinue
}
$installDir = Join-Path $env:LOCALAPPDATA 'XRAY'
Remove-Item -Path (Join-Path $installDir 'xray-db-helper.exe') -Force -ErrorAction SilentlyContinue
Remove-Item -Path (Join-Path $installDir "$HostName.json") -Force -ErrorAction SilentlyContinue
if ((Test-Path $installDir) -and -not (Get-ChildItem $installDir -Force)) { Remove-Item -Path $installDir -Force }
Write-Host 'xray-db-helper removed'
