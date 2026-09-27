#!/usr/bin/env bash
# House grade for generated stills (storyboards/README.md, "Note to the Graphics desk: grading";
# strategy/STYLE_BIBLE.md section 6.4). One ffmpeg chain applied identically to every still.
#
#   grade.sh [--space] <post-dir> <filename>     grade one still: <post-dir>/raw/<filename> -> <post-dir>/<filename>
#   grade.sh [--space] --all <post-dir>          grade every PNG in <post-dir>/raw/
#   grade.sh --check <png>                       print mean luminance of the lower third (must be < 12 %)
#
# If <post-dir>/raw/<filename> does not exist yet, the ungraded <post-dir>/<filename> is moved there first,
# so the original is always kept.
#
# The chain:
#   curves       lifts the black point to #0a1224 (10,18,36): each channel's 0 maps to its component; the
#                shadow toe carries a small blue shift (about +6 blue, -3 red at the 25 % point) and midtones
#                and highlights stay neutral (0.5 -> 0.5, 1 -> 1).
#   colorbalance a second, gentle cool push in the shadows only (rs -0.03, bs +0.06); mids and highs untouched.
#   eq           saturation capped at 0.82 so nothing but the one warm source outruns the cyan accent (#4fe3f0).
#   vignette     6 percent edge darkening (angle PI/5 * 0.06-equivalent falloff, expressed as a mild vignette).
#   noise        2 percent fine monochrome grain (alls=5 on a 0..255 scale is about 2 %, temporal flag off
#                because these are stills, 'u' keeps it uniform).
#
# --space (YP-01 to YP-06): the exception in the README. The black of deep space is not lifted above #0a1224
#   (the curve still sets 0 -> #0a1224 but the toe is straight, so nothing above true black is raised further),
#   and the saturation cap is loosened to 0.9 so the Earth's white-blue daylight limb keeps its cool highlight.
set -euo pipefail

FFMPEG=${FFMPEG:-/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2}

SPACE=0
MODE=one
while [[ $# -gt 0 ]]; do
  case "$1" in
    --space) SPACE=1; shift ;;
    --all)   MODE=all; shift ;;
    --check) MODE=check; shift ;;
    *) break ;;
  esac
done

# Black point #0a1224 = (10, 18, 36) -> (0.039, 0.071, 0.141)
if [[ $SPACE -eq 1 ]]; then
  # straight toe: deep space stays exactly at the lifted black, no extra lift above it
  CURVES="curves=r='0/0.039 0.25/0.24 0.5/0.5 1/1':g='0/0.071 0.25/0.26 0.5/0.5 1/1':b='0/0.141 0.25/0.29 0.5/0.5 1/1'"
  SAT=0.90
else
  # lifted toe with the cool shift: about -3 red, +6 blue at the quarter tone
  CURVES="curves=r='0/0.039 0.25/0.245 0.5/0.5 1/1':g='0/0.071 0.25/0.265 0.5/0.5 1/1':b='0/0.141 0.25/0.30 0.5/0.5 1/1'"
  SAT=0.82
fi

CHAIN="$CURVES,colorbalance=rs=-0.03:gs=0.0:bs=0.06:rm=0:gm=0:bm=0:rh=0:gh=0:bh=0,eq=saturation=$SAT,vignette=angle=PI/5*0.5:mode=forward,noise=alls=5:allf=u,format=rgb24"

grade_one() {
  local dir="$1" name="$2"
  mkdir -p "$dir/raw"
  if [[ ! -f "$dir/raw/$name" ]]; then
    [[ -f "$dir/$name" ]] || { echo "missing $dir/$name" >&2; return 1; }
    mv "$dir/$name" "$dir/raw/$name"
  fi
  "$FFMPEG" -y -loglevel error -i "$dir/raw/$name" -vf "$CHAIN" -frames:v 1 -update 1 "$dir/$name"
  echo "graded $dir/$name (space=$SPACE)"
}

check_lower_third() {
  # mean luma of the bottom third, reported as a percentage of full scale
  local f="$1" mean
  mean=$("$FFMPEG" -loglevel info -i "$f" -vf "crop=iw:ih/3:0:ih*2/3,format=gray,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null - 2>&1 | grep -oE 'YAVG=[0-9.]+' | head -1 | cut -d= -f2)
  awk -v m="$mean" -v f="$f" 'BEGIN{printf "%s lower-third luminance %.1f%% %s\n", f, m/255*100, (m/255<0.12?"OK":"OVER 12%")}'
}

case "$MODE" in
  one)   grade_one "$1" "$2" ;;
  all)   for f in "$1"/raw/*.png; do grade_one "$1" "$(basename "$f")"; done ;;
  check) for f in "$@"; do check_lower_third "$f"; done ;;
esac
