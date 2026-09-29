#!/usr/bin/env python3
"""Convert Descript transcript exports into our word sidecar ([{word,start,end}]).

Inputs:  the Descript SRT export (cue boundaries) and a Descript TXT export with
         timecodes every STEP seconds (default 0.25).  Descript prints timecodes as
         HH:MM:SS, so the sub-second position is recovered by counting markers: the
         N-th marker is at N*STEP, cross-checked against the printed second.
Words:   taken from an existing sidecar (keeps our spelling, punctuation and digit
         substitutions such as "550 million"); Descript's tokens are only used for time.
Usage:   descript-words.py <base.words.json> <descript.srt> <descript.tcNN.txt> <out.json> [--step 0.25]
"""
import json, re, sys
args = sys.argv[1:]
step = 0.25
if "--step" in args: i = args.index("--step"); step = float(args[i+1]); del args[i:i+2]
base_path, srt_path, tc_path, out_path = args
base = json.load(open(base_path))
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())

# 1. SRT cues: (start, end, [tokens]) -> end-of-cue caps for the last word of each cue.
tc = lambda s: (lambda h, m, sec: int(h)*3600 + int(m)*60 + float(sec.replace(",", ".")))(*s.split(":"))
cues = []
for block in re.split(r"\n\s*\n", open(srt_path).read().strip()):
    lines = block.strip().split("\n")
    a, b = re.match(r"(\S+) --> (\S+)", lines[1]).groups()
    cues.append((tc(a), tc(b), " ".join(lines[2:]).split()))

# 2. Timecoded TXT: walk markers, N-th marker = N*step; resync on printed second.
toks = re.findall(r"\[(\d\d):(\d\d):(\d\d)\]|([^\s\[]+)", open(tc_path).read())
n = -1; cur = 0.0; slot = []; words = []   # words: (token, interval_start)
for h, m, s, w in toks:
    if w: slot.append(w); continue
    n += 1; t = n*step; shown = int(h)*3600 + int(m)*60 + int(s)
    if int(t) != shown:                       # a marker was dropped/duplicated; resync
        n = int(shown/step); t = n*step
    for k, tok in enumerate(slot):            # words inside one interval split it evenly
        words.append((tok, cur + (t-cur)*k/len(slot)))
    slot = []; cur = t
for k, tok in enumerate(slot): words.append((tok, cur + step*k/len(slot)))

# 3. Align to base tokens by normalised text. A base token may span several Descript
#    tokens (our sidecars merge bands such as "550 million years"); merge greedily.
merged = []; j = 0
for x in base:
    target = norm(x["word"]); acc = ""; st = words[j][1] if j < len(words) else None
    while j < len(words) and len(acc) < len(target):
        acc += norm(words[j][0]); j += 1
    if acc != target: sys.exit(f"token mismatch near base token {len(merged)}: descript={acc!r} base={target!r}")
    merged.append((x["word"], st))
if j != len(words): sys.exit(f"{len(words)-j} unmatched Descript tokens at the end")
# remap SRT cue ends onto merged indices (count Descript tokens per cue, then map).
dcount = [len(re.findall(r"[a-z0-9]", "".join(norm(t) for t in ctoks))) for _, _, ctoks in cues]
words = merged
# 4. Ends: next word's start, capped by the SRT cue end for the last word of each cue
#    (cue boundaries located by cumulative letter count so merged tokens still line up).
caps = {}; letters = 0; cum = 0; ci = 0
for i, (w, _) in enumerate(words):
    letters += len(norm(w))
    while ci < len(cues) and letters >= cum + dcount[ci]:
        cum += dcount[ci]; caps[i] = cues[ci][1]; ci += 1
out = []
for i, (x, (tok, st)) in enumerate(zip(base, words)):
    nxt = words[i+1][1] if i+1 < len(words) else cues[-1][1]
    en = min(nxt, caps.get(i, nxt))
    if en - st > 1.2: en = st + 0.2 + 0.07*len(norm(tok))   # long gap after: estimated word length
    out.append({"word": x["word"], "start": round(st, 3), "end": round(max(en, st+0.08), 3)})
json.dump(out, open(out_path, "w"), indent=1)
d = [abs(o["start"]-x["start"]) for o, x in zip(out, base)]
print(f"{len(out)} words -> {out_path}; shift vs base: mean {sum(d)/len(d):.3f}s max {max(d):.3f}s at '{out[d.index(max(d))]['word']}'")
