// earth-limb (three.js): the curved limb of Earth from low orbit (storyboard YP-01, the age-comparison hook).
// NASA's Earth relief map (public domain) recoloured in a shader to ocean blue, land and ice under a procedural
// cloud layer; a thin luminous atmosphere rim; the sun breaking over the limb at the upper right (the one warm
// light); the night side falling to black below; NASA Tycho star map behind. Camera drifts slowly along the limb.
// Options (--var view=): "limb" (default, YP-01), "globe" (a whole Earth from further out, for the scale ladder).
import { clamp, lerp, smooth } from "./_lib.mjs";

export const kind = "three";

let T, R, scene, cam, W, H, earth, clouds, atmo, sunFlare, sunFlare2, sunDir, sunLight, view, rng, cloudTex;

const makeSprite = (T, size, inner, outer) => {
  const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d");
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(0.2, inner.replace(/[\d.]+\)$/, "0.6)")); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; return tex;
};

export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; rng = ctx.rng;
  view = ctx.opts.view || "limb";
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
  scene = new T.Scene();
  cam = new T.PerspectiveCamera(view === "globe" ? 30 : 38, W / H, 0.1, 5000);
  if (ctx.hasTexture("starmap-tycho-nasa")) {
    const tex = await ctx.loadTexture("starmap-tycho-nasa"); tex.colorSpace = T.SRGBColorSpace;
    { const c = document.createElement("canvas"); c.width = tex.image.width; c.height = tex.image.height; const g2 = c.getContext("2d"); g2.filter = "blur(1.2px)"; g2.drawImage(tex.image, 0, 0); tex.image = c; tex.needsUpdate = true; }
    const sky = new T.Mesh(new T.SphereGeometry(2500, 48, 32), new T.MeshBasicMaterial({ map: tex, side: T.BackSide, color: new T.Color(0.3, 0.35, 0.5) }));
    sky.rotation.y = 1.2; scene.add(sky);
  }
  { const n = 1200, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const th = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1), r = 2200; pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3); const b = 0.4 + rng() * 0.6; col.set([b, b, b * 1.05], i * 3); }
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3));
    scene.add(new T.Points(geo, new T.PointsMaterial({ size: 2.6, map: makeSprite(T, 32, "rgba(255,255,255,1)", "rgba(255,255,255,0)"), vertexColors: true, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending }))); }

  // Sun direction: upper right, just past the limb, so the terminator crosses the frame and the rim catches light.
  sunDir = new T.Vector3(0.75, 0.42, -0.5).normalize();
  sunLight = new T.DirectionalLight(0xfff4e0, 3.2); sunLight.position.copy(sunDir).multiplyScalar(100); scene.add(sunLight);
  scene.add(new T.AmbientLight(0x0a1020, 0.5));

  // Earth surface: relief map recoloured in the fragment shader (hypsometric tints -> ocean, land, ice) with a
  // procedural cloud texture, night side dark with faint city light, specular sun glint on the ocean.
  let relief = null;
  if (ctx.hasTexture("earth-relief-nasa")) { relief = await ctx.loadTexture("earth-relief-nasa"); relief.colorSpace = T.SRGBColorSpace; relief.anisotropy = 8; }
  // Cloud texture from fbm (2048 x 1024).
  { const cw = 1024, ch = 512, c = document.createElement("canvas"); c.width = cw; c.height = ch; const g = c.getContext("2d"), id = g.createImageData(cw, ch), d = id.data;
    for (let y = 0, i = 0; y < ch; y++) for (let x = 0; x < cw; x++, i += 4) {
      const u = x / cw, v = y / ch, lat = (v - 0.5) * Math.PI;
      // wrap seamlessly in longitude by sampling on a cylinder
      const cx = Math.cos(u * Math.PI * 2) * 2.2, cz = Math.sin(u * Math.PI * 2) * 2.2, cy = v * 6;
      const warp = ctx.fbm(cx * 1.5 + 5, cy * 1.5, cz * 1.5, 2) - 0.5;
      const n = ctx.fbm(cx * 1.6 + warp * 1.4, cy * 1.6 + warp, cz * 1.6 + 3, 6, 0.55);
      const bands = 0.5 + 0.5 * Math.sin(lat * 3.2 + n * 2); // belts of cloud
      const streak = ctx.fbm(cx * 0.8, cy * 4.5, cz * 0.8 + 7, 3);
      let a = clamp((n - 0.46) * 2.4 + (bands - 0.5) * 0.35 + (streak - 0.5) * 0.4, 0, 1);
      a = Math.pow(a, 1.4) * (0.75 + 0.25 * smooth(0.0, 0.25, Math.abs(v - 0.5))); // more cloud toward the poles
      d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = 255 * a;
    }
    g.putImageData(id, 0, 0); cloudTex = new T.CanvasTexture(c); cloudTex.colorSpace = T.SRGBColorSpace; cloudTex.anisotropy = 8; }

  const earthMat = new T.ShaderMaterial({
    uniforms: { relief: { value: relief }, clouds: { value: cloudTex }, sunDir: { value: sunDir }, hasRelief: { value: relief ? 1 : 0 }, time: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vP; varying vec2 vUv; void main(){ vN = normalize(mat3(modelMatrix) * normal); vP = (modelMatrix * vec4(position,1.0)).xyz; vUv = uv; gl_Position = projectionMatrix * viewMatrix * vec4(vP,1.0); }`,
    fragmentShader: `
      uniform sampler2D relief; uniform sampler2D clouds; uniform vec3 sunDir; uniform float hasRelief; uniform float time;
      varying vec3 vN; varying vec3 vP; varying vec2 vUv;
      void main(){
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vP);
        float ndl = dot(n, sunDir);
        float day = smoothstep(-0.08, 0.25, ndl);
        vec3 tex = hasRelief > 0.5 ? texture2D(relief, vUv).rgb : vec3(0.2, 0.4, 0.7);
        // the relief map is hypsometric: oceans blue-violet, lowlands green, highlands brown/white. Classify.
        float blueDom = tex.b - max(tex.r, tex.g);
        float ocean = smoothstep(-0.02, 0.10, blueDom);
        float greenDom = tex.g - max(tex.r, tex.b);
        float veg = smoothstep(0.02, 0.2, greenDom);
        float bright = (tex.r + tex.g + tex.b) / 3.0;
        float ice = smoothstep(0.62, 0.85, bright) * (1.0 - ocean);
        float lat = abs(vUv.y - 0.5) * 2.0;
        ice = max(ice, smoothstep(0.86, 0.95, lat));
        vec3 oceanCol = mix(vec3(0.02, 0.07, 0.20), vec3(0.05, 0.16, 0.36), smoothstep(0.2, 0.7, bright));
        vec3 landCol = mix(vec3(0.30, 0.24, 0.14), vec3(0.10, 0.20, 0.08), veg);
        landCol = mix(landCol, vec3(0.42, 0.36, 0.26), smoothstep(0.45, 0.7, bright) * (1.0 - veg));
        vec3 col = mix(landCol, oceanCol, ocean);
        col = mix(col, vec3(0.86, 0.9, 0.95), ice);
        // clouds with a soft shadow on the surface
        vec2 cuv = vec2(vUv.x + time * 0.002, vUv.y);
        float cl = texture2D(clouds, cuv).a;
        float clShadow = texture2D(clouds, cuv + vec2(0.004, -0.003)).a;
        col *= 1.0 - 0.35 * clShadow;
        col = mix(col, vec3(0.93, 0.95, 0.98), cl * 0.95);
        // ocean sun glint
        vec3 h = normalize(sunDir + v);
        float spec = pow(max(dot(n, h), 0.0), 120.0) * ocean * (1.0 - cl) * 0.8;
        vec3 lit = col * (0.15 + 1.2 * max(ndl, 0.0)) + vec3(1.0, 0.9, 0.7) * spec;
        // warm the terminator, cool the shadow, faint city light on the night side
        lit = mix(lit, lit * vec3(1.3, 0.85, 0.6) + vec3(0.25, 0.12, 0.04), smoothstep(0.3, -0.05, ndl) * day);
        vec3 night = col * 0.035 + vec3(0.9, 0.7, 0.4) * (1.0 - ocean) * 0.03 * smoothstep(0.5, 0.75, bright) * (1.0 - cl);
        vec3 c = mix(night, lit, day);
        // limb darkening / atmosphere haze near the edge as seen by the camera
        float rim = pow(1.0 - max(dot(n, v), 0.0), 2.5);
        c = mix(c, vec3(0.45, 0.65, 0.95) * (0.2 + 0.8 * day), rim * 0.55);
        gl_FragColor = vec4(c, 1.0);
      }`
  });
  earth = new T.Mesh(new T.SphereGeometry(10, 128, 96), earthMat); scene.add(earth);
  // Atmosphere: a slightly larger back-facing shell whose alpha peaks at the rim; lit only on the day side.
  const atmoMat = new T.ShaderMaterial({
    uniforms: { sunDir: { value: sunDir } }, transparent: true, side: T.BackSide, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix) * normal); vP = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vP,1.0); }`,
    fragmentShader: `uniform vec3 sunDir; varying vec3 vN; varying vec3 vP; void main(){ vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vP); float f = pow(1.0 - abs(dot(n, v)), 1.0); float sd = dot(n, sunDir); float day = smoothstep(-0.32, 0.30, sd); float glow = pow(f, 4.0) * 1.3 + pow(f, 14.0) * 1.6; vec3 col = mix(vec3(0.15, 0.4, 1.0), vec3(0.6, 0.85, 1.0), pow(f, 8.0)); col = mix(col, vec3(1.0, 0.62, 0.35), smoothstep(0.3, -0.1, sd) * smoothstep(-0.45, -0.1, sd)); float k = 0.05 + 0.95 * day; gl_FragColor = vec4(col * glow * k, glow * k); }`
  });
  atmo = new T.Mesh(new T.SphereGeometry(10.2, 128, 96), atmoMat); scene.add(atmo);
  // The sun: a hard small flare plus a wide warm halo, placed far along sunDir so the limb can occlude it.
  const flareTex = makeSprite(T, 256, "rgba(255,250,235,1)", "rgba(255,200,140,0)");
  sunFlare = new T.Sprite(new T.SpriteMaterial({ map: flareTex, color: 0xfff6e0, blending: T.AdditiveBlending, transparent: true, opacity: 1.0, depthWrite: false, depthTest: true }));
  sunFlare.position.copy(sunDir).multiplyScalar(600); sunFlare.scale.set(90, 90, 1); scene.add(sunFlare);
  sunFlare2 = new T.Sprite(new T.SpriteMaterial({ map: flareTex, color: 0xffb060, blending: T.AdditiveBlending, transparent: true, opacity: 0.35, depthWrite: false, depthTest: false }));
  sunFlare2.position.copy(sunDir).multiplyScalar(590); sunFlare2.scale.set(320, 320, 1); scene.add(sunFlare2);
}

