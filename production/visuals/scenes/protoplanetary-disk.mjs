// protoplanetary-disk (three.js): a young star inside a dusty disk with a cleared gap, and a Jupiter-like planet
// in the gap (storyboard YP-02/YP-03/YP-04 for reel-youngest-planet). The disk is a particle system with
// noise-driven density and a gap at the planet's orbit; volumetric-looking dust from additive sprites; the NASA
// Jupiter map on the planet (public domain, production/assets/textures); NASA Tycho star map as the sky.
// Camera orbits slowly, slightly above the disk plane. One warm light: the planet's own heat glow (the storyboard's
// "dull red like cooling iron"); the star is the cool, distant light.
// Options (--var view=): "wide" (default, YP-03: disk and gap, planet a point of warm light), "planet" (YP-02/04: close on the planet in the gap).
import { clamp, lerp, smooth } from "./_lib.mjs";

export const kind = "three";

let T, R, scene, cam, W, H, star, starGlow, planet, planetGlow, dust, dustFar, view, rng, sky, streams, planetGroup, subjectOnly = false;
const ORBIT = 26; // planet orbit radius in scene units

const makeSprite = (T, size, inner, outer, softness = 1.0) => {
  const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d");
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(0.25 * softness, inner.replace(/[\d.]+\)$/, "0.55)")); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; return tex;
};

