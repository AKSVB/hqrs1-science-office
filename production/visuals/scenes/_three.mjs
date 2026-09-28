// Shared helpers for the three.js scenes. Deterministic: no Math.random, no Date.
//
// - makeSprite: a radial-gradient canvas texture for glows, halos and dust.
// - Motes: n dust points drifting on seeded sinusoids inside a box (the "dust in the key beam").
// - Post: render the scene into an HDR target and composite it to the canvas through one fullscreen pass that
//   does depth-of-field (a Poisson blur whose radius grows with distance from the focus plane), the lower-third
//   fade to black, ACES tone mapping and the sRGB conversion. With alpha on (layer=subject) the pass keeps the
//   target's alpha and skips the lower-third fade, so the subject sits clean on a transparent background.

export const makeSprite = (T, size, inner, outer, softness = 1.0) => {
  const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d");
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(Math.min(0.99, 0.25 * softness), inner.replace(/[\d.]+\)$/, "0.55)")); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; return tex;
};

// Dust motes: seeded base positions and drift phases; update(t) moves them. Additive, no depth write.
export class Motes {
  constructor(T, rng, n, box, { size = 0.05, color = 0xffe0b0, opacity = 0.5, drift = 0.15 } = {}) {
    this.T = T; this.n = n; this.box = box; this.drift = drift;
    this.base = new Float32Array(n * 3); this.ph = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) { this.base[i * 3 + k] = box.min[k] + rng() * (box.max[k] - box.min[k]); this.ph[i * 3 + k] = rng() * 6.283; } }
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(this.base.slice(), 3));
    const sz = new Float32Array(n); for (let i = 0; i < n; i++) sz[i] = 0.5 + rng() * 1.2; geo.setAttribute("psize", new T.BufferAttribute(sz, 1));
    const mat = new T.PointsMaterial({ size, map: makeSprite(T, 32, "rgba(255,255,255,1)", "rgba(255,255,255,0)", 1.3), color, transparent: true, opacity, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true });
    mat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace("uniform float size;", "attribute float psize; uniform float size;").replace("gl_PointSize = size;", "gl_PointSize = size * psize;"); };
    this.points = new T.Points(geo, mat); this.points.renderOrder = 50;
  }
  update(t) {
    const p = this.points.geometry.attributes.position, d = this.drift;
    for (let i = 0; i < this.n; i++) {
      const j = i * 3;
      p.array[j] = this.base[j] + Math.sin(t * 0.21 + this.ph[j]) * d;
      p.array[j + 1] = this.base[j + 1] + Math.sin(t * 0.17 + this.ph[j + 1]) * d * 0.6 - t * d * 0.05;
      p.array[j + 2] = this.base[j + 2] + Math.cos(t * 0.19 + this.ph[j + 2]) * d;
    }
    p.needsUpdate = true;
  }
}

