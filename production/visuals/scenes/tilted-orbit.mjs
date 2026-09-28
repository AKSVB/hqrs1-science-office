// tilted-orbit (three.js): a red dwarf (an emissive deep-orange sphere with an fbm mottle, a faint equatorial
// band and two faint equatorial flares that hint at its spin, plus an additive glow) and a hazy blue-grey
// sub-Neptune on a thin cyan orbit ring tilted steeply to the star's equator, so the ring crosses the equatorial
// band at that angle and the planet on the near side moves against the spin. The star's own orange light is the
// only light besides a faint hemisphere; the planet's cool Fresnel rim is the accent. NASA Tycho star map behind,
// dimmed (storyboards PB-01/03/04 for reel-planet-backwards). Not to scale; nothing is labelled.
// Options (--var): view=wide (default) | planet | equator | hero; tilt=136 (degrees between the orbit and the
// star's equator). layer=subject (from --alpha): the planet with its rim and, in wide, the ring; never the star.
import { clamp, lerp, smooth } from "./_lib.mjs";
import { makeSprite, Post, rimPatch, setLens } from "./_three.mjs";

export const kind = "three";

let T, R, W, H, C, scene, cam, view, tilt, subjectOnly, post, star, starGlow, flares = [], planet, ringGroup, trail, sky;
const ORBIT = 1.6, PERIOD = 9;

