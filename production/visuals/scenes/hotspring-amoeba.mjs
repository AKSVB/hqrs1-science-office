// hotspring-amoeba: a translucent amoeba glowing amber from within, floating in dark teal hot-spring water.
// Storyboard FA-01 (reel-fire-amoeba hook and end card); FA-05 (dividing) and FA-06 (protective ball) via ?variant=.
// Layers (back to front): water depth gradient with a faint caustic shimmer, lumpy mineral crust along the top and
// one side (height-field shading, sulphur staining, wet rim), the cell's soft shadow on the water, the metaball
// amoeba (translucent body, fine granular cytoplasm, amber glow from the core, thin bright membrane), bubbles at
// three depths (bokeh on the near ones), layered steam across the top, drifting motes. Slow camera drift.
// One warm light: the cell. Everything else is cool.
import { clamp, lerp, smooth, mix3, rgba, layer, field, blit, glow, bubble, steamField } from "./_lib.mjs";

export const kind = "2d";

let C, W, H, g, rng, ww, wh;
let waterLo, crust, crustShadow, bubbles, motes, blobs, nucleus, cell, variant;

export async function init(ctx) {
  C = ctx; W = ctx.W; H = ctx.H; g = ctx.g; rng = ctx.rng;
  variant = ctx.opts.variant || "pool"; // pool (FA-01) | dividing (FA-05) | ball (FA-06)
  ww = W * 1.12; wh = H * 1.12; // world larger than the frame so the camera can drift

  // 1. Water: teal at the top falling to blue-black; a very soft large-scale variation so it is not a flat ramp.
  waterLo = field(ww / 4, wh / 4, (x, y, px) => {
    const u = x / (ww / 4), v = y / (wh / 4);
    const n = C.fbm(u * 1.6, v * 2.4, 0.3, 3, 0.5);
    const top = [11, 50, 60], mid = [8, 28, 40], bot = [5, 9, 18];
    const c = v < 0.45 ? mix3(top, mid, v / 0.45) : mix3(mid, bot, (v - 0.45) / 0.55);
    const k = 0.92 + 0.16 * (n - 0.5) + 0.06 * smooth(0.6, 0.2, Math.hypot(u - 0.5, (v - 0.4) * 1.4)); // faint lift around the cell
    px[0] = c[0] * k; px[1] = c[1] * k; px[2] = c[2] * k;
  });

  // 2. Mineral crust: a domain-warped fbm mask hugging the top edge and the upper right side (asymmetric, so it
  //    reads as a bank, not a frame). A height field gives lumpy 3D shading under cool top light; the rim at the
  //    water line is wet dark rock; the dry crust is pale silica with ochre sulphur staining.
  const cw = ww / 2, ch = wh / 2;
  const hmap = (u, v) => C.fbm(u * 7 + C.fbm(u * 3, v * 5, 8.8, 2) * 1.2, v * 12, 4.2, 5, 0.52);
  const maskAt = (u, v) => {
    const eTop = (1 - smooth(0.0, 0.14, v)) * (0.6 + 0.6 * smooth(0.2, 0.9, u));
    const eRight = (1 - smooth(0.0, 0.22, 1 - u)) * (1 - smooth(0.30, 0.62, v));
    const eLeft = (1 - smooth(0.0, 0.10, u)) * (1 - smooth(0.08, 0.30, v));
    const shape = Math.max(eTop, eRight, eLeft);
    const n = C.fbm(u * 4.5 + C.fbm(u * 2, v * 3, 1.1, 2) * 0.8, v * 7.5, 3.3, 4, 0.55);
    return smooth(0.40, 0.60, shape * 0.95 + (n - 0.5) * 0.8);
  };
  crust = field(cw, ch, (x, y, px) => {
    const u = x / cw, v = y / ch;
    const m = maskAt(u, v);
    if (m <= 0.002) { px[3] = 0; return; }
    const h = hmap(u, v), e = 0.0025;
    const dhx = (hmap(u + e, v) - h) / e, dhy = (hmap(u, v + e) - h) / e; // slope
    const shade = clamp(0.62 + (-dhy * 0.10 - dhx * 0.03), 0.15, 1.25); // cool light from above
    const fine = C.fbm(u * 70, v * 120, 7.7, 3, 0.5), grit = C.noise(u * 420, v * 700, 2.2);
    const dry = smooth(0.55, 0.95, m); // interior is dry and pale; the rim is wet dark rock
    const pale = [172, 166, 150], ochre = [160, 112, 52], rock = [30, 36, 42], wetHi = [70, 95, 105];
    let c = mix3(pale, ochre, smooth(0.42, 0.72, C.fbm(u * 9, v * 15, 6.1, 3)) * 0.8);
    c = mix3(c, [120, 116, 108], smooth(0.5, 0.8, fine) * 0.5);
    c = mix3(rock, c, dry * (0.45 + 0.55 * h));
    c = mix3(c, wetHi, (1 - dry) * smooth(0.55, 0.8, h) * 0.6); // wet sheen on the rim
    const k = shade * (0.75 + 0.25 * fine + 0.12 * (grit - 0.5));
    px[0] = c[0] * k * 0.68; px[1] = c[1] * k * 0.72; px[2] = c[2] * k * 0.82; px[3] = 255 * m;
  });
  crustShadow = layer(cw / 4, ch / 4); { const cg = crustShadow.getContext("2d"); cg.filter = "blur(6px)"; cg.drawImage(crust, 0, 0, cw / 4, ch / 4); }

  // 3. The cell. Core plus lobed pseudopods (each a chain of shrinking blobs), upper middle of the frame.
  const cx = ww * 0.5, cy = wh * 0.40;
  cell = { cx, cy, r: Math.min(ww, wh) * 0.17 };
  const R = cell.r;
  blobs = [];
  const core = (dx, dy, r, ph) => blobs.push({ dx, dy, r, w: 0, ph, k: 0 });
  const pod = (a, len, r0, ph, ox = 0, oy = 0) => { for (let j = 0; j < 5; j++) { const d = len * (0.3 + j * 0.2); blobs.push({ dx: ox + Math.cos(a) * d, dy: oy + Math.sin(a) * d * 0.9, r: r0 * (1 - j * 0.13), w: 0.3 + 0.2 * j, ph: ph + j * 0.7, k: 1 + j * 0.25, a }); } };
  if (variant === "dividing") {
    core(-R * 0.9, R * 0.15, R * 0.66, 0); core(R * 0.9, -R * 0.15, R * 0.66, 1); core(0, 0, R * 0.30, 2);
    for (let i = 0; i < 4; i++) { const a = Math.PI * 0.55 + i * 0.5 + rng() * 0.3; pod(a, R * 0.9, R * 0.28, rng() * 6, -R * 0.9, R * 0.15); }
    for (let i = 0; i < 4; i++) { const a = -Math.PI * 0.45 + i * 0.5 + rng() * 0.3; pod(a, R * 0.9, R * 0.28, rng() * 6, R * 0.9, -R * 0.15); }
    nucleus = { dx: -R * 0.95, dy: R * 0.15, r: R * 0.2 };
  } else if (variant === "ball") {
    core(0, 0, R * 0.95, 0);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + rng() * 0.4; blobs.push({ dx: Math.cos(a) * R * 0.75, dy: Math.sin(a) * R * 0.75, r: R * (0.3 + rng() * 0.12), w: 0.15, ph: rng() * 6, k: 0.5, a }); }
    nucleus = { dx: 0, dy: 0, r: R * 0.34 };
  } else {
    core(0, 0, R * 0.62, 0); core(R * 0.3, R * 0.18, R * 0.42, 1);
    const n = 6;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + 0.3 + rng() * 0.5, len = R * (1.35 + rng() * 0.7), r0 = R * (0.30 + rng() * 0.16); pod(a, len, r0, rng() * 6); }
    nucleus = { dx: -R * 0.15, dy: R * 0.05, r: R * 0.24 };
  }

  // 4. Bubbles at three depths and drifting motes.
  bubbles = Array.from({ length: 64 }, () => { const depth = rng(); return { x: rng() * ww, y0: rng() * wh, r: (2 + rng() * 5) * (0.6 + depth * 1.6), speed: (18 + rng() * 40) * (0.6 + depth), wob: rng() * 6.28, depth }; });
  motes = Array.from({ length: 160 }, () => ({ x: rng() * ww, y: rng() * wh, r: 0.7 + rng() * 2.0, a: 0.12 + rng() * 0.4, ph: rng() * 6.28, sp: 4 + rng() * 10 }));
}

