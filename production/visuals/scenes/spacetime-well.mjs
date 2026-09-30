// spacetime-well (three.js): the Sun resting in a smooth gravity well drawn as a cyan grid, for the Reel
// "The Sun does not pull the planets, it warps space-time". A limb-darkened orange-white Sun (fbm granulation baked
// to an equirect canvas, a shimmering granule flicker, an additive glow) sits at the bottom of a Flamm-paraboloid
// depression y = -k / sqrt(r^2 + a^2) cut into a 60 x 60 grid (a 240 x 240 plane displaced in the vertex shader; the
// lines are drawn analytically in the fragment shader with fwidth anti-aliasing, so they stay clean at 1080 px and
// fade to a haze instead of moire where cells fall under two pixels). The grid is brighter near the well and carries
// a faint outward pulse. One small blue-grey planet with a cyan Fresnel rim rides the curved surface on a circular
// orbit (its height is the well height at its radius) with a fading cyan trail. NASA Tycho star map dimmed behind.
// The Sun's own light is the only warm thing in the frame; the grid, trail and ray are cyan.
// Options (--var): view=wide (default) | flat | tilt | hero; wellDepth=1 (scale of the depression; flat forces 0);
// speed=1 (orbit speed multiplier: 1 is one orbit per 10 s; keep it an integer so a 10 s loop stays seamless);
// t0 is read from the harness (--t0); ray=1 draws a thin cyan photon path skimming the Sun and bent by the well,
// with a pulse travelling along it twice per 10 s. layer=subject (from --alpha): the Sun plus the inner well on
// transparent, for the pop-out layers. Loop: everything time-dependent has a period of 10 s or a divisor of it.
import { clamp, lerp, smooth } from "./_lib.mjs";
import { makeSprite, Post, rimPatch, setLens } from "./_three.mjs";

export const kind = "three";

let T, R, W, H, C, scene, cam, view, subjectOnly, post, sun, sunGlow, sunGlow2, sunMat, grid, gridMat, planet, planetGroup, trail, rayTube, rayMat, rayPulse, rayCurve, sky;
let wellDepth = 1, speed = 1, rayOn = false;
const PERIOD = 10; // seconds per orbit; the loop length must be a multiple of this
const ORBIT = 2.6, PLANET_R = 0.11, SUN_R = 0.5;
const K = 0.9, A = 0.7; // well: y = -K*wellDepth / sqrt(r^2 + A^2); depth 1.29 at the centre for wellDepth 1, 0.42 at the planet's orbit
const well = (r) => -K * wellDepth / Math.sqrt(r * r + A * A);
const CYAN = [0.078, 0.76, 0.87]; // #4fe3f0 in linear