export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; C = ctx;
  view = ctx.opts.view || "wide"; tilt = ctx.opts.tilt != null ? +ctx.opts.tilt : 136; subjectOnly = ctx.opts.layer === "subject";
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.NoToneMapping;
  post = new Post(T, R, W, H, { alpha: subjectOnly, exposure: 1.0 });
  scene = new T.Scene();
  cam = new T.PerspectiveCamera(40, W / H, 0.02, 4000);
  const rng = ctx.rng;

  // Sky: the Tycho map on a far sphere, dimmed to 35 percent, plus crisp pinpoint stars.
  if (!subjectOnly && ctx.hasTexture("starmap-tycho-nasa")) {
    const tex = await ctx.loadTexture("starmap-tycho-nasa"); tex.colorSpace = T.SRGBColorSpace;
    { const c = document.createElement("canvas"); c.width = tex.image.width; c.height = tex.image.height; const g2 = c.getContext("2d"); g2.filter = "blur(1.2px)"; g2.drawImage(tex.image, 0, 0); tex.image = c; tex.needsUpdate = true; }
    sky = new T.Mesh(new T.SphereGeometry(1800, 48, 32), new T.MeshBasicMaterial({ map: tex, side: T.BackSide, color: new T.Color(0.35, 0.37, 0.45) })); sky.rotation.z = 0.5; sky.rotation.y = 1.2; scene.add(sky);
    const n = 900, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const th = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1), r = 1500; pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3); const b = 0.3 + rng() * 0.6; col.set([b * 0.9, b * 0.93, b], i * 3); }
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3));
    scene.add(new T.Points(geo, new T.PointsMaterial({ size: 2.6, map: makeSprite(T, 32, "rgba(255,255,255,1)", "rgba(255,255,255,0)", 1.2), vertexColors: true, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending })));
  }

  // The star: mottle and band baked into an equirect canvas, a limb-darkening shader, glow sprite, two flares.
  if (!subjectOnly) {
    const S = 1024, c = document.createElement("canvas"); c.width = S; c.height = S / 2; const g = c.getContext("2d"), id = g.createImageData(S, S / 2);
    for (let y = 0, i = 0; y < S / 2; y++) for (let x = 0; x < S; x++, i += 4) { const u = x / S * Math.PI * 2, v = y / (S / 2) * Math.PI; const px = Math.sin(v) * Math.cos(u), py = Math.cos(v), pz = Math.sin(v) * Math.sin(u);
      const m = 1 + 0.16 * (2 * C.fbm(px * 4 + 3, py * 4, pz * 4, 2) - 1) + 0.06 * (2 * C.fbm(px * 12, py * 12, pz * 12, 2) - 1) + 0.05 * Math.exp(-Math.pow(py / 0.08, 2)); id.data[i] = 255 * clamp(m * 0.5, 0, 1); id.data[i + 1] = id.data[i]; id.data[i + 2] = id.data[i]; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0); const mot = new T.CanvasTexture(c);
    star = new T.Mesh(new T.SphereGeometry(0.5, 96, 64), new T.ShaderMaterial({
      uniforms: { mot: { value: mot }, core: { value: new T.Color(0xff6a2a) }, limb: { value: new T.Color(0xb8301a) } },
      vertexShader: `varying vec3 vN; varying vec3 vP; varying vec2 vUv; void main(){ vN = normalize(normalMatrix * normal); vP = (modelViewMatrix * vec4(position,1.0)).xyz; vUv = uv; gl_Position = projectionMatrix * vec4(vP,1.0); }`,
      fragmentShader: `uniform sampler2D mot; uniform vec3 core, limb; varying vec3 vN; varying vec3 vP; varying vec2 vUv; void main(){ float ndv = max(dot(normalize(vN), normalize(-vP)), 0.0); float m = texture2D(mot, vUv).r * 2.0; vec3 col = mix(limb * 0.7, core, pow(ndv, 0.55)) * m * 1.5; gl_FragColor = vec4(col, 1.0); }`
    }));
    scene.add(star);
    starGlow = new T.Sprite(new T.SpriteMaterial({ map: makeSprite(T, 256, "rgba(255,150,80,1)", "rgba(255,90,40,0)", 1.0), color: 0xff8a40, blending: T.AdditiveBlending, transparent: true, opacity: 0.5, depthWrite: false })); starGlow.scale.set(2.6, 2.6, 1); scene.add(starGlow);
    const flareTex = makeSprite(T, 128, "rgba(255,190,120,1)", "rgba(255,120,60,0)", 0.6);
    for (const sx of [-1, 1]) { const f = new T.Sprite(new T.SpriteMaterial({ map: flareTex, color: 0xffa060, blending: T.AdditiveBlending, transparent: true, opacity: 0.35, depthWrite: false })); f.scale.set(0.55, 0.16, 1); f.position.set(sx * 0.66, 0.02, 0); scene.add(f); flares.push(f); }
    scene.add(new T.PointLight(0xff9a55, 14.0, 0, 2));
  } else { scene.add(new T.PointLight(0xff9a55, 14.0, 0, 2)); } // the star's light still lights the planet in the subject layer
  scene.add(new T.HemisphereLight(0x4a6a90, 0x0a1224, subjectOnly ? 0.35 : 0.03));
  { const fill = new T.DirectionalLight(0x8fb8d8, 0.35); fill.position.set(2, 3, 4); scene.add(fill); } // a faint cool fill so the planet's night side reads blue-grey, not black

  // The orbit ring and the planet, in a group rotated by the tilt about the axis in the star's equatorial plane toward camera-left.
  ringGroup = new T.Group(); ringGroup.rotation.order = "YXZ"; ringGroup.rotation.y = 0.85; ringGroup.rotation.x = Math.PI / 2 + tilt * Math.PI / 180; scene.add(ringGroup); // the tilt is about an axis in the equatorial plane; the yaw only turns that axis toward the camera-left
  if (!subjectOnly || view === "wide") {
    const ring = new T.Mesh(new T.TorusGeometry(ORBIT, 0.006, 8, 256), new T.MeshBasicMaterial({ color: 0x4fe3f0, transparent: true, opacity: 0.45, blending: T.AdditiveBlending, depthWrite: false })); ringGroup.add(ring);
    trail = new T.Mesh(new T.TorusGeometry(ORBIT, 0.011, 8, 64, Math.PI / 6), new T.MeshBasicMaterial({ color: 0x9ff3fa, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false })); ringGroup.add(trail);
  }
  { const S = 512, c = document.createElement("canvas"); c.width = S; c.height = S / 2; const g = c.getContext("2d"), id = g.createImageData(S, S / 2);
    for (let y = 0, i = 0; y < S / 2; y++) for (let x = 0; x < S; x++, i += 4) { const u = x / S * Math.PI * 2, v = y / (S / 2) * Math.PI; const px = Math.sin(v) * Math.cos(u), py = Math.cos(v), pz = Math.sin(v) * Math.sin(u);
      const b = 0.78 + 0.14 * (2 * C.fbm(px * 3 + 1, py * 9, pz * 3, 3) - 1); id.data[i] = 255 * b * 0.9; id.data[i + 1] = 255 * b * 1.0; id.data[i + 2] = 255 * b * 1.08; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0); const map = new T.CanvasTexture(c); map.colorSpace = T.SRGBColorSpace;
    const pm = new T.MeshPhysicalMaterial({ map, color: 0x9fb2c4, roughness: 0.8, metalness: 0, clearcoat: 0.1 }); rimPatch(pm, new T.Color(0x4fe3f0), 0.25, 2.5);
    planet = new T.Mesh(new T.SphereGeometry(0.11, 64, 48), pm); ringGroup.add(planet); }
}

