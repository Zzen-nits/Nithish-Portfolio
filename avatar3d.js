/* Nithish 3D avatar: a small WebGL2 engine and a procedural head-and-shoulders. No libraries needed. */
(function (global) {
'use strict';
/* ===== tiny WebGL2 engine: math, geometry, shaders, scene graph, shadow map ===== */
const V3 = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
};
const M4 = {
  ident: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  },
  compose(p, r, s) { // T * (Ry * Rx * Rz) * S
    const cx = Math.cos(r[0]), sx = Math.sin(r[0]), cy = Math.cos(r[1]), sy = Math.sin(r[1]), cz = Math.cos(r[2]), sz = Math.sin(r[2]);
    // Rx*Rz
    const a = [[cz, -sz, 0], [cx * sz, cx * cz, -sx], [sx * sz, sx * cz, cx]];
    // Ry * a
    const R = [
      [cy * a[0][0] + sy * a[2][0], cy * a[0][1] + sy * a[2][1], cy * a[0][2] + sy * a[2][2]],
      [a[1][0], a[1][1], a[1][2]],
      [-sy * a[0][0] + cy * a[2][0], -sy * a[0][1] + cy * a[2][1], -sy * a[0][2] + cy * a[2][2]]
    ];
    return new Float32Array([
      R[0][0] * s[0], R[1][0] * s[0], R[2][0] * s[0], 0,
      R[0][1] * s[1], R[1][1] * s[1], R[2][1] * s[1], 0,
      R[0][2] * s[2], R[1][2] * s[2], R[2][2] * s[2], 0,
      p[0], p[1], p[2], 1]);
  },
  persp(fov, asp, n, f) {
    const t = 1 / Math.tan(fov / 2);
    return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]);
  },
  ortho(l, r, b, t, n, f) {
    return new Float32Array([2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1]);
  },
  lookAt(e, c, up) {
    const z = V3.norm(V3.sub(e, c)), x = V3.norm(V3.cross(up, z)), y = V3.cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -V3.dot(x, e), -V3.dot(y, e), -V3.dot(z, e), 1]);
  },
  normalMat(m) { // cofactor of the upper 3x3 / det (= inverse transpose)
    const a00 = m[0], a10 = m[1], a20 = m[2], a01 = m[4], a11 = m[5], a21 = m[6], a02 = m[8], a12 = m[9], a22 = m[10];
    const C00 = a11 * a22 - a12 * a21, C01 = -(a10 * a22 - a12 * a20), C02 = a10 * a21 - a11 * a20;
    const C10 = -(a01 * a22 - a02 * a21), C11 = a00 * a22 - a02 * a20, C12 = -(a00 * a21 - a01 * a20);
    const C20 = a01 * a12 - a02 * a11, C21 = -(a00 * a12 - a02 * a10), C22 = a00 * a11 - a01 * a10;
    let d = a00 * C00 + a01 * C01 + a02 * C02; if (Math.abs(d) < 1e-12) d = 1;
    return new Float32Array([C00 / d, C10 / d, C20 / d, C01 / d, C11 / d, C21 / d, C02 / d, C12 / d, C22 / d]);
  }
};
const lin = (hex) => { // sRGB hex -> linear rgb
  const n = parseInt(hex.slice(1), 16);
  return [Math.pow((n >> 16 & 255) / 255, 2.2), Math.pow((n >> 8 & 255) / 255, 2.2), Math.pow((n & 255) / 255, 2.2)];
};

/* ---------- geometry ---------- */
function param(fn, nu, nv, o) {
  o = o || {};
  const c = o.c || [0, 0, 0], np = (nu + 1) * (nv + 1);
  const pos = new Float32Array(np * 3), nor = new Float32Array(np * 3), col = new Float32Array(np * 3).fill(1);
  const e = 1e-3; let k = 0;
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const u = i / nu, v = j / nv, p = fn(u, v);
    const du = V3.sub(fn(u + e, v), fn(u - e, v)), dv = V3.sub(fn(u, Math.min(1, v + e)), fn(u, Math.max(0, v - e)));
    let n = V3.cross(du, dv); const out = V3.sub(p, c);
    if (V3.len(n) < 1e-9) n = out.slice(); else if (V3.dot(n, out) < 0) n = [-n[0], -n[1], -n[2]];
    n = V3.norm(n);
    pos[k] = p[0]; pos[k + 1] = p[1]; pos[k + 2] = p[2]; nor[k] = n[0]; nor[k + 1] = n[1]; nor[k + 2] = n[2]; k += 3;
  }
  const idx = new Uint16Array(nu * nv * 6); let q = 0;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = j * (nu + 1) + i, b = a + 1, cc = a + nu + 1, d = cc + 1;
    idx[q++] = a; idx[q++] = cc; idx[q++] = b; idx[q++] = b; idx[q++] = cc; idx[q++] = d;
  }
  return { pos, nor, col, idx };
}
const sphereG = (r, nu, nv) => param((u, v) => { const a = 2 * Math.PI * u, b = Math.PI * v; return [r * Math.sin(b) * Math.sin(a), r * Math.cos(b), r * Math.sin(b) * Math.cos(a)]; }, nu || 32, nv || 20);
// spherical cap around +z (angle in radians)
const capG = (r, ang, nu, nv) => param((u, v) => { const a = 2 * Math.PI * u, b = ang * v; return [r * Math.sin(b) * Math.sin(a), r * Math.sin(b) * Math.cos(a), r * Math.cos(b)]; }, nu || 28, nv || 10, { c: [0, 0, 0] });
// hemisphere (pole +y) used for eyelids
const hemiG = (r, nu, nv) => param((u, v) => { const a = 2 * Math.PI * u, b = 0.5 * Math.PI * v; return [r * Math.sin(b) * Math.sin(a), r * Math.cos(b), r * Math.sin(b) * Math.cos(a)]; }, nu || 28, nv || 12);
// surface of revolution around y; profile(v) -> [radius, y]
const latheG = (profile, nu, nv, cy) => param((u, v) => { const a = 2 * Math.PI * u, pr = profile(v); return [pr[0] * Math.sin(a), pr[1], pr[0] * Math.cos(a)]; }, nu || 28, nv || 8, { c: [0, cy || 0, 0] });
const coneG = (r, h) => latheG((v) => [r * v, h * (1 - v)], 12, 6, h * .3);          // tip up at y=h? base at y=0, tip at y=h
const cylG = (r0, r1, h) => latheG((v) => [r0 + (r1 - r0) * v, h * (1 - v)], 28, 10, h / 2);
const capsuleG = (r, h) => latheG((v) => {                                          // vertical capsule, total height h + 2r, centred
  const t = v * (h + Math.PI * r), top = Math.PI * r / 2;
  if (t < top) { const b = t / r; return [r * Math.sin(b), h / 2 + r * Math.cos(b)]; }
  if (t < top + h) return [r, h / 2 - (t - top)];
  const b = (t - top - h) / r; return [r * Math.cos(b), -h / 2 - r * Math.sin(b)];
}, 20, 24);

