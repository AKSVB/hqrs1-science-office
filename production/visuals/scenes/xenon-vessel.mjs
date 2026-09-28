// xenon-vessel (three.js): a tall cylindrical two-phase liquid detector reduced to its honest parts: a pale
// brushed-metal vessel wall lined with thin copper field-shaping rings, a hexagonal honeycomb of 61 dark
// photomultiplier faces at the bottom and top, a column of perfectly clear liquid with a faintly rippling surface,
// one warm amber lamp landing as a single reflection on the top ring and the upper wall, a cyan fill from below
// so the PMT faces carry faint cool reflections; optionally one scintillation flash (a cool white-cyan point,
// a light and an expanding halo) in the liquid (storyboards LZ-01/02/03 for reel-lz-dark-matter).
// Options (--var): view=interior (default) | pmt | exterior | hero; flash=<seconds> (omit for none).
// layer=subject (from --alpha): interior/pmt: the PMT honeycomb (plus the flash when set); exterior: the vessel
// with its jacket and cables, no rock.
import { clamp, lerp, smooth } from "./_lib.mjs";
import { makeSprite, Post, setLens } from "./_three.mjs";

export const kind = "three";

let T, R, W, H, C, scene, cam, view, flashAt, subjectOnly, post, lamp, liquidTop, topPos, flash = null, pmtsBottom, honeycomb = [], jacketGroup, ripple;
const RV = 1.0, HV = 2.4;


