// embryo-lineage: two cell populations (cyan Otx2, amber Gbx2) dividing over time in a dark field, never mixing
// (storyboard TB-01/TB-02/TB-03/TB-04 for reel-two-brains, fluorescence-microscope look). Each population is a
// cluster of soft, translucent spheres with a bright membrane and a darker nucleus; cells divide on a schedule
// driven by t; a crisp boundary keeps the two apart; layered blur gives depth of field; faint grey embryo outline.
// Options (--var stage=): "two" (default, TB-01: both colours meeting at the boundary), "early" (TB-02: one pale
// cluster at gastrulation, silver-blue), "cyan" (TB-03: the cyan population close) , "amber" (TB-04).
import { clamp, lerp, smooth, mix3, rgba, layer, field, blit, glow } from "./_lib.mjs";

export const kind = "2d";

let C, W, H, g, rng, ww, wh, cells, stage, motes, R0;

// A cell: position relative to its population centre, birth time, generation, size, colour tag.
const spawn = (pop, n, r0, R, rng) => {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * R;
    out.push({ pop, x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8, r: r0 * (0.8 + rng() * 0.4), birth: -rng() * 4, phase: rng() * 6.28, depth: rng(), divAt: 1 + rng() * 6, divDir: rng() * Math.PI * 2 });
  }
  return out;
};

export async function init(ctx) {
  C = ctx; W = ctx.W; H = ctx.H; g = ctx.g; rng = ctx.rng;
  stage = ctx.opts.stage || "two";
  ww = W * 1.1; wh = H * 1.1;
  const R = Math.min(ww, wh) * 0.26; R0 = R;
  if (stage === "early") cells = spawn(0, 120, 30, R * 0.75, rng);
  else if (stage === "cyan") cells = spawn(0, 170, 40, R * 1.25, rng);
  else if (stage === "amber") cells = spawn(1, 170, 40, R * 1.25, rng);
  else cells = [...spawn(0, 150, 26, R * 0.95, rng), ...spawn(1, 150, 26, R * 0.95, rng)];
  motes = Array.from({ length: 120 }, () => ({ x: rng() * ww, y: rng() * wh, r: 0.6 + rng() * 1.6, a: 0.05 + rng() * 0.25, ph: rng() * 6.28, sp: 2 + rng() * 6 }));
}

// Population centres and the boundary: cyan toward the front (upper left), amber toward the back (lower right).
const centre = (pop) => stage === "two" ? (pop === 0 ? { x: ww * 0.40, y: wh * 0.36 } : { x: ww * 0.62, y: wh * 0.46 }) : { x: ww * 0.5, y: wh * 0.40 };
const boundaryN = { x: 0.90, y: 0.43 }; // unit normal of the boundary line (from cyan side to amber side)

