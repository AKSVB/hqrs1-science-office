#!/usr/bin/env bash
# One-time local setup on Linux or macOS. Run from the repo root: bash tools/setup-local.sh
# Needs: git, node 22 (https://nodejs.org), python3.11+ with pip. Installs the rest.
set -euo pipefail
cd "$(dirname "$0")/.."
node -v; python3 --version
npm install --no-audit --no-fund
npm install --no-save playwright@1 >/dev/null
npx playwright install chromium
python3 -m pip install --upgrade pip >/dev/null
python3 -m pip install piper-tts onnxruntime imageio-ffmpeg
export FFMPEG="$(python3 -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())')"
echo "ffmpeg: $FFMPEG  (add 'export FFMPEG=$FFMPEG' to your shell profile)"
node production/carousel/render.mjs scripts/v2/carousel-youngest-planet-popout.json /tmp/hqrs1-carousel-test
echo "The office is running on this machine." | python3 -m piper -m production/tools/piper/vits-piper-en_US-ryan-medium/en_US-ryan-medium.onnx -f /tmp/hqrs1-piper-test.wav
node production/visuals/render-plate.mjs tilted-orbit /tmp/hqrs1-plate-test.png --var view=wide --var tilt=136 --seed 21 --t 1.0
echo "Setup complete. Open Claude Code in this folder and paste the prompt from HANDOFF.md."
