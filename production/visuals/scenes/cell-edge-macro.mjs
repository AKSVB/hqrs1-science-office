// cell-edge-macro: the rippling edge of a translucent amoeba at very high magnification (storyboard FA-02).
// The cell fills the upper part of the frame; its lobed membrane crosses the upper half diagonally; amber light
// glows through the granular cytoplasm from behind; vacuoles and dense granule clusters inside; motes and bokeh
// in blue-black water; shallow depth of field (sharp in the middle, soft at both ends). Lower third dark.
import { clamp, lerp, smooth, mix3, rgba, layer, field, blit, glow } from "./_lib.mjs";

export const kind = "2d";

let C, W, H, g, rng, ww, wh, motes, bokeh, organelles, lobes;

export async function init(ctx) {
  C = ctx; W = ctx.W; H = ctx.H; g = ctx.g; rng = ctx.rng;
  ww = W * 1.1; wh = H * 1.1;
  motes = Array.from({ length: 220 }, () => ({ x: rng() * ww, y: rng() * wh, r: 0.6 + rng() * 1.8, a: 0.1 + rng() * 0.5, ph: rng() * 6.28, sp: 3 + rng() * 8, dx: (rng() - 0.5) * 8 }));
  bokeh = Array.from({ length: 30 }, () => ({ x: rng() * ww, y: rng() * wh, r: 10 + rng() * 34, a: 0.05 + rng() * 0.12, ph: rng() * 6.28, sp: 2 + rng() * 5 }));
  // Rounded lobes along the edge: Gaussian bulges of varying width, in u (0..1) with heights in world-height units.
  lobes = Array.from({ length: 6 }, (_, i) => ({ u: (i + 0.5) / 6 + (rng() - 0.5) * 0.08, w: 0.05 + rng() * 0.04, h: 0.07 + rng() * 0.06, ph: rng() * 6.28 }));
  organelles = Array.from({ length: 30 }, () => ({ u: rng(), depth: 0.05 + rng() * 0.32, r: 9 + rng() * 26, kind: rng() < 0.4 ? "vac" : "dense", ph: rng() * 6.28 }));
}

// Membrane edge y(u) in world-height units: a diagonal with rounded lobes, breathing slowly.
const edgeY = (t, u) => {
  let y = 0.27 + 0.20 * u;
  for (const L of lobes) { const dx = (u - L.u) / L.w; y += L.h * (0.9 + 0.1 * Math.sin(t * 0.4 + L.ph)) * Math.exp(-dx * dx * 0.5); }
  y += 0.006 * Math.sin(u * 40 + t * 0.15) + (C.fbm(u * 8 + t * 0.03, 2.2, 0.5, 2) - 0.5) * 0.03;
  return y;
};