export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; C = ctx;
  view = ctx.opts.view || "interior"; flashAt = ctx.opts.flash != null ? +ctx.opts.flash : null; subjectOnly = ctx.opts.layer === "subject";
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.NoToneMapping;
  post = new Post(T, R, W, H, { alpha: subjectOnly, exposure: 1.0 });
  scene = new T.Scene();
  cam = new T.PerspectiveCamera(40, W / H, 0.02, 80);

  // Environment for the metals: a dark equirect with one warm smudge at the upper left and a faint cool floor.
  { const c = document.createElement("canvas"); c.width = 256; c.height = 128; const g = c.getContext("2d");
    const vg = g.createLinearGradient(0, 0, 0, 128); vg.addColorStop(0, "#1a2130"); vg.addColorStop(0.5, "#0c1019"); vg.addColorStop(1, "#0a1a22"); g.fillStyle = vg; g.fillRect(0, 0, 256, 128);
    const wg = g.createRadialGradient(70, 30, 0, 70, 30, 60); wg.addColorStop(0, "rgba(255,190,110,0.4)"); wg.addColorStop(1, "rgba(255,190,110,0)"); g.fillStyle = wg; g.fillRect(0, 0, 256, 128);
    const cg = g.createRadialGradient(128, 128, 0, 128, 128, 90); cg.addColorStop(0, "rgba(79,227,240,0.25)"); cg.addColorStop(1, "rgba(79,227,240,0)"); g.fillStyle = cg; g.fillRect(0, 0, 256, 128);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.mapping = T.EquirectangularReflectionMapping;
    const pm = new T.PMREMGenerator(R); scene.environment = pm.fromEquirectangular(tex).texture; scene.environmentIntensity = 0.7; }

  const wallMat = new T.MeshStandardMaterial({ color: 0xb9c2cc, metalness: 0.9, roughness: 0.5, side: T.BackSide, envMapIntensity: 0.5 });
  const holderMat = new T.MeshStandardMaterial({ color: 0x2a2f38, metalness: 0.6, roughness: 0.6 });
  const glassMat = new T.MeshPhysicalMaterial({ color: 0x1d2431, roughness: view === "interior" ? 0.3 : 0.08, metalness: 0.2, clearcoat: 1.0, clearcoatRoughness: view === "interior" ? 0.35 : 0.05, envMapIntensity: 1.6 });
  const copper = new T.MeshStandardMaterial({ color: 0x7a4c2c, metalness: 1.0, roughness: 0.45, envMapIntensity: 0.5 });

  // A PMT honeycomb: 61 faces (5 rings) on a holder plate, at height y facing dir (+1 up / -1 down).
  const buildArray = (y, dir) => {
    const g = new T.Group(); const centres = []; const pitch = 0.205;
    for (let q = -4; q <= 4; q++) for (let r = -4; r <= 4; r++) { const s = -q - r; if (Math.abs(s) > 4) continue; centres.push([pitch * (q + r / 2), pitch * r * 0.866]); }
    const holder = new T.Mesh(new T.CylinderGeometry(RV, RV, 0.08, 96), holderMat); holder.position.y = y - dir * 0.04; g.add(holder);
    const faceGeo = new T.CylinderGeometry(0.09, 0.09, 0.03, 40); const rimGeo = new T.TorusGeometry(0.096, 0.008, 8, 40); rimGeo.rotateX(Math.PI / 2);
    const faces = new T.InstancedMesh(faceGeo, glassMat, centres.length), rims = new T.InstancedMesh(rimGeo, holderMat, centres.length);
    const m = new T.Matrix4(); centres.forEach((c, i) => { m.makeTranslation(c[0], y + dir * 0.02, c[1]); faces.setMatrixAt(i, m); m.makeTranslation(c[0], y + dir * 0.035, c[1]); rims.setMatrixAt(i, m); });
    g.add(faces); g.add(rims); g.userData.centres = centres; return g;
  };

  if (view !== "exterior") {
    if (!subjectOnly) {
      const wall = new T.Mesh(new T.CylinderGeometry(RV, RV, HV, 96, 1, true), wallMat); scene.add(wall);
      // field-shaping rings every 0.08 down the inside
      const ringGeo = new T.TorusGeometry(RV - 0.012, 0.006, 6, 96); ringGeo.rotateX(Math.PI / 2);
      const n = Math.floor(HV / 0.08) - 2; const rings = new T.InstancedMesh(ringGeo, copper, n); const m = new T.Matrix4();
      for (let i = 0; i < n; i++) { m.makeTranslation(0, -HV / 2 + 0.12 + i * 0.08, 0); rings.setMatrixAt(i, m); } scene.add(rings);
      // the top ring: thicker, the one the lamp lands on
      const top = new T.Mesh(new T.TorusGeometry(RV - 0.02, 0.022, 10, 96), copper); top.rotation.x = Math.PI / 2; top.position.y = HV / 2 - 0.06; scene.add(top);
    }
    pmtsBottom = buildArray(-HV / 2 + 0.06, 1); scene.add(pmtsBottom);
    if (!subjectOnly) { const pmtsTop = buildArray(HV / 2 - 0.06, -1); scene.add(pmtsTop); }
    // the liquid: a transmissive column with a rippling surface plane
    if (!subjectOnly) {
      const liq = new T.MeshPhysicalMaterial({ color: 0xe8f4ff, roughness: 0.03, metalness: 0, ior: 1.4, transparent: true, opacity: 0.10, clearcoat: 1.0, clearcoatRoughness: 0.02, side: T.DoubleSide, depthWrite: false, envMapIntensity: 1.5 }); // the surface reads by its sheen; the column itself is perfectly clear
      const surf = new T.PlaneGeometry(RV * 2, RV * 2, 96, 96); surf.rotateX(-Math.PI / 2);
      liquidTop = new T.Mesh(surf, liq); liquidTop.position.y = HV / 2 - 0.35; liquidTop.renderOrder = 20; scene.add(liquidTop);
      topPos = surf.attributes.position.array.slice();
      // faint caustic-like shimmer on the bottom holder: an additive plane with an fbm texture that drifts
      const S = 256, c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d"), id = g.createImageData(S, S);
      for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i += 4) { const v = Math.pow(C.fbm(x / S * 6, y / S * 6, 4.4, 3), 3) * 2.2; id.data[i] = 150 * v; id.data[i + 1] = 220 * v; id.data[i + 2] = 240 * v; id.data[i + 3] = 255 * clamp(v, 0, 1); }
      g.putImageData(id, 0, 0); const tex = new T.CanvasTexture(c); tex.wrapS = tex.wrapT = T.RepeatWrapping;
      ripple = new T.Mesh(new T.CircleGeometry(RV - 0.02, 64), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.05, blending: T.AdditiveBlending, depthWrite: false })); tex.repeat.set(2, 2);
      ripple.rotation.x = -Math.PI / 2; ripple.position.y = -HV / 2 + 0.105; ripple.material.opacity = 0.025; if (view === "pmt") scene.add(ripple);
    }
    // the flash: a small emissive sphere, a cool point light and an expanding additive halo, in the liquid
    if (flashAt != null) {
      flash = new T.Group();
      const core = new T.Mesh(new T.SphereGeometry(0.004, 16, 16), new T.MeshBasicMaterial({ color: 0xeaffff })); flash.add(core);
      const halo = new T.Sprite(new T.SpriteMaterial({ map: makeSprite(T, 256, "rgba(220,255,255,1)", "rgba(120,220,240,0)", 1.0), color: 0xcfffff, blending: T.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false })); halo.scale.set(0.01, 0.01, 1); flash.add(halo);
      const light = new T.PointLight(0xd8fbff, 0, 4, 2); flash.add(light);
      flash.userData = { core, halo, light };
      scene.add(flash);
    }
  } else {
    // exterior: the closed vessel with an outer jacket and domed top on a dark frame, cables, a rock wall behind
    jacketGroup = new T.Group();
    const jacketMat = new T.MeshStandardMaterial({ color: 0xb9c2cc, metalness: 0.55, roughness: 0.5, envMapIntensity: 0.8 });
    const jacket = new T.Mesh(new T.CylinderGeometry(1.3, 1.3, HV + 0.6, 96), jacketMat); jacketGroup.add(jacket);
    const dome = new T.Mesh(new T.SphereGeometry(1.3, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2), jacketMat); dome.position.y = (HV + 0.6) / 2; jacketGroup.add(dome);
    for (const y of [-1.1, -0.2, 0.7, 1.5]) { const band = new T.Mesh(new T.TorusGeometry(1.31, 0.035, 8, 96), new T.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.9, roughness: 0.3 })); band.rotation.x = Math.PI / 2; band.position.y = y; jacketGroup.add(band); }
    const flange = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.25, 48), new T.MeshStandardMaterial({ color: 0x8f98a2, metalness: 0.9, roughness: 0.35 })); flange.position.y = (HV + 0.6) / 2 + 1.25; jacketGroup.add(flange);
    // cables leaving the top toward the upper right
    const cableMat = new T.MeshStandardMaterial({ color: 0x3c424c, roughness: 0.7 });
    for (let k = 0; k < 5; k++) { const a = -0.3 + k * 0.28; const pts = [new T.Vector3(Math.cos(a) * 0.35, 2.85, Math.sin(a) * 0.35), new T.Vector3(0.6 + k * 0.12, 3.5 + k * 0.05, -0.3 + k * 0.1), new T.Vector3(2.2 + k * 0.2, 4.6 + k * 0.1, -0.6 + k * 0.15), new T.Vector3(4.5, 6.0 + k * 0.2, -1.2)];
      jacketGroup.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, 0.028 + k * 0.004, 8, false), cableMat)); }
    // frame: a dark steel stand under the vessel
    const frameMat = new T.MeshStandardMaterial({ color: 0x1a1f28, metalness: 0.6, roughness: 0.6 });
    for (const [x, z] of [[-1.15, -1.15], [1.15, -1.15], [-1.15, 1.15], [1.15, 1.15]]) { const leg = new T.Mesh(new T.BoxGeometry(0.16, 1.6, 0.16), frameMat); leg.position.set(x, -(HV + 0.6) / 2 - 0.8, z); jacketGroup.add(leg); }
    const base = new T.Mesh(new T.BoxGeometry(2.9, 0.18, 2.9), frameMat); base.position.y = -(HV + 0.6) / 2 - 0.09; jacketGroup.add(base);
    scene.add(jacketGroup);
    if (!subjectOnly) {
      const floor = new T.Mesh(new T.PlaneGeometry(40, 40), new T.MeshStandardMaterial({ color: 0x0a1224, roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -(HV + 0.6) / 2 - 1.6; scene.add(floor);
      // rock wall: a displaced plane behind, dark, lit only by the lamp's spill
      const rock = new T.PlaneGeometry(30, 22, 160, 120); const p = rock.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, (C.fbm(x * 0.25 + 3, y * 0.25, 1.1, 5) - 0.5) * 2.4 + (C.fbm(x * 1.2, y * 1.2, 5.5, 3) - 0.5) * 0.5); }
      rock.computeVertexNormals();
      const wall = new T.Mesh(rock, new T.MeshStandardMaterial({ color: 0x2c3548, roughness: 0.95 })); wall.position.set(0, 3, -4.2); scene.add(wall);
    }
  }

  // Lights: one amber lamp upper left; a cyan hemisphere fill from below.
  lamp = new T.PointLight(0xffb45a, view === "exterior" ? 220 : view === "interior" ? 3 : 14, 0, 2);
  lamp.position.set(view === "exterior" ? -5 : -1.5, view === "exterior" ? 7 : view === "interior" ? 0.3 : HV / 2 + 0.9, view === "exterior" ? 5 : 0.9);
  scene.add(lamp);
  scene.add(new T.HemisphereLight(view === "exterior" ? 0x2a3a55 : 0x0a1a22, view === "exterior" ? 0x0a1224 : 0x4fe3f0, view === "exterior" ? 0.35 : view === "interior" ? 0.9 : 0.3));
  if (view === "interior") { const sky = new T.HemisphereLight(0x5a8a9a, 0x000000, 0.5); scene.add(sky); }
  if (view === "exterior") { const cool = new T.DirectionalLight(0x6fb8d8, 0.6); cool.position.set(6, 3, 4); scene.add(cool); }
  if (view === "interior") { const down = new T.PointLight(0xa8dcea, 4.5, 0, 2); down.position.set(0.1, HV / 2 - 0.2, -0.1); scene.add(down); } // the cool light down the column: the honeycomb reads grey-blue
  if (view === "pmt" || view === "hero") { const fillL = new T.PointLight(0x4fe3f0, 2.6, 3, 2); fillL.position.set(0.4, -HV / 2 + 0.7, -0.3); scene.add(fillL); }
}

