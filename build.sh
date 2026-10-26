#!/bin/sh
# Builds CCG Blocks into ./dist
# Requires: git, Node.js 20 or later, internet access (npm, github.com, downloads.scratch.mit.edu)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
SCRATCH_GUI_COMMIT="$(cat "$ROOT/SCRATCH_GUI_COMMIT")"
WORK="$ROOT/work/scratch-gui"

if [ ! -d "$WORK/.git" ]; then
  mkdir -p "$ROOT/work"
  git clone https://github.com/scratchfoundation/scratch-gui.git "$WORK"
fi
cd "$WORK"
git fetch origin "$SCRATCH_GUI_COMMIT" --depth 1 2>/dev/null || git fetch origin
git checkout --force "$SCRATCH_GUI_COMMIT"
git clean -fd src static

npm ci --no-audit --no-fund
node "$ROOT/scripts/apply-patches.js" "$WORK"
CI=1 NODE_ENV=production NODE_OPTIONS=--max-old-space-size=5500 npm run build

# Assemble the deployable folder: the editor page, its bundles, static files and the About page.
rm -rf "$ROOT/dist"
mkdir -p "$ROOT/dist"
cp build/index.html build/gui.js "$ROOT/dist/"
[ -f build/gui.js.LICENSE.txt ] && cp build/gui.js.LICENSE.txt "$ROOT/dist/"
cp build/extension-worker.js "$ROOT/dist/" 2>/dev/null || true
cp -r build/static "$ROOT/dist/static"
cp -r build/chunks "$ROOT/dist/chunks"
find "$ROOT/dist" -name "*.map" -delete
cp "$ROOT/site/about.html" "$ROOT/dist/"
echo "CCG Blocks built in $ROOT/dist"
