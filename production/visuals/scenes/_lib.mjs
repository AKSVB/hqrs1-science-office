// Shared helpers for the 2D canvas scenes. Everything is deterministic: no Math.random, no Date.
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, q) => a + (b - a) * q;
export const smooth = (a, b, x) => { const q = clamp((x - a) / (b - a), 0, 1); return q * q * (3 - 2 * q); };
export const mix3 = (c1, c2, q) => [lerp(c1[0], c2[0], q), lerp(c1[1], c2[1], q), lerp(c1[2], c2[2], q)];
export const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// House palette (production/brand.css).
export const PAL = { bg: hex("#060913"), bg2: hex("#0d1426"), surface: hex("#121a30"), line: hex("#22304f"), cyan: hex("#4fe3f0"), amber: hex("#ffb020"), black: hex("#0a1224"), ink: hex("#f5f7fa") };

// Offscreen canvas.
export const layer = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };

// Per-pixel field: fn(x, y, px) writes r,g,b,a into px (0..255). Returns a canvas of w x h.
export const field = (w, h, fn) => {
  const c = layer(w, h), g = c.getContext("2d"), id = g.createImageData(c.width, c.height), d = id.data, px = [0, 0, 0, 255];
  for (let y = 0, i = 0; y < c.height; y++) for (let x = 0; x < c.width; x++, i += 4) { px[0] = px[1] = px[2] = 0; px[3] = 255; fn(x, y, px); d[i] = px[0]; d[i + 1] = px[1]; d[i + 2] = px[2]; d[i + 3] = px[3]; }
  g.putImageData(id, 0, 0);
  return c;
};

// Draw a canvas scaled to fill (w, h) with smoothing, optionally blurred and with a composite mode.
export const blit = (g, src, w, h, { alpha = 1, blur = 0, mode = "source-over", x = 0, y = 0 } = {}) => {
  g.save(); g.globalAlpha = alpha; g.globalCompositeOperation = mode; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
  if (blur > 0) g.filter = `blur(${blur}px)`;
  g.drawImage(src, x, y, w, h); g.restore();
};

// Radial glow sprite.
export const glow = (g, x, y, r, col, a = 1, inner = 0) => {
  const gr = g.createRadialGradient(x, y, r * inner, x, y, r);
  gr.addColorStop(0, rgba(col, a)); gr.addColorStop(0.5, rgba(col, a * 0.35)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
};

// Bubble with a dark body, a bright rim on the lit side and a specular dot. Light comes from (lx, ly) direction (unit vector).
export const bubble = (g, x, y, r, lx, ly, a = 1, warm = null) => {
  g.save(); g.globalAlpha = a;
  const body = g.createRadialGradient(x - lx * r * 0.3, y - ly * r * 0.3, r * 0.1, x, y, r);
  body.addColorStop(0, "rgba(255,255,255,0.05)"); body.addColorStop(0.75, "rgba(180,220,230,0.10)"); body.addColorStop(0.92, "rgba(230,245,250,0.55)"); body.addColorStop(1, "rgba(200,230,240,0)");
  g.fillStyle = body; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  if (warm) { const wg = g.createRadialGradient(x + lx * r * 0.55, y + ly * r * 0.55, 0, x + lx * r * 0.55, y + ly * r * 0.55, r * 0.6); wg.addColorStop(0, rgba(warm, 0.55)); wg.addColorStop(1, rgba(warm, 0)); g.fillStyle = wg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.arc(x - lx * r * 0.45, y - ly * r * 0.45, Math.max(0.6, r * 0.16), 0, Math.PI * 2); g.fill();
  g.restore();
};

// Seeded scatter of n points in a box.
export const scatter = (rng, n, w, h, extra = () => ({})) => Array.from({ length: n }, () => ({ x: rng() * w, y: rng() * h, ...extra() }));

// Steam / fog layer: fbm density with a vertical falloff, tinted. Returns a canvas at (w, h) low res; call every frame with t.
// stretch > 1 squashes the noise vertically so the wisps run sideways; thresh sets how much of the field is clear.
export const steamField = (ctx, w, h, { t = 0, scale = 3.2, stretch = 1.0, speed = 0.09, rise = 0.05, top = 0.0, fade = 0.55, tint = [190, 215, 225], gain = 1.0, octaves = 5, seedOff = 0, thresh = 0.42 } = {}) =>
  field(w, h, (x, y, px) => {
    const u = x / w, v = y / h;
    const warp = ctx.fbm(u * 1.5 + seedOff, v * 3 - t * rise * 0.5, 4.4, 2) - 0.5;
    const n1 = ctx.fbm(u * scale + t * speed + seedOff + warp * 0.6, (v * scale * (h / w) - t * rise) * stretch + warp * 0.4, 1.7 + seedOff, octaves, 0.55);
    const n2 = ctx.fbm(u * scale * 2.1 - t * speed * 0.6 + seedOff, (v * scale * 2.1 * (h / w) - t * rise * 1.4) * stretch, 9.1 + seedOff, 3, 0.5);
    let d = clamp((n1 - thresh) * 2.6 + (n2 - 0.5) * 0.9, 0, 1);
    d *= smooth(fade, top, v) * gain;
    px[0] = tint[0]; px[1] = tint[1]; px[2] = tint[2]; px[3] = 255 * d * d;
  });
