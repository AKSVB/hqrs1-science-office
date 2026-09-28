// tooth-macro (three.js): one human molar crown under a macro lens: a rounded box displaced by low-frequency fbm
// into four cusps with a slight waist at the neck, an ivory-cream enamel texture (warmer toward the neck) with
// dark branching fissures between the cusps, and one flat worn facet on the lingual side carrying fine parallel
// striations that raking light reads as micro-relief. Wet enamel (clearcoat), a faint warm subsurface rim. The
// crown sits in a shallow dark matte cup that reads as the cloth of a bench; the field is grade-black.
// One warm key (amber point light, upper left, raking at 25 degrees), one cool cyan fill from the right, a dim
// hemisphere, forty dust motes in the beam (storyboards BT-01/02/03 for reel-betel-teeth).
// Options (--var view=): "crown" (default), "groove" (2.5x closer on the facet, far side blurred), "pair"
// (two crowns, the further one smaller, dimmer and from a different seed), "hero" (the crown centred, large).
// layer=subject (from --alpha): the tooth (both crowns in pair) only; no cup, motes or background.
import { clamp, lerp, smooth } from "./_lib.mjs";
import { makeSprite, Motes, Post, rimPatch, setLens } from "./_three.mjs";

export const kind = "three";

let T, R, W, H, C, scene, cam, view, subjectOnly, post, key, motes, crowns = [];

// Enamel texture: base gradient, fissures (top region), striation lines (a band along the lingual edge).
const enamelTextures = (seedOff, rng) => {
  const S = 2048, c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 0, S); bg.addColorStop(0, "#e8dcc4"); bg.addColorStop(0.55, "#e4d6b8"); bg.addColorStop(1, "#d9c39a"); g.fillStyle = bg; g.fillRect(0, 0, S, S);
  // mottle: faint enamel variation
  for (let i = 0; i < 1400; i++) { const x = rng() * S, y = rng() * S, r = 20 + rng() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, r); const k = rng() < 0.5 ? "rgba(200,180,140,0.08)" : "rgba(255,250,240,0.07)"; gr.addColorStop(0, k); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  // side map: the plain enamel with the striation band along its top edge (the facet crosses the top of the lingual face)
  const side = document.createElement("canvas"); side.width = side.height = S; const sg = side.getContext("2d"); sg.drawImage(c, 0, 0);
  const sideB = document.createElement("canvas"); sideB.width = sideB.height = S; const sbg = sideB.getContext("2d"); sbg.fillStyle = "#808080"; sbg.fillRect(0, 0, S, S);
  for (let i = 0; i < 120; i++) { const y = i * (S * 0.3 / 120); const up = i % 2 === 0; sg.fillStyle = up ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"; sg.fillRect(0, y, S, 2); sbg.fillStyle = up ? "#c0c0c0" : "#404040"; sbg.fillRect(0, y, S, 2); }
  // bump map canvas: mid grey, fissures dark, striations alternating
  const b = document.createElement("canvas"); b.width = b.height = S; const bg2 = b.getContext("2d"); bg2.fillStyle = "#808080"; bg2.fillRect(0, 0, S, S);
  // fissures: three branching polylines between the cusps, in the top face region (the texture is used per face)
  const fiss = (pts, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(pts[0][0] * S, pts[0][1] * S); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] * S, pts[i][1] * S); g.stroke();
    bg2.strokeStyle = "#2a2a2a"; bg2.lineWidth = w * 2.2; bg2.lineCap = "round"; bg2.lineJoin = "round"; bg2.beginPath(); bg2.moveTo(pts[0][0] * S, pts[0][1] * S); for (let i = 1; i < pts.length; i++) bg2.lineTo(pts[i][0] * S, pts[i][1] * S); bg2.stroke(); };
  const jit = (v, a) => v + (rng() - 0.5) * a;
  const main = [[0.5, 0.12], [jit(0.5, 0.06), 0.3], [jit(0.5, 0.06), 0.5], [jit(0.5, 0.06), 0.7], [0.5, 0.88]];
  fiss(main, 16, "rgba(60,42,30,0.9)"); fiss(main, 6, "rgba(30,20,14,0.95)");
  const cross = [[0.14, 0.5], [0.3, jit(0.5, 0.06)], [0.5, 0.5], [0.7, jit(0.5, 0.06)], [0.86, 0.5]];
  fiss(cross, 14, "rgba(60,42,30,0.85)"); fiss(cross, 6, "rgba(30,20,14,0.95)");
  const br = [[0.5, 0.35], [0.62, jit(0.25, 0.05)], [0.72, 0.18]];
  fiss(br, 10, "rgba(60,42,30,0.8)");
  const br2 = [[0.5, 0.66], [0.36, jit(0.76, 0.05)], [0.24, 0.84]];
  fiss(br2, 10, "rgba(60,42,30,0.8)");
  // striations: 120 one-pixel lines, alternating +/- 6 percent, across a band along the bottom edge (the lingual edge of the top face)
  for (let i = 0; i < 120; i++) { const y = S * 0.80 + i * (S * 0.18 / 120); const up = i % 2 === 0; g.fillStyle = up ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"; g.fillRect(0, y, S, 1.5); bg2.fillStyle = up ? "#9a9a9a" : "#666666"; bg2.fillRect(0, y, S, 2); }
  return { map: c, bump: b, side, sideB };
};

