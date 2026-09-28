// cortex-array (three.js): a folded, wet, pink-grey cortical surface (a displaced sphere cap: gyri and sulci from
// ridged fbm, valleys darker and redder) with a flexible electrode film lying on it: a translucent polyurethane
// sheet conformed to the folds, a 16 by 16 grid of small gold discs, fine gold traces, and a ribbon cable leaving
// at the upper right (storyboards AB-01/03/05 for reel-avatar-bci; BG-01/02/04 for reel-brain-gamble).
// One warm key (amber point light, upper left), a cool cyan fill from the right, a faint hemisphere; dust in the
// key beam. Nothing anatomical is identifiable: a surface and a device. No skull, no face.
// Options (--var):
//   view=array (default) | close | cable | patches | hero
//   lit=0|1|2   (patches: how many patches glow; default 2)
//   close=1     (patches: 2x closer, BG-04)
//   grid=on|off (default on; patches defaults to off)
//   layer=subject (from --alpha): the film with discs and cable only; in patches, the two patches over a soft disc of surface.
import { clamp, lerp, smooth } from "./_lib.mjs";
import { makeSprite, Motes, Post, rimPatch, setLens } from "./_three.mjs";

export const kind = "three";

let T, R, W, H, C, scene, cam, view, lit, closeUp, grid, subjectOnly, post, key, fill, motes, film, discs, traces, cable, patches = [], patchLights = [], surface, surfMat, ROT;
const RAD = 3.0;

// Surface height field over the sphere direction n (unit): gyri ridges with narrow sulci, in units of RAD.
const heightAt = (n) => {
  const s = 2.4;
  const w = C.fbm(n.x * 1.6 + 7.1, n.y * 1.6, n.z * 1.6, 2) - 0.5;                    // warp so folds meander
  const w2 = C.fbm(n.x * 3.1 + 2.2, n.y * 3.1 + 9, n.z * 3.1, 2) - 0.5;
  // anisotropic sampling: gyri are elongated worms, not cells
  const x = n.x * 0.45 + w * 0.9 + w2 * 0.35, y = n.y * 1.6 + w * 0.6 + w2 * 0.25, z = n.z * 0.9 + w2 * 0.3;
  const r1 = Math.abs(2 * C.fbm(x * s + 3, y * s, z * s, 3) - 1);                     // ridged: 0 in the sulci
  const r2 = Math.abs(2 * C.fbm(x * s * 2.1 + 11, y * s * 2.1 + w, z * s * 2.1, 2) - 1);
  const gy = Math.pow(clamp(Math.sqrt(r1 * r1 + 0.0035) * 1.25, 0, 1), 0.46); // soft valley floor: no stair-steps in the normals                                  // flat rounded ridges, narrow deep valleys
  const gy2 = Math.pow(clamp(r2 * 1.1, 0, 1), 0.5);
  const fine = C.fbm(n.x * 18, n.y * 18, n.z * 18, 2) - 0.5;
  return gy * 0.09 + gy2 * 0.016 + fine * 0.004 - 0.062;
};

const capGeometry = (seg, half) => {
  const geo = new T.BufferGeometry(); const n = (seg + 1) * (seg + 1);
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  const v = new T.Vector3();
  for (let j = 0, i = 0; j <= seg; j++) for (let k = 0; k <= seg; k++, i++) {
    const a = (k / seg * 2 - 1) * half, b = (j / seg * 2 - 1) * half;
    v.set(Math.sin(a) * Math.cos(b), Math.sin(b), Math.cos(a) * Math.cos(b));
    const h = heightAt(v);
    const ao = smooth(-0.07, 0.02, h);                                    // valleys dark, ridges lit
    const vessel = Math.pow(Math.abs(2 * C.fbm(v.x * 40 + 5, v.y * 40, v.z * 40, 2) - 1), 0.5); // fine capillary lines
    const vs = 1 - smooth(0.05, 0.0, vessel) * 0.35;
    pos.set([v.x * RAD * (1 + h), v.y * RAD * (1 + h), v.z * RAD * (1 + h)], i * 3);
    const shade = 0.42 + 0.58 * ao;
    col.set([(0.78 * shade + 0.22) * (vs * 0.5 + 0.5), (0.72 * shade + 0.14) * vs, (0.72 * shade + 0.16) * vs], i * 3); // deeper is darker and redder
    uv.set([k / seg, j / seg], i * 2);
  }
  const idx = []; for (let j = 0; j < seg; j++) for (let k = 0; k < seg; k++) { const p = j * (seg + 1) + k; idx.push(p, p + 1, p + seg + 1, p + 1, p + seg + 2, p + seg + 1); }
  geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3)); geo.setAttribute("uv", new T.BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
};