function catmull(pts, sub, closed) {
  const n = pts.length, out = [];
  const at = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let s = 0; s < sub; s++) {
      const t = s / sub, t2 = t * t, t3 = t2 * t, p = [0, 0, 0];
      for (let d = 0; d < 3; d++) p[d] = .5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3);
      out.push(p);
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
// elliptical tube swept along a dense path
function sweepG(path, closed, ra, rb, ref, seg, taper) {
  seg = seg || 10; const n = path.length, rows = closed ? n + 1 : n;
  const pos = new Float32Array(rows * (seg + 1) * 3), nor = new Float32Array(rows * (seg + 1) * 3), col = new Float32Array(rows * (seg + 1) * 3).fill(1);
  let k = 0;
  for (let i = 0; i < rows; i++) {
    const P = path[i % n];
    const nx = closed ? path[(i + 1) % n] : path[Math.min(n - 1, i + 1)], pv = closed ? path[(i - 1 + n) % n] : path[Math.max(0, i - 1)];
    const T = V3.norm(V3.sub(nx, pv)); let N = V3.cross(T, ref); if (V3.len(N) < 1e-6) N = V3.cross(T, [1, 0, 0]); N = V3.norm(N);
    const B = V3.norm(V3.cross(T, N)), s = taper ? taper(closed ? (i % n) / n : i / (n - 1)) : 1;
    for (let j = 0; j <= seg; j++) {
      const a = 2 * Math.PI * j / seg, ca = Math.cos(a), sa = Math.sin(a), A = ra * s, Bb = rb * s;
      pos[k] = P[0] + N[0] * A * ca + B[0] * Bb * sa; pos[k + 1] = P[1] + N[1] * A * ca + B[1] * Bb * sa; pos[k + 2] = P[2] + N[2] * A * ca + B[2] * Bb * sa;
      const nn = V3.norm([N[0] * ca / Math.max(A, 1e-4) + B[0] * sa / Math.max(Bb, 1e-4), N[1] * ca / Math.max(A, 1e-4) + B[1] * sa / Math.max(Bb, 1e-4), N[2] * ca / Math.max(A, 1e-4) + B[2] * sa / Math.max(Bb, 1e-4)]);
      nor[k] = nn[0]; nor[k + 1] = nn[1]; nor[k + 2] = nn[2]; k += 3;
    }
  }
  const idx = new Uint16Array((rows - 1) * seg * 6); let q = 0;
  for (let i = 0; i < rows - 1; i++) for (let j = 0; j < seg; j++) {
    const a = i * (seg + 1) + j, b = a + 1, c = a + seg + 1, d = c + 1;
    idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
  }
  return { pos, nor, col, idx };
}
function rrPath(w, h, r, n) { // rounded rectangle centred on 0 in the xy plane, counter-clockwise
  const pts = [], hw = w / 2 - r, hh = h / 2 - r;
  const corners = [[hw, hh, 0], [-hw, hh, Math.PI / 2], [-hw, -hh, Math.PI], [hw, -hh, 1.5 * Math.PI]];
  corners.forEach((c) => { for (let i = 0; i <= n; i++) { const a = c[2] + (Math.PI / 2) * i / n; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), 0]); } });
  return pts;
}
function polyG(pts, z) { // convex polygon as a flat +z fan around its centroid
  const n = pts.length, pos = new Float32Array((n + 1) * 3), nor = new Float32Array((n + 1) * 3), col = new Float32Array((n + 1) * 3).fill(1), idx = new Uint16Array(n * 3);
  let cx = 0, cy = 0; pts.forEach((p) => { cx += p[0]; cy += p[1]; }); cx /= n; cy /= n;
  pos.set([cx, cy, z || 0], 0); nor.set([0, 0, 1], 0);
  pts.forEach((p, i) => { pos.set([p[0], p[1], z || 0], (i + 1) * 3); nor.set([0, 0, 1], (i + 1) * 3); idx.set([0, i + 1, (i + 1) % n + 1], i * 3); });
  return { pos, nor, col, idx };
}
function tint(g, fn) { // per-vertex colour from position
  for (let i = 0; i < g.pos.length / 3; i++) { const c = fn(g.pos[i * 3], g.pos[i * 3 + 1], g.pos[i * 3 + 2]); g.col[i * 3] = c[0]; g.col[i * 3 + 1] = c[1]; g.col[i * 3 + 2] = c[2]; }
  return g;
}
// height of the front surface of a mesh at (x,y): highest z of any triangle covering that point
function frontZ(g, x, y) {
  let best = -9;
  for (let t = 0; t < g.idx.length; t += 3) {
    const ia = g.idx[t] * 3, ib = g.idx[t + 1] * 3, ic = g.idx[t + 2] * 3;
    const ax = g.pos[ia], ay = g.pos[ia + 1], bx = g.pos[ib], by = g.pos[ib + 1], cx = g.pos[ic], cy = g.pos[ic + 1];
    const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy); if (Math.abs(d) < 1e-12) continue;
    const l1 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / d, l2 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / d, l3 = 1 - l1 - l2;
    if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
    const z = l1 * g.pos[ia + 2] + l2 * g.pos[ib + 2] + l3 * g.pos[ic + 2]; if (z > best) best = z;
  }
  return best;
}

