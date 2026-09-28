#!/usr/bin/env bash
# Renders every plate NEW-SCENES.md lists for the eight new scenes: stills (graded in place with grade.sh) and
# sequences (graded JPEG frames via render-seq.sh). Usage: render-new-scenes.sh stills | seqs
set -euo pipefail
cd "$(dirname "$0")/../.."
RP="node production/visuals/render-plate.mjs"; G=production/assets/grade.sh; A=production/assets
still() { local post=$1 name=$2 scene=$3; shift 3; local dir=$A/$post; mkdir -p "$dir"; $RP "$scene" "$dir/$name.png" "$@" 2>&1 | grep -a -v "^ *[0-9]*:" | tail -1; if [[ "$post" == reel-planet-backwards ]]; then bash $G --space "$dir" "$name.png"; else bash $G "$dir" "$name.png"; fi; }
seq() { local post=$1 id=$2 n=$3; shift 3; local extra=(); if [[ "$post" == reel-planet-backwards ]]; then extra=(--space); fi; bash production/visuals/render-seq.sh "${extra[@]}" "$A/$post/$id-seq" "$n" "$@"; }
case "${1:-stills}" in
stills)
  still reel-betel-teeth BT-02-worn-facet tooth-macro --var view=groove --seed 3 --t 1.0
  still reel-betel-teeth BT-03-two-teeth tooth-macro --var view=pair --seed 5 --t 2.0
  still reel-avatar-bci AB-02-avatar-hand decoder-screen --var view=hand --seed 2 --t 1.0
  still reel-avatar-bci AB-03-array-close cortex-array --var view=close --seed 2 --t 1.0
  still reel-avatar-bci AB-05-cable-connector cortex-array --var view=cable --seed 2 --t 1.0
  still reel-brain-gamble BG-02-array-on-surface cortex-array --var view=array --seed 7 --t 1.0
  still reel-brain-gamble BG-03-corridor-monitor decoder-screen --var view=hallway --seed 7 --t 1.0
  still reel-brain-gamble BG-04-two-patches-close cortex-array --var view=patches --var lit=2 --var close=1 --seed 7 --t 2.0
  still reel-13-atoms-string-breaking SB-02-single-ion ion-chain --var view=single --var n=13 --seed 17 --t 1.0
  still reel-13-atoms-string-breaking SB-03-trap-wide ion-chain --var view=trap --var n=13 --seed 17 --t 1.0
  still reel-13-atoms-string-breaking SB-04-trap-empty ion-chain --var view=trap --var n=0 --seed 17 --t 1.0
  still reel-planet-backwards PB-03-planet-close tilted-orbit --var view=planet --var tilt=136 --seed 21 --t 1.0
  still reel-planet-backwards PB-04-equator-crossing tilted-orbit --var view=equator --var tilt=136 --seed 21 --t 2.0
  still reel-lz-dark-matter LZ-02b-pmt-faces xenon-vessel --var view=pmt --seed 31 --t 0.1
  still reel-lz-dark-matter LZ-03-vessel-exterior xenon-vessel --var view=exterior --seed 31 --t 1.0
  still carousel-project-anchor-debunk PA-03-eclipse-totality eclipse-corona --var view=totality --w 1080 --h 1350 --t 1.0 --seed 41
  ;;
seqs)
  seq reel-betel-teeth BT-01 90 tooth-macro --var view=crown --seed 3
  seq reel-avatar-bci AB-01 90 cortex-array --var view=array --seed 2
  seq reel-avatar-bci AB-04 90 decoder-screen --var view=traces --seed 4
  seq reel-brain-gamble BG-01 90 cortex-array --var view=patches --var lit=2 --seed 7
  seq reel-ai-navier-stokes NS-01 90 turbulent-flow --var view=ink --seed 11
  seq reel-ai-navier-stokes NS-02 90 turbulent-flow --var view=vortex --seed 11
  seq reel-ai-navier-stokes NS-03 90 turbulent-flow --var view=forced --seed 13
  seq reel-ai-navier-stokes NS-04 90 turbulent-flow --var view=free --seed 13
  seq reel-13-atoms-string-breaking SB-01 90 ion-chain --var view=chain --var n=13 --seed 17
  seq reel-planet-backwards PB-01 90 tilted-orbit --var view=wide --var tilt=136 --seed 21
  seq reel-lz-dark-matter LZ-01 90 xenon-vessel --var view=interior --seed 31
  seq reel-lz-dark-matter LZ-02 105 xenon-vessel --var view=pmt --var flash=0.3 --seed 31
  ;;
esac
