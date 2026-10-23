#!/usr/bin/env bash
# Removes xray-db-helper and its native-messaging host manifests.
set -euo pipefail

HOST_NAME="com.xray.db_helper"

case "$(uname -s)" in
  Darwin) install_dir="$HOME/Library/Application Support/XRAY"
          browser_base="$HOME/Library/Application Support" ;;
  Linux)  install_dir="$HOME/.local/share/xray"
          browser_base="$HOME/.config" ;;
  *) echo "unsupported OS: $(uname -s) (use uninstall.ps1 on Windows)" >&2; exit 1 ;;
esac

for browser in google-chrome chromium microsoft-edge BraveSoftware/Brave-Browser; do
  rm -f "$browser_base/$browser/NativeMessagingHosts/$HOST_NAME.json"
done
rm -f "$install_dir/xray-db-helper" "$install_dir/xray-db-helper.tmp"
rmdir "$install_dir" 2>/dev/null || true
echo "xray-db-helper removed"
