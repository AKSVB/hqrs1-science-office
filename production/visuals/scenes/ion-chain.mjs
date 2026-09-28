// ion-chain (three.js): a linear ion trap reduced to its honest shape: two long gold electrode rails running from
// the foreground into the dark, a flat dark chip surface with a faint grid of thinner electrode segments below
// them, a very faint violet-blue laser sheet crossing the chain, and n ions on the axis: small cool blue-white
// emissive cores with soft additive halos, each a weak cyan point light on the rails beneath. The one warm
// source is an amber point light at the upper left raking along the rails' top edges (storyboards SB-01 to
// SB-04 for reel-13-atoms-string-breaking). No labels, no chamber: black beyond the rails.
// Options (--var): view=chain (default) | single | trap | hero; n=13 (number of ions; 0 allowed).
// layer=subject (from --alpha): the ions with their halos only (in single, the seventh ion and its two neighbours).
import { clamp, lerp, smooth } from "./_lib.mjs";
import { makeSprite, Post, setLens } from "./_three.mjs";

export const kind = "three";

let T, R, W, H, C, scene, cam, view, n, subjectOnly, post, key, ions = [], sheet, sheetTex;
const PITCH = 0.25;

export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; C = ctx;
  view = ctx.opts.view || "chain"; n = ctx.opts.n != null ? Math.max(0, +ctx.opts.n | 0) : 13; subjectOnly = ctx.opts.layer === "subject";
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.NoToneMapping;
  post = new Post(T, R, W, H, { alpha: subjectOnly, exposure: 1.0 });
  scene = new T.Scene();
  cam = new T.PerspectiveCamera(40, W / H, 0.02, 80);
  const rng = ctx.rng;

  if (!subjectOnly) {
    // a dim environment so the gold reads as metal: warm at the upper left, cool blue below
    { const c = document.createElement("canvas"); c.width = 256; c.height = 128; const g = c.getContext("2d");
      const vg = g.createLinearGradient(0, 0, 0, 128); vg.addColorStop(0, "#141a26"); vg.addColorStop(0.5, "#090c14"); vg.addColorStop(1, "#0a1a24"); g.fillStyle = vg; g.fillRect(0, 0, 256, 128);
      const wg = g.createRadialGradient(60, 34, 0, 60, 34, 70); wg.addColorStop(0, "rgba(255,200,120,0.5)"); wg.addColorStop(1, "rgba(255,180,70,0)"); g.fillStyle = wg; g.fillRect(0, 0, 256, 128);
      const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.mapping = T.EquirectangularReflectionMapping;
      scene.environment = new T.PMREMGenerator(R).fromEquirectangular(tex).texture; scene.environmentIntensity = 1.5; }
    const gold = new T.MeshStandardMaterial({ color: 0xd9b24a, metalness: 1.0, roughness: 0.32, envMapIntensity: 0.7 });
    for (const x of [-0.45, 0.45]) { const rail = new T.Mesh(new T.BoxGeometry(0.06, 0.06, 12, 1, 1, 1), gold); rail.position.set(x, 0, -2); scene.add(rail); }
    const chip = new T.Mesh(new T.PlaneGeometry(14, 16), new T.MeshStandardMaterial({ color: 0x141c33, roughness: 0.55, metalness: 0.15 })); chip.rotation.x = -Math.PI / 2; chip.position.set(0, -0.35, -2); scene.add(chip);
    // segmented electrodes: thin grey boxes every 0.5 along the axis on both sides, dim
    const segGeo = new T.BoxGeometry(0.9, 0.012, 0.11); const segMat = new T.MeshStandardMaterial({ color: 0x4a5262, metalness: 0.85, roughness: 0.4 });
    const segs = new T.InstancedMesh(segGeo, segMat, 2 * 56); const m = new T.Matrix4(); let k = 0;
    for (let i = 0; i < 56; i++) for (const x of [-1.05, 1.05]) { m.makeTranslation(x, -0.345, 4 - i * 0.25); segs.setMatrixAt(k++, m); } scene.add(segs);
    // the laser sheet: a translucent additive plane with an fbm shimmer, crossing the chain at a shallow angle
    { const S = 256, c = document.createElement("canvas"); c.width = S; c.height = 64; const g = c.getContext("2d"), id = g.createImageData(S, 64);
      for (let y = 0, i = 0; y < 64; y++) for (let x = 0; x < S; x++, i += 4) { const v = C.fbm(x / S * 8, y / 64 * 2, 3.3, 3); const edge = Math.sin(y / 64 * Math.PI); id.data[i] = 120; id.data[i + 1] = 90; id.data[i + 2] = 255; id.data[i + 3] = 255 * clamp(v * 1.4 - 0.2, 0, 1) * edge; }
      g.putImageData(id, 0, 0); sheetTex = new T.CanvasTexture(c); sheetTex.wrapS = T.RepeatWrapping; sheetTex.colorSpace = T.SRGBColorSpace;
      sheet = new T.Mesh(new T.PlaneGeometry(9, 0.5), new T.MeshBasicMaterial({ map: sheetTex, transparent: true, opacity: 0.035, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
      sheet.rotation.y = Math.PI / 2 + 0.22; sheet.rotation.x = 0.12; sheet.position.set(0, 0.0, -0.4); sheet.renderOrder = 5; if (view !== "single") scene.add(sheet); }
  }
  // the ions
  const halo = makeSprite(T, 128, "rgba(210,245,255,1)", "rgba(120,220,240,0)", 1.0);
  const keepIdx = (i) => !(subjectOnly && view === "single") || Math.abs(i - 6) <= 1;
  for (let i = 0; i < n; i++) {
    if (!keepIdx(i)) continue;
    const z = -(i - (n - 1) / 2) * PITCH; const g = new T.Group(); g.position.set(0, 0, z);
    g.add(new T.Mesh(new T.SphereGeometry(view === "single" ? 0.011 : 0.035, 24, 16), new T.MeshBasicMaterial({ color: 0xdff6ff })));
    const sp = new T.Sprite(new T.SpriteMaterial({ map: halo, color: 0xbfefff, blending: T.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false })); const hs = view === "single" ? 0.16 : 0.4; sp.scale.set(hs, hs, 1); sp.userData.hs = hs; g.add(sp);
    if (!subjectOnly) g.add(new T.PointLight(0xbfe8ff, 0.22, 2.5, 2)); // near-white so the gold rails do not turn green
    scene.add(g); ions.push({ g, sp, z, rate: 0.6 + rng() * 0.5, ph: rng() * 6.28, jx: rng() * 6.28, jy: rng() * 6.28 });
  }
  key = new T.PointLight(0xffb020, view === "single" ? 22 : 60, 0, 2); key.position.set(-3.5, 1.2, 2.0); scene.add(key);
  scene.add(new T.HemisphereLight(0x33507a, 0x000000, 0.18));
}

export function draw(t) {
  const dolly = 1 - 0.03 * smooth(0, 3, t);
  for (const io of ions) { const b = 1 + 0.12 * Math.sin(t * 2 * Math.PI * io.rate + io.ph); io.sp.material.opacity = 0.55 * b; io.sp.scale.set(io.sp.userData.hs * b, io.sp.userData.hs * b, 1); io.g.position.set(Math.sin(t * 7.3 + io.jx) * 0.0025, Math.sin(t * 6.1 + io.jy) * 0.0025, io.z); }
  if (sheet) { sheetTex.offset.x = t * 0.03; sheet.material.opacity = 0.035 * (1 + 0.15 * Math.sin(t * 1.7)); }
  const asp = W / H; let blur = null, fade = [0.6, 1.0, 0.92];
  if (view === "single") {
    setLens(cam, 120, asp);
    const c = new T.Vector3(0, 0, 0); // the seventh ion is at z = 0 for n = 13
    cam.position.set(-0.9 * dolly, 0.55 * dolly, 1.0 * dolly); cam.lookAt(c.x, c.y - 0.03, c.z); cam.rotateZ(0.1);
    blur = { focus: cam.position.length(), range: 0.16, max: 22 };
  } else if (view === "trap") {
    setLens(cam, 50, asp);
    cam.position.set(-2.6 * dolly, 4.6 * dolly, 3.4 * dolly); cam.lookAt(0.4, -0.6, -1.2); cam.rotateX(-0.03);
    fade = [0.58, 1.0, 0.95];
  } else if (view === "hero") {
    setLens(cam, 50, asp);
    cam.position.set(1.6, 1.0, 2.8); cam.lookAt(0, 0, -0.3); fade = [1, 1, 0];
  } else { // chain: 25 degrees above the axis, 15 degrees to the side, the rails converging toward the upper right
    setLens(cam, 50, asp);
    cam.position.set(-1.7 * dolly, 1.5 * dolly, 2.7 * dolly); cam.lookAt(0.35, -0.85, -1.3); cam.rotateZ(0.04);
  }
  post.render(scene, cam, { fade, blur, clear: 0x03050a });
}
