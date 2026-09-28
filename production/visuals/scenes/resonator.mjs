// resonator (three.js): a lithium-niobate nanomechanical resonator, a thin translucent beam with a row of holes
// suspended over a trench in a chip (storyboard QJ-02 for reel-quantum-jump-sound). Cold blue lab light, one thin
// gold electrode trace catching the single warm reflection, a superconducting circuit trace on the substrate,
// a standing-wave ripple on the beam (a pure function of t). The quantum ladder is drawn by the reel renderer.
// Options (--var view=): "beam" (default, QJ-02 macro of the beam), "mount" (QJ-03: the chip on its gold mount with wire bonds).
// --var exposure=: tone-mapping exposure (default 1.0); the mount view is far from the key and reads best near 2.5.
import { clamp, lerp, smooth } from "./_lib.mjs";

export const kind = "three";

let T, R, scene, cam, W, H, beam, beamGeo, base, view, rng, warmLight, dustPts;

export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; rng = ctx.rng;
  view = ctx.opts.view || "beam";
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = +(ctx.opts.exposure || 1.0); // --var exposure=: editorial lift for the far mount view
  R.shadowMap.enabled = false;
  scene = new T.Scene();
  scene.fog = new T.FogExp2(0x060913, view === "beam" ? 0.022 : 0.016);
  cam = new T.PerspectiveCamera(view === "beam" ? 30 : 34, W / H, 0.05, 400);

  // Substrate: a dark silicon slab with a fine crystalline texture and an etched trench under the beam.
  const texC = document.createElement("canvas"); texC.width = texC.height = 1024;
  { const g = texC.getContext("2d"), id = g.createImageData(1024, 1024), d = id.data;
    for (let y = 0, i = 0; y < 1024; y++) for (let x = 0; x < 1024; x++, i += 4) {
      const n = ctx.fbm(x * 0.02, y * 0.02, 1.0, 4), f = ctx.noise(x * 0.35, y * 0.35, 2.0), line = smooth(0.97, 1.0, Math.abs(Math.sin(x * 0.19))) * 0.1; // faint lithography lines
      const v = 0.18 + 0.14 * n + 0.08 * (f - 0.5) + line;
      d[i] = 255 * v * 0.5; d[i + 1] = 255 * v * 0.62; d[i + 2] = 255 * v * 0.85; d[i + 3] = 255;
    }
    g.putImageData(id, 0, 0); }
  const subTex = new T.CanvasTexture(texC); subTex.wrapS = subTex.wrapT = T.RepeatWrapping; subTex.repeat.set(3, 3); subTex.colorSpace = T.SRGBColorSpace;
  const subMat = new T.MeshStandardMaterial({ map: subTex, color: 0x3e4c66, roughness: 0.3, metalness: 0.75 });
  base = new T.Group();
  const slab = (x, z, w, d, h = 1) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), subMat); m.position.set(x, -h / 2, z); base.add(m); return m; };
  slab(0, -6.5, 60, 9); slab(0, 6.5, 60, 9); // the two sides of the trench (the trench is 4 units wide along x)
  slab(-24, 0, 12, 4); slab(24, 0, 12, 4); // the anchors at either end of the beam
  const trenchFloor = new T.Mesh(new T.PlaneGeometry(60, 4), new T.MeshStandardMaterial({ color: 0x0a0f1c, roughness: 0.9, metalness: 0.2 })); trenchFloor.rotation.x = -Math.PI / 2; trenchFloor.position.y = -2.6; base.add(trenchFloor);
  // Superconducting circuit trace: a meandering flat ribbon on the substrate, pale metal, plus two contact pads.
  const traceMat = new T.MeshStandardMaterial({ color: 0xc9d6e8, roughness: 0.3, metalness: 0.9 });
  const rib = (x, z, w, d) => { const m = new T.Mesh(new T.BoxGeometry(w * 0.5, 0.06, d), traceMat); m.position.set(x, 0.03, z); base.add(m); };
  for (let k = 0; k < 9; k++) { rib(-14 + k * 2.2, -8.5 + (k % 2 ? 1.2 : -1.2), 0.5, 3.2); if (k < 8) { const m = new T.Mesh(new T.BoxGeometry(2.45, 0.06, 0.25), traceMat); m.position.set(-12.9 + k * 2.2, 0.03, -8.5 + (k % 2 ? 2.7 : -2.7)); base.add(m); } }
  { const m1 = new T.Mesh(new T.BoxGeometry(10, 0.06, 0.25), traceMat); m1.position.set(8, 0.03, -10.5); base.add(m1); const m2 = new T.Mesh(new T.BoxGeometry(26, 0.06, 0.25), traceMat); m2.position.set(-12, 0.03, 8.5); base.add(m2); }
  const pad = (x, z) => { const m = new T.Mesh(new T.BoxGeometry(2.2, 0.08, 2.2), traceMat); m.position.set(x, 0.04, z); base.add(m); };
  pad(14, -10.5); pad(-25.5, 8.5);
  // The gold electrode: a thin warm trace running along the trench edge, the one warm reflection in the frame.
  const gold = new T.Mesh(new T.BoxGeometry(56, 0.09, 0.35), new T.MeshStandardMaterial({ color: 0xffb020, roughness: 0.25, metalness: 1.0, emissive: 0x3a2200, emissiveIntensity: 0.6 }));
  gold.position.set(0, 0.05, -2.35); base.add(gold);
  scene.add(base);

  // The beam: a thin translucent slab with a row of holes (a phononic crystal), suspended across the trench.
  const shape = new T.Shape(); shape.moveTo(-18, -0.7); shape.lineTo(18, -0.7); shape.lineTo(18, 0.7); shape.lineTo(-18, 0.7); shape.closePath();
  for (let k = -8; k <= 8; k++) { const hole = new T.Path(); hole.absarc(k * 2.0, 0, 0.42, 0, Math.PI * 2, true); shape.holes.push(hole); }
  beamGeo = new T.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false, curveSegments: 24 });
  beamGeo.rotateX(Math.PI / 2); beamGeo.translate(0, 0.16, 0);
  beamGeo.attributes.position.setUsage(T.DynamicDrawUsage);
  beamGeo.userData.rest = beamGeo.attributes.position.array.slice();
  const beamMat = new T.MeshPhysicalMaterial({ color: 0xbfd8ee, roughness: 0.18, metalness: 0.0, transmission: 0.55, thickness: 0.4, ior: 2.2, transparent: true, opacity: 0.92, clearcoat: 0.6, clearcoatRoughness: 0.2, side: T.DoubleSide });
  beam = new T.Mesh(beamGeo, beamMat); beam.position.y = 0.05; scene.add(beam);

  // Lights: cold blue key from the upper left, a cool rim from behind, one warm point near the gold trace.
  scene.add(new T.HemisphereLight(0x3a527a, 0x05080f, 0.22));
  const key = new T.SpotLight(0x9cc4ff, 2600, 120, 0.21, 0.5, 1.7); key.position.set(-18, 34, 12); key.target.position.set(-2, 0, -3); scene.add(key); scene.add(key.target);
  const rim = new T.DirectionalLight(0x4fe3f0, 1.4); rim.position.set(16, 12, -30); scene.add(rim);
  warmLight = new T.PointLight(0xffb020, 6, 22, 1.6); warmLight.position.set(8, 2.2, -7); scene.add(warmLight);

  // Dust motes in the beam of light, for scale and air.
  { const n = 300, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) pos.set([(rng() - 0.5) * 50, rng() * 12, (rng() - 0.5) * 30], i * 3);
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    dustPts = new T.Points(geo, new T.PointsMaterial({ color: 0xbfdcff, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false })); scene.add(dustPts); }
}