// A point on the displaced surface for a direction n, lifted by "lift" (world units).
const surfPoint = (n, lift, floor = -1) => { const h = Math.max(heightAt(n), floor); return n.clone().multiplyScalar(RAD * (1 + h) + lift); };

// Ribbon along a curve: width w, "up" = radial from the sphere centre (so it lies flat on the surface and lifts off it).
const ribbon = (curve, w, segs, mat, uvRepeat = 1) => {
  const pts = curve.getPoints(segs), pos = [], uv = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const p = pts[i], tan = curve.getTangent(i / segs), up = p.clone().normalize(), side = new T.Vector3().crossVectors(tan, up).normalize();
    const a = p.clone().addScaledVector(side, -w / 2), b = p.clone().addScaledVector(side, w / 2);
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z); uv.push(0, i / segs * uvRepeat, 1, i / segs * uvRepeat);
    if (i < segs) { const q = i * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
  }
  const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  return new T.Mesh(geo, mat);
};

export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; C = ctx;
  view = ctx.opts.view || "array"; lit = ctx.opts.lit == null ? 2 : +ctx.opts.lit; closeUp = ctx.opts.close === "1";
  grid = ctx.opts.grid ? ctx.opts.grid === "on" : view !== "patches";
  subjectOnly = ctx.opts.layer === "subject";
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.NoToneMapping;
  post = new Post(T, R, W, H, { alpha: subjectOnly, exposure: 1.05 });
  scene = new T.Scene();
  cam = new T.PerspectiveCamera(40, W / H, 0.05, 60);

  // The surface. Rotated so the film sits on a ridge cluster and the folds run diagonally.
  ROT = new T.Group(); scene.add(ROT);
  surfMat = new T.MeshPhysicalMaterial({ color: 0xc9a1a6, vertexColors: true, roughness: 0.28, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.18, transparent: subjectOnly && view === "patches" });
  rimPatch(surfMat, new T.Color(0.55, 0.06, 0.04), 0.06, 3.0);
  surface = new T.Mesh(capGeometry(280, 0.75), surfMat); surface.renderOrder = 1;
  if (!(subjectOnly && view !== "patches")) ROT.add(surface);
  // patches subject layer: the surface fades out beyond a soft disc under the two patches.
  if (subjectOnly && view === "patches") {
    const prev = surfMat.onBeforeCompile;
    surfMat.onBeforeCompile = (sh) => { prev(sh);
      sh.uniforms.pA = { value: surfMat.userData.pA }; sh.uniforms.pB = { value: surfMat.userData.pB }; // world positions, filled before the first render
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWp;").replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec3 pA, pB; varying vec3 vWp;")
        .replace("#include <dithering_fragment>", "#include <dithering_fragment>\n{ float d = min(distance(vWp, pA), distance(vWp, pB)); gl_FragColor.a *= 1.0 - smoothstep(0.32, 0.80, d); }");
      surfMat.userData.sh = sh; };
  }

  // The film: a 0.9 x 0.9 sheet conformed to the surface, 96 segments, transparent polyurethane.
  const FILM = 0.9, FSEG = 96, fh = FILM / RAD / 2; // angular half-size
  const filmDir = (u, v) => { const a = (u * 2 - 1) * fh, b = (v * 2 - 1) * fh; return new T.Vector3(Math.sin(a) * Math.cos(b), Math.sin(b), Math.cos(a) * Math.cos(b)); };
  const filmGeo = new T.PlaneGeometry(1, 1, FSEG, FSEG); { const p = filmGeo.attributes.position, uvs = filmGeo.attributes.uv; for (let i = 0; i < p.count; i++) { const q = surfPoint(filmDir(uvs.getX(i), uvs.getY(i)), 0.02, -0.005); p.setXYZ(i, q.x, q.y, q.z); } filmGeo.computeVertexNormals(); }
  const filmMat = new T.MeshPhysicalMaterial({ color: 0xe8eef2, roughness: 0.15, metalness: 0.0, transparent: true, opacity: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.25, side: T.DoubleSide, depthWrite: false });
  film = new T.Mesh(filmGeo, filmMat); film.renderOrder = 3;
  // Traces: fine gold lines from each disc row toward the upper right edge, as a canvas texture on a copy of the film.
  { const S = 1024, c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d");
    g.clearRect(0, 0, S, S); g.strokeStyle = "rgba(217,178,74,0.9)"; g.lineWidth = 1.6; g.lineCap = "round";
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { const x = (i + 0.5) / 16 * S, y = (j + 0.5) / 16 * S; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4 + (15 - j) * 1.1, y - 10); g.lineTo(x + 4 + (15 - j) * 1.1, S * 0.985); g.stroke(); }
    // gather at the top edge (cable side): the traces run up to v = 1, which is the film's upper edge
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
    const tg = filmGeo.clone(); { const p = tg.attributes.position, uvs = tg.attributes.uv; for (let i = 0; i < p.count; i++) { const q = surfPoint(filmDir(uvs.getX(i), uvs.getY(i)), 0.026, -0.005); p.setXYZ(i, q.x, q.y, q.z); } }
    traces = new T.Mesh(tg, new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide })); traces.renderOrder = 4; }
  // Discs: 16 x 16 instanced gold cylinders, each seated on the film surface, axis along the surface normal.
  { const geo = new T.CylinderGeometry(0.013, 0.013, 0.005, 20); geo.rotateX(Math.PI / 2);
    discs = new T.InstancedMesh(geo, new T.MeshStandardMaterial({ color: 0xd9b24a, metalness: 1.0, roughness: 0.3 }), 256);
    const m = new T.Matrix4(), q = new T.Quaternion(), up = new T.Vector3(0, 0, 1);
    for (let i = 0, k = 0; i < 16; i++) for (let j = 0; j < 16; j++, k++) { const n = filmDir((i + 0.5) / 16, (j + 0.5) / 16), p = surfPoint(n, 0.027, -0.005); q.setFromUnitVectors(up, n); m.compose(p, q, new T.Vector3(1, 1, 1)); discs.setMatrixAt(k, m); }
    discs.renderOrder = 5; }
  // Cable: leaves the film's upper right corner, lifts off the surface and runs out of frame (array/close), or down to the bench block (cable).
  const cableMat = new T.MeshPhysicalMaterial({ color: 0xdfe6ea, roughness: 0.2, transparent: true, opacity: 0.5, clearcoat: 0.8, side: T.DoubleSide, depthWrite: false });
  const corner = surfPoint(filmDir(1.0, 0.96), 0.025, -0.005);
  const cablePts = view === "cable"
    ? [corner, corner.clone().add(new T.Vector3(0.35, 0.05, 0.05)), new T.Vector3(1.4, 0.1, 2.85), new T.Vector3(2.3, 0.05, 2.35), new T.Vector3(3.05, 0.0, 2.12)]
    : [corner, corner.clone().add(new T.Vector3(0.3, 0.08, 0.08)), new T.Vector3(1.1, 0.55, 3.15), new T.Vector3(2.2, 1.3, 3.6), new T.Vector3(3.6, 2.4, 4.4), new T.Vector3(5.2, 3.6, 5.6)];
  const curve = new T.CatmullRomCurve3(cablePts); cable = new T.Group();
  cable.add(ribbon(curve, 0.16, 120, cableMat));
  { const S = 512, c = document.createElement("canvas"); c.width = 64; c.height = S; const g = c.getContext("2d"); g.strokeStyle = "rgba(217,178,74,0.95)"; g.lineWidth = 1.2; for (let i = 0; i < 14; i++) { const x = 6 + i * 3.8; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.wrapT = T.RepeatWrapping;
    const tr = ribbon(new T.CatmullRomCurve3(cablePts.map(p => p.clone().addScaledVector(p.clone().normalize(), 0.004))), 0.16, 120, new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.6, depthWrite: false, side: T.DoubleSide }), 6); cable.add(tr); }
  cable.renderOrder = 6;
  if (grid) { ROT.add(film); ROT.add(traces); ROT.add(discs); ROT.add(cable); }

  // cable view: the bench, the connector block with 20 gold pins, a coiled grey lead into the dark.
  if (view === "cable" && !subjectOnly) {
    const bench = new T.Mesh(new T.PlaneGeometry(30, 30), new T.MeshStandardMaterial({ color: 0x141a28, roughness: 0.7 })); bench.position.set(3, 0, 2.1); ROT.add(bench);
    const block = new T.Group(); block.position.set(3.35, 0.0, 2.1);
    const body = new T.Mesh(new T.BoxGeometry(0.9, 0.42, 0.2, 8, 8, 8), new T.MeshStandardMaterial({ color: 0x2a3040, roughness: 0.4, metalness: 0.25 })); body.position.z = 0.1; block.add(body);
    const pinGeo = new T.CylinderGeometry(0.008, 0.008, 0.07, 10); pinGeo.rotateZ(Math.PI / 2);
    const pins = new T.InstancedMesh(pinGeo, new T.MeshStandardMaterial({ color: 0xd9b24a, metalness: 1, roughness: 0.28 }), 20); const m = new T.Matrix4();
    for (let i = 0; i < 20; i++) { m.makeTranslation(-0.47, -0.15 + (i % 10) * 0.033, 0.07 + Math.floor(i / 10) * 0.07); pins.setMatrixAt(i, m); } block.add(pins);
    ROT.add(block);
    // coiled lead: a helix along a curve toward the lower right, grey
    const pts = []; for (let i = 0; i <= 400; i++) { const s = i / 400; const cx = 3.75 + s * 3.2, cy = -0.05 - s * 2.2, cz = 2.13 + Math.sin(s * 3.14) * 0.05; const a = s * 90; pts.push(new T.Vector3(cx + Math.cos(a) * 0.055, cy + Math.sin(a) * 0.055 * 0.4, cz + Math.sin(a) * 0.055)); }
    const lead = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 900, 0.018, 8, false), new T.MeshStandardMaterial({ color: 0x5d6570, roughness: 0.6 })); ROT.add(lead);
  }

  // patches: two soft glowing spots on neighbouring gyri; each is a sprite on the surface plus a coloured point light.
  if (view === "patches") {
    const defs = [{ u: 0.36, v: 0.52, col: 0xffb020, on: lit >= 1 }, { u: 0.63, v: 0.50, col: 0x4fe3f0, on: lit >= 2 }];
    defs.forEach((d, k) => {
      const a = (d.u * 2 - 1) * 0.42, b = (d.v * 2 - 1) * 0.42; const n = new T.Vector3(Math.sin(a) * Math.cos(b), Math.sin(b), Math.cos(a) * Math.cos(b)); const p = surfPoint(n, 0.03);
      const sp = new T.Sprite(new T.SpriteMaterial({ map: makeSprite(T, 256, k === 0 ? "rgba(255,190,80,1)" : "rgba(140,240,250,1)", "rgba(0,0,0,0)", 1.2), color: d.col, blending: T.AdditiveBlending, transparent: true, opacity: d.on ? 0.75 : 0, depthWrite: false }));
      sp.position.copy(p); sp.scale.set(0.27, 0.27, 1); sp.renderOrder = 8; sp.material.depthTest = !subjectOnly; ROT.add(sp);
      const l = new T.PointLight(d.col, d.on ? 0.9 : 0, 1.2, 2); l.position.copy(surfPoint(n, 0.12)); ROT.add(l);
      patches.push({ sprite: sp, on: d.on, k, p }); patchLights.push(l);
    });
  }
  ROT.rotation.z = -0.55; ROT.updateMatrixWorld();
  if (view === "patches" && subjectOnly) { surfMat.userData.pA = patches[0].p.clone().applyMatrix4(ROT.matrixWorld); surfMat.userData.pB = patches[1].p.clone().applyMatrix4(ROT.matrixWorld); }

  // Lights: one warm key upper left; cool cyan fill from the right; faint hemisphere.
  key = new T.PointLight(0xffd2a0, 95, 0, 2); key.position.set(-3.2, 3.4, 7.2); scene.add(key);
  if (view === "cable") key.position.copy(new T.Vector3(1.2, 2.4, 4.6).applyMatrix4(ROT.matrixWorld));
  fill = new T.DirectionalLight(0x8fd8e8, subjectOnly ? 0.5 : 0.2); fill.position.set(4, 0.5, 3); scene.add(fill);
  scene.add(new T.HemisphereLight(0x2a3a55, 0x120a0c, 0.2));
  if (!subjectOnly) { motes = new Motes(T, ctx.rng, 30, { min: [-2.5, -1.5, 3.2], max: [1.5, 3, 5.5] }, { size: 0.14, opacity: 0.16 }); scene.add(motes.points); }
}

