// eclipse-corona (2D canvas): a total solar eclipse at totality. The Moon is a black disc darker than the field;
// the corona is a set of radial streamers from seeded fbm in polar coordinates, brightest at the limb and fading
// by 2.4 lunar radii, with two long equatorial streamers and shorter polar plumes, drawn additively in six passes
// of increasing blur so the inner corona is sharp and the outer a soft glow. The one warm accent is three small
// prominences at the limb (pink-red beads with a warm glow); in "diamond" it is the single bead of the diamond
// ring instead. A faint seeded star scatter outside 2.5 radii; the corona is masked below 0.68 of frame height
// (storyboard PA-03 for carousel-project-anchor-debunk, and the plate for future sky-event posts).
// Options (--var view=): "totality" (default), "diamond", "hero" (larger disc, centred, for the pop-out layer).
// layer=subject (from --alpha): the Moon's disc plus the inner corona to 1.4 radii (and the bead in diamond), no stars.
import { clamp, lerp, smooth, mix3, rgba, layer, field, blit, glow } from "./_lib.mjs";

export const kind = "2d";

let C, W, H, g, rng, view, subjectOnly, stars, proms, R, cx, cy;

export async function init(ctx) {
  C = ctx; W = ctx.W; H = ctx.H; g = ctx.g; rng = ctx.rng;
  view = ctx.opts.view || "totality"; subjectOnly = ctx.opts.layer === "subject";
  R = view === "hero" ? W * 0.26 : W * 0.19; cx = W * 0.5; cy = view === "hero" ? H * 0.5 : H * 0.40;
  stars = Array.from({ length: 120 }, () => ({ x: rng() * W, y: rng() * H, r: 0.5 + rng() * 1.3, a: 0.08 + rng() * 0.16 }));
  proms = Array.from({ length: 3 }, (_, i) => ({ ang: (i / 3) * Math.PI * 2 + rng() * 1.6 - 0.8 + 0.6, size: 6 + rng() * 4, rate: 0.32 + rng() * 0.16, ph: rng() * 6.28 }));
}

