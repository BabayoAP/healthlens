// Run after build-body.mjs: reshapes body-female.glb to a slimmer, lithe build (narrow waist, flat belly,
// slimmer arms and thighs, hips kept). Same warp for skin, organs and bones. Needs the same packages as build-body.mjs.
//   node slim-female.mjs <repo>/app/public/models/body-female.glb <repo>/app/public/models/body-female.glb
// Reshapes body-female.glb to a slimmer, more lithe build. Same warp for skin, organs and bones.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { dequantize, quantize, reorder, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const [inp, out, amt = '1'] = process.argv.slice(2); const A = +amt;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(inp);
await doc.transform(dequantize());

const F = { chin: 1.42, crotch: 0.79, handBottom: 0.55, shoulderTop: 1.3, deltoidX: 0.15,
  armX: [[0.6, 0.33], [0.7, 0.3], [0.85, 0.26], [1.0, 0.185], [1.05, 0.175], [1.1, 0.165], [2, 0.165]] };
const lerpK = (k, y) => { if (y <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) { const [y0, a] = k[i - 1], [y1, b] = k[i]; if (y <= y1) { const t = (y - y0) / (y1 - y0), s = t * t * (3 - 2 * t); return a + s * (b - a); } } return k[k.length - 1][1]; };
const part = (x, y) => { const ax = Math.abs(x);
  if (y >= 1.5) return 'head';
  if (y > F.handBottom && (ax > lerpK(F.armX, y) || (y > F.shoulderTop && ax > F.deltoidX))) return x >= 0 ? 'armL' : 'armR';
  if (y < F.crotch) return x >= 0 ? 'legL' : 'legR';
  return 'torso'; };
const amtK = (k) => k.map(([y, f]) => [y, 1 - A * (1 - f)]);
// Torso: [height, side-to-side, front, back] scale about the slice center
const TX = amtK([[0.79, 0.92], [0.9, 0.94], [1.0, 0.78], [1.06, 0.78], [1.15, 0.88], [1.28, 0.9], [1.36, 0.93], [1.42, 0.9], [1.5, 1]]);
const TF = amtK([[0.79, 0.86], [0.9, 0.76], [1.0, 0.64], [1.06, 0.66], [1.15, 0.8], [1.28, 0.88], [1.36, 0.92], [1.42, 0.9], [1.5, 1]]);
const TB = amtK([[0.79, 0.97], [0.9, 0.95], [1.0, 0.9], [1.1, 0.9], [1.28, 0.93], [1.42, 0.92], [1.5, 1]]);
const ARM = amtK([[0.6, 1], [0.74, 1], [0.82, 0.88], [0.95, 0.84], [1.15, 0.8], [1.3, 0.86], [1.42, 0.95]]);
const LEG = amtK([[0, 1], [0.1, 1], [0.2, 0.92], [0.35, 0.88], [0.48, 0.9], [0.6, 0.8], [0.72, 0.78], [0.79, 0.86]]);

// World positions of every mesh
const nodes = doc.getRoot().listNodes().filter((n) => n.getMesh());
const meshes = nodes.map((n) => { const M = n.getWorldMatrix(); const p = n.getMesh().listPrimitives()[0].getAttribute('POSITION'); const v = [0, 0, 0];
  const pos = new Float32Array(p.getCount() * 3);
  for (let i = 0; i < p.getCount(); i++) { p.getElement(i, v); for (let r = 0; r < 3; r++) pos[i * 3 + r] = M[r] * v[0] + M[4 + r] * v[1] + M[8 + r] * v[2] + M[12 + r]; }
  return { n, p, pos, idx: n.getMesh().listPrimitives()[0].getIndices()?.getArray() }; });
const skin = meshes.find((m) => m.n.getName() === 'skin');

// Slice centers (from the original skin) per part and 1 cm of height, smoothed
const B = 0.01, NB = 200;
const centers = {};
for (const key of ['torso', 'armL', 'armR', 'legL', 'legR']) centers[key] = { x: Array.from({ length: NB }, () => [9, -9]), z: Array.from({ length: NB }, () => [9, -9]) };
for (let i = 0; i < skin.pos.length; i += 3) { const [x, y, z] = [skin.pos[i], skin.pos[i + 1], skin.pos[i + 2]]; const k = part(x, y); if (k === 'head') continue;
  const b = Math.min(NB - 1, Math.max(0, Math.floor(y / B))); const c = centers[k];
  c.x[b][0] = Math.min(c.x[b][0], x); c.x[b][1] = Math.max(c.x[b][1], x); c.z[b][0] = Math.min(c.z[b][0], z); c.z[b][1] = Math.max(c.z[b][1], z); }
