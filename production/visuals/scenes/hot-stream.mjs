// hot-stream: a steaming hot stream through volcanic rock at dawn (storyboard FA-03). Wide lens from low on the
// bank: a cold blue sky, a dark conifer ridge, the valley floor in perspective with the stream winding toward the
// camera, grey and rust basalt banks with pale silica and sulphur crust at the water line, teal water with caustics,
// thick steam rising off the water and catching one low warm light from the upper left. Lower third in deep shadow.
import { clamp, lerp, smooth, mix3, rgba, layer, field, blit, glow } from "./_lib.mjs";

export const kind = "2d";

let C, W, H, g, rng, ww, wh, groundImg, waterMask, steamMask, sky, motes;
const VH = 0.30;      // horizon (fraction of world height)
const CAMH = 1.15;    // camera height in world units
const FOV = 1.5;      // horizontal scale
const proj = (u, v) => { const z = CAMH / Math.max(0.004, v - VH); return { z, x: (u - 0.5) * z * FOV }; };
const chan = (z) => ({ xc: 0.7 * Math.sin(z * 0.30 + 1.0) + 0.35 * Math.sin(z * 0.85 + 2.1), hw: 0.85 + 0.25 * Math.sin(z * 0.55 + 0.7) });

export async function init(ctx) {
  C = ctx; W = ctx.W; H = ctx.H; g = ctx.g; rng = ctx.rng;
  ww = W * 1.12; wh = H * 1.12;
  const s = 0.5, w = Math.round(ww * s), h = Math.round(wh * s);
  // Ground and water mask (static; the water shimmer is added per frame).
  waterMask = new Float32Array(w * h);
  const hmap = (x, z, oct) => C.fbm(x * 5 + C.fbm(x * 1.2, z * 1.2, 5.5, 2) * 1.2, z * 5, 4.2, oct, 0.52);
  groundImg = field(w, h, (x, y, px) => {
    const u = x / w, v = y / h;
    if (v <= VH + 0.002) { px[3] = 0; return; }
    const { z, x: gx } = proj(u, v);
    const { xc, hw } = chan(z);
    const d = Math.abs(gx - xc) / hw; // 1 at the water line
    const fog = smooth(3, 26, z);
    const oct = z < 4 ? 6 : z < 9 ? 4 : 2;
    if (d < 0.98) { waterMask[y * w + x] = smooth(0.98, 0.85, d); px[3] = 0; return; }
    const hgt = hmap(gx, z, oct), e = 0.008;
    const dhx = (hmap(gx + e, z, oct) - hgt) / e, dhz = (hmap(gx, z + e, oct) - hgt) / e;
    const lambert = clamp(0.5 + (-dhx * 0.06 + dhz * 0.02), 0.05, 1.35); // sun low at the left
    const rn = C.fbm(gx * 5 + 7, z * 5, 3.1, 3); const crack = smooth(0.42, 0.5, 1 - Math.abs(2 * rn - 1)) * (z < 14 ? 1 : 0); // dark seams between plates
    const boulder = smooth(0.58, 0.72, C.fbm(gx * 2.6 + 2, z * 2.6 + 5, 6.6, 3)); // lighter rounded tops
    const fine = C.fbm(gx * 22, z * 22, 1.1, z < 8 ? 3 : 1), grit = z < 6 ? C.noise(gx * 160, z * 160, 3.3) : 0.5;
    const rustN = smooth(0.5, 0.75, C.fbm(gx * 0.7 + 4, z * 0.7, 8.8, 3));
    const basalt = [62, 64, 68], rust = [124, 68, 42], pale = [190, 182, 164], sulphur = [210, 176, 64], wetDark = [24, 30, 34];
    let c = mix3(basalt, rust, rustN * 0.85);
    const crustN = C.fbm(gx * 3, z * 3, 6.6, 3) - 0.5;
    c = mix3(c, pale, smooth(1.8 + crustN * 0.9, 1.05, d) * (0.5 + 0.5 * fine));
    c = mix3(c, sulphur, smooth(1.3 + crustN * 0.5, 1.0, d) * smooth(0.35, 0.7, C.fbm(gx * 1.4, z * 1.4, 3.9, 3)) * 0.9);
    c = mix3(c, wetDark, smooth(1.1, 0.98, d) * 0.8);
    let k = lambert * (0.72 + 0.28 * fine + 0.14 * (grit - 0.5)) * (0.75 + 0.25 * hgt) * (1 - 0.55 * crack) * (1 + 0.35 * boulder);
    // near ground is in the bank's own shadow (lower third dark); far ground fades into cool morning haze
    k *= 0.22 + 0.78 * smooth(1.0, 0.5, v);
    c = mix3(c, [20, 32, 58], smooth(0.5, 0.12, k) * 0.35);
    c = [c[0] * k, c[1] * k, c[2] * k * 1.05];
    c = mix3(c, [46, 62, 86], fog * 0.8);
    px[0] = c[0]; px[1] = c[1]; px[2] = c[2]; px[3] = 255;
  });
  // Steam mask: steam rises from the water, so a column of steam above every water pixel, thinning with height.
  // Steam mask at quarter res: for every pixel, water below it (within a rising column) weighted by a wide
  // gaussian sideways so the plume has soft sides; sampled bilinearly at draw time.
  const qw = Math.round(w / 4), qh = Math.round(h / 4);
  steamMask = new Float32Array(qw * qh); steamMask.w = qw; steamMask.h = qh;
  for (let y = 0; y < qh; y++) for (let x = 0; x < qw; x++) {
    let m = 0, wsum = 0;
    for (let dx = -14; dx <= 14; dx += 2) { const xx = clamp(x + dx, 0, qw - 1), wx = Math.exp(-dx * dx / 60);
      let col = 0; for (let k = 0; k < 36; k++) { const yy = y + k; if (yy >= qh) break; const wm = waterMask[(yy * 4) * w + xx * 4]; if (wm > 0) col = Math.max(col, wm * Math.exp(-k / 11)); }
      m += col * wx; wsum += wx; }
    steamMask[y * qw + x] = m / wsum;
  }
  const smp = (u, v) => { const x = clamp(u * (qw - 1), 0, qw - 1.001), y = clamp(v * (qh - 1), 0, qh - 1.001), x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    return (steamMask[y0 * qw + x0] * (1 - fx) + steamMask[y0 * qw + x0 + 1] * fx) * (1 - fy) + (steamMask[(y0 + 1) * qw + x0] * (1 - fx) + steamMask[(y0 + 1) * qw + x0 + 1] * fx) * fy; };
  steamMask.sample = smp;
  // Sky and ridge: cold blue dawn, warmest just above the ridge at the upper left where the sun is about to rise.
  sky = field(w / 2, Math.round((h / 2) * (VH + 0.06)), (x, y, px) => {
    const u = x / (w / 2), v = (y / (h / 2));
    const sunD = Math.hypot((u - 0.16) * 1.0, (v - VH) * 2.2);
    let c = mix3([22, 46, 84], [120, 150, 178], smooth(0.0, VH, v));
    c = mix3(c, [232, 168, 96], smooth(0.5, 0.0, sunD) * 0.75);
    c = mix3(c, [255, 214, 150], smooth(0.16, 0.0, sunD) * 0.9);
    c = mix3(c, [255, 240, 210], smooth(0.05, 0.0, sunD));
    const cirrus = smooth(0.55, 0.72, C.fbm(u * 5 + 3, v * 12, 7.4, 4)) * smooth(0.02, 0.12, v) * 0.4;
    c = mix3(c, [200, 212, 224], cirrus);
    // ridge silhouette with conifers
    const ridge = VH - 0.055 - 0.035 * C.fbm(u * 3.2 + 1, 0.3, 2.2, 3) - 0.012 * smooth(0.6, 0.9, C.noise(u * 240, 0.5, 8.8)) - 0.006 * smooth(0.5, 0.95, C.noise(u * 520 + 3, 0.2, 4.4));
    const onRidge = smooth(ridge - 0.002, ridge + 0.002, v);
    const haze = smooth(ridge, VH + 0.02, v); // the valley wall lightens into morning haze toward its base
    const dark = mix3(mix3([10, 16, 28], [30, 44, 66], smooth(0.35, 0.0, sunD)), [44, 60, 84], haze * 0.6);
    c = mix3(c, dark, onRidge);
    px[0] = c[0]; px[1] = c[1]; px[2] = c[2]; px[3] = 255 * (1 - smooth(VH + 0.01, VH + 0.06, v));
  });
  motes = Array.from({ length: 50 }, () => ({ x: rng() * ww, y: rng() * wh, r: 0.8 + rng() * 1.6, a: 0.1 + rng() * 0.3, ph: rng() * 6.28, sp: 6 + rng() * 14 }));
}