export function draw(t) {
  earth.material.uniforms.time.value = t;
  earth.rotation.y = 0.9 + t * 0.004; // slow rotation under the camera
  if (view === "globe") {
    const a = 0.2 + t * 0.01;
    cam.position.set(Math.sin(a) * 42, 6, Math.cos(a) * 42); cam.lookAt(0, -2.5, 0);
  } else {
    // low orbit, looking along the limb so the curve crosses the upper half; the sunrise point at the upper right
    // low orbit (altitude about half a radius), looking out over the horizon: Earth's night side fills the lower
    // part of the frame, the limb curves across the upper half with space above it, the sunrise at the upper right
    const a = 0.55 + t * 0.006, dist = 15.5;
    cam.position.set(Math.sin(a) * dist, 1.5 + Math.sin(t * 0.08) * 0.1, Math.cos(a) * dist);
    cam.lookAt(0, 0, 0);
    cam.rotateX(Math.acos(10 / dist) - 0.10 + Math.sin(t * 0.06) * 0.008); // pitch up to the horizon
    cam.rotateZ(-0.22);
  }
  // The sun sits in the camera's frame: to the upper right, just beyond the limb, so the day side faces us and the
  // terminator crosses the globe. Recomputed per frame from the camera basis (deterministic in t).
  { cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    // put the sun at a fixed screen position just above the limb at the upper right (NDC x 0.62, y 0.30 in limb view)
    const ndc = view === "globe" ? new T.Vector3(0.9, 0.85, 0.5) : new T.Vector3(0.66, 0.14, 0.5);
    sunDir.copy(ndc.unproject(cam).sub(cam.position).normalize());
    sunLight.position.copy(sunDir).multiplyScalar(100);
    sunFlare.position.copy(sunDir).multiplyScalar(600); sunFlare2.position.copy(sunDir).multiplyScalar(590); }
  cam.updateProjectionMatrix();
  R.setClearColor(0x02040a, 1);
  R.render(scene, cam);
}