export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; rng = ctx.rng;
  view = ctx.opts.view || "wide"; // wide (YP-03) | planet (YP-02, YP-04)
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 0.9;
  scene = new T.Scene();
  cam = new T.PerspectiveCamera(view === "planet" ? 34 : 42, W / H, 0.1, 4000);

  // Sky: NASA Tycho star map on an inverted sphere, dimmed so the disk stays the subject.
  if (ctx.hasTexture("starmap-tycho-nasa")) {
    const tex = await ctx.loadTexture("starmap-tycho-nasa"); tex.colorSpace = T.SRGBColorSpace;
    // soften the map a little so single-texel stars do not magnify into squares
    { const c = document.createElement("canvas"); c.width = tex.image.width; c.height = tex.image.height; const g2 = c.getContext("2d"); g2.filter = "blur(1.2px)"; g2.drawImage(tex.image, 0, 0); tex.image = c; tex.needsUpdate = true; }
    sky = new T.Mesh(new T.SphereGeometry(1800, 48, 32), new T.MeshBasicMaterial({ map: tex, side: T.BackSide, color: new T.Color(0.4, 0.45, 0.6) }));
    sky.rotation.z = 0.35; scene.add(sky);
  }
  // Extra pinpoint stars so the field has crisp points at 1080p.
  { const n = 1600, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const th = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1), r = 1500; pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3); const b = 0.4 + rng() * 0.6, warm = rng(); col.set([b * (0.85 + 0.15 * warm), b * (0.9 - 0.05 * warm), b * (1.0 - 0.2 * warm)], i * 3); }
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3));
    const starTex = makeSprite(T, 32, "rgba(255,255,255,1)", "rgba(255,255,255,0)", 1.2);
    scene.add(new T.Points(geo, new T.PointsMaterial({ size: 3.0, map: starTex, vertexColors: true, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending }))); }

  // The star: a small emissive sphere with two sprite glows (bloom without postprocessing).
  star = new T.Mesh(new T.SphereGeometry(1.6, 32, 32), new T.MeshBasicMaterial({ color: 0xfff1d6 }));
  scene.add(star);
  const glowTex = makeSprite(T, 256, "rgba(255,236,200,1)", "rgba(255,200,120,0)");
  starGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd9a0, blending: T.AdditiveBlending, transparent: true, opacity: 0.85, depthWrite: false }));
  starGlow.scale.set(22, 22, 1); scene.add(starGlow);
  const starGlow2 = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffb060, blending: T.AdditiveBlending, transparent: true, opacity: 0.35, depthWrite: false }));
  starGlow2.scale.set(70, 70, 1); scene.add(starGlow2);
  scene.add(new T.PointLight(0xfff0dd, 3.0, 0, 0.0)); // star light on the planet (cool white)

  // The disk: particles in an annulus 8..90 with a flared scale height, a gap at the planet's orbit, spiral density
  // waves from seeded fbm, colour from warm ochre near the star to cool dust far out.
  const dustTex = makeSprite(T, 128, "rgba(255,225,190,0.9)", "rgba(255,200,150,0)", 1.4);
  const build = (n, sizeMul, opacity, far, dark = false) => {
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
    let i = 0, tries = 0;
    while (i < n && tries < n * 30) {
      tries++;
      const r = 8 + Math.pow(rng(), 0.7) * 82, a = rng() * Math.PI * 2;
      const gapD = Math.abs(r - ORBIT) / 5.5, gap = 1 - Math.exp(-gapD * gapD); // cleared lane around the orbit
      const spiral = 0.5 + 0.5 * Math.sin(a * 2 - r * 0.22 + 1.0);
      const dens = ctx.fbm(Math.cos(a) * r * 0.06 + 3, Math.sin(a) * r * 0.06, r * 0.02, 3) * 0.7 + spiral * 0.3;
      const p = gap * (0.35 + 0.65 * dens) * (1 - smooth(70, 90, r) * 0.7);
      if (rng() > p) continue;
      const hscale = 0.3 + (r / 90) * 3.2; // flared
      const y = (rng() + rng() + rng() - 1.5) * hscale * (far ? 2.5 : 1);
      pos.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
      const warm = smooth(60, 8, r);
      const b = (0.55 + 0.45 * dens) * (0.55 + 0.45 * warm) * (far ? 0.6 : 1);
      if (dark) col.set([0.16 + 0.10 * warm * dens, 0.10 + 0.05 * warm * dens, 0.07], i * 3); // opaque brown dust
      else col.set([b * (0.75 + 0.25 * warm), b * (0.55 + 0.25 * warm), b * (0.5 + 0.1 * (1 - warm) + 0.05)], i * 3);
      sz[i] = (1.2 + rng() * 2.4) * sizeMul * (0.8 + r / 90);
      i++;
    }
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos.slice(0, i * 3), 3)); geo.setAttribute("color", new T.BufferAttribute(col.slice(0, i * 3), 3));
    const mat = new T.PointsMaterial({ size: 1.0, map: dustTex, vertexColors: true, transparent: true, opacity, blending: dark ? T.NormalBlending : T.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    mat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace("uniform float size;", "attribute float psize; uniform float size;").replace("gl_PointSize = size;", "gl_PointSize = size * psize;"); };
    geo.setAttribute("psize", new T.BufferAttribute(sz.slice(0, i), 1));
    return new T.Points(geo, mat);
  };
  {
    const S = 1024, c = document.createElement("canvas"); c.width = c.height = S; const g2 = c.getContext("2d"), id = g2.createImageData(S, S), d = id.data;
    for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i += 4) {
      const px = (x - S / 2) / (S / 2) * 95, py = (y - S / 2) / (S / 2) * 95, r = Math.hypot(px, py), a = Math.atan2(py, px);
      if (r < 6 || r > 94) { d[i + 3] = 0; continue; }
      const gapD = Math.abs(r - ORBIT) / 5.0, gap = 1 - 0.92 * Math.exp(-gapD * gapD);
      const spiral = 0.5 + 0.5 * Math.sin(a * 2 - r * 0.22 + 1.0), spiral2 = 0.5 + 0.5 * Math.sin(a * 3 + r * 0.15);
      const n = ctx.fbm(px * 0.06 + 3, py * 0.06, r * 0.02, 4) * 0.6 + spiral * 0.25 + spiral2 * 0.15;
      const fine = ctx.fbm(px * 0.35, py * 0.35, 1.5, 3);
      const inner = smooth(6, 14, r), outer = 1 - smooth(60, 94, r);
      const dens = clamp((n - 0.2) * 1.4, 0, 1) * gap * inner * outer * (0.8 + 0.4 * fine);
      const warm = smooth(70, 10, r);
      const col = [0.62 + 0.3 * warm, 0.40 + 0.22 * warm, 0.24 + 0.08 * warm];
      const b = 0.35 + 0.65 * dens;
      d[i] = 255 * col[0] * b; d[i + 1] = 255 * col[1] * b; d[i + 2] = 255 * col[2] * b; d[i + 3] = 255 * clamp(dens * 1.6, 0, 1);
    }
    g2.putImageData(id, 0, 0);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
    const ring = new T.Mesh(new T.PlaneGeometry(190, 190), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, depthWrite: false, side: T.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.renderOrder = 0; scene.add(ring);
    const ringGlow = new T.Mesh(new T.PlaneGeometry(190, 190), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.35, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }));
    ringGlow.rotation.x = -Math.PI / 2; ringGlow.position.y = 0.4; ringGlow.renderOrder = 4; ringGlow.material.opacity = view === "planet" ? 0.15 : 0.35; scene.add(ringGlow);
  }
  const body = build(22000, 0.9, 0.3, false, true); body.renderOrder = 1; scene.add(body); // opaque brown dust gives the disk a body that occludes the star field
  dust = build(60000, 0.7, 0.16, false); dust.renderOrder = 2; scene.add(dust);           // fine glowing grains
  dustFar = build(12000, 3.0, view === "planet" ? 0.02 : 0.045, true); dustFar.renderOrder = 3; scene.add(dustFar);  // haze: bigger, fainter sprites give the volumetric look

  // The planet in the gap: NASA Jupiter map, tinted toward the deep red of a young, hot giant; a heat glow sprite;
  // thin accretion streams (sprites strung along arcs) falling in from the gap edges.
  planetGroup = new T.Group(); planetGroup.renderOrder = 10;
  let map = null;
  if (ctx.hasTexture("jupiter-nasa")) { map = await ctx.loadTexture("jupiter-nasa"); map.colorSpace = T.SRGBColorSpace; map.anisotropy = 4; }
  const pr = view === "wide" ? 1.6 : 3.2;
  const pmat = new T.MeshStandardMaterial({ map, color: map ? new T.Color(0.9, 0.42, 0.30) : new T.Color(0.8, 0.35, 0.2), roughness: 0.9, metalness: 0.0, emissive: new T.Color(0.6, 0.12, 0.02), emissiveMap: map, emissiveIntensity: 1.3 });
  planet = new T.Mesh(new T.SphereGeometry(pr, 64, 48), pmat); planet.rotation.z = 0.15; planet.renderOrder = 10; planetGroup.add(planet);
  const heat = makeSprite(T, 256, "rgba(255,120,60,1)", "rgba(255,80,30,0)");
  planetGlow = new T.Sprite(new T.SpriteMaterial({ map: heat, color: 0xff7a3a, blending: T.AdditiveBlending, transparent: true, opacity: view === "planet" ? 0.55 : 0.9, depthWrite: false }));
  planetGlow.scale.set(pr * 6, pr * 6, 1); planetGlow.renderOrder = 11; planetGroup.add(planetGlow);
  const heatLight = new T.PointLight(0xff6a30, view === "planet" ? 2.5 : 1.2, 40, 1.2); planetGroup.add(heatLight);
  // accretion streams
  { const n = 2400, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
    for (let i = 0; i < n; i++) { const arm = i % 2, q = rng(); const ang = (arm ? 0 : Math.PI) + q * 2.6 + rng() * 0.15; const rad = pr * (1.1 + q * 4.5); const y = (rng() - 0.5) * pr * 0.35 * (1 + q);
      pos.set([Math.cos(ang) * rad, y, Math.sin(ang) * rad], i * 3); const b = (1 - q * 0.7) * (0.5 + rng() * 0.5); col.set([b, b * 0.55, b * 0.3], i * 3); sz[i] = 0.5 + rng() * 1.2; }
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3)); geo.setAttribute("psize", new T.BufferAttribute(sz, 1));
    const mat = new T.PointsMaterial({ size: pr * 0.25, map: dustTex, vertexColors: true, transparent: true, opacity: view === "planet" ? 0.45 : 0.18, blending: T.AdditiveBlending, depthWrite: false });
    mat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace("uniform float size;", "attribute float psize; uniform float size;").replace("gl_PointSize = size;", "gl_PointSize = size * psize;"); };
    streams = new T.Points(geo, mat); planetGroup.add(streams); }
  scene.add(planetGroup);
  scene.add(new T.AmbientLight(0x223048, 0.6));
  // layer=subject: only the planet, its heat glow and streams on a transparent background (pop-out carousel).
  subjectOnly = ctx.opts.layer === "subject";
  if (subjectOnly) {
    for (const o of [...scene.children]) if (o !== planetGroup && !(o.isLight)) scene.remove(o);
    planetGlow.scale.set(pr * 2.6, pr * 2.6, 1); planetGlow.material.opacity = 0.3; // tight rim glow only, so the alpha layer stays clean
    streams.material.opacity = 0.35;
    const key = new T.DirectionalLight(0xfff0dd, 2.2); key.position.set(-30, 25, 20); scene.add(key);
  }
}