export function draw(t) {
  const world = layer(ww, wh), wg = world.getContext("2d");
  const s = 0.5, w = Math.round(ww * s), h = Math.round(wh * s);
  blit(wg, sky, ww, wh * (VH + 0.06));
  // Water: teal with depth, caustic network and flow toward the camera, a warm sheen toward the sun.
  const water = field(w, h, (x, y, px) => {
    const wm = waterMask[y * w + x];
    if (wm <= 0) { px[3] = 0; return; }
    const u = x / w, v = y / h, { z, x: gx } = proj(u, v), { xc, hw } = chan(z);
    const d = Math.abs(gx - xc) / hw, depth = smooth(1.0, 0.25, d);
    const flow = z + t * 0.9;
    const n = C.fbm((gx - xc) * 2.2, flow * 1.4, 5.5 + t * 0.2, z < 8 ? 4 : 2, 0.5);
    const caus = Math.pow(1 - Math.abs(2 * n - 1), 5) * (0.3 + 0.7 * depth);
    const shallow = [56, 118, 116], deep = [10, 46, 58], pool = [6, 26, 38];
    let c = mix3(shallow, mix3(deep, pool, smooth(0.5, 1.0, depth)), depth);
    c = mix3(c, [150, 225, 225], caus * 0.6);
    const sunSheen = smooth(0.7, 0.0, Math.hypot(u - 0.2, (v - VH) * 1.5)) * 0.6;
    c = mix3(c, [255, 205, 140], sunSheen * (0.5 + caus));
    const fog = smooth(3, 26, z); c = mix3(c, [56, 74, 98], fog * 0.75);
    const k = 0.45 + 0.55 * smooth(1.0, 0.55, v);
    px[0] = c[0] * k; px[1] = c[1] * k; px[2] = c[2] * k; px[3] = 255 * wm;
  });
  blit(wg, water, ww, wh);
  blit(wg, groundImg, ww, wh);
  { const hz = wg.createLinearGradient(0, wh * (VH - 0.01), 0, wh * (VH + 0.12)); hz.addColorStop(0, "rgba(40,56,80,0.85)"); hz.addColorStop(1, "rgba(40,56,80,0)"); wg.fillStyle = hz; wg.fillRect(0, wh * (VH - 0.01), ww, wh * 0.13); }
  // Steam: two animated layers shaped by the steam mask; warm where the low sun reaches, cool elsewhere.
  const steam = (scale, speed, rise, gain, seedOff) => field(w / 2, h / 2, (x, y, px) => {
    const u = x / (w / 2), v = y / (h / 2), m = steamMask.sample(u, v) * (0.6 + 0.8 * C.fbm(u * 3 + seedOff, v * 5 - t * 0.05, 2.5, 2));
    if (m < 0.01) { px[3] = 0; return; }
    const warp = C.fbm(u * 2 + seedOff, v * 4 - t * rise * 0.5, 4.4, 2) - 0.5;
    const n1 = C.fbm(u * scale + warp * 0.7 + t * speed + seedOff, (v * scale * 1.7 - t * rise) + warp * 0.4, 1.7 + seedOff, 5, 0.55);
    const n2 = C.fbm(u * scale * 2.2 - t * speed * 0.5 + seedOff, v * scale * 3.6 - t * rise * 1.5, 9.1 + seedOff, 3, 0.5);
    let dens = clamp((n1 - 0.44) * 2.8 + (n2 - 0.5) * 1.0, 0, 1) * m * gain;
    const sunlit = smooth(0.9, 0.1, Math.hypot(u - 0.18, (v - VH) * 1.4)) * dens;
    const c = mix3([200, 214, 224], [255, 222, 176], sunlit * 1.3);
    px[0] = c[0]; px[1] = c[1]; px[2] = c[2]; px[3] = 255 * Math.sqrt(dens) * 0.85;
  });
  blit(wg, steam(2.2, 0.05, 0.08, 1.15, 0), ww, wh, { blur: 8, alpha: 0.95 });
  blit(wg, steam(4.0, -0.03, 0.12, 0.9, 5.3), ww, wh, { blur: 4, alpha: 0.8 });
  // Low morning mist across the far valley floor.
  const mist = field(w / 4, h / 4, (x, y, px) => { const v = y / (h / 4); const a = smooth(VH - 0.02, VH + 0.05, v) * smooth(VH + 0.16, VH + 0.06, v); px[0] = 150; px[1] = 170; px[2] = 190; px[3] = 255 * a * 0.45; });
  blit(wg, mist, ww, wh, { blur: 6 });
  // The one warm light: the sun about to break over the ridge at the upper left.
  wg.save(); wg.globalCompositeOperation = "screen"; glow(wg, ww * 0.16, wh * (VH - 0.03), ww * 0.34, [255, 168, 70], 0.28); wg.restore();
  wg.save(); wg.globalCompositeOperation = "soft-light"; glow(wg, ww * 0.16, wh * VH, ww * 0.9, [255, 190, 110], 0.45); wg.restore();
  for (const m of motes) { const y = ((m.y - t * m.sp) % wh + wh) % wh, x = m.x + Math.sin(t * 0.7 + m.ph) * 6; if (y < wh * VH) continue; wg.fillStyle = rgba([230, 235, 240], m.a); wg.beginPath(); wg.arc(x, y, m.r, 0, Math.PI * 2); wg.fill(); }
  // Lower third in deep shadow.
  const dg = wg.createLinearGradient(0, wh * 0.56, 0, wh); dg.addColorStop(0, "rgba(6,9,19,0)"); dg.addColorStop(0.5, "rgba(6,9,19,0.78)"); dg.addColorStop(1, "rgba(6,9,19,0.96)"); wg.fillStyle = dg; wg.fillRect(0, wh * 0.56, ww, wh * 0.44);
  // Camera: slow tilt-up drift.
  const zoom = 1.0 + 0.012 * Math.sin(t * 0.2), px = -(ww - W) / 2 + Math.sin(t * 0.12) * W * 0.015, py = -(wh - H) / 2 + H * 0.02 - t * H * 0.006;
  g.save(); g.fillStyle = "#060913"; g.fillRect(0, 0, W, H); g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2, -H / 2); g.imageSmoothingQuality = "high"; g.drawImage(world, px, py); g.restore();
}
