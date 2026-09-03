#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/css" "$DIST_DIR/js" "$DIST_DIR/assets/recorrido"

cp "$ROOT_DIR/index.html" "$DIST_DIR/index.html"
cp "$ROOT_DIR/css/styles.css" "$DIST_DIR/css/styles.css"
cp "$ROOT_DIR/js/app.js" "$DIST_DIR/js/app.js"
cp "$ROOT_DIR/assets/recorrido/"*.webp "$DIST_DIR/assets/recorrido/"
cp "$ROOT_DIR/CNAME" "$DIST_DIR/CNAME"
touch "$DIST_DIR/.nojekyll"

printf 'Static site built in %s\n' "$DIST_DIR"
