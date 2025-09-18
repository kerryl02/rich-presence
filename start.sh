#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$HOME/rich-presence"
NODE_BIN="$(command -v node)"

cd "$APP_DIR"
exec "$NODE_BIN" index.js
