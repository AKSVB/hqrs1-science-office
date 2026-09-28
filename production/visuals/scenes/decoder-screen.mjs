// decoder-screen (2D canvas): a dark lab monitor seen from a low three-quarter angle at the upper left of the
// frame, its screen content mapped in perspective (strip-mapped quad), a thin dark bezel with one warm highlight
// along its top edge from a lamp out of frame, the screen's cyan glow bleeding onto the bezel and the bench, a
// coiled grey cable leaving the base toward the right, the bench falling to black in the lower third
// (storyboards AB-02/AB-04 for reel-avatar-bci; BG-03 for reel-brain-gamble). No letters, no numbers on screen.
// Options (--var view=): "traces" (default, AB-04: 16 scrolling neural traces with amber spikes), "hand" (AB-02:
// a low-poly wireframe hand raised in a wave), "hallway" (BG-03: a one-point-perspective corridor with two
// doorways), "hero" (the monitor square-on and large, for the pop-out layer).
// layer=subject (from --alpha): the monitor with its bezel and screen only; no bench, no cable, no glow pool.
import { clamp, lerp, smooth, mix3, rgba, layer, blit, glow, PAL } from "./_lib.mjs";

export const kind = "2d";

let C, W, H, g, rng, view, subjectOnly, spikes, traceSeeds, handTris, handPts;
const SW = 1280, SH = 800; // screen content resolution

// Wireframe hand: palm and five fingers built once from a fixed parametric description (no external model).
const buildHand = () => {
  const pts = [], tris = [];
  const add = (x, y) => { pts.push([x, y]); return pts.length - 1; };
  // palm: a rounded polygon fan, wrist at the bottom
  const palm = [[-0.34, 0.05], [-0.36, -0.25], [-0.28, -0.5], [-0.12, -0.62], [0.12, -0.62], [0.30, -0.5], [0.36, -0.25], [0.36, 0.05], [0.30, 0.22], [0.16, 0.30], [0.0, 0.32], [-0.16, 0.30], [-0.30, 0.22]];
  const c0 = add(0, -0.15), c1 = add(-0.15, -0.35), c2 = add(0.15, -0.35), c3 = add(0, 0.05);
  const ring = palm.map(p => add(p[0], p[1]));
  for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; const cc = palm[i][1] < -0.3 ? (palm[i][0] < 0 ? c1 : c2) : (palm[i][1] > 0.1 ? c3 : c0); tris.push([a, b, cc]); }
  tris.push([c0, c1, c2], [c0, c3, c1], [c0, c2, c3]);
  // fingers: base x, angle (radians from straight up), lengths of three segments, width
  const fingers = [[-0.28, 0.32, [0.22, 0.17, 0.14], 0.085], [-0.12, 0.08, [0.28, 0.2, 0.15], 0.09], [0.02, 0.0, [0.31, 0.22, 0.16], 0.09], [0.16, -0.07, [0.28, 0.2, 0.15], 0.085], [0.30, -0.16, [0.2, 0.15, 0.13], 0.075]];
  for (const [bx, ang, segs, w] of fingers) {
    const dx = Math.sin(ang), dy = Math.cos(ang), px = dy, py = -dx;
    let x = bx, y = 0.28, l = add(x - px * w / 2, y - py * w / 2), r = add(x + px * w / 2, y + py * w / 2);
    for (let s = 0; s < segs.length; s++) {
      x += dx * segs[s]; y += dy * segs[s]; const ww = w * (1 - 0.12 * s);
      const l2 = add(x - px * ww / 2, y - py * ww / 2), r2 = add(x + px * ww / 2, y + py * ww / 2), m = add(x, y);
      tris.push([l, r, r2], [l, r2, l2], [l2, r2, m]); l = l2; r = r2;
    }
  }
  // thumb: from the left side of the palm, angled out
  { const w = 0.1, a = 1.05, dx = -Math.sin(a), dy = Math.cos(a), px = dy, py = -dx; let x = -0.34, y = -0.15, l = add(x - px * w / 2, y - py * w / 2), r = add(x + px * w / 2, y + py * w / 2);
    for (const sl of [0.22, 0.18, 0.14]) { x += dx * sl; y += dy * sl; const l2 = add(x - px * w / 2, y - py * w / 2), r2 = add(x + px * w / 2, y + py * w / 2), m = add(x, y); tris.push([l, r, r2], [l, r2, l2], [l2, r2, m]); l = l2; r = r2; } }
  // forearm: two quads down from the wrist
  { const l = add(-0.2, -0.62), r = add(0.2, -0.62), l2 = add(-0.22, -1.1), r2 = add(0.22, -1.1), l3 = add(-0.24, -1.6), r3 = add(0.24, -1.6); tris.push([l, r, r2], [l, r2, l2], [l2, r2, r3], [l2, r3, l3]); }
  return { pts, tris };
};