export function draw(t) {
  // Standing wave on the beam: the fundamental plus a faint third harmonic, exaggerated for the camera.
  const pos = beamGeo.attributes.position, rest = beamGeo.userData.rest;
  for (let i = 0; i < pos.count; i++) { const x = rest[i * 3], y = rest[i * 3 + 1], z = rest[i * 3 + 2]; const q = (x + 18) / 36; const w = Math.sin(q * Math.PI) * Math.sin(t * 6.0) * 0.28 + Math.sin(q * Math.PI * 3) * Math.sin(t * 17.0) * 0.05; pos.setXYZ(i, x, y + w * smooth(0, 0.08, q) * smooth(1, 0.92, q), z); }
  pos.needsUpdate = true; beamGeo.computeVertexNormals();
  warmLight.intensity = 6 + Math.sin(t * 3.1) * 0.3;
  dustPts.rotation.y = t * 0.01; dustPts.position.y = Math.sin(t * 0.2) * 0.3;
  if (view === "mount") {
    const a = 0.35 + t * 0.01;
    cam.position.set(Math.sin(a) * 40, 24, Math.cos(a) * 40); cam.lookAt(0, 0, 0); cam.rotateX(-0.06);
  } else {
    // macro: low over the substrate, the beam running diagonally across the upper half, far end soft in fog
    const a = -0.62 + t * 0.006;
    cam.position.set(Math.cos(a) * 21, 7.0 + Math.sin(t * 0.1) * 0.2, Math.sin(a) * 21);
    cam.lookAt(-3, 0.3, 0); cam.rotateX(-0.09); // the beam runs diagonally across the upper half; the near substrate falls into shadow below
  }
  cam.updateProjectionMatrix();
  R.setClearColor(0x060913, 1);
  R.render(scene, cam);
}