export function draw(t) {
  const subj = subjectOnly;
  const world = layer(W, H), wg = world.getContext("2d");
  if (!subj) {
    wg.fillStyle = "#0a1224"; wg.fillRect(0, 0, W, H);
    const vg = wg.createRadialGradient(cx, cy, R, cx, cy, H * 0.75); vg.addColorStop(0, "rgba(16,26,48,1)"); vg.addColorStop(1, "rgba(6,9,19,1)"); wg.fillStyle = vg; wg.fillRect(0, 0, W, H);
    for (const s of stars) { if (Math.hypot(s.x - cx, s.y - cy) < R * 2.5) continue; wg.fillStyle = rgba([220, 232, 245], s.a); wg.beginPath(); wg.arc(s.x, s.y, s.r, 0, Math.PI * 2); wg.fill(); }
  }
  // Corona field at half resolution, in a box of 4 radii around the disc.
  const dim = view === "diamond" ? 0.6 : 1.0, maxR = subj ? 1.8 : 4.0;
  const s = 0.5, bw = Math.round(R * 2 * maxR * s), bh = bw, ox = cx - R * maxR, oy = cy - R * maxR;
  const cor = field(bw, bh, (x, y, px) => {
    const dx = (x / s - R * maxR) / R, dy = (y / s - R * maxR) / R; const r = Math.hypot(dx, dy);
    if (r < 0.985 || r > maxR) { px[3] = 0; return; }
    const a = Math.atan2(dy, dx), ca = Math.cos(a), sa = Math.sin(a);
    // filaments: high angular frequency, low radial frequency, drifting slowly in phase
    const n1 = C.fbm(ca * 3.0 + 5.0, sa * 3.0 + 2.0, r * 0.9 + t * 0.05, 4, 0.55);
    const n2 = C.fbm(ca * 7.0 + 1.0, sa * 7.0 + 9.0, r * 1.6 - t * 0.03, 3, 0.5);
    const fil = clamp((n1 - 0.36) * 2.6, 0, 1) * (0.55 + 0.45 * clamp((n2 - 0.3) * 2.0, 0, 1));
    // envelope: bright at the limb, gone by 2.4 radii; equatorial streamers to 3.5 radii; short polar plumes
    const eq = Math.exp(-Math.pow(sa, 2) * 5.0), pol = Math.exp(-Math.pow(ca, 2) * 6.0);
    const reach = 2.4 + 1.1 * eq - 0.6 * pol;
    const env = Math.exp(-(r - 1) * (2.2 / (reach - 1))) * smooth(reach, reach - 0.6, r);
    const limb = Math.exp(-(r - 1) * 9.0);
    let v = (0.28 * limb + 0.75 * fil * env + 0.10 * env) * dim;
    if (subj) v *= smooth(1.4, 1.1, r); // the inner corona only, to 1.4 radii
    const col = mix3([234, 246, 255], [150, 205, 235], smooth(1.0, 2.0, r));
    px[0] = col[0]; px[1] = col[1]; px[2] = col[2]; px[3] = 255 * clamp(v, 0, 1);
  });
  const cw = bw / s, ch = bh / s;
  const passes = subj ? [[0, 0.9], [2, 0.6], [6, 0.5], [14, 0.4]] : [[0, 0.9], [2, 0.6], [6, 0.5], [14, 0.4], [30, 0.35], [60, 0.3]]; // the subject layer keeps only the sharp inner passes
  const cg = subj ? layer(cw, ch).getContext("2d") : wg; // subject: build the additive corona over black, then unpremultiply
  if (subj) { cg.fillStyle = "#000"; cg.fillRect(0, 0, cw, ch); cg.translate(-ox, -oy); }
  cg.save(); cg.globalCompositeOperation = "lighter";
  for (const [b, a] of passes) { const sc = b > 10 ? 4 : 1; if (sc > 1) { const sm = layer(cw / sc, ch / sc), sg = sm.getContext("2d"); sg.filter = `blur(${b / sc}px)`; sg.drawImage(cor, 0, 0, cw / sc, ch / sc); blit(cg, sm, cw, ch, { alpha: a, x: ox, y: oy }); } else blit(cg, cor, cw, ch, { alpha: a, blur: b, x: ox, y: oy }); }
  cg.restore();
  if (subj) { const id = cg.getImageData(0, 0, cw, ch), d = id.data; for (let i = 0; i < d.length; i += 4) { const a = Math.max(d[i], d[i + 1], d[i + 2]); if (a > 0) { d[i] = d[i] * 255 / a; d[i + 1] = d[i + 1] * 255 / a; d[i + 2] = d[i + 2] * 255 / a; } d[i + 3] = a; } cg.putImageData(id, 0, 0); wg.drawImage(cg.canvas, ox, oy); }
  // The Moon: a perfectly black disc, darker than the field so it reads as a hole.
  wg.fillStyle = "#03050c"; wg.beginPath(); wg.arc(cx, cy, R, 0, Math.PI * 2); wg.fill();
  if (view === "diamond") {
    // the diamond-ring bead at 40 degrees (upper right): white core, warm-white flare, four thin spikes
    const ang = -40 * Math.PI / 180, bx = cx + Math.cos(ang) * R, by = cy + Math.sin(ang) * R, grow = lerp(0.7, 1.0, smooth(0, 2, t));
    wg.save(); wg.globalCompositeOperation = "lighter";
    glow(wg, bx, by, 80 * grow, [255, 236, 200], 0.9); glow(wg, bx, by, 220 * grow, [255, 210, 150], 0.35);
    wg.strokeStyle = "rgba(255,240,215,0.55)"; wg.lineWidth = 1.5;
    for (let k = 0; k < 4; k++) { const sa = Math.PI / 4 + k * Math.PI / 2, L = 260 * grow; const lg = wg.createLinearGradient(bx - Math.cos(sa) * L, by - Math.sin(sa) * L, bx + Math.cos(sa) * L, by + Math.sin(sa) * L); lg.addColorStop(0, "rgba(255,240,215,0)"); lg.addColorStop(0.5, "rgba(255,240,215,0.7)"); lg.addColorStop(1, "rgba(255,240,215,0)"); wg.strokeStyle = lg; wg.beginPath(); wg.moveTo(bx - Math.cos(sa) * L, by - Math.sin(sa) * L); wg.lineTo(bx + Math.cos(sa) * L, by + Math.sin(sa) * L); wg.stroke(); }
    wg.restore();
    wg.fillStyle = "#ffffff"; wg.beginPath(); wg.arc(bx, by, 7 * grow, 0, Math.PI * 2); wg.fill();
    glow(wg, bx, by, 22 * grow, [255, 255, 255], 0.9);
  } else {
    // prominences: three small warm beads at the limb, each pulsing at its own rate
    for (const p of proms) { const k = 1 + 0.1 * Math.sin(t * 2 * Math.PI * p.rate + p.ph); const px2 = cx + Math.cos(p.ang) * (R + 2), py2 = cy + Math.sin(p.ang) * (R + 2);
      wg.save(); wg.globalCompositeOperation = "lighter"; glow(wg, px2, py2, 22 * k, [255, 140, 110], 0.7); wg.restore();
      wg.fillStyle = "#ff6a5a"; wg.beginPath(); wg.ellipse(px2, py2, p.size * 0.5 * k, p.size * 0.32 * k, p.ang, 0, Math.PI * 2); wg.fill();
      wg.fillStyle = "rgba(255,190,160,0.8)"; wg.beginPath(); wg.arc(px2, py2, p.size * 0.18 * k, 0, Math.PI * 2); wg.fill(); }
  }
  // lower third: the corona is masked below 0.68 of frame height
  if (!subj && view !== "hero") { const dg = wg.createLinearGradient(0, H * 0.6, 0, H * 0.72); dg.addColorStop(0, "rgba(10,18,36,0)"); dg.addColorStop(1, "rgba(8,13,26,0.97)"); wg.fillStyle = dg; wg.fillRect(0, H * 0.6, W, H * 0.4); }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (subj) g.clearRect(0, 0, W, H); else { g.fillStyle = "#0a1224"; g.fillRect(0, 0, W, H); } g.drawImage(world, 0, 0); g.restore();
}