export function draw(t) {
  const orbitA = 0.9 + t * 0.012; // planet's place on its orbit (slow)
  planetGroup.position.set(Math.cos(orbitA) * ORBIT, 0, Math.sin(orbitA) * ORBIT);
  planet.rotation.y = t * 0.08;
  streams.rotation.y = -t * 0.05;
  starGlow.material.opacity = 0.8 + 0.05 * Math.sin(t * 2.1);
  if (!subjectOnly) planetGlow.material.opacity = (view === "planet" ? 0.55 : 0.9) * (0.95 + 0.05 * Math.sin(t * 1.3));
  if (view === "planet") {
    // close on the planet from just above the disk plane, the star beyond it; the disk walls of the gap frame it
    // inside the gap lane, a little above the plane, looking along the lane at the planet with the star beyond it;
    // the outer disk wall fills the top, the dark gap floor the lower third
    const p = planetGroup.position, a = orbitA + Math.PI / 2 + 0.25 + t * 0.004, dist = 3.2 * 9;
    cam.position.set(p.x + Math.cos(a) * dist, 5.5 + Math.sin(t * 0.1) * 0.2, p.z + Math.sin(a) * dist);
    cam.lookAt(p.x, 0, p.z); cam.rotateX(-0.11); // pitch down: the planet in the upper middle, the dark gap floor below it
  } else {
    // wide: the disk fills the upper two thirds seen from about 28 degrees above the plane, orbiting slowly
    const a = 0.4 + t * 0.02, d = 215, el = 0.52 + 0.02 * Math.sin(t * 0.15);
    cam.position.set(Math.cos(a) * d * Math.cos(el), Math.sin(el) * d, Math.sin(a) * d * Math.cos(el));
    cam.lookAt(0, 0, 0); cam.rotateX(-0.13); // pitch down so the disk sits in the upper two thirds and the lower third is space
  }
  if (view === "hero") { // planet large and centred for the pop-out subject layer, lit from the upper left by the star
    const p = planetGroup.position, a = orbitA + Math.PI / 2 + 0.6, dist = 3.2 * 5.2;
    cam.position.set(p.x + Math.cos(a) * dist, 3.0, p.z + Math.sin(a) * dist); cam.lookAt(p.x, 0.2, p.z);
  }
  cam.updateProjectionMatrix();
  if (subjectOnly) R.setClearColor(0x000000, 0); else R.setClearColor(0x03050c, 1);
  R.render(scene, cam);
}