// Metaball body over a bounding box at half resolution.
function drawCell(t) {
  const { cx, cy, r } = cell;
  const ext = variant === "dividing" ? 3.2 : 2.7;
  const bx0 = cx - r * ext, by0 = cy - r * ext * 0.9, bw = r * ext * 2, bh = r * ext * 1.8;
  const s = 0.5, w = Math.round(bw * s), h = Math.round(bh * s);
  const B = blobs.map(b => {
    const breathe = b.w ? 1 + 0.08 * Math.sin(t * 0.5 * b.w + b.ph) : 1 + 0.015 * Math.sin(t * 0.4 + b.ph);
    const reach = b.w ? 1 + 0.10 * b.k * Math.sin(t * 0.3 + b.ph * 1.3) : 1;
    return { x: (cx + b.dx * reach - bx0) * s, y: (cy + b.dy * reach - by0) * s, r2: (b.r * breathe * s) ** 2 };
  });
  const nx = (cx + nucleus.dx - bx0) * s, ny = (cy + nucleus.dy - by0) * s, nr = nucleus.r * s;
  const F = new Float32Array(w * h);
  for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
    let f = 0; for (const b of B) { const dx = x - b.x, dy = y - b.y; f += b.r2 / (dx * dx + dy * dy + 1); }
    F[i] = f * (1 + 0.16 * (C.fbm(x * 0.035 + t * 0.06, y * 0.035, 3.3 + t * 0.03, 2) - 0.5));
  }
  const amber = [255, 170, 40], deep = [190, 105, 25], cream = [255, 232, 180], glass = [90, 150, 165];
  const img = field(w, h, (x, y, px) => {
    const i = y * w + x, f = F[i];
    if (f < 0.75) { px[3] = 0; return; }
    const gx = F[Math.min(w - 1, x + 1) + y * w] - F[Math.max(0, x - 1) + y * w], gy = F[x + Math.min(h - 1, y + 1) * w] - F[x + Math.max(0, y - 1) * w];
    const gl = Math.hypot(gx, gy) + 1e-6;
    const inside = smooth(0.88, 1.12, f);
    const edge = clamp(1 - Math.abs(f - 1.0) / (0.10 + 0.6 * gl), 0, 1); // membrane band, thin where the field is steep
    const thick = smooth(1.0, 3.6, f);
    const dn = Math.hypot(x - nx, y - ny) / nr, glowN = Math.exp(-dn * dn * 0.5);
    // fine granules: two rotated high-frequency noises thresholded to dots (no lattice: non-integer scales, rotated)
    const rx = x * 0.62 - y * 0.31, ry = x * 0.31 + y * 0.62;
    const g1 = C.noise(rx * 0.71 + 11.3, ry * 0.71 + 4.7, 1.9), g2 = C.noise(x * 0.43 + 3.1, y * 0.43 + 8.9, 6.3), g3 = C.noise(rx * 1.3, ry * 1.3, 2.7);
    const granule = smooth(0.66, 0.84, g1) * 0.9 + smooth(0.70, 0.88, g2) * 0.7 + smooth(0.76, 0.9, g3) * 0.5;
    const vac = smooth(0.62, 0.72, C.fbm(x * 0.05 + 5, y * 0.05, 9.1, 2)); // a few clearer vacuoles
    let c = mix3(glass, mix3(deep, amber, glowN), clamp(0.2 + 0.5 * thick + 0.5 * glowN, 0, 1));
    c = mix3(c, cream, granule * 0.85);
    c = mix3(c, [60, 120, 135], vac * 0.5);
    let a = 0.22 + 0.28 * thick + 0.22 * glowN + 0.5 * granule - 0.15 * vac;
    const nuc = smooth(1.05, 0.8, dn);
    c = mix3(c, [220, 130, 30], nuc * 0.5); c = mix3(c, [255, 240, 200], smooth(0.5, 0.0, dn) * 0.7); a += nuc * 0.25;
    // membrane: bright refracted rim, slightly cooler on the side away from the core light
    const lit = 0.5 + 0.5 * (-gx * 0.5 - gy * 0.85) / gl;
    const rim = edge * edge * (0.5 + 0.5 * inside);
    c = mix3(c, mix3([210, 235, 240], [255, 245, 220], lit), rim * 0.9);
    // a darker line just inside the membrane (refraction shadow) makes the edge read as glass
    const innerLine = clamp(1 - Math.abs(f - 1.22) / 0.14, 0, 1) * inside;
    c = mix3(c, [40, 70, 80], innerLine * 0.35);
    a = clamp(a * inside + rim * 0.95 + innerLine * 0.2, 0, 1);
    px[0] = c[0]; px[1] = c[1]; px[2] = c[2]; px[3] = 255 * a;
  });
  return { img, x0: bx0, y0: by0, w: bw, h: bh, ax: cx, ay: cy, r };
}

