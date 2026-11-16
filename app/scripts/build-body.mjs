// Builds app/public/models/body.glb from BodyParts3D 4.0 OBJ files (CC BY 4.0, © The Database Center for Life Science).
//
// Not part of the app build; run by hand only when the model changes. In a scratch folder:
//   1. Download from https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/ :
//      partof_element_parts.txt and partof_BP3D_4.0_obj_99.zip (62 MB), and unzip it there.
//   2. npm i @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1 @gltf-transform/extensions@4.1.1 meshoptimizer@0.22.0
//   3. node build-body.mjs <that folder> <repo>/app/public/models/body.glb
// Output: one mesh per group (skin, skeleton, organs), meters, y up, feet at 0, +x = the person's left,
// +z = front, simplified to about 230k triangles and meshopt-compressed (about 680 KB).
// The groin of the skin is smoothed to a mannequin shape (the demo audience includes minors).
import fs from 'node:fs';
import path from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { quantize, reorder, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const [dir, out] = process.argv.slice(2);
const objDir = path.join(dir, 'partof_BP3D_4.0_obj_99');

// concept id -> element file ids
const elements = new Map();
const LIMB_BONE = /(humerus|radius|ulna|femur|patella|tibia|fibula|clavicle|scapula|metacarpal|metatarsal|phalanx|talus|calcaneus|cuneiform|cuboid|navicular|scaphoid|lunate|hamate|capitate|trapezium|trapezoid|pisiform|triquetral|sesamoid)/i;
const NOT_BONE = /(artery|vein|nerve|muscle|tract|levator|branch|fascia|ligament|tendon|retinaculum|bursa|joint|capsule|cartilage)/i;
const limbBones = new Set();
for (const line of fs.readFileSync(path.join(dir, 'partof_element_parts.txt'), 'utf8').split(/\r?\n/).slice(1)) {
  const [concept, name, file] = line.split('\t');
  if (!file) continue;
  if (!elements.has(concept)) elements.set(concept, []);
  elements.get(concept).push(file.trim());
  if (LIMB_BONE.test(name) && !NOT_BONE.test(name)) limbBones.add(file.trim());
}
elements.set('LIMB_BONES', [...limbBones]);

/**
 * One mesh per group. layer: which toggle shows it. system: body system for status color.
 * region: body-map region it belongs to (organs only; skin and bones are split by position in the app).
 * tris: target triangle count after simplifying.
 */
const GROUPS = [
  { id: 'skin', layer: 'skin', concepts: ['FMA7163'], tris: 26000 },
  { id: 'skeleton', layer: 'skeleton', concepts: ['FMA23881', 'LIMB_BONES'], tris: 80000 },
  { id: 'brain', layer: 'organs', system: 'behavioral', region: 'head', concepts: ['FMA50801'], tris: 6000 },
  { id: 'eyes', layer: 'organs', system: 'vision', region: 'head', concepts: ['FMA12514', 'FMA12515'], tris: 1200 },
  { id: 'heart', layer: 'organs', system: 'cardiovascular', region: 'chest', concepts: ['FMA7088'], tris: 5000 },
  { id: 'aorta', layer: 'organs', system: 'cardiovascular', region: 'chest', concepts: ['FMA3734'], tris: 2500 },
  { id: 'lungs', layer: 'organs', system: 'cardiovascular', region: 'chest', concepts: ['FMA7309', 'FMA7310', 'FMA7394'], tris: 7000 },
  { id: 'digestive', layer: 'organs', system: 'metabolic', region: 'abdomen', concepts: ['FMA7131', 'FMA7148', 'FMA7197', 'FMA7198', 'FMA7202', 'FMA7200', 'FMA7201'], tris: 14000 },
  { id: 'urinary', layer: 'organs', system: 'immune', region: 'abdomen', concepts: ['FMA7204', 'FMA7205', 'FMA15900'], tris: 2500 },
];

function readObj(file) {
  const pos = [], idx = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (line.startsWith('v ')) { const p = line.split(/\s+/); pos.push(+p[1], +p[2], +p[3]); }
    else if (line.startsWith('f ')) {
      const p = line.trim().split(/\s+/).slice(1).map((t) => parseInt(t, 10) - 1);
      for (let i = 1; i + 1 < p.length; i++) idx.push(p[0], p[i], p[i + 1]);
    }
  }
  return { pos, idx };
}

// Global frame: BodyParts3D is mm, z up. Out: meters, y up, feet at y = 0, +z front, centered on x.
// Found by inspection: the face points to -y in BodyParts3D, and +x is the person's left.
const skinFile = path.join(objDir, `${elements.get('FMA7163')[0]}.obj`);
const skin0 = readObj(skinFile).pos;
let minZ = Infinity, cx = 0, cy = 0, n = 0;
for (let i = 0; i < skin0.length; i += 3) { minZ = Math.min(minZ, skin0[i + 2]); cx += skin0[i]; cy += skin0[i + 1]; n++; }
cx /= n; cy /= n;
const toM = (x, y, z) => [(x - cx) / 1000, (z - minZ) / 1000, -(y - cy) / 1000];

/**
 * Mannequin-neutral groin (the demo is public and the Space Apps audience includes minors):
 * skin in front of a smooth surface between the lower belly and the inner thighs is pressed onto it.
 */
