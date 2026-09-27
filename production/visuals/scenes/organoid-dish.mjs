// organoid-dish (three.js): a pale pink-white brain organoid, a lumpy translucent sphere with a faintly folded
// surface, resting in clear medium in a shallow glass dish (storyboard OR-01 for carousel-organoids-5-years).
// One warm lamp from the upper left; cool blue fill off the glass rim; the bench falls to black across the lower
// third. Subsurface-like shading comes from a wrap-lit custom shader with a warm transmission term at the rim.
// Options (--var view=): "cover" (default, OR-01: organoid at the upper right, cut by the frame edge),
// "centre" (OR-01 recrop for slide 7: centred and dim), "wells" (OR-02: a multi-well plate, several organoids).
import { clamp, lerp, smooth } from "./_lib.mjs";

export const kind = "three";

let T, R, scene, cam, W, H, view, rng, organoids = [], lamp, dishRim, medium;

const organoidGeo = (T, ctx, r, seedOff) => {
  const geo = new T.SphereGeometry(r, 220, 160);
  const p = geo.attributes.position, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = v.clone().normalize();
    // lobes (low frequency), folds (ridged mid frequency), fine bumps
    const lob = ctx.fbm(n.x * 1.4 + seedOff, n.y * 1.4, n.z * 1.4 + 2, 2) - 0.5;
    const rid = 1 - Math.abs(2 * ctx.fbm(n.x * 3.2 + seedOff, n.y * 3.2 + 1, n.z * 3.2, 2) - 1);
    const fine = ctx.fbm(n.x * 7 + seedOff, n.y * 7, n.z * 7, 2) - 0.5;
    const d = 1 + lob * 0.22 - Math.pow(rid, 2.2) * 0.05 + fine * 0.02;
    v.copy(n).multiplyScalar(r * d); p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
};

