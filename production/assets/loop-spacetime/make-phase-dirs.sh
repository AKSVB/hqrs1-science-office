#!/usr/bin/env bash
# Phase-offset views of the 300-frame spacetime-well sequences. render-reel.mjs indexes a bg.sequence from the
# scene's local time, so a card that starts at global frame F would restart the orbit; a "phase/<seq>-<k>" dir
# is the same sequence rotated by k frames (symlinks), so card N shows frame (F + local) mod 300 and the orbit
# runs continuously across cards and closes at the loop seam. Usage: make-phase-dirs.sh <seq-name> <k> [<k>...]
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd); SEQ=$1; shift
for K in "$@"; do
  OUT="$HERE/phase/$SEQ-$K"; rm -rf "$OUT"; mkdir -p "$OUT"
  for i in $(seq 0 299); do j=$(( (i + K) % 300 )); ln -s "../../$SEQ/$(printf f%05d.jpg $j)" "$OUT/$(printf f%05d.jpg $i)"; done
done
echo "phase dirs for $SEQ: $*"