function neutralize(pos) {
  // Front limit near the center line, taken from the skin 3-6 cm to the side (measured profile):
  // 0.072 m at y 0.92 down to 0.05 m at 0.74-0.86, recessed to 0.03 between the thighs below that.
  const KNOTS = [[0.68, -0.03], [0.74, -0.02], [0.79, 0.02], [0.83, 0.045], [0.86, 0.05], [0.92, 0.072], [0.96, 0.088]];
  const limit = (y) => {
    for (let k = 1; k < KNOTS.length; k++) {
      const [y0, z0] = KNOTS[k - 1], [y1, z1] = KNOTS[k];
      if (y <= y1) return z0 + ((y - y0) / (y1 - y0)) * (z1 - z0);
    }
    return Infinity;
  };
  const smooth = (e0, e1, v) => { const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const inPatch = [];
  for (let i = 0; i < pos.length; i += 3) {
    const [x, y, z] = [pos[i], pos[i + 1], pos[i + 2]];
    const ax = Math.abs(x);
    if (ax > 0.08 || y < 0.68 || y > 0.96 || z < -0.05) continue;
    inPatch.push(i / 3);
    // Weight: 1 at the center line, fading to 0 by 7 cm to the side and at the top and bottom of the patch
    const w = (1 - smooth(0.02, 0.07, ax)) * smooth(0.68, 0.72, y) * (1 - smooth(0.92, 0.96, y));
    if (z > -0.04 && z > limit(y)) pos[i + 2] = z + (limit(y) - z) * w;
    // Nothing hangs below the crotch line at the center: squash that part up against it
  }
  return inPatch;
}

/** A few rounds of neighbor averaging on the given vertices, to remove creases left by `neutralize` */
function relax(pos, idx, verts, rounds) {
  const nb = new Map(verts.map((v) => [v, new Set()]));
  for (let t = 0; t < idx.length; t += 3) {
    const tri = [idx[t], idx[t + 1], idx[t + 2]];
    for (const a of tri) if (nb.has(a)) for (const b of tri) if (b !== a) nb.get(a).add(b);
  }
  for (let r = 0; r < rounds; r++) {
    const next = new Map();
    for (const [v, s] of nb) {
      if (!s.size) continue;
      let x = 0, y = 0, z = 0;
      for (const n of s) { x += pos[n * 3]; y += pos[n * 3 + 1]; z += pos[n * 3 + 2]; }
      next.set(v, [(pos[v * 3] + x / s.size) / 2, (pos[v * 3 + 1] + y / s.size) / 2, (pos[v * 3 + 2] + z / s.size) / 2]);
    }
    for (const [v, p] of next) { pos[v * 3] = p[0]; pos[v * 3 + 1] = p[1]; pos[v * 3 + 2] = p[2]; }
  }
}

await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene('body');
const stats = [];

for (const g of GROUPS) {
  const pos = [], idx = [];
  const files = [...new Set(g.concepts.flatMap((c) => elements.get(c) ?? []))];
  if (!files.length) throw new Error(`no files for ${g.id}`);
  for (const f of files) {
    const o = readObj(path.join(objDir, `${f}.obj`));
    const base = pos.length / 3;
    for (let i = 0; i < o.pos.length; i += 3) pos.push(...toM(o.pos[i], o.pos[i + 1], o.pos[i + 2]));
    for (const k of o.idx) idx.push(k + base);
  }
  if (g.id === 'skin') relax(pos, idx, neutralize(pos), 120);
  let P = new Float32Array(pos);
  let I = new Uint32Array(idx);
  const before = I.length / 3;
  if (before > g.tris) {
    const target = g.tris * 3;
    // Allow more error only when the gentle pass can't reach the target
    let simp = I;
    for (const err of [0.005, 0.02, 0.08]) {
      [simp] = MeshoptSimplifier.simplify(I, P, 3, target, err, []);
      if (simp.length <= target * 1.3) break;
    }
    I = simp;
  }
  // Drop unused vertices
  const remap = new Int32Array(P.length / 3).fill(-1);
  const NP = [];
  const NI = new Uint32Array(I.length);
  for (let i = 0; i < I.length; i++) {
    const v = I[i];
    if (remap[v] < 0) { remap[v] = NP.length / 3; NP.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]); }
    NI[i] = remap[v];
  }
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(NP)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(NI).setBuffer(buffer));
  const mesh = doc.createMesh(g.id).addPrimitive(prim);
  const node = doc.createNode(g.id).setMesh(mesh).setExtras({ layer: g.layer, system: g.system ?? null, region: g.region ?? null });
  scene.addChild(node);
  stats.push(`${g.id}: ${files.length} parts, ${before} -> ${NI.length / 3} triangles`);
}

doc.getRoot().setDefaultScene(scene);
doc.getRoot().getAsset().copyright = 'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International. Simplified and merged for HealthLens.';
doc.createExtension(KHRMeshQuantization).setRequired(true);
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await doc.transform(weld(), reorder({ encoder: MeshoptEncoder }), quantize({ quantizePosition: 14 }));
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await io.write(out, doc);
console.log(stats.join('\n'));
console.log('size', (fs.statSync(out).size / 1024).toFixed(0), 'KB');