const crownGeometry = (T, ctx, seedOff) => {
  const geo = new T.BoxGeometry(1.05, 0.8, 1.0, 64, 48, 64);
  const p = geo.attributes.position, v = new T.Vector3(), n = new T.Vector3();
  // the worn facet plane on the lingual side (-z, upper edge), tilted 12 degrees off the top
  const fn = new T.Vector3(0.0, Math.sin(12 * Math.PI / 180), -Math.cos(12 * Math.PI / 180)).normalize();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    n.copy(v).normalize();
    v.lerp(n.clone().multiplyScalar(0.55), 0.72);               // round the box toward a sphere of radius 0.55
    // cusps: four bumps on the top face; a valley between them
    const top = smooth(0.05, 0.3, v.y);
    let cusp = -0.35; for (const [cx, cz] of [[-0.24, -0.2], [0.24, -0.2], [-0.24, 0.22], [0.24, 0.22]]) { const d = Math.hypot(v.x - cx, v.z - cz); cusp += Math.exp(-d * d * 40); }
    const fold = ctx.fbm(v.x * 2.2 + seedOff, v.y * 2.2, v.z * 2.2 + 1, 2) - 0.5;
    const fine = ctx.fbm(v.x * 9 + seedOff, v.y * 9, v.z * 9, 2) - 0.5;
    const disp = top * cusp * 0.11 + fold * 0.035 + fine * 0.006;
    v.addScaledVector(n, disp);
    // the waist at the neck
    const neck = smooth(-0.15, -0.5, v.y); v.x *= 1 - neck * 0.09; v.z *= 1 - neck * 0.09;
    // the facet: points beyond the plane are flattened onto it
    const dd = v.dot(fn) - 0.34; if (dd > 0) v.addScaledVector(fn, -dd);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
};