export async function init(ctx) {
  C = ctx; W = ctx.W; H = ctx.H; g = ctx.g; rng = ctx.rng;
  view = ctx.opts.view || "traces"; subjectOnly = ctx.opts.layer === "subject";
  traceSeeds = Array.from({ length: 16 }, () => rng() * 100);
  // spikes: about one per second across all traces, seeded, over a 40 s window
  spikes = Array.from({ length: 44 }, () => ({ tr: Math.floor(rng() * 16), at: rng() * 40, h: 0.5 + rng() * 0.5 }));
  const h = buildHand(); handTris = h.tris; handPts = h.pts;
}

// Screen content at time t, drawn into an offscreen SW x SH canvas.
const drawScreen = (t, flick) => {
  const c = layer(SW, SH), s = c.getContext("2d");
  s.fillStyle = "#111b31"; s.fillRect(0, 0, SW, SH);
  const rg = s.createRadialGradient(SW * 0.5, SH * 0.45, 0, SW * 0.5, SH * 0.45, SW * 0.7); rg.addColorStop(0, "rgba(40,58,96,0.95)"); rg.addColorStop(1, "rgba(13,20,38,0)"); s.fillStyle = rg; s.fillRect(0, 0, SW, SH);
  const cyan = `rgba(110,235,246,${0.95 * flick})`, amber = "rgba(255,176,32,0.95)";
  s.lineCap = "round"; s.lineJoin = "round";
  if (view === "traces" || view === "hero") {
    const n = 16, pad = 40, rowH = (SH - 2 * pad - 60) / n, scroll = t * 90 / SW * 4.0; // 90 px/s of screen scroll in fbm units
    for (let i = 0; i < n; i++) {
      const y0 = pad + rowH * (i + 0.5); s.strokeStyle = cyan; s.lineWidth = 2; s.beginPath();
      for (let x = 0; x <= SW; x += 3) { const u = x / SW * 4.0 + scroll; const v = (C.fbm(u * 2.2 + traceSeeds[i], traceSeeds[i] * 0.3, 1.7, 4) - 0.5) * rowH * 1.6 + (C.noise(u * 9 + traceSeeds[i], 3.3, 0) - 0.5) * rowH * 0.5; if (x === 0) s.moveTo(x, y0 + v); else s.lineTo(x, y0 + v); }
      s.stroke();
    }
    // amber spikes: 40 ms wide (3.6 px), placed by time: a spike at time a sits at x = SW - (t - a) * 90 px
    for (const sp of spikes) { const x = SW - (t - sp.at) * 90 - 60; if (x < 0 || x > SW) continue; const y0 = pad + rowH * (sp.tr + 0.5); s.strokeStyle = amber; s.lineWidth = 3.6; s.beginPath(); s.moveTo(x, y0 + rowH * 0.35); s.lineTo(x, y0 - rowH * 0.9 * sp.h); s.stroke(); const gl = s.createRadialGradient(x, y0 - rowH * 0.3, 0, x, y0 - rowH * 0.3, 26); gl.addColorStop(0, "rgba(255,176,32,0.35)"); gl.addColorStop(1, "rgba(255,176,32,0)"); s.fillStyle = gl; s.fillRect(x - 26, y0 - rowH * 1.2, 52, rowH * 1.6); }
    // time axis: a thin muted line with unlabelled ticks
    s.strokeStyle = "rgba(120,140,170,0.55)"; s.lineWidth = 2; s.beginPath(); s.moveTo(pad, SH - 44); s.lineTo(SW - pad, SH - 44); s.stroke();
    const off = (t * 90) % 90; for (let x = SW - pad - off; x > pad; x -= 90) { s.beginPath(); s.moveTo(x, SH - 44); s.lineTo(x, SH - 32); s.stroke(); }
  } else if (view === "hand") {
    const rot = 12 * Math.PI / 180 * Math.sin(t * 2 * Math.PI * 0.7); // the wave: the wrist rocks +/- 12 degrees at 0.7 Hz
    const wx = SW * 0.5, wy = SH * 0.66, sc = SH * 0.44; // wrist pivot on screen
    const P = handPts.map(([x, y]) => { const rx = x * Math.cos(rot) - y * Math.sin(rot), ry = x * Math.sin(rot) + y * Math.cos(rot); return [wx + rx * sc, wy - ry * sc]; });
    s.fillStyle = `rgba(79,227,240,${0.2 * flick})`; s.strokeStyle = cyan; s.lineWidth = 2;
    for (const [a, b, c2] of handTris) { s.beginPath(); s.moveTo(P[a][0], P[a][1]); s.lineTo(P[b][0], P[b][1]); s.lineTo(P[c2][0], P[c2][1]); s.closePath(); s.fill(); s.stroke(); }
    // tracked points: three amber discs, two fingertips and the wrist (schematic)
    const tips = [handPts.findIndex(p => p[1] > 1.05), handPts.findIndex(p => p[0] < -0.62 && p[1] > 0.3), handPts.findIndex(p => p[1] === -0.62 && p[0] === 0.2)];
    for (const i of tips) { if (i < 0) continue; const [x, y] = P[i]; s.fillStyle = amber; s.beginPath(); s.arc(x, y, 7, 0, Math.PI * 2); s.fill(); const gl = s.createRadialGradient(x, y, 0, x, y, 30); gl.addColorStop(0, "rgba(255,176,32,0.45)"); gl.addColorStop(1, "rgba(255,176,32,0)"); s.fillStyle = gl; s.fillRect(x - 30, y - 30, 60, 60); }
  } else if (view === "hallway") {
    const vx = SW * (0.5 + 0.01 * Math.sin(t * 2 * Math.PI * 0.2)), vy = SH * (0.42 + 0.01 * Math.cos(t * 2 * Math.PI * 0.2));
    const L = SW * 0.16, Rr = SW * 0.84, T0 = SH * 0.06, B = SH * 0.94; // near frame of the corridor
    const toV = (x, y, k) => [lerp(x, vx, k), lerp(y, vy, k)];
    s.strokeStyle = cyan; s.lineWidth = 2;
    const edge = (x, y) => { s.beginPath(); s.moveTo(x, y); const e = toV(x, y, 0.965); s.lineTo(e[0], e[1]); s.stroke(); };
    edge(L, T0); edge(Rr, T0); edge(L, B); edge(Rr, B);
    // receding transverse lines on floor, ceiling and walls, spaced by perspective
    s.strokeStyle = `rgba(79,227,240,${0.35 * flick})`;
    for (let i = 1; i <= 9; i++) { const k = 1 - 1 / (1 + i * 0.7); const a = toV(L, B, k), b = toV(Rr, B, k), c2 = toV(L, T0, k), d = toV(Rr, T0, k); s.beginPath(); s.moveTo(a[0], a[1]); s.lineTo(b[0], b[1]); s.moveTo(c2[0], c2[1]); s.lineTo(d[0], d[1]); s.moveTo(a[0], a[1]); s.lineTo(c2[0], c2[1]); s.moveTo(b[0], b[1]); s.lineTo(d[0], d[1]); s.stroke(); }
    // far end: a small brighter rectangle
    { const a = toV(L, T0, 0.965), b = toV(Rr, B, 0.965); s.fillStyle = `rgba(79,227,240,${0.18 * flick})`; s.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
    // two doorways: brighter quads on the left and right walls at different depths
    const door = (side, k0, k1) => { const x = side < 0 ? L : Rr; const y0 = T0 + (B - T0) * 0.16, y1 = B; const p = [toV(x, y0, k0), toV(x, y0, k1), toV(x, y1, k1), toV(x, y1, k0)];
      s.fillStyle = `rgba(79,227,240,${0.22 * flick})`; s.beginPath(); s.moveTo(p[0][0], p[0][1]); for (let i = 1; i < 4; i++) s.lineTo(p[i][0], p[i][1]); s.closePath(); s.fill(); s.strokeStyle = cyan; s.lineWidth = 2.5; s.stroke(); };
    door(-1, 0.28, 0.45); door(1, 0.5, 0.63);
  }
  // 3 percent scanlines
  s.fillStyle = "rgba(0,0,0,0.06)"; for (let y = 0; y < SH; y += 3) s.fillRect(0, y, SW, 1);
  return c;
};

// Perspective strip mapping of a source canvas onto the quad [tl, tr, br, bl] (each [x, y]), n vertical strips.
const mapQuad = (dst, src, q, n = 96) => {
  const [tl, tr, br, bl] = q; const sw = src.width / n;
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n;
    const t0x = lerp(tl[0], tr[0], u0), t0y = lerp(tl[1], tr[1], u0), t1x = lerp(tl[0], tr[0], u1), t1y = lerp(tl[1], tr[1], u1);
    const b0x = lerp(bl[0], br[0], u0), b0y = lerp(bl[1], br[1], u0);
    // affine: strip x axis (t0 -> t1), y axis (t0 -> b0)
    const ax = (t1x - t0x) / sw, ay = (t1y - t0y) / sw, bx = (b0x - t0x) / src.height, by = (b0y - t0y) / src.height;
    dst.save(); dst.setTransform(ax, ay, bx, by, t0x, t0y); dst.drawImage(src, i * sw, 0, sw + 1.5, src.height, 0, 0, sw + 1.5, src.height); dst.restore();
  }
};