export function draw(t) {
  const dolly = 1 - 0.04 * smooth(0, 3, t);
  key.intensity = (view === "close" ? 55 : 95) * (1 + 0.05 * Math.sin(t * 2 * Math.PI * 0.9));
  surfMat.clearcoat = 0.6 + 0.03 * Math.sin(t * 2 * Math.PI * 0.9);
  if (view === "patches") patches.forEach((p, k) => { const b = 1 + 0.15 * Math.sin(t * 2 * Math.PI * 0.5 + k * 1.7); if (p.on) { p.sprite.material.opacity = 0.75 * b; patchLights[k].intensity = 0.9 * b; } });
  if (motes) motes.update(t);
  let blur = null, fade = [0.58, 1.0, 0.9];
  const asp = W / H;
  if (view === "close") {
    setLens(cam, 90, asp);
    const c = new T.Vector3(0.36, 0.34, 3.02).applyMatrix4(ROT.matrixWorld); // the film's right edge
    cam.position.set(c.x + 0.8 * dolly, c.y - 1.3 * dolly, c.z + 1.85 * dolly); cam.lookAt(c.x - 0.2, c.y - 0.02, c.z - 0.1); cam.rotateZ(0.42);
    blur = { focus: cam.position.distanceTo(c) - 0.1, range: 0.5, max: 20 };
    fade = [0.5, 0.85, 0.95];
  } else if (view === "cable") {
    setLens(cam, 50, asp);
    const c = new T.Vector3(2.7, 0.15, 2.3).applyMatrix4(ROT.matrixWorld), e = new T.Vector3(2.7 + 0.3 * dolly, -3.1 * dolly, 2.3 + 4.0 * dolly).applyMatrix4(ROT.matrixWorld);
    cam.position.copy(e); cam.lookAt(c); cam.rotateZ(0.1); cam.rotateX(-0.06);
    fade = [0.58, 1.0, 0.92];
  } else if (view === "hero") {
    setLens(cam, 50, asp);
    const c = new T.Vector3(0.25, 0.25, 3.05).applyMatrix4(ROT.matrixWorld);
    cam.position.set(c.x + 0.5, c.y - 0.9, c.z + 1.7); cam.lookAt(c.x + 0.05, c.y + 0.05, c.z); cam.rotateZ(0.3);
    fade = [1, 1, 0];
  } else if (view === "patches") {
    setLens(cam, 50, asp);
    const c = new T.Vector3(0.05, 0.05, 3.0).applyMatrix4(ROT.matrixWorld);
    const d = closeUp ? 0.5 : 1.0;
    cam.position.set(c.x + 1.3 * d * dolly, c.y - 2.9 * d * dolly, c.z + 3.6 * d * dolly); cam.lookAt(c.x - 0.1, c.y + 0.42 * d, c.z); cam.rotateZ(0.1);
    fade = closeUp ? [0.42, 0.8, 0.97] : [0.5, 0.85, 0.95];
  } else { // array
    setLens(cam, 50, asp);
    const c = new T.Vector3(0.1, 0.1, 3.0).applyMatrix4(ROT.matrixWorld);
    cam.position.set(c.x + 1.7 * dolly, c.y - 3.1 * dolly, c.z + 3.7 * dolly); cam.lookAt(c.x - 0.1, c.y - 0.15, c.z - 0.3); cam.rotateZ(0.32);
  }
  post.render(scene, cam, { fade, blur, clear: 0x05070d });
}