export function draw(t) {
  const world = layer(ww, wh), wg = world.getContext("2d");
  blit(wg, waterLo, ww, wh);
  // Caustic shimmer: slow cool light bands in the upper half.
  const caus = field(ww / 6, wh / 6, (x, y, px) => {
    const u = x / (ww / 6), v = y / (wh / 6);
    const n = C.fbm(u * 7 + t * 0.05, v * 11 - t * 0.03, 12.0 + t * 0.12, 3, 0.5);
    const k = smooth(0.55, 0.78, n) * (1 - smooth(0.2, 0.62, v));
    px[0] = 120; px[1] = 210; px[2] = 215; px[3] = 255 * k * 0.28;
  });
  blit(wg, caus, ww, wh, { blur: 5, mode: "screen" });
  blit(wg, crustShadow, ww, wh, { alpha: 0.75, mode: "multiply", x: 8, y: 14 });
  blit(wg, crust, ww, wh);
  const light = [0.25, -0.97];
  // Far bubbles: tiny and soft, drawn into one low-res layer so a single blur covers them.
  const far = layer(ww / 2, wh / 2), fg = far.getContext("2d");
  for (const b of bubbles) if (b.depth < 0.35) { const y = ((b.y0 - t * b.speed) % wh + wh) % wh, x = b.x + Math.sin(t * 0.8 + b.wob) * 4; bubble(fg, x / 2, y / 2, b.r / 2, light[0], light[1], 0.5); }
  blit(wg, far, ww, wh, { alpha: 0.7 });
  // The cell: shadow, the glow it throws, the body, then a bloom.
  const ci = drawCell(t);
  const { ax, ay, r } = ci;
  const drift = { x: Math.sin(t * 0.21) * r * 0.05, y: Math.cos(t * 0.17) * r * 0.04 };
  wg.save(); wg.translate(drift.x, drift.y);
  const sh = layer(ww / 8, wh / 8), sg = sh.getContext("2d"); sg.filter = "blur(5px)"; sg.fillStyle = "rgba(2,6,10,0.7)"; sg.beginPath(); sg.ellipse((ax + r * 0.3) / 8, (ay + r * 1.1) / 8, r * 1.3 / 8, r * 0.5 / 8, 0, 0, Math.PI * 2); sg.fill();
  blit(wg, sh, ww, wh);
  glow(wg, ax, ay, r * 2.8, [255, 140, 30], 0.22);
  glow(wg, ax, ay, r * 1.4, [255, 185, 80], 0.20);
  blit(wg, ci.img, ci.w, ci.h, { x: ci.x0, y: ci.y0 });
  const bloom = layer(ci.w / 6, ci.h / 6), bg = bloom.getContext("2d"); bg.filter = "blur(4px)"; bg.drawImage(ci.img, 0, 0, ci.w / 6, ci.h / 6);
  blit(wg, bloom, ci.w, ci.h, { x: ci.x0, y: ci.y0, alpha: 0.4, mode: "screen" });
  wg.restore();
  // Mid bubbles sharp (warm-lit near the cell), near bubbles as big bokeh discs in one blurred layer.
  const nearL = layer(ww / 4, wh / 4), ng = nearL.getContext("2d");
  for (const b of bubbles) { const y = ((b.y0 - t * b.speed) % wh + wh) % wh, x = b.x + Math.sin(t * 0.8 + b.wob) * 6 * b.depth; const near = Math.hypot(x - ax, y - ay) < r * 1.8;
    if (b.depth >= 0.35 && b.depth < 0.8) bubble(wg, x, y, b.r, light[0], light[1], 0.8, near ? [255, 176, 32] : null);
    else if (b.depth >= 0.8) bubble(ng, x / 4, y / 4, b.r * 1.8 / 4, light[0], light[1], 0.5); }
  blit(wg, nearL, ww, wh, { blur: 3, alpha: 0.6 });
  for (const m of motes) { const y = ((m.y - t * m.sp) % wh + wh) % wh, x = m.x + Math.sin(t * 0.6 + m.ph) * 5; const near = Math.hypot(x - ax, y - ay) < r * 2.4; wg.fillStyle = near ? rgba([255, 215, 150], m.a) : rgba([170, 210, 220], m.a * 0.6); wg.beginPath(); wg.arc(x, y, m.r, 0, Math.PI * 2); wg.fill(); }
  // Steam: two cool layers across the top, the lower one catching a little of the cell's warmth.
  const s1 = steamField(C, ww / 4, wh / 4, { t, scale: 2.0, stretch: 2.6, speed: 0.06, rise: 0.05, fade: 0.50, tint: [196, 214, 222], gain: 1.6, thresh: 0.46 });
  const s2 = steamField(C, ww / 4, wh / 4, { t, scale: 3.6, stretch: 3.4, speed: -0.04, rise: 0.08, fade: 0.36, tint: [214, 224, 228], gain: 1.3, seedOff: 3.1, thresh: 0.5 });
  blit(wg, s1, ww, wh, { blur: 8, alpha: 0.85 });
  blit(wg, s2, ww, wh, { blur: 4, alpha: 0.7 });
  wg.save(); wg.globalCompositeOperation = "soft-light"; glow(wg, ax, ay - r * 0.9, r * 2.6, [255, 170, 60], 0.6); wg.restore();
  // Deep water stays dark for the caption band.
  const dg = wg.createLinearGradient(0, wh * 0.58, 0, wh); dg.addColorStop(0, "rgba(6,9,19,0)"); dg.addColorStop(1, "rgba(6,9,19,0.88)"); wg.fillStyle = dg; wg.fillRect(0, wh * 0.58, ww, wh * 0.42);
  // Camera: slow drift and a 1.5 percent breathe.
  const zoom = 1.0 + 0.015 * Math.sin(t * 0.25), px = -(ww - W) / 2 + Math.sin(t * 0.18) * W * 0.02, py = -(wh - H) / 2 + Math.cos(t * 0.13) * H * 0.012;
  g.save(); g.fillStyle = "#060913"; g.fillRect(0, 0, W, H);
  g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2, -H / 2);
  g.imageSmoothingQuality = "high"; g.drawImage(world, px, py);
  g.restore();
}
