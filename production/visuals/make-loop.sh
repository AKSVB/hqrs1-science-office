#!/usr/bin/env bash
# Build a seamless loop sequence (for a loop card, STYLE_BIBLE addendum item 1) from a graded frame sequence.
#   make-loop.sh crossfade <raw-seq-dir> <out-seq-dir> <N> [F=9]
#       raw has at least N+F frames; loop frame j = raw[j+F], and the last F frames cross-fade toward raw[0..F-1],
#       so the last loop frame cuts back to loop frame 0 without a jump (a 0.3 s dissolve at F=9, 30 fps).
#       Use it when the scene is periodic or drifts slowly (tilted-orbit at its 9 s period, eclipse-corona).
#   make-loop.sh pingpong <raw-seq-dir> <out-seq-dir> <N>
#       loop = raw[0..N/2] forward then back to raw[1]; exactly N frames. Use it when the scene's motion is a slow,
#       non-periodic camera drift (protoplanetary-disk), where a dissolve would ghost.
# Both also write <out-seq-dir>-tail/ with the last 45 loop frames renumbered from f00000, for the 1.5 s end card:
# a spec whose scenes end at k*loop - 1.5 s and whose end card uses the tail dir keeps the plate's phase continuous
# through the end card and back to frame 0 of the post.
set -euo pipefail
FFMPEG=${FFMPEG:-/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2}
MODE=$1; RAW=$2; OUT=$3; N=$4; F=${5:-9}
mkdir -p "$OUT"; rm -f "$OUT"/f*.jpg
mapfile -t RAWF < <(ls "$RAW"/f*.jpg | sort)
name() { printf "f%05d.jpg" "$1"; }
if [[ $MODE == crossfade ]]; then
  (( ${#RAWF[@]} >= N + F )) || { echo "need $((N+F)) raw frames, have ${#RAWF[@]}"; exit 1; }
  for ((j=0; j<N; j++)); do
    if (( j < N - F )); then cp "${RAWF[j+F]}" "$OUT/$(name $j)"
    else
      k=$((j-(N-F))); w=$(awk -v k=$k -v F=$F 'BEGIN{printf "%.4f", (k+1)/(F+1)}')
      "$FFMPEG" -y -loglevel error -i "${RAWF[j+F]}" -i "${RAWF[j+F-N]}" -filter_complex "[0][1]blend=all_expr='A*(1-$w)+B*$w'" -q:v 3 -frames:v 1 -update 1 "$OUT/$(name $j)"
    fi
  done
elif [[ $MODE == pingpong ]]; then
  H=$((N/2)); (( ${#RAWF[@]} > H )) || { echo "need $((H+1)) raw frames"; exit 1; }
  j=0
  for ((i=0; i<=H; i++)); do cp "${RAWF[i]}" "$OUT/$(name $j)"; j=$((j+1)); done
  for ((i=H-1; i>=1 && j<N; i--)); do cp "${RAWF[i]}" "$OUT/$(name $j)"; j=$((j+1)); done
else echo "mode crossfade|pingpong"; exit 1; fi
TAIL="$OUT-tail"; mkdir -p "$TAIL"; rm -f "$TAIL"/f*.jpg
for ((k=0; k<45; k++)); do cp "$OUT/$(name $((N-45+k)))" "$TAIL/$(name $k)"; done
echo "loop: $(ls "$OUT" | wc -l) frames -> $OUT; tail: $(ls "$TAIL" | wc -l) frames -> $TAIL"
