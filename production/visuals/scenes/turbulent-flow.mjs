// turbulent-flow (2D canvas): ink in water. A divergence-free velocity field (a counter-rotating vortex pair plus
// the curl of a seeded fbm potential, sampled on a grid of time keyframes) advects 24,000 seeded tracers from
// t = 0 with a fixed-step integrator, so every frame is a pure function of t and the seed. Tracers are drawn as
// short additive strokes coloured by age (fresh ink amber, ageing through cream to the cool blue-grey of the
// field); a soft density layer under them gives the plume its body. The freshest ink is the single warm light
// (storyboards NS-01 to NS-04 for reel-ai-navier-stokes).
// Options (--var view=): "ink" (default: one plume from the upper centre folding into two spirals), "vortex"
// (2x closer on one spiral), "forced" (a continuous source at the upper left with a rotating force term, the
// flow keeps stirring), "free" (the same seed with no source and no force, the flow decays), "hero" (the plume
// centred, for the pop-out layer).
// layer=subject (from --alpha): the plume (tracers and density) on a transparent background.
import { clamp, lerp, smooth, mix3, rgba, layer, blit, glow } from "./_lib.mjs";

export const kind = "2d";

let C, W, H, g, rng, view, subjectOnly, P, N, GX, GY, AR, keyframes = [], forced, free;
const KF_DT = 0.25, DT = 1 / 60, MAX_STEPS = 180;

// Velocity at (u, v) (units of frame width, v downward) at time t: a vortex pair (or its decayed remains), curl noise, the forcing dipole.
const fieldAt = (u, v, t) => {
  const decay = free ? Math.exp(-t / 1.4) : 1;
  let vx = 0, vy = 0;
  // the vortex pair at the upper middle: counter-rotating, Gaussian cores; the pair drifts slowly downward
  const cy = 0.40 * AR + 0.02 * smooth(0, 3, t), rc = 0.07;
  for (const [cx, G] of [[0.5 - 0.115, 1], [0.5 + 0.115, -1]]) {
    const dx = u - cx, dy = v - cy, r2 = dx * dx + dy * dy; const k = G * 0.065 / (r2 + rc * rc) * (1 - Math.exp(-r2 / (rc * rc)));
    vx += -dy * k; vy += dx * k;
  }
  // curl noise: the turbulence
  const e = 0.004, s = 4.2, z = t * 0.12;
  const A = 0.06;
  const pu1 = C.fbm((u + e) * s, v * s, z, 3), pu0 = C.fbm((u - e) * s, v * s, z, 3), pv1 = C.fbm(u * s, (v + e) * s, z, 3), pv0 = C.fbm(u * s, (v - e) * s, z, 3);
  vx += A * (pv1 - pv0) / (2 * e); vy -= A * (pu1 - pu0) / (2 * e);
  // forced: a rotating dipole at the source (an external force term), so the flow never settles
  if (forced) { const sx = 0.18, sy = 0.22 * AR, dx = u - sx, dy = v - sy, r2 = dx * dx + dy * dy, w = t * 1.6; const kk = 0.06 * Math.exp(-r2 / 0.02); vx += kk * (Math.cos(w) * dy - Math.sin(w) * dx) / 0.08 + 0.05 * Math.exp(-r2 / 0.006); vy += kk * (Math.sin(w) * dy + Math.cos(w) * dx) / 0.08 + 0.02 * Math.exp(-r2 / 0.006); }
  // a gentle downward settling so filaments trail toward the lower edges
  vy += 0.006;
  return [vx * decay, vy * decay];
};

const gridFor = (t) => { const f = new Float32Array(GX * GY * 2); for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { const [vx, vy] = fieldAt(i / (GX - 1), j / (GY - 1) * AR, t); f[(j * GX + i) * 2] = vx; f[(j * GX + i) * 2 + 1] = vy; } return f; };