for (const c of Object.values(centers)) for (const ax of ['x', 'z']) { const raw = c[ax].map(([a, b]) => (a <= b ? (a + b) / 2 : NaN));
  // fill gaps, then smooth over +-4 cm
  let last = NaN; for (let i = 0; i < NB; i++) { if (isNaN(raw[i])) raw[i] = last; else last = raw[i]; } last = NaN; for (let i = NB - 1; i >= 0; i--) { if (isNaN(raw[i])) raw[i] = last; else last = raw[i]; }
  c[ax] = raw.map((_, i) => { let s = 0, n = 0; for (let j = Math.max(0, i - 4); j <= Math.min(NB - 1, i + 4); j++) if (!isNaN(raw[j])) { s += raw[j]; n++; } return n ? s / n : 0; }); }
const at = (arr, y) => { const f = Math.min(NB - 1.001, Math.max(0, y / B - 0.5)); const i = Math.floor(f), t = f - i; return arr[i] * (1 - t) + arr[i + 1] * t; };

const sm = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
function torsoT(x, y, z) { const cz = at(centers.torso.z, y); const w = sm(-0.04, 0.04, z - cz); const sz = w * lerpK(TF, y) + (1 - w) * lerpK(TB, y);
  return [x * lerpK(TX, y), y, cz + (z - cz) * sz]; }
function limbT(key, K, x, y, z) { const c = centers[key], cx = at(c.x, y), cz = at(c.z, y), s = lerpK(K, y); return [cx + (x - cx) * s, y, cz + (z - cz) * s]; }
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function target(x, y, z) {
  if (y >= 1.5) return [x, y, z];
  const ax = Math.abs(x), L = x >= 0 ? 'L' : 'R';
  let t = torsoT(x, y, z);
  // torso <-> legs across the crotch
  if (y < 0.86) t = mix(limbT('leg' + L, LEG, x, y, z), t, sm(0.73, 0.86, y));
  // torso <-> arm across the arm boundary and over the shoulder
  if (y > F.handBottom) { const b = lerpK(F.armX, y); let w = sm(b - 0.025, b + 0.025, ax);
    if (y > F.shoulderTop - 0.03) w = Math.max(w, sm(F.deltoidX - 0.025, F.deltoidX + 0.025, ax) * sm(F.shoulderTop - 0.03, F.shoulderTop + 0.03, y));
    if (w > 0) t = mix(t, limbT('arm' + L, ARM, x, y, z), w); }
  return t;
}

for (const m of meshes) {
  const d = new Float32Array(m.pos.length);
  for (let i = 0; i < m.pos.length; i += 3) { const t = target(m.pos[i], m.pos[i + 1], m.pos[i + 2]); for (let r = 0; r < 3; r++) d[i + r] = t[r] - m.pos[i + r]; }
  if (m === skin) { // smooth the displacement over the surface so part borders leave no seams
    const nv = m.pos.length / 3, nb = Array.from({ length: nv }, () => new Set());
    for (let i = 0; i < m.idx.length; i += 3) { const [a, b, c] = [m.idx[i], m.idx[i + 1], m.idx[i + 2]]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
    for (let it = 0; it < 20; it++) { const nd = new Float32Array(d); for (let v = 0; v < nv; v++) { if (!nb[v].size) continue; for (let r = 0; r < 3; r++) { let s = 0; for (const u of nb[v]) s += d[u * 3 + r]; nd[v * 3 + r] = 0.5 * d[v * 3 + r] + 0.5 * s / nb[v].size; } } d.set(nd); }
  }
  for (let i = 0; i < m.pos.length; i++) m.pos[i] += d[i];
  if (m === skin) { // Taubin smoothing over the front of the torso: removes the old belly fold ledge
    const nv = m.pos.length / 3, nb = Array.from({ length: nv }, () => new Set());
    for (let i = 0; i < m.idx.length; i += 3) { const [a, b, c] = [m.idx[i], m.idx[i + 1], m.idx[i + 2]]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
    const wt = new Float32Array(nv); for (let v = 0; v < nv; v++) { const [x, y, z] = [m.pos[v * 3], m.pos[v * 3 + 1], m.pos[v * 3 + 2]];
      wt[v] = sm(0.76, 0.84, y) * (1 - sm(1.24, 1.32, y)) * (1 - sm(0.13, 0.17, Math.abs(x))) * sm(-0.06, 0.0, z - at(centers.torso.z, y)); }
    for (let it = 0; it < 40; it++) for (const f of [0.5, -0.53]) { const np = new Float32Array(m.pos); for (let v = 0; v < nv; v++) { if (!wt[v] || !nb[v].size) continue;
      for (let r = 0; r < 3; r++) { let s = 0; for (const u of nb[v]) s += m.pos[u * 3 + r]; np[v * 3 + r] += f * wt[v] * (s / nb[v].size - m.pos[v * 3 + r]); } } m.pos.set(np); }
  }
  m.p.setArray(m.pos); m.n.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]);
}
await doc.transform(weld(), reorder({ encoder: MeshoptEncoder }), quantize({ quantizePosition: 14 }));
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder }).write(out, doc);
console.log('wrote', out);