export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; C = ctx;
  view = ctx.opts.view || "crown"; subjectOnly = ctx.opts.layer === "subject";
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.NoToneMapping;
  post = new Post(T, R, W, H, { alpha: subjectOnly, exposure: 1.0 });
  scene = new T.Scene();
  cam = new T.PerspectiveCamera(30, W / H, 0.05, 50);

  const makeCrown = (seedOff, dimK) => {
    const tex = enamelTextures(seedOff, ctx.rng);
    const map = new T.CanvasTexture(tex.map); map.colorSpace = T.SRGBColorSpace; map.anisotropy = 8;
    const bump = new T.CanvasTexture(tex.bump); bump.anisotropy = 8;
    const smap = new T.CanvasTexture(tex.side); smap.colorSpace = T.SRGBColorSpace; smap.anisotropy = 8; const sbump = new T.CanvasTexture(tex.sideB);
    const mk = (m, b) => { const mat = new T.MeshPhysicalMaterial({ map: m, bumpMap: b, bumpScale: 0.5, color: new T.Color(dimK, dimK, dimK), roughness: 0.35, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.12 }); rimPatch(mat, new T.Color(1.0, 0.7, 0.45), 0.04, 2.5); return mat; };
    const plain = mk(smap, null), occl = mk(map, bump), lingual = mk(smap, sbump); lingual.bumpScale = 3.0;
    const mesh = new T.Mesh(crownGeometry(T, ctx, seedOff), [plain, plain, occl, plain, plain, lingual]); // box faces: +x -x +y -y +z -z
    return mesh;
  };
  const group = new T.Group(); scene.add(group);
  if (view === "pair") {
    const a = makeCrown(1.0, 1.0); a.position.set(-0.42, 0, 0.25); a.rotation.y = 2.3; group.add(a);
    const b = makeCrown(7.3, 0.65); b.scale.setScalar(0.8); b.position.set(0.55, -0.05, -0.55); b.rotation.y = 1.4; group.add(b);
    crowns = [a, b];
  } else { const a = makeCrown(1.0, 1.0); a.rotation.y = 2.45; group.add(a); crowns = [a]; }
  if (!subjectOnly) {
    // the cup: a dark matte torus segment under each crown, and a dark cloth plane
    for (const cr of crowns) { const cup = new T.Mesh(new T.TorusGeometry(0.42 * cr.scale.x, 0.12 * cr.scale.x, 12, 64), new T.MeshStandardMaterial({ color: 0x0b0e16, roughness: 1.0 })); cup.rotation.x = Math.PI / 2; cup.position.copy(cr.position); cup.position.y -= 0.42 * cr.scale.x; group.add(cup); }
    const cloth = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardMaterial({ color: 0x0a0d16, roughness: 1.0 })); cloth.rotation.x = -Math.PI / 2; cloth.position.y = -0.5; group.add(cloth);
    motes = new Motes(T, ctx.rng, 40, { min: [-1.4, -0.4, -0.8], max: [1.0, 1.3, 1.4] }, { size: 0.03, opacity: 0.4, drift: 0.08 }); scene.add(motes.points);
  }
  key = new T.PointLight(0xffdcb0, 14, 0, 2); key.position.set(-2.2, 1.1, 1.2); scene.add(key); // upper left, about 25 degrees above the bench, raking
  const fill = new T.DirectionalLight(0x6fd8e8, 0.6); fill.position.set(2.5, 0.6, -0.5); scene.add(fill);
  scene.add(new T.HemisphereLight(0x33507a, 0x0a0a0a, 0.08));
}

export function draw(t) {
  const dolly = 1 - 0.02 * smooth(0, 3, t);
  key.intensity = 14 * (1 + 0.03 * Math.sin(t * 2 * Math.PI * 0.35));
  if (motes) motes.update(t);
  const asp = W / H; let blur = null, fade = [0.6, 1.0, 0.92];
  if (view === "groove") {
    setLens(cam, 60, asp);
    const fnl = new T.Vector3(0, Math.sin(12 * Math.PI / 180), -Math.cos(12 * Math.PI / 180)).applyAxisAngle(new T.Vector3(0, 1, 0), 2.45); // the facet's normal in world
    const c = fnl.clone().multiplyScalar(0.34); // the facet's centre
    cam.position.copy(c).addScaledVector(fnl, 1.55 * dolly).add(new T.Vector3(0.25, 0.7, 0.1)); cam.lookAt(c.x, c.y + 0.02, c.z); cam.rotateZ(0.45);
    blur = { focus: cam.position.distanceTo(c) - 0.05, range: 0.4, max: 18 }; fade = [0.42, 0.85, 0.97];
  } else if (view === "pair") {
    setLens(cam, 60, asp);
    cam.position.set(-0.5 * dolly, 2.2 * dolly, 4.0 * dolly); cam.lookAt(0.05, 0.0, -0.1); cam.rotateX(-0.06);
  } else if (view === "hero") {
    setLens(cam, 60, asp);
    cam.position.set(-1.6, 2.1, 3.4); cam.lookAt(0, 0.02, 0); fade = [1, 1, 0];
  } else { // crown: seen from 30 degrees above, the worn facet toward the camera at the left
    setLens(cam, 60, asp);
    cam.position.set(-1.35 * dolly, 1.9 * dolly, 2.95 * dolly); cam.lookAt(0.0, 0.1, 0); cam.rotateX(-0.06);
  }
  post.render(scene, cam, { fade, blur, clear: 0x070b14 });
}