export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; C = ctx;
  view = ctx.opts.view || "wide"; subjectOnly = ctx.opts.layer === "subject";
  wellDepth = ctx.opts.wellDepth != null ? +ctx.opts.wellDepth : 1; if (view === "flat") wellDepth = 0;
  speed = ctx.opts.speed != null ? +ctx.opts.speed : 1; rayOn = ctx.opts.ray === "1" || ctx.opts.ray === "true";
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.NoToneMapping;
  post = new Post(T, R, W, H, { alpha: subjectOnly, exposure: 1.0 });
  scene = new T.Scene();
  cam = new T.PerspectiveCamera(40, W / H, 0.05, 4000);
  const rng = ctx.rng;

  // Sky: the Tycho map on a far sphere, dimmed hard so the grid stays the subject, plus crisp pinpoint stars.
  if (!subjectOnly && ctx.hasTexture("starmap-tycho-nasa")) {
    const tex = await ctx.loadTexture("starmap-tycho-nasa"); tex.colorSpace = T.SRGBColorSpace;
    { const c = document.createElement("canvas"); c.width = tex.image.width; c.height = tex.image.height; const g2 = c.getContext("2d"); g2.filter = "blur(1.2px)"; g2.drawImage(tex.image, 0, 0); tex.image = c; tex.needsUpdate = true; }
    sky = new T.Mesh(new T.SphereGeometry(1800, 48, 32), new T.MeshBasicMaterial({ map: tex, side: T.BackSide, color: new T.Color(0.22, 0.24, 0.32) })); sky.rotation.z = 0.4; sky.rotation.y = 2.1; scene.add(sky);
    const n = 700, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const th = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1), r = 1500; pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3); const b = 0.25 + rng() * 0.55; col.set([b * 0.88, b * 0.93, b], i * 3); }
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3));
    scene.add(new T.Points(geo, new T.PointsMaterial({ size: 2.4, map: makeSprite(T, 32, "rgba(255,255,255,1)", "rgba(255,255,255,0)", 1.2), vertexColors: true, sizeAttenuation: false, transparent: true, opacity: 0.7, depthWrite: false, blending: T.AdditiveBlending })));
  }

  // The Sun: granulation baked into an equirect canvas (two fbm scales), a limb-darkening shader with a periodic
  // granule flicker (three cycles per 10 s, phase from a second noise channel), two additive glow sprites.
  const SUN_Y = well(0) + SUN_R; // rests on the bottom of the well; in flat it sits on the plane
  { const S = 1024, c = document.createElement("canvas"); c.width = S; c.height = S / 2; const g = c.getContext("2d"), id = g.createImageData(S, S / 2);
    for (let y = 0, i = 0; y < S / 2; y++) for (let x = 0; x < S; x++, i += 4) { const u = x / S * Math.PI * 2, v = y / (S / 2) * Math.PI; const px = Math.sin(v) * Math.cos(u), py = Math.cos(v), pz = Math.sin(v) * Math.sin(u);
      const m = 1 + 0.10 * (2 * C.fbm(px * 5 + 7, py * 5, pz * 5, 2) - 1) + 0.08 * (2 * C.fbm(px * 16, py * 16 + 3, pz * 16, 3) - 1);
      const ph = C.fbm(px * 9 + 31, py * 9, pz * 9 + 11, 2);
      id.data[i] = 255 * clamp(m * 0.5, 0, 1); id.data[i + 1] = 255 * clamp(ph, 0, 1); id.data[i + 2] = 0; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0); const mot = new T.CanvasTexture(c);
    sunMat = new T.ShaderMaterial({
      uniforms: { mot: { value: mot }, core: { value: new T.Color(1.0, 0.93, 0.78) }, limb: { value: new T.Color(1.0, 0.42, 0.10) }, t: { value: 0 } },
      vertexShader: `varying vec3 vN; varying vec3 vP; varying vec2 vUv; void main(){ vN = normalize(normalMatrix * normal); vP = (modelViewMatrix * vec4(position,1.0)).xyz; vUv = uv; gl_Position = projectionMatrix * vec4(vP,1.0); }`,
      fragmentShader: `uniform sampler2D mot; uniform vec3 core, limb; uniform float t; varying vec3 vN; varying vec3 vP; varying vec2 vUv;
        void main(){ float ndv = max(dot(normalize(vN), normalize(-vP)), 0.0); vec2 s = texture2D(mot, vUv).rg; float m = s.r * 2.0;
          m *= 1.0 + 0.07 * sin(6.2831853 * (3.0 * t / ${PERIOD}.0 + s.g)); // granule shimmer, periodic in 10 s
          float ld = pow(ndv, 1.1); vec3 col = mix(limb * 0.5, core, ld) * m * (0.55 + 0.95 * ld); gl_FragColor = vec4(col, 1.0); }`
    });
    sun = new T.Mesh(new T.SphereGeometry(SUN_R, 96, 64), sunMat); sun.position.y = SUN_Y; scene.add(sun);
    const glowTex = makeSprite(T, 256, "rgba(255,200,130,1)", "rgba(255,120,50,0)", 1.0);
    sunGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffa050, blending: T.AdditiveBlending, transparent: true, opacity: 0.45, depthWrite: false, depthTest: false })); sunGlow.scale.set(1.9, 1.9, 1); sunGlow.renderOrder = 6; sunGlow.position.y = SUN_Y; scene.add(sunGlow);
    sunGlow2 = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xff8030, blending: T.AdditiveBlending, transparent: true, opacity: 0.06, depthWrite: false, depthTest: false })); sunGlow2.scale.set(3.4, 3.4, 1); sunGlow2.renderOrder = 6; sunGlow2.position.y = SUN_Y; scene.add(sunGlow2);
    const sunLight = new T.PointLight(0xffb070, 22.0, 0, 2); sunLight.position.y = SUN_Y; scene.add(sunLight);
  }
  scene.add(new T.HemisphereLight(0x3a5a80, 0x06090f, subjectOnly ? 0.3 : 0.25));
  { const fill = new T.DirectionalLight(0x7fb0d8, 1.0); fill.position.set(3, 4, 5); scene.add(fill); }

  // The grid: a plane (or, for the subject layer, a disc) displaced by the well in the vertex shader; lines drawn
  // in the fragment shader. Cells are 1/6 unit: 60 x 60 over +/-5. Mesh resolution 240 x 240 (115k triangles).
  { const geo = subjectOnly ? new T.CircleGeometry(2.3, 160, 40) : new T.PlaneGeometry(10, 10, 240, 240);
    gridMat = new T.ShaderMaterial({
      uniforms: { k: { value: K * wellDepth }, a2: { value: A * A }, t: { value: 0 }, cyan: { value: new T.Vector3(...CYAN) }, fill: { value: new T.Vector3(0.004, 0.007, 0.016) }, rEdge0: { value: subjectOnly ? 1.2 : 3.9 }, rEdge1: { value: subjectOnly ? 2.3 : 5.0 }, keepAlpha: { value: subjectOnly ? 1 : 0 }, near: { value: 1.0 } },
      vertexShader: `uniform float k, a2; varying vec2 vXY; varying float vR; varying vec3 vWorld;
        void main(){ vXY = position.xy; float r = length(position.xy); vR = r; float h = -k / sqrt(r * r + a2);
          vec4 wp = modelMatrix * vec4(position.xy, h, 1.0); vWorld = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
      fragmentShader: `uniform float t, rEdge0, rEdge1, keepAlpha, near; uniform vec3 cyan, fill; varying vec2 vXY; varying float vR; varying vec3 vWorld;
        void main(){
          vec2 c = vXY * 6.0; // cell coordinates
          vec2 fw = fwidth(c);
          vec2 g = abs(fract(c - 0.5) - 0.5) / (fw * 1.2); // 1.2 px half-width
          float line = 1.0 - clamp(min(g.x, g.y), 0.0, 1.0);
          float dens = max(fw.x, fw.y); // cells per pixel; over ~0.5 the lines are too dense to resolve, so fade to a haze
          line *= 1.0 - smoothstep(0.3, 0.6, dens);
          float nearWell = 0.16 + 1.1 * exp(-vR * vR / 3.2) + 0.5 * exp(-vR / 1.8);
          float pulse = 1.0 + 0.10 * sin(6.2831853 * (vR / 3.0 - t / ${PERIOD}.0)) * exp(-vR / 3.0); // outward ripple, one cycle per 10 s
          float edge = 1.0 - smoothstep(rEdge0, rEdge1, vR);
          float dist = length(vWorld - cameraPosition); float depthFade = clamp(1.6 - dist * 0.055, 0.35, 1.0);
          float I = line * nearWell * pulse * edge * depthFade * near;
          vec3 col = fill * edge + cyan * I;
          float alpha = keepAlpha > 0.5 ? clamp(I * 1.2, 0.0, 1.0) : 1.0;
          gl_FragColor = vec4(col, alpha);
        }`,
      transparent: subjectOnly, depthWrite: !subjectOnly, side: T.DoubleSide, blending: subjectOnly ? T.AdditiveBlending : T.NormalBlending
    });
    grid = new T.Mesh(geo, gridMat); grid.rotation.x = -Math.PI / 2; grid.renderOrder = 1; scene.add(grid);
    if (subjectOnly) { const dm = gridMat.clone(); dm.colorWrite = false; dm.transparent = false; dm.depthWrite = true; dm.blending = T.NoBlending; const gd = new T.Mesh(geo, dm); gd.rotation.x = -Math.PI / 2; gd.renderOrder = 0; scene.add(gd); } } // depth-only pass so the Sun's lower half is hidden inside the well on the subject layer

  // The planet and its trail, in a group that turns about the Sun's axis. The trail is a ribbon on the surface at
  // the orbit radius (the height there is constant), fading from the planet backwards over 55 degrees of arc.
  planetGroup = new T.Group(); scene.add(planetGroup);
  if (!subjectOnly) {
    const PY = well(ORBIT) + PLANET_R * 0.75;
    { const S = 512, c = document.createElement("canvas"); c.width = S; c.height = S / 2; const g = c.getContext("2d"), id = g.createImageData(S, S / 2);
      for (let y = 0, i = 0; y < S / 2; y++) for (let x = 0; x < S; x++, i += 4) { const u = x / S * Math.PI * 2, v = y / (S / 2) * Math.PI; const px = Math.sin(v) * Math.cos(u), py = Math.cos(v), pz = Math.sin(v) * Math.sin(u);
        const b = 0.76 + 0.16 * (2 * C.fbm(px * 3 + 5, py * 8, pz * 3, 3) - 1); id.data[i] = 255 * b * 0.88; id.data[i + 1] = 255 * b * 0.98; id.data[i + 2] = 255 * b * 1.08; id.data[i + 3] = 255; }
      g.putImageData(id, 0, 0); const map = new T.CanvasTexture(c); map.colorSpace = T.SRGBColorSpace;
      const pm = new T.MeshPhysicalMaterial({ map, color: 0x9fb2c8, roughness: 0.8, metalness: 0, clearcoat: 0.1 }); rimPatch(pm, new T.Color(0x4fe3f0), 0.6, 2.5);
      planet = new T.Mesh(new T.SphereGeometry(PLANET_R, 64, 48), pm); planet.position.set(ORBIT, PY, 0); planetGroup.add(planet); }
    { const seg = 48, arc = 55 * Math.PI / 180, wdt = 0.05, pos = new Float32Array((seg + 1) * 2 * 3), alp = new Float32Array((seg + 1) * 2), idx = [];
      const slope = -(K * wellDepth * ORBIT) / Math.pow(ORBIT * ORBIT + A * A, 1.5); // dy/dr at the orbit, so the ribbon lies on the bowl
      for (let i = 0; i <= seg; i++) { const q = i / seg, th = -arc * (1 - q); const cx = Math.cos(th), sz = Math.sin(th);
        for (let s = 0; s < 2; s++) { const dr = (s ? 1 : -1) * wdt / 2, r = ORBIT + dr; pos.set([r * cx, well(ORBIT) + 0.006 + slope * dr, -r * sz], (i * 2 + s) * 3); alp[i * 2 + s] = Math.pow(q, 1.6) * 0.9; }
        if (i < seg) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); }
      const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("alp", new T.BufferAttribute(alp, 1)); geo.setIndex(idx);
      trail = new T.Mesh(geo, new T.ShaderMaterial({ uniforms: { cyan: { value: new T.Vector3(...CYAN) } }, vertexShader: `attribute float alp; varying float vA; void main(){ vA = alp; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`, fragmentShader: `uniform vec3 cyan; varying float vA; void main(){ gl_FragColor = vec4(cyan * vA * 1.8, 1.0); }`, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }));
      trail.renderOrder = 2; planetGroup.add(trail); }
  }

  // The light ray: a photon path integrated once through an inverse-square bend (impact parameter 0.85, about 30
  // degrees of deflection, closest approach 0.69), lying on the surface. Tube plus a pulse travelling along it.
  if (rayOn) {
    const pts = []; let x = -7, z = 0.85, vx = 1, vz = 0; const G = 0.16 * (wellDepth > 0 ? 1 : 0), dt = 0.005;
    for (let i = 0; i < 14 / dt; i++) { const r = Math.hypot(x, z); const acc = -G / (r * r * r); vx += acc * x * dt; vz += acc * z * dt; const v = Math.hypot(vx, vz); vx /= v; vz /= v; x += vx * dt; z += vz * dt; if (i % 8 === 0 && Math.max(Math.abs(x), Math.abs(z)) < 5.2) pts.push(new T.Vector3(x, well(r) + 0.02, z)); }
    rayCurve = new T.CatmullRomCurve3(pts);
    rayMat = new T.ShaderMaterial({ uniforms: { head: { value: 0 }, cyan: { value: new T.Vector3(...CYAN) } }, vertexShader: `varying float vU; void main(){ vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float head; uniform vec3 cyan; varying float vU; void main(){ float d = head - vU; float tail = d > 0.0 ? exp(-d * 14.0) : 0.0; float I = 0.35 + 2.2 * tail; float ends = smoothstep(0.0, 0.06, vU) * smoothstep(1.0, 0.94, vU); gl_FragColor = vec4(mix(cyan, vec3(0.7, 0.95, 1.0), tail * 0.6) * I * ends, 1.0); }`, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    rayTube = new T.Mesh(new T.TubeGeometry(rayCurve, 400, 0.011, 8, false), rayMat); rayTube.renderOrder = 3; scene.add(rayTube);
    rayPulse = new T.Sprite(new T.SpriteMaterial({ map: makeSprite(T, 128, "rgba(200,245,255,1)", "rgba(79,227,240,0)", 1.0), color: 0x9ff3fa, blending: T.AdditiveBlending, transparent: true, opacity: 0.9, depthWrite: false, depthTest: false })); rayPulse.scale.set(0.16, 0.16, 1); rayPulse.renderOrder = 4; scene.add(rayPulse);
  }
}

export function draw(t) {
  const th = 0.9 + speed * t * 2 * Math.PI / PERIOD; // one orbit per 10 s (times speed), anticlockwise seen from above
  planetGroup.rotation.y = th;
  if (planet) planet.rotation.y = t * 2 * Math.PI * 3 / PERIOD;
  sunMat.uniforms.t.value = t; gridMat.uniforms.t.value = t;
  const breathe = 1 + 0.05 * Math.sin(t * 2 * Math.PI * 2 / PERIOD); sunGlow.material.opacity = 0.45 * breathe; sunGlow2.material.opacity = 0.06 * breathe;
  if (rayOn) { const u = (t / (PERIOD / 2)) % 1; rayMat.uniforms.head.value = u; rayPulse.position.copy(rayCurve.getPointAt(u)); }
  const asp = W / H; let fade = [0.62, 1.0, 0.9];
  const sway = 0.012 * Math.sin(t * 2 * Math.PI / PERIOD); // a slow periodic camera sway
  const SUN_Y = well(0) + SUN_R;
  if (view === "hero") {
    setLens(cam, 50, asp); const el = 30 * Math.PI / 180, d = 8.0, a = 0.55 + sway;
    cam.position.set(Math.sin(a) * d * Math.cos(el), SUN_Y + Math.sin(el) * d, Math.cos(a) * d * Math.cos(el)); cam.lookAt(0, SUN_Y - 0.25, 0); fade = [1, 1, 0];
  } else if (view === "tilt") { // near the plane: the depression in profile, the Sun's top half above the rim
    setLens(cam, 40, asp); const el = 7 * Math.PI / 180, d = 8.5, a = 0.5 + sway;
    cam.position.set(Math.sin(a) * d * Math.cos(el), -0.05 + Math.sin(el) * d, Math.cos(a) * d * Math.cos(el)); cam.lookAt(0, -0.95, 0);
  } else { // wide, flat: three-quarter view from 30 degrees above the plane; the Sun in the upper-middle of the frame
    setLens(cam, 35, asp); const el = 30 * Math.PI / 180, d = 9.0, a = 0.55 + sway;
    cam.position.set(Math.sin(a) * d * Math.cos(el), Math.sin(el) * d, Math.cos(a) * d * Math.cos(el)); cam.lookAt(0, -1.35, 0);
  }
  post.render(scene, cam, { fade, blur: null, clear: 0x03050c });
}
