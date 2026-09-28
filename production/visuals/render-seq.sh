#!/usr/bin/env bash
# Render a plate sequence and grade it to JPEG frames (the repository convention, see production/assets/reel-fire-amoeba/FA-01-seq).
#   render-seq.sh [--space] <out-seq-dir> <frames> <scene> [render-plate args...]
# PNG frames go to a scratch dir, each is graded with the production/assets/grade.sh chain and written as
# <out-seq-dir>/fNNNNN.jpg (quality 3), then the PNGs are deleted. The lower-third check is printed by render-plate.
set -euo pipefail
FFMPEG=${FFMPEG:-/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2}
SPACE=0; if [[ "${1:-}" == "--space" ]]; then SPACE=1; shift; fi
OUT=$1; N=$2; SCENE=$3; shift 3
HERE=$(cd "$(dirname "$0")" && pwd)
TMP=${SEQ_TMP:-/tmp/plate-seq}/$(basename "$OUT")-$$
mkdir -p "$TMP" "$OUT"
node "$HERE/render-plate.mjs" "$SCENE" --frames "$N" --fps 30 --out-dir "$TMP" "$@" 2>&1 | grep -a -v "^ *[0-9]*:" | tail -2
if [[ $SPACE -eq 1 ]]; then
  CURVES="curves=r='0/0.039 0.25/0.24 0.5/0.5 1/1':g='0/0.071 0.25/0.26 0.5/0.5 1/1':b='0/0.141 0.25/0.29 0.5/0.5 1/1'"; SAT=0.90
else
  CURVES="curves=r='0/0.039 0.25/0.245 0.5/0.5 1/1':g='0/0.071 0.25/0.265 0.5/0.5 1/1':b='0/0.141 0.25/0.30 0.5/0.5 1/1'"; SAT=0.82
fi
CHAIN="$CURVES,colorbalance=rs=-0.03:gs=0.0:bs=0.06:rm=0:gm=0:bm=0:rh=0:gh=0:bh=0,eq=saturation=$SAT,vignette=angle=PI/5*0.5:mode=forward,noise=alls=5:allf=u,format=yuvj420p"
for f in "$TMP"/f*.png; do b=$(basename "$f" .png); "$FFMPEG" -y -loglevel error -i "$f" -vf "$CHAIN" -q:v 3 -frames:v 1 -update 1 "$OUT/$b.jpg"; done
rm -rf "$TMP"
echo "graded $N frames -> $OUT (space=$SPACE)"