export function draw(t) {
  const world = layer(ww, wh), wg = world.getContext("2d");
  wg.fillStyle = "#04060c"; wg.fillRect(0, 0, ww, wh);
  const vg = wg.createRadialGradient(ww * 0.5, wh * 0.4, 0, ww * 0.5, wh * 0.4, wh * 0.6); vg.addColorStop(0, "rgba(16,24,44,1)"); vg.addColorStop(1, "rgba(4,6,12,0)"); wg.fillStyle = vg; wg.fillRect(0, 0, ww, wh);
  // Faint embryo outline: a curled translucent grey body behind the glowing populations.
  const body = field(ww / 6, wh / 6, (x, y, px) => {
    const u = x / (ww / 6), v = y / (wh / 6);
    const cx = 0.5 + 0.22 * Math.cos((v - 0.15) * 5.0), dx = (u - cx) / (0.12 + 0.05 * Math.sin(v * 7)); // a curled tube
    const along = smooth(0.08, 0.2, v) * smooth(0.72, 0.55, v);
    const a = Math.exp(-dx * dx * 2.5) * along * (0.55 + 0.45 * C.fbm(u * 8, v * 14, 2.2, 3));
    px[0] = 150; px[1] = 165; px[2] = 180; px[3] = 255 * a * 0.16;
  });
  blit(wg, body, ww, wh, { blur: 8 });
  // Cells: grow from birth, divide (a cell splits into two offset copies) after divAt, all deterministic in t.
  const drawn = [];
  for (const c of cells) {
    const ctr = centre(c.pop);
    const age = t - c.birth;
    if (age < 0) continue;
    const grow = smooth(0, 1.5, age);
    const wob = { x: Math.sin(t * 0.4 + c.phase) * 3, y: Math.cos(t * 0.35 + c.phase) * 3 };
    const dq = smooth(0, 1.2, age - c.divAt); // division progress: 0 undivided, 1 fully split
    const parts = dq <= 0 ? [{ ox: 0, oy: 0, r: c.r }] : [{ ox: Math.cos(c.divDir) * c.r * 0.9 * dq, oy: Math.sin(c.divDir) * c.r * 0.9 * dq, r: c.r * (1 - 0.22 * dq) }, { ox: -Math.cos(c.divDir) * c.r * 0.9 * dq, oy: -Math.sin(c.divDir) * c.r * 0.9 * dq, r: c.r * (1 - 0.22 * dq) }];
    for (const p of parts) {
      let x = ctr.x + c.x + p.ox + wob.x, y = ctr.y + c.y + p.oy + wob.y;
      // the two populations never cross the boundary: clamp to their own side
      if (stage === "two") { const bx = ww * 0.51, by = wh * 0.41, side = (x - bx) * boundaryN.x + (y - by) * boundaryN.y; const want = c.pop === 0 ? -1 : 1; const m = want * side; if (m < p.r * 0.9) { const push = p.r * 0.9 - m; x += want * boundaryN.x * push; y += want * boundaryN.y * push; } }
      drawn.push({ x, y, r: p.r * grow, pop: c.pop, depth: c.depth, pinch: dq > 0 && dq < 1 ? dq : 0 });
    }
  }
  drawn.sort((a, b) => a.depth - b.depth);
  const cyan = [79, 227, 240], amber = [255, 176, 32], silver = [190, 210, 232];
  const colOf = (pop) => stage === "early" ? silver : pop === 0 ? cyan : amber;
  // Three depth layers: far (blurred), mid (sharp), near (larger, blurred): drawn into separate canvases.
  const layers = [layer(ww / 3, wh / 3), layer(ww, wh), layer(ww / 3, wh / 3)];
  const scales = [1 / 3, 1, 1 / 3];
  const cellSprite = (cg, x, y, r, col, s, a) => {
    cg.save(); cg.globalAlpha = a; cg.scale(s, s);
    const body = cg.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.05, x, y, r);
    body.addColorStop(0, rgba(mix3(col, [255, 255, 255], 0.35), 0.7)); body.addColorStop(0.5, rgba(col, 0.5)); body.addColorStop(0.85, rgba(col, 0.6)); body.addColorStop(1, rgba(col, 0));
    cg.fillStyle = body; cg.beginPath(); cg.arc(x, y, r, 0, Math.PI * 2); cg.fill();
    // nucleus: a darker disc with a soft rim
    const nuc = cg.createRadialGradient(x + r * 0.1, y + r * 0.1, 0, x + r * 0.1, y + r * 0.1, r * 0.42);
    nuc.addColorStop(0, rgba(mix3(col, [0, 0, 0], 0.6), 0.6)); nuc.addColorStop(0.8, rgba(mix3(col, [0, 0, 0], 0.4), 0.45)); nuc.addColorStop(1, rgba(col, 0));
    cg.fillStyle = nuc; cg.beginPath(); cg.arc(x + r * 0.1, y + r * 0.1, r * 0.42, 0, Math.PI * 2); cg.fill();
    // membrane: a thin bright ring
    cg.strokeStyle = rgba(mix3(col, [255, 255, 255], 0.4), 0.5); cg.lineWidth = Math.max(1, r * 0.05); cg.beginPath(); cg.arc(x, y, r * 0.94, 0, Math.PI * 2); cg.stroke();
    cg.restore();
  };
  for (const d of drawn) {
    const li = d.depth < 0.3 ? 0 : d.depth < 0.8 ? 1 : 2, cg = layers[li].getContext("2d"), s = scales[li];
    const col = colOf(d.pop);
    const a = li === 0 ? 0.55 : li === 1 ? 0.95 : 0.5;
    cellSprite(cg, d.x, d.y, d.r * (li === 2 ? 1.35 : 1), col, s, a);
  }
  blit(wg, layers[0], ww, wh, { blur: 3, alpha: 0.9, mode: "screen" });
  blit(wg, layers[1], ww, wh, { mode: "screen" });
  // Fluorescence bloom of the mid layer.
  const bl = layer(ww / 6, wh / 6), bg = bl.getContext("2d"); bg.filter = "blur(5px)"; bg.drawImage(layers[1], 0, 0, ww / 6, wh / 6);
  blit(wg, bl, ww, wh, { alpha: 0.55, mode: "screen" });
  blit(wg, layers[2], ww, wh, { blur: 6, alpha: 0.75, mode: "screen" });
  // The boundary: a faint darker seam where the two populations meet (they never mix), not a drawn line.
  if (stage === "two") { wg.save(); wg.translate(ww * 0.51, wh * 0.41); wg.rotate(Math.atan2(boundaryN.y, boundaryN.x)); const sg = wg.createLinearGradient(-30, 0, 30, 0); sg.addColorStop(0, "rgba(4,6,12,0)"); sg.addColorStop(0.5, "rgba(4,6,12,0.28)"); sg.addColorStop(1, "rgba(4,6,12,0)"); wg.fillStyle = sg; const eg = wg.createLinearGradient(0, -R0 * 1.2, 0, R0 * 1.2); eg.addColorStop(0, "rgba(0,0,0,0)"); eg.addColorStop(0.25, "rgba(0,0,0,1)"); eg.addColorStop(0.75, "rgba(0,0,0,1)"); eg.addColorStop(1, "rgba(0,0,0,0)"); wg.globalCompositeOperation = "multiply"; wg.fillRect(-30, -R0 * 1.2, 60, R0 * 2.4); wg.restore(); }
  for (const m of motes) { const y = ((m.y - t * m.sp) % wh + wh) % wh, x = m.x + Math.sin(t * 0.5 + m.ph) * 4; wg.fillStyle = rgba([160, 190, 210], m.a); wg.beginPath(); wg.arc(x, y, m.r, 0, Math.PI * 2); wg.fill(); }
  // One warm light: the amber population is the warm source; a soft amber wash from its side. Lower third dark.
  if (stage !== "cyan" && stage !== "early") { wg.save(); wg.globalCompositeOperation = "screen"; const c1 = centre(1); glow(wg, c1.x, c1.y, wh * 0.28, [255, 150, 30], 0.12); wg.restore(); }
  const dg = wg.createLinearGradient(0, wh * 0.58, 0, wh); dg.addColorStop(0, "rgba(4,6,12,0)"); dg.addColorStop(1, "rgba(4,6,12,0.9)"); wg.fillStyle = dg; wg.fillRect(0, wh * 0.58, ww, wh * 0.42);
  const zoom = 1.0 + 0.012 * Math.sin(t * 0.2), px = -(ww - W) / 2 + Math.sin(t * 0.14) * W * 0.015, py = -(wh - H) / 2 + Math.cos(t * 0.1) * H * 0.008;
  g.save(); g.fillStyle = "#060913"; g.fillRect(0, 0, W, H); g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2, -H / 2); g.imageSmoothingQuality = "high"; g.drawImage(world, px, py); g.restore();
}