export function draw(t) {
  const world = layer(ww, wh), wg = world.getContext("2d");
  const bgc = wg.createLinearGradient(0, 0, 0, wh); bgc.addColorStop(0, "#0f1a36"); bgc.addColorStop(0.5, "#0a1228"); bgc.addColorStop(1, "#05070e");
  wg.fillStyle = bgc; wg.fillRect(0, 0, ww, wh);
  const bk = layer(ww / 4, wh / 4), bg = bk.getContext("2d");
  for (const b of bokeh) { const y = ((b.y - t * b.sp) % wh + wh) % wh; const warm = y < edgeY(t, b.x / ww) * wh + 60; bg.fillStyle = rgba(warm ? [255, 200, 120] : [140, 190, 210], b.a); bg.beginPath(); bg.arc(b.x / 4, y / 4, b.r / 4, 0, Math.PI * 2); bg.fill(); }
  blit(wg, bk, ww, wh, { blur: 6 });

  // Signed distance to the membrane on a half-res grid: sample the edge polyline every 3 px and take the nearest
  // sample within a window, so distance is measured perpendicular to the lobes, not vertically.
  const s = 0.5, w = Math.round(ww * s), h = Math.round(wh * 0.75 * s);
  const step = 1, ns = Math.ceil(w / step) + 1, ex = new Float32Array(ns), ey = new Float32Array(ns);
  for (let i = 0; i < ns; i++) { ex[i] = i * step; ey[i] = edgeY(t, (i * step) / w) * wh * s; }
  const win = Math.ceil(200 / step);
  const D = new Float32Array(w * h);
  for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
    const c = Math.round(x / step); let best = 1e9;
    for (let k = Math.max(0, c - win); k <= Math.min(ns - 1, c + win); k++) { const dx = x - ex[k], dy = y - ey[k]; const dd = dx * dx + dy * dy; if (dd < best) best = dd; }
    const d = Math.sqrt(best); D[i] = y < ey[Math.min(ns - 1, c)] ? d : -d; // positive inside the cell (above the edge)
  }
  const cellImg = field(w, h, (x, y, px) => {
    const d = D[y * w + x]; // px at half res
    if (d < -14) { px[3] = 0; return; }
    const inside = smooth(-2, 2, d);
    const u = x / w;
    const rx = x * 0.62 - y * 0.31, ry = x * 0.31 + y * 0.62;
    const g1 = C.noise(rx * 0.55 + 11.3, ry * 0.55 + 4.7, 1.9), g2 = C.noise(x * 0.38 + 3.1, y * 0.38 + 8.9, 6.3), g3 = C.noise(rx * 1.1 + 2, ry * 1.1, 2.7);
    const dens = 0.5 + 0.5 * smooth(160, 0, d);
    const granule = clamp(smooth(0.86 - 0.16 * dens, 0.94, g1) + smooth(0.88 - 0.14 * dens, 0.96, g2) * 0.8 + smooth(0.9 - 0.1 * dens, 0.97, g3) * 0.6, 0, 1);
    const cyto = C.fbm(x * 0.02, y * 0.02, 7.0, 3);
    // back light: strongest in a broad pool behind the middle of the edge, fading into the body
    const back = smooth(420, 0, d) * (0.45 + 0.55 * smooth(0.05, 0.4, u) * smooth(0.95, 0.6, u));
    const amber = [226, 142, 40], cream = [255, 236, 190], dark = [58, 40, 20], glass = [110, 120, 110];
    const cyto2 = C.fbm(x * 0.008 + 3, y * 0.008, 2.0, 3);
    let c = mix3(dark, amber, back * (0.45 + 0.55 * cyto) * (0.6 + 0.4 * cyto2));
    c = mix3(c, glass, 0.12 * (1 - back));
    c = mix3(c, cream, granule * (0.5 + 0.5 * back) * (0.6 + 0.4 * cyto2));
    let a = 0.45 + 0.2 * back + 0.5 * granule * (0.6 + 0.4 * cyto2) + 0.15 * cyto;
    for (const o of organelles) { const ox = o.u * w, oy = (edgeY(t, o.u) - o.depth) * wh * s + Math.sin(t * 0.3 + o.ph) * 2; const dd = Math.hypot(x - ox, y - oy) / (o.r * s);
      if (dd < 1.15) { if (o.kind === "vac") { const ring = smooth(0.78, 1.0, dd) * smooth(1.15, 1.0, dd); c = mix3(c, [26, 36, 44], smooth(1.0, 0.55, dd) * 0.5); c = mix3(c, cream, ring * 0.55); a = a * (1 - 0.4 * smooth(1.0, 0.5, dd)) + ring * 0.3; }
        else { c = mix3(c, [170, 100, 26], smooth(1.0, 0.3, dd) * 0.5); a += smooth(1.0, 0.4, dd) * 0.25; } } }
    // membrane: a thin bright line at d = 0, a darker refractive line just inside, and a faint halo outside
    const m = clamp(1 - Math.abs(d) / 2.2, 0, 1);
    const innerLine = clamp(1 - Math.abs(d - 6) / 3.0, 0, 1) * (0.6 + 0.4 * smooth(0.3, 0.7, C.noise(x * 0.05, y * 0.05, 1)));
    const halo = Math.exp(-Math.max(0, -d) / 9) * (1 - inside);
    c = mix3(c, [40, 60, 70], innerLine * 0.4);
    c = mix3(c, [255, 248, 225], m * m);
    a = clamp(a * inside + m * m * 1.0 + innerLine * 0.15 + halo * 0.3, 0, 1);
    px[0] = c[0]; px[1] = c[1]; px[2] = c[2]; px[3] = 255 * a;
  });
  blit(wg, cellImg, ww, wh * 0.75);
  // Depth of field: a blurred copy masked in at both ends.
  const soft = layer(w / 3, h / 3), sg = soft.getContext("2d"); sg.filter = "blur(2.5px)"; sg.drawImage(cellImg, 0, 0, w / 3, h / 3);
  const dof = layer(ww, wh * 0.75), dg = dof.getContext("2d"); dg.drawImage(soft, 0, 0, ww, wh * 0.75);
  dg.globalCompositeOperation = "destination-in"; const mg = dg.createLinearGradient(0, 0, ww, 0); mg.addColorStop(0, "rgba(0,0,0,1)"); mg.addColorStop(0.28, "rgba(0,0,0,0)"); mg.addColorStop(0.66, "rgba(0,0,0,0)"); mg.addColorStop(1, "rgba(0,0,0,1)"); dg.fillStyle = mg; dg.fillRect(0, 0, ww, wh);
  blit(wg, dof, ww, wh * 0.75);
  // Warm bloom from the back light and the membrane.
  const bl = layer(w / 6, h / 6), blg = bl.getContext("2d"); blg.filter = "blur(4px)"; blg.drawImage(cellImg, 0, 0, w / 6, h / 6);
  blit(wg, bl, ww, wh * 0.75, { alpha: 0.35, mode: "screen" });
  glow(wg, ww * 0.42, wh * 0.30, ww * 0.42, [255, 160, 50], 0.14);
  for (const m of motes) { const y = ((m.y - t * m.sp) % wh + wh) % wh, x = m.x + Math.sin(t * 0.5 + m.ph) * m.dx; const eyy = edgeY(t, x / ww) * wh; const near = Math.abs(y - eyy) < 170; wg.fillStyle = rgba(near ? [255, 220, 160] : [150, 200, 215], m.a * (near ? 1 : 0.6)); wg.beginPath(); wg.arc(x, y, m.r, 0, Math.PI * 2); wg.fill(); }
  const dg2 = wg.createLinearGradient(0, wh * 0.6, 0, wh); dg2.addColorStop(0, "rgba(5,7,14,0)"); dg2.addColorStop(1, "rgba(5,7,14,0.8)"); wg.fillStyle = dg2; wg.fillRect(0, wh * 0.6, ww, wh * 0.4);
  const zoom = 1.0 + 0.01 * Math.sin(t * 0.2), px = -(ww - W) / 2 + Math.sin(t * 0.15) * W * 0.025, py = -(wh - H) / 2 + Math.cos(t * 0.11) * H * 0.008;
  g.save(); g.fillStyle = "#060913"; g.fillRect(0, 0, W, H); g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2, -H / 2); g.imageSmoothingQuality = "high"; g.drawImage(world, px, py); g.restore();
}