export function draw(t) {
  const dolly = 1 - 0.02 * smooth(0, 3, t);
  if (liquidTop) { const p = liquidTop.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = topPos[i * 3], z = topPos[i * 3 + 2]; p.setY(i, (C.fbm(x * 1.5 + t * 0.15, z * 1.5 - t * 0.1, 2.2, 1) - 0.5) * 0.005 * 2); } p.needsUpdate = true; liquidTop.geometry.computeVertexNormals(); }
  if (ripple) { ripple.material.map.offset.set(t * 0.01, -t * 0.007); }
  if (flash) {
    const dt = t - flashAt, u = flash.userData;
    if (dt < 0 || dt > 1.6) { u.light.intensity = 0; u.halo.material.opacity = 0; u.core.visible = false; flash.visible = false; }
    else {
      flash.visible = true; u.core.visible = dt < 0.9;
      const rise = clamp(dt / 0.12, 0, 1), decay = 1 - smooth(0.12, 0.92, dt); const k = rise * (dt < 0.12 ? 1 : decay);
      u.light.intensity = 1.1 * k; u.core.material.color.setScalar(0.4 + 0.6 * k);
      const e = clamp(dt / 0.6, 0, 1), eo = 1 - Math.pow(1 - e, 3); const hs = 0.02 + eo * (view === "pmt" ? 0.16 : 0.3); u.halo.scale.set(hs, hs, 1); u.halo.material.opacity = 0.85 * (1 - e) * (1 - e);
    }
  }
  const asp = W / H; let blur = null, fade = [0.62, 1.0, 0.9];
  if (view === "interior") {
    setLens(cam, 24, asp);
    cam.up.set(0, 0, -1); cam.position.set(0.0, HV / 2 - 0.5 - 0.05 * (1 - dolly) * 50, 0.28); cam.lookAt(0, -HV / 2, 0.28); cam.rotateX(-0.13); // just below the liquid surface, looking down the column, pitched so the honeycomb sits at 0.40 of frame height and the near wall fills the lower third
    if (flash) { cam.updateMatrixWorld(); flash.position.copy(new T.Vector3(0.24, 0.10, 0.5).unproject(cam).sub(cam.position).normalize().multiplyScalar(1.5).add(cam.position)); }
  } else if (view === "pmt") {
    setLens(cam, 70, asp);
    const y = -HV / 2 + 0.06 + 0.3;
    cam.position.set(-0.05, y + 0.02, 0.62 * dolly); cam.lookAt(0.1, y - 0.28, -0.4); cam.rotateX(-0.22);
    blur = { focus: 0.55, range: 0.35, max: 20 };
    if (flash) { cam.updateMatrixWorld(); flash.position.copy(new T.Vector3(0.24, 0.10, 0.5).unproject(cam).sub(cam.position).normalize().multiplyScalar(0.36).add(cam.position)); }
    fade = [0.6, 1.0, 0.92];
  } else if (view === "hero") {
    setLens(cam, 50, asp);
    cam.position.set(0.5, -HV / 2 + 2.6, 1.6); cam.lookAt(0, -HV / 2 + 0.06, 0); fade = [1, 1, 0]; // the whole honeycomb as one object
    if (flash) flash.position.set(0.24, -HV / 2 + 0.3, -0.05);
  } else { // exterior
    setLens(cam, 35, asp);
    cam.position.set(2.4 * dolly, 0.6, 5.6 * dolly); cam.lookAt(0.15, 0.9, 0); cam.rotateX(0.0);
    fade = [0.6, 1.0, 0.95];
  }
  post.render(scene, cam, { fade, blur, clear: 0x04060c });
}