export async function init(ctx) {
  C = ctx; W = ctx.W; H = ctx.H; g = ctx.g; rng = ctx.rng; AR = H / W;
  view = ctx.opts.view || "ink"; subjectOnly = ctx.opts.layer === "subject"; forced = view === "forced"; free = view === "free";
  GX = 96; GY = Math.round(96 * AR);
  // Tracers: 24,000. Half released at t = 0 from a point at the upper centre (the plume), half from the source over
  // 0..3 s (used only when forced; in free they share the same seed but are never born).
  N = 24000; P = { x0: new Float32Array(N), y0: new Float32Array(N), birth: new Float32Array(N), w: new Float32Array(N), ph: new Float32Array(N), warm: new Float32Array(N) };
  for (let i = 0; i < N; i++) {
    const src = i >= N / 2; const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * (src ? 0.012 : 0.17);
    P.warm[i] = src ? 1 : Math.pow(clamp(1 - r / 0.17, 0, 1), 0.9); // the freshest ink is the plume's core
    // the plume: an irregular cloud around the vortex pair, denser toward its core and thinned by noise
    const nx = (src ? 0.18 : 0.5) + Math.cos(a) * r, ny = (src ? 0.22 : 0.36) * AR + Math.sin(a) * r * 0.8;
    if (!src && ctx.fbm(nx * 9 + 3, ny * 9, 1.5, 3) < 0.42) { P.x0[i] = 0.5 + Math.cos(a) * r * 0.3; P.y0[i] = 0.30 * AR + Math.sin(a) * r * 0.3; } else { P.x0[i] = nx; P.y0[i] = ny; }
    P.birth[i] = src ? (forced ? rng() * 3.0 : 1e9) : 0; P.w[i] = 0.8 + rng() * 2.2; P.ph[i] = rng();
  }
  for (let k = 0; k <= Math.ceil(6 / KF_DT); k++) keyframes.push(gridFor(k * KF_DT));
}

const sample = (f, u, v, out) => {
  const x = clamp(u * (GX - 1), 0, GX - 1.001), y = clamp(v / AR * (GY - 1), 0, GY - 1.001), i = x | 0, j = y | 0, fx = x - i, fy = y - j;
  const a = (j * GX + i) * 2, b = a + 2, c = a + GX * 2, d = c + 2;
  out[0] = (f[a] * (1 - fx) + f[b] * fx) * (1 - fy) + (f[c] * (1 - fx) + f[d] * fx) * fy;
  out[1] = (f[a + 1] * (1 - fx) + f[b + 1] * fx) * (1 - fy) + (f[c + 1] * (1 - fx) + f[d + 1] * fx) * fy;
};