export async function init(ctx) {
  T = ctx.THREE; R = ctx.renderer; W = ctx.W; H = ctx.H; rng = ctx.rng;
  view = ctx.opts.view || "cover";
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
  scene = new T.Scene(); scene.fog = new T.Fog(0x060913, 30, 80);
  cam = new T.PerspectiveCamera(view === "wells" ? 30 : 26, W / H, 0.1, 300);

  // Organoid material: a wrap-lit, subsurface-ish shader (translucent pinkish tissue, warm rim transmission).
  const mat = (tint) => new T.ShaderMaterial({
    uniforms: { lampPos: { value: new T.Vector3(-14, 22, 10) }, fillDir: { value: new T.Vector3(0.6, 0.2, -0.75).normalize() }, tint: { value: new T.Color(tint) } },
    vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix) * normal); vP = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vP,1.0); }`,
    fragmentShader: `
      uniform vec3 lampPos; uniform vec3 fillDir; uniform vec3 tint; varying vec3 vN; varying vec3 vP;
      void main(){
        vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vP); vec3 l = normalize(lampPos - vP);
        float ndl = dot(n, l);
        float wrap = clamp((ndl + 0.55) / 1.55, 0.0, 1.0);           // wrap lighting: light bleeds past the terminator
        float sss = pow(clamp(dot(-v, l) * 0.5 + 0.5, 0.0, 1.0), 3.0); // light through the tissue toward the camera
        float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        vec3 h = normalize(l + v); float spec = pow(max(dot(n, h), 0.0), 60.0) * 0.5; // wet surface
        float fill = clamp(dot(n, fillDir), 0.0, 1.0);
        vec3 base = tint;                                              // pale pink-white
        vec3 deep = vec3(0.62, 0.36, 0.34);                            // deeper tissue red where light passes through
        vec3 col = base * (0.12 + 1.15 * wrap) * vec3(1.0, 0.97, 0.94);
        col += deep * sss * 0.55 * wrap;
        col += vec3(0.85, 0.7, 0.62) * fres * 0.35 * wrap;
        col += vec3(0.30, 0.45, 0.6) * fill * 0.22;                   // cool blue fill from the glass
        col += vec3(0.35, 0.5, 0.7) * fres * 0.25 * (1.0 - wrap);
        col += vec3(1.0, 0.95, 0.85) * spec;
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const place = (x, z, r, seedOff, tint = 0xf8e2dc) => { const m = new T.Mesh(organoidGeo(T, ctx, r, seedOff), mat(tint)); m.position.set(x, r * 0.92, z); m.rotation.set(rng() * 6, rng() * 6, rng() * 6); organoids.push(m); scene.add(m); return m; };
  if (view === "wells") { for (let k = 0; k < 7; k++) { const x = -18 + k * 6.2, z = (k % 2 ? 2.5 : -2.5); place(x, z, 1.9 + rng() * 0.4, k * 3.7 + 1); } }
  else place(view === "centre" ? 0 : 3.2, view === "centre" ? 0 : -1.0, 3.6, 1.0);

  // The dish: a glass floor disc (subtle reflection), a bevelled rim, the medium's meniscus as a soft ring.
  const glass = new T.MeshPhysicalMaterial({ color: 0xdde8f2, roughness: 0.08, metalness: 0.0, transmission: 0.85, thickness: 0.6, ior: 1.5, transparent: true, opacity: 0.6, clearcoat: 1.0 });
  const floorMat = new T.MeshStandardMaterial({ color: 0x0e1526, roughness: 0.25, metalness: 0.6 });
  const dishR = view === "wells" ? 30 : 12;
  const floor = new T.Mesh(new T.CircleGeometry(dishR, 96), floorMat); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  if (view === "wells") {
    // a multi-well plate: a dark plastic tray with round wells, condensation on the lid implied by bokeh
    const tray = new T.Mesh(new T.BoxGeometry(50, 1.2, 14), new T.MeshStandardMaterial({ color: 0x1a2236, roughness: 0.6, metalness: 0.1 })); tray.position.y = -0.7; scene.add(tray);
    for (let k = 0; k < 7; k++) { const ring = new T.Mesh(new T.TorusGeometry(3.0, 0.25, 12, 64), glass); ring.rotation.x = Math.PI / 2; ring.position.set(-18 + k * 6.2, 0.1, k % 2 ? 2.5 : -2.5); scene.add(ring); }
  } else {
    dishRim = new T.Mesh(new T.TorusGeometry(dishR, 0.55, 16, 128), glass); dishRim.rotation.x = Math.PI / 2; dishRim.position.y = 0.3; scene.add(dishRim);
    const wall = new T.Mesh(new T.CylinderGeometry(dishR, dishR, 2.2, 128, 1, true), glass); wall.position.y = 1.1; scene.add(wall);
    medium = new T.Mesh(new T.CircleGeometry(dishR - 0.4, 96), new T.MeshPhysicalMaterial({ color: 0xf6e8ea, roughness: 0.05, metalness: 0, transmission: 0.95, thickness: 0.3, ior: 1.33, transparent: true, opacity: 0.35 }));
    medium.rotation.x = -Math.PI / 2; medium.position.y = 1.6; scene.add(medium);
  }
  // Bench: a dark matte plane falling into fog.
  const bench = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshStandardMaterial({ color: 0x0a0f1c, roughness: 0.95, metalness: 0.0 })); bench.rotation.x = -Math.PI / 2; bench.position.y = -0.02 - (view === "wells" ? 1.3 : 0.05); scene.add(bench);

  // Lights: one warm lamp upper left; cool blue fill from the right and behind; a faint hemisphere.
  lamp = new T.SpotLight(0xffe2c0, 1500, 90, 0.6, 0.6, 1.6); lamp.position.set(-14, 22, 10); lamp.target.position.set(0, 0, 0); scene.add(lamp); scene.add(lamp.target);
  const fill = new T.DirectionalLight(0x4f9ad0, 1.8); fill.position.set(12, 6, -14); scene.add(fill);
  scene.add(new T.HemisphereLight(0x33507a, 0x05080f, 0.5));
}

export function draw(t) {
  organoids.forEach((o, k) => { o.rotation.y += 0; o.position.y = o.geometry.parameters.radius * 0.92 + Math.sin(t * 0.5 + k) * 0.02; });
  if (view === "wells") { const a = 0.15 + t * 0.006; cam.position.set(Math.sin(a) * 20 - 6, 7.5, Math.cos(a) * 20 + 16); cam.lookAt(-2, 1.2, 0); cam.rotateX(-0.04); }
  else if (view === "centre") { const a = 0.3 + t * 0.008; cam.position.set(Math.sin(a) * 26, 16, Math.cos(a) * 26); cam.lookAt(0, 2.0, 0); cam.rotateX(-0.16); }
  else { const a = 0.55 + t * 0.008; cam.position.set(Math.sin(a) * 24, 14, Math.cos(a) * 24); cam.lookAt(1.5, 1.8, -0.5); cam.rotateX(-0.04); cam.rotateY(0.03); } // organoid upper right, its edge past the frame; dish rim and bench below
  cam.updateProjectionMatrix();
  R.setClearColor(0x060913, 1);
  R.render(scene, cam);
}
