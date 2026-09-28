// Mechanism plates shared by the Reel renderer (production/reel/render-reel.mjs, animated through window.seek)
// and the carousel renderer (production/carousel/render.mjs, one static frame via the `plate-diagram` slide type).
//
// Each builder returns an SVG string 936 px wide (the mechanism plate, x 72 to 1008 on the Reel canvas).
// visualRuntime() is serialised into the page and installs window.updateVisual(svg, local, len): a pure
// function of local scene time that sets every attribute for that frame. Nothing is randomised at render time.
//
// Types: lineage | staircase | orbit | thermometer | flash | timeline | compare | ruler-log | telegraph | trace | methyl-clock | dual-trace | string-break
// Common fields: enter (seconds the plate fades in over, default 0.6; 0 for a plate that continues on a hard cut).
// Colours: "cyan" | "amber" | any CSS colour. Times are local scene seconds.
//
//  thermometer  min, max, unit, decimals, fill (target, with the default ease) | keys:[{t,v}] (fill over time, piecewise linear),
//               ticks (step between unlabelled rail ticks), markers:[{value,label,colour,at}], flash (value: the marker lit once
//               when the fill first crosses it), pulse:{value,t0,period}, timer:{at,dur,seconds,label}
//  staircase    levels, labels, start, appear, ballLabel, jumps:[{t,from,to,drift:{t0,frac}}]
//  lineage      labels, colours, depth, baseline, grown, growStart, growDur, pulses:[{t,side}]
//  orbit        tilt, starSpin, planets:[{r,size,period,retrograde,colour,label}], disk:{inner,outer,gap,gapWidth},
//               starLabel, diskLabel, ruler:{at,dur,to,unit,decimals,flip:{at,text}},
//               obliquity:{from,to,at,dur} (degrees: the orbit ellipse and the planet's path rotate in the plate plane about the
//               star, ease-in-out; the dash pattern flips to the retrograde dash the frame the sweep crosses 90),
//               equator (true: a faint --sim-dim band through the star), spinLabel, orbitLabel, starColour
//  timeline     min, max (min > max reverses the rail), unit, decimals, cursor:{from,to,dur,at} | cursor:false (no cursor; ticks light by
//               their own `at`), ticks:[{value,label,colour,at,readout,row:up|down}], label, cursorText:false (no live value pill),
//               readout:"cursor" (64 px amber readout of the cursor value) | "ticks" (the `readout` text of the last lit tick),
//               bracket:{from,to,label,colour,at} (a --sim-dim line above the rail between two values), band:true (`.done` fills from
//               cursor.from instead of from min), draw (seconds the rail draws on over, from the min end)
//  ruler-log    min, max (years), draw, marks:[{value,label,colour,at,bracket:left|right,anchor,row,pulse,readout}]
//  telegraph    stairs:{labels} | stairs:false (flat-line diagram: no staircase, the trace runs the full width), start, drop:{at}, rate (px/s),
//               readout:{from,to,dur,unit,decimals,label}, jumpLabel, traceLabel, axisLabels:[left,right],
//               marks:[{frac,label,colour,bracketPx,note}] (a tick under the axis at frac of its length, a --sim-dim bracket above it),
//               or text (a line of text that types on at `rate` characters per second)
//  trace        points:[[x,y],...] in canvas fractions (full 1080x1920 frame overlay), at, dur, colour
//  methyl-clock years, dur, dots, labels:{top,bottom,strand}, unit
//  flash        at, x, y, readout, label, waiting, readoutAt (the readout lands here instead of 0.5 s after the flash),
//               labels:[{text,at,corner:bl|br}] (max two, the lower corners)
//  dual-trace   min, max (seconds relative to the event), event:{value,label}, tick (unlabelled axis ticks, default 0.25),
//               traces:[{label,colour,lit,step:{at,height}}] (two; `lit` lights the patch, `step` draws the trace forward and lifts it;
//               the previous trace resets flat when the next steps), bracket:{label,show,hide} (between the two patches; hidden from
//               countdown.at), countdown:{at,from,to,dur,decimals,unit} (64 px readout; both traces redraw flat and their heads follow
//               the readout to the event line), rate (px/s for the pre-countdown draws), signalLabel:{at,text,trace} (the trace lifts here)
//  string-break sites (13), mode:"uniform"|"edge", pull:{t0,dur,px}, breakAt, pairs:[{t,sites:[a] | [a,b]}] (1-based, explicit),
//               labels:[text | {text,at}] (max three: above left, above right, below centre), wavefront (edge mode: a thin amber line
//               moving inward from each end one site ahead of the latest pair)
//  compare: unchanged from v2.
export const VW = 936;
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const attr = (o) => esc(JSON.stringify(o)).replace(/"/g, "&quot;");
const rnd = (k) => { const x = Math.sin(k * 9301 + 49297) * 233280; return x - Math.floor(x); };
const col = (c, d) => c === "amber" ? "var(--accent-2)" : c === "cyan" ? "var(--accent)" : c === "grey" ? "var(--line)" : (c || d);
const svgOpen = (type, h, data, v = {}) => `<svg class="vis vis-${type}" viewBox="0 0 ${VW} ${h}" data-h="${h}" data-enter="${v.enter ?? 0.6}" data-p="${attr(data)}" xmlns="http://www.w3.org/2000/svg">`;
let uid = 0;

const buildLineage = (v) => {
  const H = 560, depth = Math.min(7, Math.max(3, v.depth ?? 5));
  const sides = [{ x: 234, min: 30, max: 440, col: col(v.colours?.[0], "var(--accent)") }, { x: 702, min: 496, max: 906, col: col(v.colours?.[1], "var(--accent-2)") }];
  const segs = [];
  sides.forEach((side, si) => {
    let seed = si * 1000 + 7;
    const branch = (x, y, ang, len, d, order) => {
      if (d >= depth) return;
      let nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len;
      nx = Math.min(side.max, Math.max(side.min, nx)); ny = Math.max(24, ny);
      segs.push({ s: si, x1: x, y1: y, x2: nx, y2: ny, birth: (order + rnd(seed++) * 0.6) / depth, w: Math.max(3, 14 - d * 2.2) });
      const spread = 0.42 + rnd(seed++) * 0.3;
      branch(nx, ny, ang - spread * (0.7 + rnd(seed++) * 0.6), len * 0.72, d + 1, order + 1);
      branch(nx, ny, ang + spread * (0.7 + rnd(seed++) * 0.6), len * 0.72, d + 1, order + 1);
    };
    branch(side.x, H - 70, -Math.PI / 2, 150, 0, 0);
  });
  const labels = v.labels || ["A", "B"];
  const P = { grown: !!v.grown, growStart: v.growStart ?? 0, growDur: v.growDur ?? null, pulses: v.pulses || [], lag: v.lag ?? 0.06 };
  return `${svgOpen("lineage", H, P, v)}
    ${segs.map(g => `<line class="seg" data-s="${g.s}" data-x1="${g.x1.toFixed(1)}" data-y1="${g.y1.toFixed(1)}" data-x2="${g.x2.toFixed(1)}" data-y2="${g.y2.toFixed(1)}" data-b="${g.birth.toFixed(3)}" x1="${g.x1.toFixed(1)}" y1="${g.y1.toFixed(1)}" x2="${g.x1.toFixed(1)}" y2="${g.y1.toFixed(1)}" stroke="${sides[g.s].col}" stroke-width="${g.w}" stroke-linecap="round"/>`).join("")}
    <line x1="468" y1="20" x2="468" y2="${H - 60}" stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-dasharray="8 12"/>
    ${v.baseline !== undefined ? `<line x1="40" x2="${VW - 40}" y1="${H - 70}" y2="${H - 70}" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/><text class="lab" x="468" y="${H - 14}">${esc(v.baseline)}</text>` : ""}
    ${sides.map((s, i) => `<circle class="pulse" data-s="${i}" cx="${s.x}" cy="${H - 70}" r="0" fill="none" stroke="${s.col}" stroke-width="4" opacity="0"/><circle class="root" data-s="${i}" cx="${s.x}" cy="${H - 70}" r="11" fill="${s.col}" opacity="0"/>`).join("")}
    <text class="lab" x="234" y="${H - 14}" style="fill:${sides[0].col}">${esc(labels[0])}</text>
    <text class="lab" x="702" y="${H - 14}" style="fill:${sides[1].col}">${esc(labels[1])}</text>
  </svg>`;
};

const buildStaircase = (v) => {
  const H = 560, n = Math.min(8, Math.max(2, v.levels ?? 4));
  const labels = v.labels || Array.from({ length: n }, (_, k) => `E${k}`);
  const ys = Array.from({ length: n }, (_, k) => H - 80 - k * ((H - 160) / (n - 1)));
  const start = v.jumps?.[0]?.from ?? v.start ?? 0;
  return `${svgOpen("staircase", H, { n, ys, start, jumps: v.jumps || [], appear: v.appear ?? 0 }, v)}
    <defs><radialGradient id="ballg"><stop offset="0" stop-color="#fff"/><stop offset="0.35" stop-color="#ffb020"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient></defs>
    ${ys.map((y, k) => `<g class="lvl" data-k="${k}"><line x1="170" x2="786" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/><text class="lab-l" x="170" y="${y - 18}">${esc(labels[k] ?? "")}</text></g>`).join("")}
    <circle class="ring" cx="468" cy="${ys[start]}" r="0" fill="none" stroke="var(--accent-2)" stroke-width="4" opacity="0"/>
    <circle class="glow" cx="468" cy="${ys[start]}" r="70" fill="url(#ballg)" opacity="0.7"/>
    <circle class="ball" cx="468" cy="${ys[start]}" r="22" fill="#fff"/>
    ${v.ballLabel ? `<text class="lab-l ball-lab" x="510" y="${ys[start] + 10}" opacity="0">${esc(v.ballLabel)}</text>` : ""}
    ${v.label ? `<text class="lab" x="468" y="${H - 14}">${esc(v.label)}</text>` : ""}
  </svg>`;
};

const buildOrbit = (v) => {
  const H = 620, tilt = v.tilt ?? 55, cx = 468, cy = H / 2;
  const planets = v.planets || [{ r: v.r ?? 300, size: v.size ?? 22, period: v.period ?? 6, retrograde: !!v.retrograde, colour: v.colour || "var(--accent)", label: v.label || "" }];
  const k = Math.max(0.12, Math.cos(tilt * Math.PI / 180));
  const d = v.disk;
  const ell = (r) => `M ${cx - r} ${cy} A ${r} ${(r * k).toFixed(1)} 0 1 0 ${cx + r} ${cy} A ${r} ${(r * k).toFixed(1)} 0 1 0 ${cx - r} ${cy} Z`;
  const ob = v.obliquity ? { from: v.obliquity.from ?? 0, to: v.obliquity.to ?? 0, at: v.obliquity.at ?? 0, dur: Math.max(1e-6, v.obliquity.dur ?? 1) } : null;
  return `${svgOpen("orbit", H, { tilt: k, planets, starSpin: v.starSpin ?? 8, ruler: v.ruler || null, H, ob }, v)}
    <defs><radialGradient id="starg"><stop offset="0" stop-color="#fff"/><stop offset="0.3" stop-color="#ffd27a"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient></defs>
    ${d ? `<path d="${ell(d.outer)} ${ell(d.inner)}" fill="rgba(79,227,240,0.2)" fill-rule="evenodd"/><ellipse cx="${cx}" cy="${cy}" rx="${d.gap}" ry="${(d.gap * k).toFixed(1)}" fill="none" stroke="rgba(6,9,19,0.75)" stroke-width="${d.gapWidth ?? 40}"/>` : ""}
    ${planets.map((p, i) => `<ellipse class="orb" data-i="${i}" cx="${cx}" cy="${cy}" rx="${p.r}" ry="${(p.r * k).toFixed(1)}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3" stroke-dasharray="${p.retrograde ? "14 10" : "none"}"/>`).join("")}
    ${v.equator ? `<line x1="${cx - 100}" x2="${cx + 100}" y1="${cy}" y2="${cy}" stroke="var(--sim-dim, rgba(79,227,240,0.35))" stroke-width="4" stroke-linecap="round"/>` : ""}
    <circle cx="${cx}" cy="${cy}" r="110" fill="url(#starg)" opacity="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="52" fill="${esc(v.starColour || "#ffe4a8")}"/>
    <g class="spin"><path class="spin-arc" fill="none" stroke="var(--accent-2)" stroke-width="5" stroke-linecap="round"/><polygon class="spin-arrow" points="0,0 -20,-11 -20,11" fill="var(--accent-2)"/></g>
    ${v.spinLabel ? `<text class="lab-s" x="${cx}" y="${cy - 100}" style="fill:var(--accent-2)">${esc(v.spinLabel)}</text>` : ""}
    ${v.orbitLabel ? `<text class="lab-s" x="${cx - (planets[0].r ?? 300) - 18}" y="${cy + 10}" style="text-anchor:end">${esc(v.orbitLabel)}</text>` : ""}
    ${v.ruler ? `<line class="ruler" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="var(--accent-2)" stroke-width="5" stroke-linecap="round" opacity="0"/>` : ""}
    ${planets.map((p, i) => `<g class="pl" data-i="${i}"><path class="trail" fill="none" stroke="${col(p.colour, "var(--accent)")}" stroke-width="6" stroke-linecap="round" opacity="0.55"/><circle class="body" r="${p.size ?? 22}" fill="${col(p.colour, "var(--accent)")}"/><text class="lab-s" style="fill:${col(p.colour, "var(--accent)")}">${esc(p.label || "")}</text></g>`).join("")}
    ${v.starLabel ? `<text class="lab-s" x="${cx}" y="${cy + 96}">${esc(v.starLabel)}</text>` : ""}
    ${d && v.diskLabel ? `<text class="lab-s" x="${(cx + d.outer * 0.8).toFixed(0)}" y="${(cy + d.outer * k * 0.8 + 34).toFixed(0)}">${esc(v.diskLabel)}</text>` : ""}
    ${v.ruler ? `<g class="ro"><text class="readout ro-a" x="${cx}" y="66" text-anchor="middle" opacity="0"></text><text class="readout ro-b" x="${cx}" y="66" text-anchor="middle" opacity="0">${esc(v.ruler.flip?.text || "")}</text></g>` : ""}
    ${v.caption ? `<text class="lab" x="468" y="${H - 14}">${esc(v.caption)}</text>` : ""}
  </svg>`;
};

const buildThermometer = (v) => {
  const H = 600, min = v.min ?? 0, max = v.max ?? 100, top = 40, bot = H - 130, x = 250;
  const yOf = (val) => bot - (bot - top) * (val - min) / (max - min);
  const markers = (v.markers || []).map(m => ({ ...m, y: yOf(m.value), ly: yOf(m.value) })).sort((a, b) => b.value - a.value);
  for (let i = 1; i < markers.length; i++) if (markers[i].ly - markers[i - 1].ly < 40) markers[i].ly = markers[i - 1].ly + 40; // label collision pass, tick stays true
  const ticks = []; if (v.ticks) for (let t = Math.ceil(min / v.ticks) * v.ticks; t <= max; t += v.ticks) ticks.push(t);
  const P = { min, max, fill: v.fill ?? max, top, bot, unit: v.unit || "", decimals: v.decimals ?? 0, keys: v.keys || null, timer: v.timer || null, pulse: v.pulse || null, flash: v.flash ?? null };
  return `${svgOpen("thermometer", H, P, v)}
    <rect x="${x - 36}" y="${top - 20}" width="72" height="${bot - top + 40}" rx="36" fill="rgba(255,255,255,0.08)" stroke="var(--line)" stroke-width="4"/>
    ${ticks.map(t => `<line x1="${x - 72}" x2="${x - 44}" y1="${yOf(t).toFixed(1)}" y2="${yOf(t).toFixed(1)}" stroke="var(--muted)" stroke-width="3"/>`).join("")}
    <circle cx="${x}" cy="${bot + 50}" r="62" fill="rgba(255,255,255,0.08)" stroke="var(--line)" stroke-width="4"/>
    <circle cx="${x}" cy="${bot + 50}" r="48" fill="var(--accent-2)"/>
    <rect class="merc" x="${x - 20}" y="${bot}" width="40" height="0" rx="20" fill="var(--accent-2)"/>
    ${markers.map(m => { const c = col(m.colour, "var(--accent)"); return `<g class="mk" data-v="${m.value}" data-at="${m.at ?? 0}"><line x1="${x + 40}" x2="${x + 80}" y1="${m.y.toFixed(1)}" y2="${m.ly.toFixed(1)}" stroke="${c}" stroke-width="5" stroke-linecap="round"/><text class="lab-l mk-t" x="${x + 98}" y="${(m.ly + 10).toFixed(1)}" style="fill:${c}">${esc(m.label)}</text></g>`; }).join("")}
    <text class="readout ro" x="${VW - 30}" y="${bot}" text-anchor="end"></text>
    ${v.timer ? `<text class="readout timer" x="${VW - 30}" y="${bot + 60}" text-anchor="end" opacity="0"></text><text class="lab-s timer-lab" x="${VW - 30}" y="${bot + 100}" text-anchor="end" opacity="0">${esc(v.timer.label || "")}</text>` : ""}
  </svg>`;
};

const buildFlash = (v) => {
  const H = 580, cols = 10, rows = 6, pad = 70;
  const fx = 60 + (v.x ?? 0.62) * 816, fy = 30 + (v.y ?? 0.45) * (H - 130);
  const pmts = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pmts.push({ x: pad + c * ((VW - 2 * pad) / (cols - 1)), y: 60 + r * ((H - 200) / (rows - 1)) });
  const labels = (v.labels || []).slice(0, 2).map((l, i) => ({ text: l.text ?? "", at: l.at ?? 0, corner: l.corner || (i === 0 ? "bl" : "br") }));
  return `${svgOpen("flash", H, { at: v.at ?? 1.2, fx, fy, readoutAt: v.readoutAt ?? null, labels: labels.map(l => l.at) }, v)}
    <rect x="30" y="10" width="${VW - 60}" height="${H - 90}" rx="34" fill="#03050c" stroke="var(--line)" stroke-width="4"/>
    ${pmts.map(p => `<circle class="pmt" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="14" fill="rgba(79,227,240,0.14)" data-d="${Math.hypot(p.x - fx, p.y - fy).toFixed(1)}"/>`).join("")}
    <circle class="ring" cx="${fx}" cy="${fy}" r="0" fill="none" stroke="var(--accent-2)" stroke-width="5" opacity="0"/>
    <circle class="core" cx="${fx}" cy="${fy}" r="0" fill="#fff" opacity="0"/>
    <text class="lab readout-s" x="468" y="${H - 22}" opacity="0"><tspan style="fill:var(--accent-2)">${esc(v.readout || "")}</tspan>${v.label ? `<tspan> ${esc(v.label)}</tspan>` : ""}</text>
    <text class="lab waiting" x="468" y="${H - 22}">${esc(v.waiting || "listening")}</text>
    ${labels.map((l, i) => `<text class="lab-s corner" data-i="${i}" x="${l.corner === "br" ? VW - 40 : 40}" y="${H - 22}" style="text-anchor:${l.corner === "br" ? "end" : "start"}" opacity="0">${esc(l.text)}</text>`).join("")}
  </svg>`;
};

const buildTimeline = (v) => {
  const H = 380, min = v.min ?? 0, max = v.max ?? 100, x0 = 70, x1 = VW - 70, ay = 200;
  const xOf = (val) => x0 + (x1 - x0) * (val - min) / (max - min);
  const ticks = (v.ticks || []).map((tk, i) => ({ ...tk, x: xOf(tk.value), up: tk.row ? tk.row === "up" : i % 2 === 0 }));
  const grouping = v.grouping ?? !(min >= 1000 && max <= 3000); // years are not grouped
  const noCursor = v.cursor === false, C = noCursor ? null : (v.cursor || {});
  const br = v.bracket ? { x0: xOf(v.bracket.from), x1: xOf(v.bracket.to), at: v.bracket.at ?? 0, c: col(v.bracket.colour, "var(--sim-dim, rgba(79,227,240,0.35))") } : null;
  const P = { min, max, x0, x1, from: C ? C.from ?? min : min, to: C ? C.to ?? max : min, dur: C ? C.dur ?? null : null, at: C ? C.at ?? 0 : 0, unit: v.unit || "", decimals: v.decimals ?? 0, grouping,
    noCursor, readout: v.readout || null, band: !!v.band, draw: v.draw ?? 0, brAt: br ? br.at : null, ticks: ticks.map(t => ({ v: t.value, at: t.at ?? null, readout: t.readout ?? null })) };
  return `${svgOpen("timeline", H, P, v)}
    <line class="rail" x1="${x0}" x2="${x1}" y1="${ay}" y2="${ay}" stroke="var(--line)" stroke-width="8" stroke-linecap="round"/>
    <line class="done" x1="${x0}" x2="${x0}" y1="${ay}" y2="${ay}" stroke="var(--accent)" stroke-width="8" stroke-linecap="round"/>
    ${br ? `<g class="br" opacity="${br.at > 0 ? 0 : 1}"><path d="M ${Math.min(br.x0, br.x1).toFixed(1)} ${ay - 22} v -12 H ${Math.max(br.x0, br.x1).toFixed(1)} v 12" fill="none" stroke="${br.c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${v.bracket.label ? `<text class="lab-s" x="${((br.x0 + br.x1) / 2).toFixed(1)}" y="${ay - 48}" style="fill:${col(v.bracket.colour, "var(--muted)")}">${esc(v.bracket.label)}</text>` : ""}</g>` : ""}
    ${ticks.map((tk, i) => `<g class="tk" data-i="${i}" data-v="${tk.value}" style="--tk:${col(tk.colour, "var(--accent)")}"><line x1="${tk.x.toFixed(1)}" x2="${tk.x.toFixed(1)}" y1="${ay - 22}" y2="${ay + 22}" stroke="var(--muted)" stroke-width="5" stroke-linecap="round"/><text class="lab-s tk-t" x="${tk.x.toFixed(1)}" y="${tk.up ? ay - 44 : ay + 62}">${esc(tk.label)}</text></g>`).join("")}
    ${noCursor ? "" : `<g class="cur"><line x1="0" x2="0" y1="${ay - 54}" y2="${ay + 54}" stroke="var(--accent-2)" stroke-width="8" stroke-linecap="round"/>${v.cursorText === false ? "" : `<rect x="-110" y="${ay - 150}" width="220" height="72" rx="36" fill="var(--accent-2)"/>`}<text class="cur-t" x="0" y="${ay - 102}"${v.cursorText === false ? ' opacity="0"' : ""}></text></g>`}
    ${v.readout ? `<g class="ro"><text class="readout ro-a" x="${x1}" y="86" text-anchor="end" opacity="0"></text><text class="readout ro-b" x="${x1}" y="86" text-anchor="end" opacity="0"></text></g>` : ""}
    ${v.label ? `<text class="lab" x="468" y="${H - 14}">${esc(v.label)}</text>` : ""}
  </svg>`;
};

const buildCompare = (v) => {
  const H = 560, items = (v.items || []).slice(0, 4), mode = v.mode || "circles", n = Math.max(1, items.length);
  const defCol = ["var(--accent)", "var(--accent-2)", "var(--fact)", "var(--myth)"];
  const slot = VW / n;
  return `${svgOpen("compare", H, { mode, n, H }, v)}
    ${items.map((it, i) => { const cx = slot * i + slot / 2, c = col(it.colour, defCol[i % 4]), size = Math.max(2, Math.min(100, it.size ?? 50));
      const shape = mode === "bars"
        ? `<rect class="shape" data-size="${size}" x="${cx - Math.min(150, slot * 0.32)}" width="${Math.min(300, slot * 0.64)}" y="${H - 120}" height="0" rx="18" fill="${c}" fill-opacity="0.22" stroke="${c}" stroke-width="4"/>`
        : `<circle class="shape" data-size="${size}" cx="${cx}" cy="${H - 120}" r="0" fill="${c}" fill-opacity="0.18" stroke="${c}" stroke-width="4"/>`;
      return `<g class="cmp" data-i="${i}">${shape}<text class="val-s" x="${cx}" y="${H - 120}" style="fill:${c}">${esc(it.value ?? "")}</text><text class="lab" x="${cx}" y="${H - 50}">${esc(it.label ?? "")}</text></g>`; }).join("")}
  </svg>`;
};

// Logarithmic ruler: marks light in turn; a bracket shows "under" (left) or "over" (right); one optional 64 px readout.
const buildRulerLog = (v) => {
  const H = 400, min = v.min ?? 1e5, max = v.max ?? 1e10, x0 = 70, x1 = VW - 70, ry = 320;
  const lmin = Math.log10(min), lmax = Math.log10(max);
  const xOf = (val) => x0 + (x1 - x0) * (Math.log10(val) - lmin) / (lmax - lmin);
  const decades = []; for (let d = Math.ceil(lmin); d <= Math.floor(lmax); d++) decades.push(Math.pow(10, d));
  const marks = (v.marks || []).map((m, i) => ({ ...m, x: xOf(m.value), row: m.row ?? (i % 2) }));
  return `${svgOpen("ruler-log", H, { x0, x1, draw: v.draw ?? 0.6, marks: marks.map(m => ({ at: m.at ?? 0, pulse: !!m.pulse })) }, v)}
    <line class="rail" x1="${x0}" x2="${x0}" y1="${ry}" y2="${ry}" stroke="var(--line)" stroke-width="8" stroke-linecap="round"/>
    ${decades.map(d => `<line class="dec" data-x="${xOf(d).toFixed(1)}" x1="${xOf(d).toFixed(1)}" x2="${xOf(d).toFixed(1)}" y1="${ry + 8}" y2="${ry + 30}" stroke="var(--muted)" stroke-width="3" opacity="0"/>`).join("")}
    ${marks.map((m, i) => { const c = col(m.colour, "var(--accent)"), ly = m.row === 0 ? ry - 78 : ry - 128, anchor = m.anchor || "middle";
      const br = m.bracket === "left" ? `<path d="M ${m.x - 8} ${ry - 40} h -60 m 14 -12 l -14 12 l 14 12" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
        : m.bracket === "right" ? `<path d="M ${m.x + 8} ${ry - 40} h 60 m -14 -12 l 14 12 l -14 12" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : "";
      return `<g class="mark" data-i="${i}" opacity="0"><line x1="${m.x.toFixed(1)}" x2="${m.x.toFixed(1)}" y1="${ry - 60}" y2="${ry}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>${br}<text class="lab-s" x="${m.x.toFixed(1)}" y="${ly}" text-anchor="${anchor}" style="fill:${c}">${esc(m.label)}</text>${m.readout ? `<text class="readout" x="${m.x.toFixed(1)}" y="${ry - 190}" text-anchor="${anchor}">${esc(m.readout)}</text>` : ""}</g>`; }).join("")}
  </svg>`;
};

// Telegraph: a staircase on the left third, a live trace on the right two thirds that draws on in real time and steps
// down at the jump, plus a 64 px readout that counts (slowed) time. With `text` instead: a single line that types on.
const buildTelegraph = (v) => {
  const H = 560;
  if (v.text) return `${svgOpen("telegraph", H, { text: v.text, rate: v.rate ?? 20 }, v)}<text class="readout ty" x="40" y="${H / 2 + 20}" text-anchor="start"></text></svg>`;
  const labels = v.stairs?.labels || ["ground state", "first excited state"];
  const yHi = 150, yLo = H - 120, sx0 = 150, sx1 = 300, tx0 = 340, tx1 = VW - 30, ay = yLo + 40;
  const start = v.start ?? 1;
  const R = v.readout || null;
  return `${svgOpen("telegraph", H, { yHi, yLo, tx0, tx1, start, drop: v.drop || null, rate: v.rate ?? 160, readout: R, jumpLabel: v.jumpLabel || "" }, v)}
    <defs><radialGradient id="ballg2"><stop offset="0" stop-color="#fff"/><stop offset="0.35" stop-color="#ffb020"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient></defs>
    <g class="lvl" data-k="0"><line x1="${sx0}" x2="${sx1}" y1="${yLo}" y2="${yLo}" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/><text class="lab-l" x="${sx0 - 110}" y="${yLo + 44}">${esc(labels[0])}</text></g>
    <g class="lvl" data-k="1"><line x1="${sx0}" x2="${sx1}" y1="${yHi}" y2="${yHi}" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/><text class="lab-l" x="${sx0 - 110}" y="${yHi - 18}">${esc(labels[1])}</text></g>
    <circle class="ring" cx="${(sx0 + sx1) / 2}" cy="${yHi}" r="0" fill="none" stroke="var(--accent-2)" stroke-width="4" opacity="0"/>
    <circle class="glow" cx="${(sx0 + sx1) / 2}" cy="${yHi}" r="70" fill="url(#ballg2)" opacity="0.7"/>
    <circle class="ball" cx="${(sx0 + sx1) / 2}" cy="${yHi}" r="22" fill="#fff"/>
    <line x1="${tx0}" x2="${tx1}" y1="${ay}" y2="${ay}" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/>
    <line x1="${tx0}" x2="${tx1}" y1="${yHi}" y2="${yHi}" stroke="var(--sim-dim, rgba(79,227,240,0.35))" stroke-width="2" stroke-dasharray="6 10"/>
    <line x1="${tx0}" x2="${tx1}" y1="${yLo}" y2="${yLo}" stroke="var(--sim-dim, rgba(79,227,240,0.35))" stroke-width="2" stroke-dasharray="6 10"/>
    <polyline class="trace" points="" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="head" r="7" fill="var(--accent)" opacity="0"/>
    ${R ? `<text class="readout ro" x="${tx1}" y="${yHi - 60}" text-anchor="end"></text>${R.label ? `<text class="lab-s" x="${tx1}" y="${yHi - 20}" text-anchor="end">${esc(R.label)}</text>` : ""}` : ""}
    <text class="lab-s jl" x="0" y="${(yHi + yLo) / 2 + 10}" text-anchor="start" opacity="0" style="fill:var(--accent-2)">${esc(v.jumpLabel || "")}</text>
  </svg>`;
};

// Trace: a dashed cyan line drawn over the still (full-frame overlay in canvas fractions), not inside the plate.
const buildTrace = (v) => {
  const id = `tr${uid++}`, pts = (v.points || [[0.3, 0.3], [0.7, 0.5]]).map(p => `${(p[0] * 1080).toFixed(1)},${(p[1] * 1920).toFixed(1)}`).join(" ");
  const xs = (v.points || []).map(p => p[0] * 1080); const xmin = Math.min(...xs) - 20, xmax = Math.max(...xs) + 20;
  return `<svg class="vis overlay vis-trace" viewBox="0 0 1080 1920" data-h="1920" data-enter="0" data-p="${attr({ at: v.at ?? 0, dur: v.dur ?? 0.4, xmin, xmax })}" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${id}"><rect class="clip" x="${xmin.toFixed(1)}" y="0" width="0" height="1920"/></clipPath></defs>
    <polyline points="${pts}" fill="none" stroke="${col(v.colour, "var(--accent)")}" stroke-width="${v.width ?? 5}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${v.dash || "16 14"}" clip-path="url(#${id})" style="filter: drop-shadow(0 0 10px rgba(79,227,240,0.6))"/>
  </svg>`;
};

// Methylation clock: dish-time ruler below, a DNA double strand with methyl marks accumulating left to right,
// a clock-age ruler above, and join lines where the two readings line up.
const buildMethylClock = (v) => {
  const H = 640, years = v.years ?? 5, x0 = 60, x1 = VW - 40, n = v.dots ?? 96, yTop = 130, yBot = 520, ymid = 320, A = 58, lam = (x1 - x0) / 4;
  const L = v.labels || {};
  const xOf = (yr) => x0 + (x1 - x0) * yr / years;
  const strand = (sign) => { let d = ""; for (let x = x0; x <= x1; x += 8) d += (x === x0 ? "M " : " L ") + x + " " + (ymid + sign * A * Math.sin(2 * Math.PI * (x - x0) / lam)).toFixed(1); return d; };
  const dots = Array.from({ length: n }, (_, k) => { const x = x0 + (x1 - x0) * Math.sqrt((k + 1) / n), s = k % 2 ? -1 : 1; return { x, y: ymid + s * A * Math.sin(2 * Math.PI * (x - x0) / lam) }; });
  const joins = v.joins || [1, 3, 5];
  return `${svgOpen("methyl-clock", H, { x0, x1, dur: v.dur ?? 5, years, unit: v.unit ?? " yr", joins }, v)}
    <text class="lab-s" x="${x1}" y="64" text-anchor="end" style="fill:var(--accent-2)">${esc(L.top || "clock age")}</text>
    <line x1="${x0}" x2="${x1}" y1="${yTop}" y2="${yTop}" stroke="var(--accent-2)" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
    ${Array.from({ length: years + 1 }, (_, y) => `<line x1="${xOf(y)}" x2="${xOf(y)}" y1="${yTop - 14}" y2="${yTop + 14}" stroke="var(--accent-2)" stroke-width="4" stroke-linecap="round"/><text class="lab-s" x="${xOf(y)}" y="${yTop - 26}" style="fill:var(--accent-2)">${y}</text>`).join("")}
    ${joins.map(j => `<line class="join" data-yr="${j}" x1="${xOf(j)}" x2="${xOf(j)}" y1="${yTop + 20}" y2="${yBot - 20}" stroke="var(--accent-2)" stroke-width="3" stroke-dasharray="10 10" opacity="0"/>`).join("")}
    <path d="${strand(1)}" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>
    <path d="${strand(-1)}" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
    ${dots.map(d => `<circle class="dot" data-x="${d.x.toFixed(1)}" cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="7" fill="var(--accent-2)" opacity="0"/>`).join("")}
    <text class="lab-s" x="${x1 - 60}" y="${ymid + A + 52}" text-anchor="end">${esc(L.strand || "methyl marks")}</text>
    <line x1="${x0}" x2="${x1}" y1="${yBot}" y2="${yBot}" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/>
    ${Array.from({ length: years + 1 }, (_, y) => `<line x1="${xOf(y)}" x2="${xOf(y)}" y1="${yBot - 14}" y2="${yBot + 14}" stroke="var(--muted)" stroke-width="4" stroke-linecap="round"/><text class="lab-s" x="${xOf(y)}" y="${yBot + 50}">${y}</text>`).join("")}
    <text class="lab-s" x="${x1}" y="${H - 14}" text-anchor="end">${esc(L.bottom || "dish time")}</text>
    <text class="readout ro" x="${x0}" y="72" text-anchor="start"></text>
  </svg>`;
};

export const builders = {
  lineage: buildLineage, staircase: buildStaircase, orbit: buildOrbit, thermometer: buildThermometer, flash: buildFlash,
  timeline: buildTimeline, compare: buildCompare, "ruler-log": buildRulerLog, telegraph: buildTelegraph, trace: buildTrace, "methyl-clock": buildMethylClock,
};
export const buildVisual = (v) => (v && builders[v.type]) ? builders[v.type](v) : "";
export const isOverlay = (v) => v?.type === "trace";

export const visualCss = `
  .vis { width:100%; height:auto; max-height:660px; display:block; overflow:visible; }
  .vis.overlay { position:absolute; inset:0; width:1080px; height:1920px; max-height:none; pointer-events:none; }
  .vis text { font-family: var(--font-body); paint-order: stroke; stroke: rgba(6,9,19,0.85); stroke-width: 6px; stroke-linejoin: round; }
  .vis .readout { stroke-width: 10px; }
  .vis .lab { font: 600 28px var(--font-body); fill: var(--ink-2); text-anchor: middle; }
  .vis .lab-l { font: 600 28px var(--font-body); fill: var(--ink-2); text-anchor: start; }
  .vis .lab-s { font: 600 28px var(--font-body); fill: var(--muted); text-anchor: middle; }
  .vis .readout { font: 700 64px var(--font-display); fill: var(--accent-2); letter-spacing: -0.02em; }
  .vis .val-s { font: 700 40px var(--font-display); fill: var(--ink); text-anchor: middle; }
  .vis .cur-t { font: 700 34px var(--font-display); fill: var(--bg); text-anchor: middle; }
  .vis-staircase .lab-l, .vis-telegraph .lab-l { text-anchor: start; }
  .vis-staircase .lvl.now line, .vis-telegraph .lvl.now line { stroke: var(--accent-2); }
  .vis-staircase .lvl.now text, .vis-telegraph .lvl.now text { fill: var(--accent-2); }
  .vis-thermometer .mk { opacity: 0.8; }
  .vis-thermometer .mk.hit { opacity: 1; }
  .vis-thermometer .mk.hit text { fill: var(--ink); }
  .vis-timeline .tk.hit line { stroke: var(--tk, var(--accent)); }
  .vis-timeline .tk.hit text { fill: var(--ink); }
  .vis-orbit .lab-s { text-anchor: middle; }
`;

// Serialised into the page: window.updateVisual(svg, local, len) sets one frame of one plate.
export function visualRuntime() {
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, q) => a + (b - a) * q;
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOut = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const num = (x, d) => x.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const keyed = (keys, t) => { // piecewise linear {t,v} track, held at both ends
    if (t <= keys[0].t) return keys[0].v;
    for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) return lerp(keys[i - 1].v, keys[i].v, (t - keys[i - 1].t) / Math.max(1e-6, keys[i].t - keys[i - 1].t));
    return keys[keys.length - 1].v;
  };
  const crossTime = (keys, val) => { for (let i = 1; i < keys.length; i++) if (keys[i - 1].v < val && keys[i].v >= val) return lerp(keys[i - 1].t, keys[i].t, (val - keys[i - 1].v) / (keys[i].v - keys[i - 1].v)); return Infinity; };
  const roll = (a, b, q) => { // 6-frame vertical roll from text a to text b
    a.setAttribute("opacity", 1 - q); a.setAttribute("transform", "translate(0 " + (-40 * q).toFixed(1) + ")");
    b.setAttribute("opacity", q); b.setAttribute("transform", "translate(0 " + (40 * (1 - q)).toFixed(1) + ")");
  };
  const types = {
    staircase(v, local, len, P) {
      let lvl = P.start, y = P.ys[lvl], ringR = 0, ringO = 0;
      for (const j of P.jumps) {
        if (j.drift && local >= j.drift.t0 && local < j.t) { const q = clamp((local - j.drift.t0) / Math.max(1e-6, j.t - j.drift.t0), 0, 1); y = lerp(P.ys[j.from], P.ys[j.to], j.drift.frac * q); lvl = j.from; }
        if (local < j.t) break;
        const q = clamp((local - j.t) / (j.drift ? 0.13 : 0.16), 0, 1); lvl = j.to;
        const y0 = j.drift ? lerp(P.ys[j.from], P.ys[j.to], j.drift.frac) : P.ys[j.from];
        y = lerp(y0, P.ys[j.to], easeOut(q)) - (j.drift ? 0 : 46 * Math.sin(Math.PI * q));
        const rq = clamp((local - j.t) / 0.5, 0, 1); ringR = 26 + 90 * easeOut(rq); ringO = 1 - rq;
      }
      const vis = local >= P.appear, pop = easeOut(clamp((local - P.appear) / 0.25, 0, 1));
      const glow = 62 + 6 * Math.sin(local * 5);
      const ball = v.querySelector(".ball"), g = v.querySelector(".glow");
      ball.setAttribute("cy", y); ball.setAttribute("r", vis ? 22 * pop : 0); g.setAttribute("cy", y); g.setAttribute("r", glow); g.setAttribute("opacity", vis ? 0.7 * pop : 0);
      const ring = v.querySelector(".ring"); ring.setAttribute("cy", P.ys[lvl]); ring.setAttribute("r", ringR); ring.setAttribute("opacity", ringO);
      v.querySelectorAll(".lvl").forEach(l => l.classList.toggle("now", vis && +l.dataset.k === lvl));
      const bl = v.querySelector(".ball-lab"); if (bl) { bl.setAttribute("y", y + 10); bl.setAttribute("opacity", vis ? Math.min(pop, clamp((P.appear + 2.0 - local) / 0.3, 0, 1)) : 0); }
    },
    lineage(v, local, len, P) {
      const g = P.grown ? 1 : clamp((local - P.growStart) / (P.growDur ?? len * 0.8), 0, 1);
      v.querySelectorAll(".seg").forEach(l => { const q = easeOut(clamp((g - +l.dataset.b - (+l.dataset.s ? P.lag : 0)) / 0.14, 0, 1)); l.setAttribute("x2", lerp(+l.dataset.x1, +l.dataset.x2, q)); l.setAttribute("y2", lerp(+l.dataset.y1, +l.dataset.y2, q)); l.setAttribute("opacity", q > 0 ? 1 : 0); });
      v.querySelectorAll(".root").forEach(r => r.setAttribute("opacity", g > 0 ? 1 : 0));
      v.querySelectorAll(".pulse").forEach(pz => { let r = 0, o = 0; for (const p of P.pulses) { if (+pz.dataset.s !== p.side) continue; const q = (local - p.t) / 0.6; if (q >= 0 && q <= 1) { r = 12 + 60 * easeOut(q); o = 1 - q; } } pz.setAttribute("r", r); pz.setAttribute("opacity", o); });
    },
    orbit(v, local, len, P) {
      const cy = P.H / 2, cx = 468, sr = 78, sk = P.tilt;
      const a0 = 2 * Math.PI * local / P.starSpin;
      let d = ""; for (let k = 0; k <= 10; k++) { const a = a0 + (k / 10) * Math.PI / 2; d += (k ? " L " : "M ") + (cx + sr * Math.cos(a)).toFixed(1) + " " + (cy + sr * sk * Math.sin(a)).toFixed(1); }
      v.querySelector(".spin-arc").setAttribute("d", d);
      const ae = a0 + Math.PI / 2, ax = cx + sr * Math.cos(ae), ay = cy + sr * sk * Math.sin(ae), tang = Math.atan2(sr * sk * Math.cos(ae), -sr * Math.sin(ae)) * 180 / Math.PI;
      v.querySelector(".spin-arrow").setAttribute("transform", "translate(" + ax.toFixed(1) + " " + ay.toFixed(1) + ") rotate(" + tang.toFixed(1) + ")");
      let px = cx, py = cy;
      v.querySelectorAll(".pl").forEach(g => {
        const pl = P.planets[+g.dataset.i], dir = pl.retrograde ? -1 : 1, rx = pl.r, ry = pl.r * sk;
        const th = dir * 2 * Math.PI * local / (pl.period || 6) - Math.PI / 2;
        const x = cx + rx * Math.cos(th), y = cy + ry * Math.sin(th);
        if (+g.dataset.i === 0) { px = x; py = y; }
        const b = g.querySelector(".body"); b.setAttribute("cx", x); b.setAttribute("cy", y);
        const lab = g.querySelector(".lab-s"); lab.setAttribute("x", x); lab.setAttribute("y", y - (pl.size || 22) - 14);
        let tr = ""; for (let k = 0; k <= 12; k++) { const a = th - dir * (k / 12) * 0.9; tr += (k ? " L " : "M ") + (cx + rx * Math.cos(a)).toFixed(1) + " " + (cy + ry * Math.sin(a)).toFixed(1); }
        g.querySelector(".trail").setAttribute("d", tr);
      });
      if (P.ruler) {
        const R = P.ruler, q = clamp((local - R.at) / R.dur, 0, 1), ln = v.querySelector(".ruler");
        ln.setAttribute("x2", lerp(cx, px, q)); ln.setAttribute("y2", lerp(cy, py, q)); ln.setAttribute("opacity", local >= R.at ? 1 : 0);
        const a = v.querySelector(".ro-a"), b = v.querySelector(".ro-b");
        a.textContent = num((R.from ?? 0) + (R.to - (R.from ?? 0)) * q, R.decimals ?? 0) + (R.unit || "");
        const fq = R.flip ? clamp((local - R.flip.at) / 0.2, 0, 1) : 0;
        if (local < R.at) { a.setAttribute("opacity", 0); b.setAttribute("opacity", 0); } else roll(a, b, fq);
      }
    },
    thermometer(v, local, len, P) {
      const p = easeOut(clamp(local / Math.min(1.6, len * 0.7), 0, 1));
      const val = P.keys ? keyed(P.keys, local) : P.min + (P.fill - P.min) * p, y = P.bot - (P.bot - P.top) * (val - P.min) / (P.max - P.min);
      const m = v.querySelector(".merc"); m.setAttribute("y", y); m.setAttribute("height", Math.max(0, P.bot - y + 20));
      const ro = v.querySelector(".ro"); ro.setAttribute("y", clamp(y + 22, P.top + 30, P.bot)); ro.textContent = num(val, P.decimals) + P.unit;
      v.querySelectorAll(".mk").forEach(k => {
        const at = +k.dataset.at, mv = +k.dataset.v, hit = val >= mv - 1e-9;
        k.classList.toggle("hit", hit);
        let o = local >= at ? easeOut(clamp((local - at) / 0.3, 0, 1)) : 0;
        if (P.pulse && Math.abs(P.pulse.value - mv) < 1e-9 && local >= P.pulse.t0) o *= 0.7 + 0.3 * Math.cos(2 * Math.PI * (local - P.pulse.t0) / (P.pulse.period || 1));
        if (P.flash !== null && P.keys && Math.abs(P.flash - mv) < 1e-9) { const tc = crossTime(P.keys, mv), fq = (local - tc) / 0.4; if (fq >= 0 && fq <= 1) o = Math.max(o, 1) ; k.querySelector("line").setAttribute("stroke-width", fq >= 0 && fq <= 1 ? 5 + 6 * (1 - fq) : 5); }
        k.style.opacity = hit ? o : o * 0.8;
      });
      if (P.timer) {
        const T = P.timer, q = clamp((local - T.at) / T.dur, 0, 1), on = local >= T.at && local <= T.at + T.dur + 0.6;
        const o = on ? Math.min(clamp((local - T.at) / 0.2, 0, 1), clamp((T.at + T.dur + 0.6 - local) / 0.3, 0, 1)) : 0;
        const s = Math.round(T.seconds * q), tt = v.querySelector(".timer"), tl = v.querySelector(".timer-lab");
        tt.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); tt.setAttribute("opacity", o); tl.setAttribute("opacity", o);
      }
    },
    flash(v, local, len, P) {
      const q = local - P.at, core = v.querySelector(".core"), ring = v.querySelector(".ring");
      v.querySelector(".waiting").setAttribute("opacity", q < 0 ? 0.6 + 0.3 * Math.sin(local * 6) : 0);
      if (q < 0) { core.setAttribute("opacity", 0); ring.setAttribute("opacity", 0); v.querySelector(".readout-s").setAttribute("opacity", 0); v.querySelectorAll(".pmt").forEach(c => c.setAttribute("fill", "rgba(79,227,240,0.14)")); return; }
      const cq = clamp(q / 0.12, 0, 1); core.setAttribute("r", 8 + 70 * easeOut(cq)); core.setAttribute("opacity", q < 0.12 ? 1 : Math.max(0.35, 1 - (q - 0.12) / 0.8));
      const rq = clamp(q / 0.6, 0, 1); ring.setAttribute("r", 300 * easeOut(rq)); ring.setAttribute("opacity", 1 - rq);
      v.querySelectorAll(".pmt").forEach(c => { const dd = +c.dataset.d, lit = clamp(1 - dd / 320, 0, 1) * clamp(1 - (q - 0.1) / 1.2, 0.25, 1); c.setAttribute("fill", "rgba(255,176,32," + (0.14 + 0.86 * lit).toFixed(3) + ")"); });
      v.querySelector(".readout-s").setAttribute("opacity", clamp((q - 0.5) / 0.3, 0, 1));
    },
    timeline(v, local, len, P) {
      const val = lerp(P.from, P.to, easeInOut(clamp(local / (P.dur ?? len * 0.85), 0, 1)));
      const x = P.x0 + (P.x1 - P.x0) * (val - P.min) / (P.max - P.min);
      v.querySelector(".cur").setAttribute("transform", "translate(" + x.toFixed(1) + " 0)");
      v.querySelector(".cur-t").textContent = (P.grouping ? num(val, P.decimals) : val.toFixed(P.decimals)) + P.unit;
      v.querySelector(".done").setAttribute("x2", Math.max(P.x0, x));
      v.querySelectorAll(".tk").forEach(k => k.classList.toggle("hit", val >= +k.dataset.v - 1e-9));
    },
    compare(v, local, len, P) {
      const p = easeOut(clamp(local / Math.min(1.6, len * 0.7), 0, 1));
      v.querySelectorAll(".cmp").forEach(g => {
        const sh = g.querySelector(".shape"), size = +sh.dataset.size, q = 0.08 + 0.92 * p, valT = g.querySelector(".val-s");
        if (P.mode === "bars") { const h = 400 * size / 100 * q; sh.setAttribute("height", h); sh.setAttribute("y", P.H - 120 - h); valT.setAttribute("y", P.H - 120 - h - 20); }
        else { const r = 200 * Math.sqrt(size / 100) * q; sh.setAttribute("r", r); sh.setAttribute("cy", P.H - 120 - r); valT.setAttribute("y", P.H - 120 - r + 14); }
      });
    },
    "ruler-log"(v, local, len, P) {
      const q = easeOut(clamp(local / P.draw, 0, 1)), xe = lerp(P.x0, P.x1, q);
      v.querySelector(".rail").setAttribute("x2", xe);
      v.querySelectorAll(".dec").forEach(d => d.setAttribute("opacity", +d.dataset.x <= xe ? 1 : 0));
      v.querySelectorAll(".mark").forEach(m => {
        const M = P.marks[+m.dataset.i], a = clamp((local - M.at) / 0.3, 0, 1);
        let o = easeOut(a); if (M.pulse && a >= 1) o = 0.75 + 0.25 * Math.cos(2 * Math.PI * (local - M.at - 0.3));
        m.setAttribute("opacity", local >= M.at ? o : 0);
        m.setAttribute("transform", "translate(0 " + (10 * (1 - easeOut(a))).toFixed(1) + ")");
      });
    },
    telegraph(v, local, len, P) {
      if (P.text) { const n = clamp(Math.floor(local * P.rate), 0, P.text.length); v.querySelector(".ty").textContent = P.text.slice(0, n) + (local * 2 % 1 < 0.5 && n < P.text.length ? "_" : ""); return; }
      const dropT = P.drop ? P.drop.at : Infinity, dropped = local >= dropT, yTop = P.start ? P.yHi : P.yLo, yBot = P.start ? P.yLo : P.yHi;
      const xNow = Math.min(P.tx1, P.tx0 + P.rate * local), xDrop = Math.min(P.tx1, P.tx0 + P.rate * dropT);
      let pts = P.tx0 + "," + yTop + " " + (dropped ? xDrop + "," + yTop + " " + xDrop + "," + yBot + " " : "") + xNow + "," + (dropped ? yBot : yTop);
      v.querySelector(".trace").setAttribute("points", pts);
      const hd = v.querySelector(".head"); hd.setAttribute("cx", xNow); hd.setAttribute("cy", dropped ? yBot : yTop); hd.setAttribute("opacity", local > 0 ? 1 : 0);
      const sq = clamp((local - dropT) / 0.13, 0, 1), by = dropped ? lerp(yTop, yBot, easeOut(sq)) : yTop;
      v.querySelector(".ball").setAttribute("cy", by); v.querySelector(".glow").setAttribute("cy", by);
      const rq = clamp((local - dropT) / 0.5, 0, 1), ring = v.querySelector(".ring"); ring.setAttribute("cy", yBot); ring.setAttribute("r", dropped ? 26 + 90 * easeOut(rq) : 0); ring.setAttribute("opacity", dropped ? 1 - rq : 0);
      v.querySelectorAll(".lvl").forEach(l => l.classList.toggle("now", (+l.dataset.k === 1) === (P.start ? !dropped : dropped)));
      if (P.readout) { const R = P.readout, q = clamp(local / R.dur, 0, 1); v.querySelector(".ro").textContent = num((R.from ?? 0) + (R.to - (R.from ?? 0)) * q, R.decimals ?? 1) + (R.unit || ""); }
      const jl = v.querySelector(".jl"); jl.setAttribute("x", xDrop + 16); jl.setAttribute("opacity", dropped ? clamp((local - dropT - 0.2) / 0.3, 0, 1) : 0);
    },
    trace(v, local, len, P) {
      const q = easeOut(clamp((local - P.at) / P.dur, 0, 1));
      v.querySelector(".clip").setAttribute("width", Math.max(0, (P.xmax - P.xmin) * q));
    },
    "methyl-clock"(v, local, len, P) {
      const q = clamp(local / P.dur, 0, 1), xe = lerp(P.x0, P.x1, q);
      v.querySelectorAll(".dot").forEach(d => d.setAttribute("opacity", +d.dataset.x <= xe ? 1 : 0));
      v.querySelectorAll(".join").forEach(j => j.setAttribute("opacity", q * P.years >= +j.dataset.yr - 1e-9 ? 0.8 : 0));
      v.querySelector(".ro").textContent = num(P.years * q, 1) + P.unit;
    },
  };
  window.updateVisual = (svg, local, len) => {
    const enter = +svg.dataset.enter;
    svg.style.opacity = enter > 0 ? clamp(local / enter, 0, 1) : 1;
    const type = [...svg.classList].find(c => c.startsWith("vis-"))?.slice(4);
    const fn = types[type]; if (!fn) return;
    fn(svg, local, len, JSON.parse(svg.dataset.p));
  };
}