export function draw(t) {
  const flick = 1 + 0.02 * Math.sin(t * 2 * Math.PI * 8);
  const drift = { x: W * 0.03 * 0.5 * Math.sin(t * 0.21), y: H * 0.01 * Math.cos(t * 0.17) }; // 3 percent slow drift of the whole monitor
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (subjectOnly) g.clearRect(0, 0, W, H); else { g.fillStyle = "#060913"; g.fillRect(0, 0, W, H); const bgg = g.createLinearGradient(0, 0, 0, H); bgg.addColorStop(0, "#0a1020"); bgg.addColorStop(0.55, "#070b16"); bgg.addColorStop(1, "#03050a"); g.fillStyle = bgg; g.fillRect(0, 0, W, H); }
  g.restore();
  // The monitor quad in frame fractions: low three-quarter view, upper 55 percent, right edge further away.
  const hero = view === "hero";
  const fx = (u) => W * u + drift.x, fy = (v) => H * v + drift.y;
  const q = hero ? [[fx(0.10), fy(0.24)], [fx(0.92), fy(0.30)], [fx(0.90), fy(0.66)], [fx(0.12), fy(0.62)]]
                 : [[fx(0.07), fy(0.13)], [fx(0.82), fy(0.205)], [fx(0.80), fy(0.545)], [fx(0.09), fy(0.53)]];
  const screen = drawScreen(t, flick);
  const world = layer(W, H), wg = world.getContext("2d");
  const bezel = 0.03; // bezel thickness as a fraction of the quad's width
  const expand = (qq, k) => { const cx = (qq[0][0] + qq[1][0] + qq[2][0] + qq[3][0]) / 4, cy = (qq[0][1] + qq[1][1] + qq[2][1] + qq[3][1]) / 4; return qq.map(p => [cx + (p[0] - cx) * (1 + k), cy + (p[1] - cy) * (1 + k * 1.25)]); };
  const qb = expand(q, bezel * 1.6);
  if (!subjectOnly) {
    // bench: a dark surface under the monitor, the screen glow bleeding onto it, one warm pool under the left corner
    const benchY = (q[2][1] + q[3][1]) / 2 + H * 0.06;
    { const bgd = wg.createLinearGradient(0, benchY - H * 0.02, 0, H); bgd.addColorStop(0, "#161c2c"); bgd.addColorStop(0.35, "#0b0f1a"); bgd.addColorStop(1, "#04060b"); wg.fillStyle = bgd; wg.fillRect(0, benchY - H * 0.02, W, H); }
    // the screen's reflection in the bench: the content mirrored, squashed and blurred
    { const rq = [[q[3][0], benchY + (benchY - q[3][1]) * 0.55], [q[2][0], benchY + (benchY - q[2][1]) * 0.55], [q[2][0], benchY + H * 0.005], [q[3][0], benchY + H * 0.005]];
      const rl = layer(W / 3, H / 3), rg2 = rl.getContext("2d"); rg2.scale(1 / 3, 1 / 3); mapQuad(rg2, screen, rq, 32); blit(wg, rl, W, H, { blur: 9, alpha: 0.22, mode: "screen" }); }
    const gl = layer(W / 4, H / 4), gg = gl.getContext("2d"); gg.scale(0.25, 0.25);
    gg.globalAlpha = 0.55; mapQuad(gg, screen, expand(q, 0.10), 24); blit(wg, gl, W, H, { blur: 22, alpha: 0.6, mode: "screen" });
    // the stand and base
    const bx = (q[2][0] + q[3][0]) / 2, by = (q[2][1] + q[3][1]) / 2;
    wg.fillStyle = "#101521"; wg.beginPath(); wg.moveTo(bx - W * 0.03, by); wg.lineTo(bx + W * 0.03, by + H * 0.003); wg.lineTo(bx + W * 0.025, by + H * 0.055); wg.lineTo(bx - W * 0.025, by + H * 0.053); wg.closePath(); wg.fill();
    wg.fillStyle = "#0c1019"; wg.beginPath(); wg.ellipse(bx, by + H * 0.058, W * 0.14, H * 0.012, 0.02, 0, Math.PI * 2); wg.fill();
    // warm pool on the bench under the monitor's left corner (the lamp out of frame, upper left)
    glow(wg, q[3][0] - W * 0.06, benchY + H * 0.005, W * 0.5, [255, 176, 32], 0.3);
    { const wl = wg.createLinearGradient(0, benchY - H * 0.02, 0, benchY + H * 0.12); wl.addColorStop(0, "rgba(255,190,100,0.10)"); wl.addColorStop(1, "rgba(255,190,100,0)"); wg.fillStyle = wl; wg.fillRect(0, benchY - H * 0.02, W * 0.5, H * 0.14); }
    // coiled cable from the base toward the right: a spring of overlapping loops, dark grey with a thin highlight
    const coil = (dx, dy, col, w) => { wg.strokeStyle = col; wg.lineWidth = w; wg.lineCap = "round"; wg.beginPath();
      for (let i = 0; i <= 900; i++) { const s = i / 900, a = s * 2 * Math.PI * 34, r = W * 0.012; const x = bx + W * 0.05 + s * W * 0.62 + r * Math.cos(a) + dx, y = by + H * 0.062 + s * H * 0.075 + Math.sin(s * 3.14) * H * 0.012 + r * 0.45 * Math.sin(a) + dy; if (i === 0) wg.moveTo(x, y); else wg.lineTo(x, y); } wg.stroke(); };
    coil(0, 0, "#2c313b", 7); coil(0, -1.5, "rgba(150,160,180,0.28)", 1.6);
  }
  // bezel: a rounded dark slab, its top edge catching the warm lamp
  const poly = (qq) => { wg.beginPath(); wg.moveTo(qq[0][0], qq[0][1]); for (let i = 1; i < 4; i++) wg.lineTo(qq[i][0], qq[i][1]); wg.closePath(); };
  const qback = expand(qb, 0.012).map((p) => [p[0] - W * 0.006, p[1] + H * 0.004]);
  wg.fillStyle = "#0b0e15"; poly(qback); wg.fill();
  { const d = W * 0.018; wg.fillStyle = "#1b1f28"; wg.beginPath(); wg.moveTo(qb[0][0], qb[0][1]); wg.lineTo(qb[0][0] - d, qb[0][1] + H * 0.006); wg.lineTo(qb[3][0] - d, qb[3][1] + H * 0.006); wg.lineTo(qb[3][0], qb[3][1]); wg.closePath(); wg.fill(); }
  const bg2 = wg.createLinearGradient(qb[0][0], qb[0][1], qb[3][0], qb[3][1]); bg2.addColorStop(0, "#2a2e36"); bg2.addColorStop(0.08, "#171a21"); bg2.addColorStop(1, "#0f1218"); wg.fillStyle = bg2; poly(qb); wg.fill();
  // warm highlight along the top edge
  wg.strokeStyle = "rgba(255,190,90,0.75)"; wg.lineWidth = 3; wg.lineCap = "round"; wg.beginPath(); wg.moveTo(qb[0][0], qb[0][1]); wg.lineTo(qb[1][0], qb[1][1]); wg.stroke();
  wg.strokeStyle = "rgba(255,190,90,0.18)"; wg.lineWidth = 9; wg.beginPath(); wg.moveTo(qb[0][0], qb[0][1]); wg.lineTo(qb[1][0], qb[1][1]); wg.stroke();
  wg.strokeStyle = "rgba(200,140,60,0.25)"; wg.lineWidth = 2; wg.beginPath(); wg.moveTo(qb[0][0], qb[0][1]); wg.lineTo(qb[3][0], qb[3][1]); wg.stroke();
  // screen glass: the content, then a soft reflection of the lamp and the cyan bleed onto the bezel
  mapQuad(wg, screen, q, 120);
  { const gr = wg.createLinearGradient(q[0][0], q[0][1], q[3][0], q[3][1]); gr.addColorStop(0, "rgba(255,220,170,0.10)"); gr.addColorStop(0.35, "rgba(255,220,170,0)"); gr.addColorStop(1, "rgba(0,0,0,0.18)"); wg.fillStyle = gr; poly(q); wg.fill(); }
  { const bl = layer(W / 8, H / 8), bgc = bl.getContext("2d"); bgc.scale(1 / 8, 1 / 8); mapQuad(bgc, screen, q, 16); blit(wg, bl, W, H, { blur: 7, alpha: 0.45, mode: "screen" }); }
  if (!subjectOnly) { const dg = wg.createLinearGradient(0, H * 0.6, 0, H); dg.addColorStop(0, "rgba(3,5,10,0)"); dg.addColorStop(0.5, "rgba(3,5,10,0.85)"); dg.addColorStop(1, "rgba(3,5,10,0.97)"); wg.fillStyle = dg; wg.fillRect(0, H * 0.6, W, H * 0.4); }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (subjectOnly) g.clearRect(0, 0, W, H); g.drawImage(world, 0, 0); g.restore();
}