export function draw(t) {
  const dolly = 1 - 0.03 * smooth(0, 3, t);
  const th = 1.2 + t * 2 * Math.PI / PERIOD; // one revolution per 9 s, in the retrograde sense for tilt > 90
  planet.position.set(Math.cos(th) * ORBIT, Math.sin(th) * ORBIT, 0); planet.rotation.y = t * 0.3;
  if (trail) trail.rotation.z = th - Math.PI / 6;
  if (star) { star.rotation.y = t * 2 * Math.PI / 60; starGlow.material.opacity = 0.5 * (1 + 0.04 * Math.sin(t * 2 * Math.PI * 0.3)); }
  ringGroup.updateMatrixWorld();
  const pw = planet.getWorldPosition(new T.Vector3());
  const asp = W / H; let fade = [0.62, 1.0, 0.9];
  if (view === "planet") {
    setLens(cam, 85, asp);
    // 0.5 units from the planet, its limb across the upper half, the star behind it and to the left
    const toStar = pw.clone().negate().normalize(); const side = new T.Vector3().crossVectors(toStar, new T.Vector3(0, 1, 0)).normalize();
    cam.position.copy(pw).addScaledVector(toStar, -0.62 * dolly).addScaledVector(side, 0.42).add(new T.Vector3(0, 0.14, 0));
    const aim = pw.clone().addScaledVector(toStar, 0.45).addScaledVector(side, -0.12); aim.y -= 0.16; cam.lookAt(aim); cam.rotateZ(0.1);
    if (trail) { trail.visible = false; ringGroup.children[0].material.opacity = 0.25; }
  } else if (view === "equator") {
    setLens(cam, 35, asp);
    const a = 0.25, d = 3.5 * dolly, el = 3 * Math.PI / 180;
    cam.position.set(Math.sin(a) * d * Math.cos(el), Math.sin(el) * d, Math.cos(a) * d * Math.cos(el)); cam.lookAt(0.15, -0.45, 0); cam.rotateZ(0.02);
  } else if (view === "hero") {
    setLens(cam, 85, asp);
    const toStar = pw.clone().negate().normalize(); const side = new T.Vector3().crossVectors(toStar, new T.Vector3(0, 1, 0)).normalize();
    cam.position.copy(pw).addScaledVector(toStar, 0.6).addScaledVector(side, 0.5).add(new T.Vector3(0, 0.25, 0)); cam.lookAt(pw); fade = [1, 1, 0]; // from the day side, so the pop-out planet is lit
  } else { // wide: 12 degrees above the equator plane, 6 units out; the star at the upper left third, the ring across the upper middle
    setLens(cam, 35, asp);
    const a = 0.35, d = 6 * dolly, el = 12 * Math.PI / 180;
    cam.position.set(Math.sin(a) * d * Math.cos(el), Math.sin(el) * d, Math.cos(a) * d * Math.cos(el)); cam.lookAt(0.55, -0.75, 0); cam.rotateZ(0.0);
  }
  post.render(scene, cam, { fade, blur: null, clear: 0x03050c });
}