export function draw(t) {
  const steps = Math.min(MAX_STEPS, Math.max(1, Math.ceil(t / DT))), dt = t / steps;
  const x = new Float32Array(N), y = new Float32Array(N), px = new Float32Array(N), py = new Float32Array(N), alive = new Uint8Array(N);
  x.set(P.x0); y.set(P.y0);
  const va = [0, 0], vb = [0, 0];
  for (let s = 0; s < steps; s++) {
    const t0 = s * dt, t1 = (s + 1) * dt, kf = Math.min(keyframes.length - 2, Math.floor(t0 / KF_DT)), q = clamp(t0 / KF_DT - kf, 0, 1), fa = keyframes[kf], fb = keyframes[kf + 1];
    const last = s === steps - 1;
    for (let i = 0; i < N; i++) {
      if (P.birth[i] > t1) continue;
      if (P.birth[i] > t0) { alive[i] = 1; continue; } // born this step
      alive[i] = 1;
      sample(fa, x[i], y[i], va); sample(fb, x[i], y[i], vb);
      const vx = lerp(va[0], vb[0], q), vy = lerp(va[1], vb[1], q);
      if (last) { px[i] = x[i]; py[i] = y[i]; }
      x[i] += vx * dt; y[i] += vy * dt;
    }
  }
  // Camera: fixed orthographic; vortex view scales by 2 about the left spiral's core.
  const zoom = view === "vortex" ? 2 : view === "hero" ? 1.25 : 1, cxv = view === "vortex" ? 0.615 : 0.5, cyv = view === "vortex" ? 0.42 * AR : view === "hero" ? 0.5 * AR : 0.5 * AR;
  const toX = (u) => W * (0.5 + (u - cxv) * zoom), toY = (v) => H * (0.5 + (v - cyv) * zoom / AR);
  const world = layer(W, H), wg = world.getContext("2d");
  if (!subjectOnly) { wg.fillStyle = "#060913"; wg.fillRect(0, 0, W, H); const lift = wg.createRadialGradient(toX(0.5), toY(0.4 * AR), 0, toX(0.5), toY(0.4 * AR), W * 0.7); lift.addColorStop(0, "rgba(28,40,66,0.55)"); lift.addColorStop(1, "rgba(6,9,19,0)"); wg.fillStyle = lift; wg.fillRect(0, 0, W, H); }
  // density layer: soft splats at low resolution, blurred, with a 1 percent slow drift
  const D = 8, dl = layer(W / D, H / D), dg = dl.getContext("2d"); dg.globalCompositeOperation = "lighter";
  const amber = [255, 176, 32], cream = [255, 232, 190], cool = [79, 227, 240], grey = [110, 130, 150];
  // colour: warmth from the ink's freshness (the plume core, or a source tracer's age), cooling with age; free decays to grey
  const colFor = (i, age) => { const dimK = free ? 1 - 0.55 * smooth(0.8, 3.0, t) : 1; let w = P.warm[i] * (1 - smooth(0.8, 3.5, age)); if (free) w *= 1 - smooth(0.3, 2.0, t); const c = w > 0.5 ? mix3(cream, amber, (w - 0.5) * 2) : mix3(mix3(cool, grey, smooth(2.5, 6, age)), cream, w * 2); return [c[0] * dimK, c[1] * dimK, c[2] * dimK]; };
  for (let i = 0; i < N; i += 3) { if (!alive[i]) continue; const age = t - P.birth[i]; const c = colFor(i, age); dg.fillStyle = rgba(c, 0.05 * (1 - smooth(4, 6, age))); dg.beginPath(); dg.arc(toX(x[i]) / D, toY(y[i]) / D, 40 / D, 0, Math.PI * 2); dg.fill(); }
  const drift = { x: W * 0.01 * Math.sin(t * 0.3), y: H * 0.005 * Math.cos(t * 0.25) };
  blit(wg, dl, W, H, { blur: 14, alpha: 0.45, mode: "screen", x: drift.x, y: drift.y });
  // tracers: short strokes, length from speed, width 1..3 px, additive
  wg.save(); wg.globalCompositeOperation = "lighter"; wg.lineCap = "round";
  for (let i = 0; i < N; i++) {
    if (!alive[i]) continue; const age = t - P.birth[i]; if (age > 6) continue;
    const ax = toX(px[i]), ay = toY(py[i]), bx = toX(x[i]), by = toY(y[i]);
    const dx = bx - ax, dy = by - ay, sp = Math.hypot(dx, dy); const L = clamp(sp * 6, 1.5, 22);
    const c = colFor(i, age); const a = (0.10 + 0.14 * P.warm[i]) * (1 - smooth(4, 6, age)) * (0.6 + 0.4 * P.ph[i]);
    wg.strokeStyle = rgba(c, a); wg.lineWidth = P.w[i] * 0.8;
    const nx = sp > 0 ? dx / sp : 0, ny = sp > 0 ? dy / sp : 1;
    wg.beginPath(); wg.moveTo(bx - nx * L, by - ny * L); wg.lineTo(bx, by); wg.stroke();
  }
  wg.restore();
  if (forced) { const sx = toX(0.18), sy = toY(0.22 * AR); glow(wg, sx, sy, 60, amber, 0.5); wg.fillStyle = "#ffb020"; wg.beginPath(); wg.arc(sx, sy, 9, 0, Math.PI * 2); wg.fill(); }
  // the freshest ink is the warm light: a soft amber pool where the young tracers are (the plume head)
  if (!subjectOnly && (!free || t < 1.5)) { let sx = 0, sy = 0, n = 0; for (let i = 0; i < N; i += 20) { if (!alive[i] || P.warm[i] < 0.6) continue; sx += x[i]; sy += y[i]; n++; } if (n > 0) glow(wg, toX(sx / n), toY(sy / n), W * 0.25, amber, 0.12 * (free ? 1 - t / 1.5 : 1)); }
  // lower third: the tracers are clipped by a gradient mask below 0.68 of frame height
  if (!subjectOnly && view !== "hero") { const dg2 = wg.createLinearGradient(0, H * 0.6, 0, H * 0.72); dg2.addColorStop(0, "rgba(6,9,19,0)"); dg2.addColorStop(1, "rgba(6,9,19,0.97)"); wg.fillStyle = dg2; wg.fillRect(0, H * 0.6, W, H * 0.4); }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (subjectOnly) g.clearRect(0, 0, W, H); else { g.fillStyle = "#060913"; g.fillRect(0, 0, W, H); } g.drawImage(world, 0, 0); g.restore();
}