/* ---------- shaders ---------- */
const VS = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec3 aCol;
uniform mat4 uModel, uViewProj, uLightVP; uniform mat3 uNormal;
out vec3 vW; out vec3 vN; out vec3 vC; out vec4 vL;
void main(){ vec4 w = uModel*vec4(aPos,1.); vW = w.xyz; vN = normalize(uNormal*aNor); vC = aCol; vL = uLightVP*w; gl_Position = uViewProj*w; }`;
const FS = `#version 300 es
precision highp float; precision highp sampler2DShadow;
in vec3 vW; in vec3 vN; in vec3 vC; in vec4 vL;
uniform vec3 uEye, uColor, uEmis, uKeyDir, uKeyCol, uFillDir, uFillCol, uRimDir, uRimCol, uSky, uGround;
uniform float uAlpha, uSpec, uShin, uRim, uFres, uSss, uUnlit, uSoft, uRecv, uVcol, uClipOn, uExposure, uShadowSize;
uniform vec4 uClip; uniform sampler2DShadow uShadow; uniform sampler2D uTex; uniform float uTexOn;
out vec4 o;
float shadowAt(float ndl){
  vec3 p = vL.xyz / vL.w * .5 + .5;
  if (p.x < 0. || p.x > 1. || p.y < 0. || p.y > 1. || p.z > 1.) return 1.;
  float bias = .0012 + .004 * (1. - clamp(ndl, 0., 1.)); float s = 0.; float tx = 1. / uShadowSize;
  for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) s += texture(uShadow, vec3(p.xy + vec2(float(i), float(j)) * tx * 1.3, p.z - bias));
  return s / 9.;
}
vec3 aces(vec3 c){ return clamp((c * (2.51 * c + .03)) / (c * (2.43 * c + .59) + .14), 0., 1.); }
void main(){
  if (uClipOn > .5 && dot(vec4(vW, 1.), uClip) < 0.) discard;
  vec3 N = normalize(vN), V = normalize(uEye - vW);
  vec3 alb = uColor * mix(vec3(1.), vC, uVcol);
  float tA = 1.;
  if (uTexOn > .5) { vec4 tx = texture(uTex, vC.xy); tA = tx.a; alb = pow(tx.rgb / max(tx.a, .001), vec3(2.2)); }   // premultiplied sRGB decal (the RoundU logo)
  float nv = max(dot(N, V), 0.);
  float alpha = uAlpha * tA; if (uSoft > 0.) alpha *= pow(nv, uSoft);
  vec3 col;
  if (uUnlit > 1.5) { o = vec4(pow(alb + uEmis, vec3(1. / 2.2)) * alpha, alpha); return; }   // flat print: brand colours exactly as drawn
  if (uUnlit > .5) { col = alb + uEmis; }
  else {
    float ndl = dot(N, uKeyDir);
    float sh = uRecv > .5 ? shadowAt(ndl) : 1.;
    float dk = clamp((ndl + .35) / 1.35, 0., 1.);
    float term = smoothstep(0., .45, dk) * (1. - smoothstep(.45, .9, dk));
    vec3 amb = mix(uGround, uSky, N.y * .5 + .5);
    vec3 lightSum = amb + uKeyCol * dk * mix(.0, 1., sh) + uFillCol * max(dot(N, uFillDir), 0.) + vec3(.9, .3, .14) * term * uSss * (.35 + .65 * sh);
    col = alb * lightSum + uEmis;
    vec3 H = normalize(uKeyDir + V);
    col += uKeyCol * pow(max(dot(N, H), 0.), uShin) * uSpec * sh * step(0., ndl);
    vec3 R = reflect(-V, N);
    float soft1 = smoothstep(.84, .97, dot(R, normalize(vec3(-.45, .65, .6)))), soft2 = smoothstep(.9, .985, dot(R, normalize(vec3(.75, .3, .55))));
    float fr = pow(1. - nv, 3.);
    col += (mix(uGround * .7, uSky * 1.6, smoothstep(-.3, .6, R.y)) * (.25 + fr) + (soft1 * 1.1 + soft2 * .5) * uKeyCol) * uFres;
    float rf = pow(1. - nv, 2.2);
    col += uRimCol * rf * clamp(dot(N, uRimDir) + .45, 0., 1.) * uRim;
    col += uFillCol * rf * clamp(-N.x + .2, 0., 1.) * uRim * .35;
    col = aces(col * uExposure);
    col = pow(col, vec3(1. / 2.2));
    o = vec4(col * alpha, alpha); return;
  }
  col = pow(aces(col * uExposure), vec3(1. / 2.2));
  o = vec4(col * alpha, alpha);
}`;
const DVS = `#version 300 es
layout(location=0) in vec3 aPos; uniform mat4 uModel, uLightVP; out vec3 vW;
void main(){ vec4 w = uModel * vec4(aPos, 1.); vW = w.xyz; gl_Position = uLightVP * w; }`;
const DFS = `#version 300 es
precision highp float; in vec3 vW; uniform vec4 uClip; uniform float uClipOn;
void main(){ if (uClipOn > .5 && dot(vec4(vW, 1.), uClip) < 0.) discard; }`;

function compile(gl, vs, fs) {
  const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
  const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}

/* ---------- materials and nodes ---------- */
function mat(o) {
  return Object.assign({ color: [1, 1, 1], emis: [0, 0, 0], alpha: 1, spec: 0, shin: 30, rim: 0, fres: 0, sss: 0, unlit: 0, soft: 0, recv: 1, cast: 1, vcol: 0, clip: 0, tex: 0 }, o);
}
class Node {
  constructor(mesh, m) { this.mesh = mesh || null; this.m = m || null; this.p = [0, 0, 0]; this.r = [0, 0, 0]; this.s = [1, 1, 1]; this.kids = []; this.vis = true; this.world = M4.ident(); }
  add(k) { this.kids.push(k); return k; }
  update(pw) { this.world = M4.mul(pw, M4.compose(this.p, this.r, this.s)); this.kids.forEach((k) => k.update(this.world)); }
}
function gather(n, out) { if (!n.vis) return; if (n.mesh) out.push(n); n.kids.forEach((k) => gather(k, out)); }

function makeMesh(gl, g, dynamic) {
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const bufs = [];
  [[g.pos, 0], [g.nor, 1], [g.col, 2]].forEach((a) => {
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, a[0], dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    gl.enableVertexAttribArray(a[1]); gl.vertexAttribPointer(a[1], 3, gl.FLOAT, false, 0, 0); bufs.push(b);
  });
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.idx, gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return { vao, n: g.idx.length, type: g.idx instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, bufs,
    set(g2) { gl.bindBuffer(gl.ARRAY_BUFFER, bufs[0]); gl.bufferSubData(gl.ARRAY_BUFFER, 0, g2.pos); gl.bindBuffer(gl.ARRAY_BUFFER, bufs[1]); gl.bufferSubData(gl.ARRAY_BUFFER, 0, g2.nor); } };
}
/* ===== the avatar: a Roblox-style 3D head-and-shoulders of Nithish ===== */
const HY = 2.43;

function create(opts) {
  const canvas = opts.canvas; let gl = null;
  try { gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true }); } catch (e) { gl = null; }
  if (!gl) return null;
  let P, DP;
  try { P = compile(gl, VS, FS); DP = compile(gl, DVS, DFS); } catch (e) { if (global.console) console.warn('Avatar3D: ' + e.message); return null; }

  /* ----- the RoundU logo, as a small decal texture (unit 1) ----- */
  const LOGO_SRC = 'data:image/png;base64,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';
  const logoTex = gl.createTexture(); let logoReady = false;
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, logoTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  gl.activeTexture(gl.TEXTURE0);
  gl.useProgram(P.p); gl.uniform1i(P.u.uTex, 1);
  if (typeof Image !== 'undefined') {
    const img = new Image();
    img.onload = () => {
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, logoTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.activeTexture(gl.TEXTURE0); logoReady = true; if (typeof wantEmblem !== 'undefined' && wantEmblem) emblem.vis = true;
    };
    img.src = LOGO_SRC;
  }

  /* ----- shadow map ----- */
  const SS = opts.shadowSize || 1024;
  const stex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, stex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, SS, SS, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
  const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, stex, 0);
  gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
  const shadowOK = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const mesh = (g, dyn) => makeMesh(gl, g, dyn);
  const KD = V3.norm([-0.55, 0.72, 0.8]);
  const LIGHT = {
    key: KD, keyCol: [1.55, 1.4, 1.2], fill: V3.norm([0.7, 0.1, 0.6]), fillCol: [0.2, 0.26, 0.42],
    rimDir: V3.norm([0.85, 0.25, -0.45]), rimCol: [1.0, 0.5, 0.06], sky: [0.5, 0.56, 0.72], ground: [0.3, 0.2, 0.17]
  };
  const lightVP = M4.mul(M4.ortho(-3.7, 3.7, -3.4, 3.4, 2, 22), M4.lookAt([0 + KD[0] * 10, 2.1 + KD[1] * 10, KD[2] * 10], [0, 2.1, 0], [0, 1, 0]));

  /* ----- scene graph ----- */
  const root = new Node();
  const add = (parent, g, m, p, r, s, dyn) => { const n = new Node(mesh(g, dyn), m); if (p) n.p = p; if (r) n.r = r; if (s) n.s = s; parent.add(n); return n; };
  const group = (parent, p, r, s) => { const n = new Node(); if (p) n.p = p; if (r) n.r = r; if (s) n.s = s; parent.add(n); return n; };
  const aim = (n, d) => { d = V3.norm(d); n.r = [Math.atan2(d[2], d[1]), 0, -Math.asin(Math.max(-1, Math.min(1, d[0])))]; };


  const PAL = { skin: '#D9A47E', skinDk: '#C48C67', hair: '#15100E', frame: '#1A2442', tee: '#F4F6FB', teeDk: '#DDE3EF', feat: '#1A1210', inside: '#4A1B1D', tongue: '#D4676A', teeth: '#FAF7F2' };
  const M = {
    skin: mat({ color: lin(PAL.skin), spec: .25, shin: 30, rim: .35, fres: .05, sss: .25 }),
    skinDk: mat({ color: lin(PAL.skinDk), spec: .2, shin: 26, rim: .3, sss: .25 }),
    hair: mat({ color: lin(PAL.hair), spec: .1, shin: 46, rim: .3, fres: .02 }),
    tee: mat({ color: lin(PAL.tee), spec: .08, shin: 16, rim: .7, fres: .04 }),
    teeDk: mat({ color: lin(PAL.teeDk), spec: .06, shin: 14, rim: .5 }),
    feat: mat({ color: lin(PAL.feat), unlit: 1, recv: 0, cast: 0 }),
    inside: mat({ color: lin(PAL.inside), spec: 0, recv: 0, cast: 0 }),
    tongue: mat({ color: lin(PAL.tongue), spec: .2, shin: 30, recv: 0, cast: 0 }),
    teeth: mat({ color: lin(PAL.teeth), spec: .3, shin: 40, recv: 0, cast: 0 }),
    shine: mat({ color: [1, 1, 1], unlit: 1, recv: 0, cast: 0 }),
    blush: mat({ color: lin('#FF7A3A'), alpha: .28, unlit: 1, soft: 1.4, recv: 0, cast: 0 }),
    frame: mat({ color: lin(PAL.frame), spec: .95, shin: 80, rim: .9, fres: .45, cast: 0 }),
    lens: mat({ color: lin('#D6E4FF'), alpha: .10, spec: 1.5, shin: 140, fres: 1.2, recv: 0, cast: 0 }),
    glint: mat({ color: [1, 1, 1], alpha: .4, unlit: 1, recv: 0, cast: 0 }),
    drop: mat({ color: [1, 1, 1], alpha: 0, unlit: 1, recv: 0, cast: 0, soft: .8 }),
    emblem: mat({ color: [1, 1, 1], spec: .12, shin: 20, rim: .3 }),
    cap: mat({ color: lin('#2C3751'), spec: .2, shin: 26, rim: .7, fres: .06 }),
    brim: mat({ color: lin('#E4560A'), spec: .25, shin: 30, rim: .4 }),
    spark: mat({ color: [1, 1, 1], unlit: 1, recv: 0, cast: 0 }),
    cloth: mat({ color: lin('#E9600A'), spec: .05, shin: 10, rim: .12, fres: .02 })
  };
  const CLIP = [0, 1, 0, -99];

  // a soft, rounded block: the building piece of the whole character
  const sg = (w, e) => Math.sign(w) * Math.pow(Math.abs(w), e);
  const rbox = (w, h, d, e) => param((u, v) => {
    const th = 2 * Math.PI * u, ph = Math.PI * v - Math.PI / 2, c = Math.cos(ph), s = Math.sin(ph);
    return [w / 2 * sg(c, e) * sg(Math.cos(th), e), h / 2 * sg(s, e), d / 2 * sg(c, e) * sg(Math.sin(th), e)];
  }, 72, 48);
  const ellipse = (n) => { const p = []; for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n; p.push([Math.cos(a), Math.sin(a)]); } return p; };
  const disc = polyG(ellipse(32), 0);

  const body = group(root);
  const headPivot = group(root, [0, 1.5, 0]);
  const head = group(headPivot, [0, .93, 0]);   // head centre sits at y = 2.43

  /* ----- torso and arms: narrow enough that both arms sit fully inside the frame ----- */
  add(body, rbox(2.5, 2.2, 1.4, .3), M.tee, [0, .4, 0]);
  add(body, rbox(3.1, .55, 1.25, .3), M.tee, [0, 1.22, 0]);               // shoulder bridge: closes the notch between torso and sleeves
  add(body, rbox(1.2, .16, .8, .5), M.teeDk, [0, 1.47, .02]);            // collar line
  const arms = [-1, 1].map((sd) => {
    const g = group(body, [sd * 1.58, 1.3, 0]);
    g.sl = add(g, rbox(.74, .8, .8, .34), M.tee, [0, -.18, 0]);          // sleeve, top level with the shoulder line
    const el = group(g, [0, -.58, 0]);                                   // elbow: the forearm bends here when he waves
    add(el, rbox(.46, .5, .46, .22), M.skin, [0, -.25, 0]);                  // forearm
    const hd = group(el, [0, -.64, 0]);                                  // hand: palm, thumb and a finger line
    add(hd, rbox(.62, .5, .52, .26), M.skin, [0, 0, 0]);
    add(hd, rbox(.22, .36, .28, .12), M.skin, [-sd * .33, .04, .2]);       // thumb on the inner side
    g.el = el; g.hd = hd;
    return g;
  });
  const hand = arms[1];
  const clothG = group(body, [0, 2.5, 1.6]); clothG.vis = false;                         // the polishing cloth: orange with a white stripe
  add(clothG, rbox(1.04, .8, .1, .12), M.cloth);
  add(clothG, rbox(1.04, .1, .12, .04), M.tee, [0, .27, .01]);
  const logoQuad = (w) => ({ pos: new Float32Array([-w / 2, -w / 2, 0, w / 2, -w / 2, 0, w / 2, w / 2, 0, -w / 2, w / 2, 0]), nor: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
    col: new Float32Array([0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0]), idx: new Uint16Array([0, 1, 2, 0, 2, 3]) });
  M.logo = mat({ color: [1, 1, 1], tex: 1, alpha: .998, unlit: 2, recv: 0, cast: 0 });
  const emblem = group(body, [0, .8, .722]); emblem.vis = false;                    // RoundU tee: the real logo on the chest
  add(emblem, logoQuad(1.2), M.logo);
  const hoodie = group(body); hoodie.vis = false;                                    // hoodie: draped hood, strings, pocket
  [-1, 1].forEach((sd) => {
    add(hoodie, rbox(.95, .5, .5, .5), M.teeDk, [sd * .52, 1.2, .62], [0, 0, -sd * .5]);
    add(hoodie, rbox(.075, .5, .075, .8), M.emblem, [sd * .2, .85, .86]);
  });
  add(hoodie, rbox(1.5, .55, .14, .35), M.teeDk, [0, .05, .74]);

  /* ----- head: a rounded block ----- */
  const HHW = 1.0, HHH = .95, HHD = .9;
  add(head, rbox(2.0, 1.9, 1.8, .4), M.skin);

  /* ----- face (flat shapes on the front of the block) ----- */
  const FZ = HHD + .004;
  const eyes = [-1, 1].map((sd) => {
    const g = group(head, [sd * .5, .12, FZ + .004]);
    const e = add(g, disc, M.feat, [0, 0, 0], null, [.13, .2, 1]);
    const sh = add(g, disc, M.shine, [.05, .08, .006], null, [.04, .05, 1]);
    return { g, e, sh, sd };
  });
  const brows = [-1, 1].map((sd) => {
    const g = group(head, [sd * .5, .56, FZ + .01]);
    add(g, rbox(.42, .08, .06, .5), M.feat, [0, 0, 0]);
    return g;
  });
  [-1, 1].forEach((sd) => add(head, disc, M.blush, [sd * .66, -.28, FZ + .002], null, [.2, .12, 1]));

  const noseG = group(head, [0, -.12, FZ + .06]);
  add(noseG, rbox(.24, .28, .2, .45), M.skinDk);

  const MYr = -.52;
  const mouth = group(head, [0, 0, FZ + .006]);
  const cav = add(mouth, disc, M.inside, [0, MYr, .002], null, [.01, .01, 1]);
  const teeth = add(mouth, disc, M.teeth, [0, MYr, .004], null, [.01, .01, 1]);
  const tongue = add(mouth, disc, M.tongue, [0, MYr, .004], null, [.01, .01, 1]);
  function lipLineGeo(s, t) {
    const pts = []; for (let i = 0; i <= 16; i++) {
      const u = -1 + 2 * i / 16, x = u * s.mw, y = s.cy + s.mup * u * u + s.masym * u + s.wob * Math.sin(u * 7 + t * 16) * (1 - u * u * .5);
      pts.push([x, y, .008]);
    }
    return sweepG(pts, false, .02, .03, [0, 1, 0], 6, (q) => .55 + .45 * Math.sin(Math.PI * q));
  }
  const lineN = add(mouth, lipLineGeo({ mw: .3, mup: .1, masym: 0, cy: MYr, wob: 0 }, 0), M.feat, null, null, null, true);

  /* ----- glasses: large rounded navy frames ----- */
  const GZ = FZ + .12, LX = .5, LY = .12;
  const glassG = group(head);
  const lensPts = (a, b) => { const out = [], N = 48; for (let i = 0; i < N; i++) { const t = 2 * Math.PI * i / N, c = Math.cos(t), sn = Math.sin(t); out.push([a * Math.sign(c) * Math.pow(Math.abs(c), .7), b * Math.sign(sn) * Math.pow(Math.abs(sn), .7) * (sn > 0 ? .92 : 1.04), 0]); } return out; };
  const lensPath = lensPts(.43, .35), inner = lensPts(.39, .31);
  [-1, 1].forEach((sd) => {
    const g = group(glassG, [sd * LX, LY, GZ]);
    add(g, sweepG(lensPath, true, .036, .05, [0, 0, 1], 10), M.frame);
    add(g, polyG(inner, -.01), M.lens);
    add(g, polyG([[-.28, .12], [-.2, .12], [-.04, .26], [-.12, .26]], .005), M.glint);
    add(g, polyG([[-.32, .02], [-.29, .02], [-.22, .08], [-.25, .08]], .005), M.glint);
    add(glassG, sweepG(catmull([[sd * (LX + .43), LY, GZ - .02], [sd * 1.03, LY, GZ - .2], [sd * 1.05, LY, .3], [sd * 1.05, LY - .02, -.4]], 6, false), false, .03, .03, [0, 1, 0], 8), M.frame);
  });
  add(glassG, sweepG(catmull([[-.09, LY + .02, GZ], [-.055, LY + .14, GZ], [0, LY + .18, GZ], [.055, LY + .14, GZ], [.09, LY + .02, GZ]], 6, false), false, .03, .04, [0, 0, 1], 8), M.frame);

  const starPts = []; for (let i = 0; i < 8; i++) { const a2 = Math.PI * i / 4 + Math.PI / 2, r = i % 2 ? .06 : .2; starPts.push([Math.cos(a2) * r, Math.sin(a2) * r]); }
  const sparks = [[-.26, LY + .27, GZ + .14], [.74, LY + .27, GZ + .14]].map((q) => { const n = add(glassG, polyG(starPts, 0), M.spark, q, null, [.01, .01, 1]); n.vis = false; return n; });

  /* ----- hair: chunky black blocks, swept fringe ----- */
  const hairG = group(head);
  add(hairG, rbox(2.18, .7, 1.98, .38), M.hair, [0, .98, -.02]);
  add(hairG, rbox(2.12, 1.6, .6, .38), M.hair, [0, .28, -.84]);
  [-1, 1].forEach((sd) => add(hairG, rbox(.3, 1.0, 1.5, .38), M.hair, [sd * 1.0, .5, -.08]));
  add(hairG, rbox(2.08, .4, .5, .4), M.hair, [0, .86, .84], [0, 0, -.08]);                // fringe
  add(hairG, rbox(.8, .34, .5, .4), M.hair, [-.55, .74, .98], [0, 0, .18]);               // swept lock
  const tufts = [[.62, .6, .6, [.45, 1.38, .25], -.35], [.58, .56, .56, [-.2, 1.42, .3], -.12], [.54, .5, .54, [-.75, 1.28, .2], .25]].map((q) => ({ n: add(hairG, rbox(q[0], q[1], q[2], .4), M.hair, q[3], [0, 0, q[4]]), z: q[4], y: q[3][1] }));


  /* ----- cap (hidden until worn) ----- */
  const capG = group(head); capG.vis = false;
  add(capG, rbox(2.26, 1.0, 2.2, .62), M.cap, [0, 1.22, -.04]);
  add(capG, rbox(1.5, .12, 1.1, .6), M.brim, [0, .9, 1.34], [.16, 0, 0]);
  add(capG, disc, M.emblem, [0, 1.34, 1.085], null, [.2, .2, 1]);
  add(capG, logoQuad(.33), M.logo, [0, 1.34, 1.1]);

  /* ----- sneeze droplets ----- */
  const dropG = sphereG(1, 10, 7), drops = [];
  for (let i = 0; i < 18; i++) { const n = add(root, dropG, Object.assign({}, M.drop), [0, -9, 0], null, [.05, .05, .05]); n.vis = false; drops.push({ n, v: [0, 0, 0], life: 0, max: 1 }); }

  /* ----- animation state ----- */
  const cur = { ey: 1, er: 0, bL: [0, 0], bR: [0, 0], mw: .3, mup: .1, masym: 0, wob: 0, ow: .01, oh: .01, cy: MYr, tooth: 0, tong: 0, hand: 0, tilt: 0, nose: 0 };
  const tgt = JSON.parse(JSON.stringify(cur));
  const EYE = { open: [1, 0], squint: [.42, 0], scrunch: [.2, 12], closed: [.07, 0] };
  const BROW = { idle: [[0, 0], [0, 0]], curious: [[.1, 8], [-.03, -5]], focused: [[-.04, -10], [-.04, 10]], raised: [[.09, 0], [.09, 0]], scrunch: [[-.07, -14], [-.07, 14]], pinch: [[-.1, -18], [-.1, 18]] };
  const MOUTH = {
    smile: { mw: .3, mup: .1, masym: 0, wob: 0, ow: .01, oh: .01, tooth: 0, tong: 0, cy: MYr },
    small: { mw: .2, mup: .04, masym: .02, wob: 0, ow: .01, oh: .01, tooth: 0, tong: 0, cy: MYr },
    flat: { mw: .2, mup: 0, masym: 0, wob: 0, ow: .01, oh: .01, tooth: 0, tong: 0, cy: MYr },
    grin: { mw: .2, mup: 0, masym: 0, wob: 0, ow: .34, oh: .16, tooth: 1, tong: .35, cy: MYr },
    open: { mw: .2, mup: 0, masym: 0, wob: 0, ow: .24, oh: .25, tooth: 1, tong: 1, cy: MYr - .03 },
    wobble: { mw: .26, mup: 0, masym: 0, wob: .03, ow: .01, oh: .01, tooth: 0, tong: 0, cy: MYr },
    yawn: { mw: .16, mup: 0, masym: 0, wob: 0, ow: .17, oh: .34, tooth: 0, tong: 1, cy: MYr - .05 }
  };
  const look = { x: 0, y: 0, tx: 0, ty: 0 }, turn = { x: 0, y: 0, roll: 0 };
  const A = { clean: -1, bounce: -1, spin: -1, nod: -1, pop: -1 }, DUR = { clean: 3.8, bounce: 1.3, spin: 1.15, nod: .7, pop: .5 };
  let leanT = 0, leanC = 0, outfitN = 0, wantEmblem = false;
  const OUTFITS = [
    { tee: '#F4F6FB', dk: '#DDE3EF' },
    { tee: '#F4F6FB', dk: '#DDE3EF', emblem: 1 },
    { tee: '#2E3A57', dk: '#232D45', hoodie: 1 },
    { tee: '#F4F6FB', dk: '#DDE3EF', cap: 1 }
  ];
  function setOutfit(i) {
    outfitN = ((i % OUTFITS.length) + OUTFITS.length) % OUTFITS.length; const o = OUTFITS[outfitN];
    M.tee.color = lin(o.tee); M.teeDk.color = lin(o.dk);
    emblem.vis = !!o.emblem && logoReady; wantEmblem = !!o.emblem; hoodie.vis = !!o.hoodie; capG.vis = !!o.cap; tufts.forEach((t) => { t.n.vis = !o.cap; });
    return outfitN;
  }
  const ease = (x) => x * x * (3 - 2 * x);
  /* small vector helpers and a two-bone solver so a hand can reach the glasses */
  const v3 = { sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len: (a) => Math.hypot(a[0], a[1], a[2]) };
  v3.norm = (a) => v3.mul(a, 1 / (v3.len(a) || 1));
  const aimDown = (u) => { const s2 = Math.hypot(u[0], u[2]); return [Math.atan2(-s2, -u[1]), Math.atan2(u[0], u[2]), 0]; };   // rx, ry that turn "down" into u
  const rotM = (r) => { const cx = Math.cos(r[0]), sx = Math.sin(r[0]), cy = Math.cos(r[1]), sy = Math.sin(r[1]), cz = Math.cos(r[2]), sz = Math.sin(r[2]);
    const a = [[cz, -sz, 0], [cx * sz, cx * cz, -sx], [sx * sz, sx * cz, cx]];
    return [[cy * a[0][0] + sy * a[2][0], cy * a[0][1] + sy * a[2][1], cy * a[0][2] + sy * a[2][2]], a[1], [-sy * a[0][0] + cy * a[2][0], -sy * a[0][1] + cy * a[2][1], -sy * a[0][2] + cy * a[2][2]]]; };
  const mulR = (R, v) => [R[0][0] * v[0] + R[0][1] * v[1] + R[0][2] * v[2], R[1][0] * v[0] + R[1][1] * v[1] + R[1][2] * v[2], R[2][0] * v[0] + R[2][1] * v[1] + R[2][2] * v[2]];
  const mulT = (R, v) => [R[0][0] * v[0] + R[1][0] * v[1] + R[2][0] * v[2], R[0][1] * v[0] + R[1][1] * v[1] + R[2][1] * v[2], R[0][2] * v[0] + R[1][2] * v[1] + R[2][2] * v[2]];
  const solve2 = (P, T, L1, L2, pole) => {
    const d = v3.sub(T, P), dh = v3.norm(d), dist = Math.min(v3.len(d), (L1 + L2) * .995), a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const n = v3.norm(v3.sub(pole, v3.mul(dh, v3.dot(pole, dh)))), E = v3.add(v3.add(P, v3.mul(dh, a)), v3.mul(n, hh)), H = v3.add(P, v3.mul(dh, dist));
    return { u: v3.norm(v3.sub(E, P)), f: v3.norm(v3.sub(H, E)), hand: H };
  };
  let snap = 0, blinkT = 2.5, blinkP = -1, noseTw = 0;
  function setState(s) {
    const e = EYE[s.eye] || EYE.open; tgt.ey = e[0]; tgt.er = e[1];
    const b = BROW[s.brow] || BROW.idle; tgt.bL = b[0].slice(); tgt.bR = b[1].slice();
    Object.assign(tgt, MOUTH[s.mouth] || MOUTH.smile);
    tgt.hand = s.hand ? 1 : 0; tgt.tilt = s.tilt || 0; tgt.nose = s.nose === 'twitch' ? 1 : 0;
  }
  setState({ eye: 'open', mouth: 'smile', brow: 'idle', tilt: 0 });
  Object.keys(tgt).forEach((k) => { cur[k] = Array.isArray(tgt[k]) ? tgt[k].slice() : tgt[k]; });

  /* ----- per-frame ----- */
  const camY = 2.2, viewH = 2.6, camD = 14, fov = 2 * Math.atan(viewH / camD), eye = [0, camY, camD];   // frame runs from y = -0.4 (room for long arms) up past the hair
  let W = 0, H = 0, last = 0, running = true, onNose = opts.onNose || null;
  function resize() {
    const d = Math.min(opts.maxDpr || 2, global.devicePixelRatio || 1), cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (!cw || !ch) return false;
    const w = Math.round(cw * d), h = Math.round(ch * d);
    if (w !== W || h !== H) { W = w; H = h; canvas.width = w; canvas.height = h; }
    return true;
  }
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function step(dt, t) {
    const k = 1 - Math.exp(-dt * 13);
    ['ey', 'er', 'mw', 'mup', 'masym', 'wob', 'ow', 'oh', 'cy', 'tooth', 'tong', 'hand', 'tilt', 'nose'].forEach((key) => { cur[key] = lerp(cur[key], tgt[key], key === 'ey' ? 1 - Math.exp(-dt * 20) : k); });
    cur.bL = [lerp(cur.bL[0], tgt.bL[0], k), lerp(cur.bL[1], tgt.bL[1], k)]; cur.bR = [lerp(cur.bR[0], tgt.bR[0], k), lerp(cur.bR[1], tgt.bR[1], k)];
    blinkT -= dt; if (blinkT < 0 && blinkP < 0 && tgt.ey > .9) blinkP = 0;
    let ey = cur.ey;
    if (blinkP >= 0) { blinkP += dt / .16; if (blinkP >= 1) { blinkP = -1; blinkT = 2.2 + Math.random() * 3.2; } else ey = lerp(cur.ey, .06, Math.sin(Math.PI * blinkP)); }
    look.x = lerp(look.x, look.tx, 1 - Math.exp(-dt * 14)); look.y = lerp(look.y, look.ty, 1 - Math.exp(-dt * 14));
    snap = Math.max(0, snap - dt * 1.6);
    const sn = Math.sin(snap * Math.PI) * snap;
    const br = Math.sin(t * 1.3) * .03;
    Object.keys(A).forEach((k) => { if (A[k] >= 0) { A[k] += dt / DUR[k]; if (A[k] >= 1) A[k] = -1; } });
    leanC = lerp(leanC, leanT, 1 - Math.exp(-dt * 7));
    const spinA = A.spin >= 0 ? ease(A.spin) * Math.PI * 2 : 0, hop = A.spin >= 0 ? Math.sin(Math.PI * A.spin) * .28 : 0;
    const nodA = A.nod >= 0 ? Math.sin(Math.PI * 2 * A.nod) * (1 - A.nod) * .3 : 0;
    const pop = A.pop >= 0 ? 1 + Math.sin(Math.PI * A.pop) * .06 : 1;
    body.p = [-turn.x * .08, br + hop, leanC * .12]; body.s = [pop, pop * (1 + Math.sin(t * 1.3) * .004), pop]; body.r = [0, spinA, 0];
    headPivot.p = [-turn.x * .04, 1.5 + br * 1.2 - sn * .12 - leanC * .05 + hop, sn * .1 + leanC * .34];
    headPivot.r = [turn.y * .15 + .02 * Math.sin(t * .7) + sn * .5 + nodA + leanC * .1, turn.x * .34 + .015 * Math.sin(t * .5) + spinA, -(cur.tilt * Math.PI / 180) * .8 - turn.roll * Math.PI / 180];
    // arms: at rest unless a wave or the glasses polish is driving them
    arms.forEach((g, i) => { const sd = i ? 1 : -1; g.p = [sd * 1.58, 1.3, 0]; g.r = [0, 0, 0]; g.sl.p = [0, -.18, 0]; g.sl.s = [1, 1, 1]; g.el.p = [0, -.58, 0]; g.el.r = [0, 0, 0]; });
    const hv = cur.hand; hand.p[0] = 1.58 - .2 * hv; hand.r = [0, 0, hv * 2.85]; hand.el.r = [0, 0, hv * (.29 + Math.sin(t * 6.5) * .28)];
    // glasses: he takes a cloth and polishes the right lens, then the left, and they sparkle at the end
    if (A.clean >= 0) {
      const q = A.clean, SY = 1.4, L1 = .58 * SY, L2 = .64;
      const wR = q < .07 ? ease(q / .07) : q < .5 ? 1 : q < .58 ? 1 - ease((q - .5) / .08) : 0;
      const wL = q < .46 ? 0 : q < .54 ? ease((q - .46) / .08) : q < .88 ? 1 : 1 - ease((q - .88) / .1);
      const Rh = rotM(headPivot.r), hp = headPivot.p, bp = body.p;
      const wipe = (sd, w, ph) => {
        const sw = Math.sin(ph * Math.PI * 12), sy = 1 + (SY - 1) * w;
        const lens = mulR(Rh, [sd * (.5 + .27 * sw), .93 + .08 + .05 * Math.cos(ph * Math.PI * 12), 1.52]);          // palm sits just in front of the lens
        const T = [hp[0] + lens[0] - bp[0], hp[1] + lens[1] - bp[1], hp[2] + lens[2] - bp[2]], P = [sd * 1.1, 1.4, .78];
        const sol = solve2(P, T, L1, L2, [sd * .7, -.7, .2]), ru = aimDown(sol.u), er = aimDown(mulT(rotM(ru), sol.f)), g = arms[sd > 0 ? 1 : 0];
        g.p = [lerp(sd * 1.58, P[0], w), lerp(1.3, P[1], w), lerp(0, P[2], w)];
        g.r = [ru[0] * w, ru[1] * w, 0]; g.el.p = [0, -.58 * sy, 0]; g.el.r = [er[0] * w, er[1] * w, 0];
        const h = (.22 + .58 * sy) / .8; g.sl.s = [1, h, 1]; g.sl.p = [0, .22 - h * .4, 0];
        return { T, sw, lens };
      };
      let c1 = null, c2 = null;
      if (wR > 0) c1 = wipe(1, wR, clamp((q - .07) / .43, 0, 1));
      if (wL > 0) c2 = wipe(-1, wL, clamp((q - .54) / .34, 0, 1));
      const use = wL > wR ? c2 : c1, kk = wL > wR ? wL : wR;
      if (use) {
        const sd = use === c1 ? 1 : -1, cs = clamp((kk - .25) / .6, 0, 1);                                   // the cloth rides along with the hand as it lifts and lowers
        clothG.vis = cs > .03; clothG.p = [lerp(sd * 1.58, use.T[0], kk), lerp(.1, use.T[1] - .03, kk), lerp(.3, use.T[2] - .3, kk)]; clothG.r = [0, 0, use.sw * .2]; clothG.s = [cs, cs, cs];
      } else clothG.vis = false;
      const wig = (wR > .6 || wL > .6) ? Math.sin(t * 34) * .014 : 0;
      glassG.p = [wig, 0, 0]; glassG.r = [0, 0, wig * 1.5];
      const sp = q > .86 ? Math.sin(Math.PI * Math.min(1, (q - .86) / .14)) : 0;
      sparks.forEach((n, i) => { n.vis = sp > .02; const k = sp * (i ? 1.1 : 1.4); n.s = [k, k, 1]; n.r = [0, 0, q * 5 * (i ? -1 : 1)]; });
    } else { clothG.vis = false; glassG.p = [0, 0, 0]; glassG.r = [0, 0, 0]; sparks.forEach((n) => { n.vis = false; }); }
    // hair: a springy bounce
    if (A.bounce >= 0) {
      const q = A.bounce, env = Math.pow(1 - q, 1.4), w = Math.sin(q * Math.PI * 5);
      hairG.p = [0, Math.abs(w) * .16 * env, 0]; hairG.s = [1 - w * .02 * env, 1 + w * .06 * env, 1 - w * .02 * env];
      tufts.forEach((tf, i) => { tf.n.r = [0, 0, tf.z + Math.sin(q * 30 + i * 1.7) * .42 * env]; });
    } else { hairG.p = [0, 0, 0]; hairG.s = [1, 1, 1]; tufts.forEach((tf) => { tf.n.r = [0, 0, tf.z]; }); }
    eyes.forEach((e) => {
      e.g.p[0] = e.sd * .5 + look.x * .07; e.g.p[1] = .12 - look.y * .05;
      e.e.s = [.13 * (1 + (1 - ey) * .25), Math.max(.012, .2 * ey), 1]; e.e.r = [0, 0, -e.sd * cur.er * Math.PI / 180];
      e.sh.vis = ey > .55;
    });
    [brows[0], brows[1]].forEach((b, i) => { const v = i === 0 ? cur.bL : cur.bR, sd = i === 0 ? -1 : 1; b.p = [sd * .5, .56 + v[0] * .6, FZ + .01]; b.r = [0, 0, -sd * v[1] * Math.PI / 180]; });
    noseTw = cur.nose > .5 ? Math.sin(t * 38) : 0; noseG.p[0] = noseTw * .015 * cur.nose; const ns = 1 + cur.nose * .06 + noseTw * .04 * cur.nose; noseG.s = [ns, ns, ns];
    const showLine = cur.oh < .06;
    lineN.vis = showLine; if (showLine || cur.oh < .12) lineN.mesh.set(lipLineGeo(cur, t));
    const hasOpen = cur.oh > .03 && cur.ow > .03;
    [cav, teeth, tongue].forEach((n) => { n.vis = hasOpen; });
    if (hasOpen) {
      const ow = cur.ow, oh = cur.oh;
      cav.p = [0, cur.cy, .002]; cav.s = [ow, oh, 1];
      const th = Math.max(.01, cur.tooth); teeth.vis = cur.tooth > .05; teeth.p = [0, cur.cy + oh * .55, .004]; teeth.s = [ow * .82, oh * .32 * th, 1];
      const tg = Math.max(.01, cur.tong); tongue.vis = cur.tong > .05; tongue.p = [0, cur.cy - oh * .55, .004]; tongue.s = [ow * .6 * Math.min(1, tg + .2), oh * .38 * tg, 1];
    }
    drops.forEach((d) => {
      if (d.life <= 0) { d.n.vis = false; return; }
      d.life -= dt; d.v[1] -= dt * 1.6; d.n.p = [d.n.p[0] + d.v[0] * dt, d.n.p[1] + d.v[1] * dt, d.n.p[2] + d.v[2] * dt];
      const f = Math.max(0, d.life / d.max); d.n.vis = f > 0; d.n.m.alpha = Math.min(.85, f * 1.4); const sc = d.sz * (1.3 - f * .3); d.n.s = [sc, sc, sc];
    });
    root.update(M4.ident());
  }

  /* ----- drawing ----- */
  function setMat(U, m, sh) {
    const g = (n, a, b, c) => { if (U[n] != null) gl.uniform3f(U[n], a, b, c); };
    gl.uniform3f(U.uColor, m.color[0], m.color[1], m.color[2]); gl.uniform3f(U.uEmis, m.emis[0], m.emis[1], m.emis[2]);
    gl.uniform1f(U.uAlpha, m.alpha); gl.uniform1f(U.uSpec, m.spec); gl.uniform1f(U.uShin, m.shin); gl.uniform1f(U.uRim, m.rim); gl.uniform1f(U.uFres, m.fres);
    gl.uniform1f(U.uSss, m.sss); gl.uniform1f(U.uUnlit, m.unlit); gl.uniform1f(U.uSoft, m.soft); gl.uniform1f(U.uRecv, shadowOK ? m.recv : 0); gl.uniform1f(U.uVcol, m.vcol); gl.uniform1f(U.uClipOn, m.clip); gl.uniform1f(U.uTexOn, m.tex || 0);
  }
  function render() {
    const list = []; gather(root, list);
    const opaque = list.filter((n) => n.m.alpha >= .999), clear = list.filter((n) => n.m.alpha < .999);
    // shadow pass
    if (shadowOK) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, SS, SS); gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.useProgram(DP.p); gl.uniformMatrix4fv(DP.u.uLightVP, false, lightVP); gl.uniform4f(DP.u.uClip, CLIP[0], CLIP[1], CLIP[2], CLIP[3]);
      gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 3);
      opaque.forEach((n) => { if (!n.m.cast) return; gl.uniformMatrix4fv(DP.u.uModel, false, n.world); gl.uniform1f(DP.u.uClipOn, n.m.clip); gl.bindVertexArray(n.mesh.vao); gl.drawElements(gl.TRIANGLES, n.mesh.n, n.mesh.type, 0); });
      gl.disable(gl.POLYGON_OFFSET_FILL); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(P.p);
    const U = P.u, proj = M4.persp(fov, W / H, 4, 40), view = M4.lookAt(eye, [0, camY, 0], [0, 1, 0]), vp = M4.mul(proj, view);
    gl.uniformMatrix4fv(U.uViewProj, false, vp); gl.uniformMatrix4fv(U.uLightVP, false, lightVP);
    gl.uniform3f(U.uEye, eye[0], eye[1], eye[2]);
    gl.uniform3fv(U.uKeyDir, LIGHT.key); gl.uniform3fv(U.uKeyCol, LIGHT.keyCol); gl.uniform3fv(U.uFillDir, LIGHT.fill); gl.uniform3fv(U.uFillCol, LIGHT.fillCol);
    gl.uniform3fv(U.uRimDir, LIGHT.rimDir); gl.uniform3fv(U.uRimCol, LIGHT.rimCol); gl.uniform3fv(U.uSky, LIGHT.sky); gl.uniform3fv(U.uGround, LIGHT.ground);
    gl.uniform4f(U.uClip, CLIP[0], CLIP[1], CLIP[2], CLIP[3]); gl.uniform1f(U.uExposure, opts.exposure || .95); gl.uniform1f(U.uShadowSize, SS);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, logoTex); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, stex); gl.uniform1i(U.uShadow, 0); gl.uniform1i(U.uTex, 1);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND);
    const draw = (n) => { gl.uniformMatrix4fv(U.uModel, false, n.world); gl.uniformMatrix3fv(U.uNormal, false, M4.normalMat(n.world)); setMat(U, n.m); gl.bindVertexArray(n.mesh.vao); gl.drawElements(gl.TRIANGLES, n.mesh.n, n.mesh.type, 0); };
    opaque.forEach(draw);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    clear.sort((a, b) => (b.world[14] - a.world[14]) * -1 + 0).forEach(draw);
    gl.depthMask(true); gl.bindVertexArray(null);
    // where is the nose on screen? (for the click target)
    if (onNose) {
      const p = [noseG.world[12], noseG.world[13] + .0, noseG.world[14] + .22];
      const cx = vp[0] * p[0] + vp[4] * p[1] + vp[8] * p[2] + vp[12], cy = vp[1] * p[0] + vp[5] * p[1] + vp[9] * p[2] + vp[13], cw = vp[3] * p[0] + vp[7] * p[1] + vp[11] * p[2] + vp[15];
      const sx = (cx / cw * .5 + .5) * canvas.clientWidth, sy = (1 - (cy / cw * .5 + .5)) * canvas.clientHeight;
      const pxPerUnit = canvas.clientHeight / (2 * viewH * (camD - p[2]) / camD);
      onNose(sx, sy, .42 * pxPerUnit);
    }
  }
  let t0 = 0, raf = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden || !running) return;
    if (!t0) t0 = now; const t = (now - t0) / 1000, dt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now;
    if (!resize()) return;
    step(dt, t); render();
  }
  raf = requestAnimationFrame(frame);

  return {
    ok: true, setState,
    look(x, y) { look.tx = Math.max(-1.2, Math.min(1.2, x)); look.ty = Math.max(-1.2, Math.min(1.2, y)); },
    turn(x, y, roll) { turn.x = x; turn.y = y; turn.roll = roll || 0; },
    sneezeFx() {
      snap = 1;
      const mp = [0, HY - .55, 1.3]; let c = 0;
      drops.forEach((d) => {
        if (c++ > 15) return; const a = (Math.random() - .5) * 1.6, up = (Math.random() - .6) * .8;
        d.n.p = [mp[0] + (Math.random() - .5) * .2, mp[1] + .1 + Math.random() * .1, mp[2]]; d.v = [Math.sin(a) * 2.2, up * 1.2 + .2, 2.4 + Math.random() * 2.2];
        d.sz = .035 + Math.random() * .05; d.max = d.life = .7 + Math.random() * .5; d.n.vis = true;
      });
    },
    poke() { noseTw = 1; },
    act(name) { if (name in A) A[name] = 0; },
    lean(v) { leanT = Math.max(0, Math.min(1, v || 0)); },
    outfit(i) { const n = setOutfit(i == null ? outfitN + 1 : i); A.pop = 0; return n; },
    outfitCount: OUTFITS.length,
    pause(v) { running = !v; },
    advance(sec) { for (let k = 0; k < Math.round(sec / .016); k++) step(.016, k * .016); },
    frameOnce(t) { if (!resize()) return; step(.016, t || 0); render(); },
    destroy() { cancelAnimationFrame(raf); }
  };
}
global.Avatar3D = { create: create };
})(window);