// Post: HDR render target plus one composite pass to the canvas.
export class Post {
  constructor(T, R, W, H, { alpha = false, exposure = 1.0 } = {}) {
    this.T = T; this.R = R; this.W = W; this.H = H; this.alpha = alpha;
    this.rt = new T.WebGLRenderTarget(W, H, { type: T.HalfFloatType, depthBuffer: true, depthTexture: new T.DepthTexture(W, H, T.UnsignedIntType), samples: 0 });
    this.rt.texture.colorSpace = T.LinearSRGBColorSpace;
    this.mat = new T.ShaderMaterial({
      uniforms: { tex: { value: this.rt.texture }, dep: { value: this.rt.depthTexture }, near: { value: 0.1 }, far: { value: 100 }, focus: { value: 5 }, range: { value: 3 }, maxBlur: { value: 0 }, px: { value: new T.Vector2(1 / W, 1 / H) }, fadeFrom: { value: 0.62 }, fadeTo: { value: 1.0 }, fadeStrength: { value: 0.85 }, exposure: { value: exposure }, keepAlpha: { value: alpha ? 1 : 0 }, fadeTint: { value: new T.Color(0x03050c) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `
        #include <packing>
        vec3 aces(vec3 x){ x *= 0.6; float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14; return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0); }
        vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
        uniform sampler2D tex; uniform sampler2D dep; uniform float near, far, focus, range, maxBlur, fadeFrom, fadeTo, fadeStrength, exposure, keepAlpha; uniform vec2 px; uniform vec3 fadeTint;
        varying vec2 vUv;
        float viewZ(vec2 uv){ float d = texture2D(dep, uv).x; return -perspectiveDepthToViewZ(d, near, far); }
        float coc(vec2 uv){ float z = viewZ(uv); return clamp(abs(z - focus) / range, 0.0, 1.0); }
        void main(){
          vec4 c;
          if (maxBlur > 0.0) {
            float r = coc(vUv) * maxBlur;
            vec2 taps[24];
            taps[0]=vec2(-0.613,0.169);taps[1]=vec2(0.170,-0.874);taps[2]=vec2(0.729,0.336);taps[3]=vec2(-0.230,0.626);taps[4]=vec2(0.441,-0.201);taps[5]=vec2(-0.834,-0.428);
            taps[6]=vec2(0.089,0.334);taps[7]=vec2(-0.385,-0.767);taps[8]=vec2(0.913,-0.309);taps[9]=vec2(-0.140,-0.184);taps[10]=vec2(0.532,0.795);taps[11]=vec2(-0.951,0.147);
            taps[12]=vec2(0.302,0.056);taps[13]=vec2(-0.541,0.559);taps[14]=vec2(0.677,-0.646);taps[15]=vec2(-0.089,0.942);taps[16]=vec2(0.196,-0.476);taps[17]=vec2(-0.377,-0.328);
            taps[18]=vec2(0.845,0.036);taps[19]=vec2(-0.708,-0.089);taps[20]=vec2(0.024,-0.663);taps[21]=vec2(0.389,0.501);taps[22]=vec2(-0.263,0.251);taps[23]=vec2(0.588,-0.900);
            vec4 acc = texture2D(tex, vUv); float wsum = 1.0;
            for (int i = 0; i < 24; i++) {
              vec2 uv2 = vUv + taps[i] * r * px;
              float r2 = coc(uv2) * maxBlur;
              float w = clamp(r2 / max(r, 0.5), 0.0, 1.0) * 0.9 + 0.1; // a sharp sample does not bleed into a soft one
              acc += texture2D(tex, uv2) * w; wsum += w;
            }
            c = acc / wsum;
          } else c = texture2D(tex, vUv);
          vec3 col = c.rgb * exposure;
          col = aces(col);
          float alpha = 1.0;
          if (keepAlpha > 0.5) { alpha = c.a; }
          else {
            float v = 1.0 - vUv.y; // 0 top .. 1 bottom
            float f = smoothstep(fadeFrom, fadeTo, v) * fadeStrength;
            col = mix(col, fadeTint, f);
          }
          gl_FragColor = vec4(toSRGB(col), alpha);
        }`,
      depthTest: false, depthWrite: false, transparent: true, toneMapped: false
    });
    this.quad = new T.Mesh(new T.PlaneGeometry(2, 2), this.mat);
    this.qscene = new T.Scene(); this.qscene.add(this.quad);
    this.qcam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  // fade: [from, to, strength] as fractions of frame height from the top; blur: { focus, range, max } in world units and px.
  render(scene, cam, { fade = [0.6, 1.0, 0.85], blur = null, clear = 0x000000, clearAlpha = 1 } = {}) {
    const R = this.R, u = this.mat.uniforms;
    R.setRenderTarget(this.rt); R.setClearColor(clear, this.alpha ? 0 : clearAlpha); R.clear(); R.render(scene, cam); R.setRenderTarget(null);
    u.near.value = cam.near; u.far.value = cam.far;
    if (blur) { u.focus.value = blur.focus; u.range.value = blur.range; u.maxBlur.value = blur.max; } else u.maxBlur.value = 0;
    u.fadeFrom.value = fade[0]; u.fadeTo.value = fade[1]; u.fadeStrength.value = fade[2];
    R.setClearColor(0x000000, 0); R.clear();
    R.render(this.qscene, this.qcam);
  }
}

// Fresnel-tinted emissive rim patch for MeshPhysical/Standard materials (onBeforeCompile), for living tissue and enamel.
export const rimPatch = (mat, color, strength, power = 3.0) => {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.rimColor = { value: color }; sh.uniforms.rimStrength = { value: strength }; sh.uniforms.rimPower = { value: power };
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 rimColor; uniform float rimStrength; uniform float rimPower;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n{ vec3 nv = normalize(vViewPosition); float fr = pow(1.0 - max(dot(normalize(normal), nv), 0.0), rimPower); totalEmissiveRadiance += rimColor * fr * rimStrength; }");
  };
};

export const setLens = (cam, mm, aspect) => { // mm equivalent on a full-frame 36 x 24 sensor, vertical fov for a portrait frame
  const sensorH = aspect < 1 ? 36 : 24; // portrait: the long side is vertical
  cam.fov = 2 * Math.atan(sensorH / 2 / mm) * 180 / Math.PI; cam.aspect = aspect; cam.updateProjectionMatrix();
};
