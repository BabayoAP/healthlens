// Builds the 3D anatomy models for the Body map and Dashboard:
//   app/public/models/body-male.glb    from BodyParts3D 4.0 (CC BY 4.0, © The Database Center for Life Science)
//   app/public/models/body-female.glb  from the HuBMAP Human Reference Atlas female reference body v1.10
//                                      (CC BY 4.0, Kristen Browne and Heidi Schlehlein, built on the NLM Visible Human Female),
//                                      with the bones that source lacks (skull, ribs, shoulders, arms, feet) borrowed from
//                                      BodyParts3D, scaled to her height and turned at the shoulder to match her arms.
//
// Not part of the app build; run by hand only when the models change. In a scratch folder:
//   1. From https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/ download partof_element_parts.txt and
//      partof_BP3D_4.0_obj_99.zip (62 MB) and unzip it there.
//   2. Download https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.10/assets/3d-vh-f-united.glb (375 MB).
//   3. npm i @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1 @gltf-transform/extensions@4.1.1 meshoptimizer@0.22.0
//   4. node --max-old-space-size=8192 build-body.mjs <bodyparts3d folder> <female .glb> <repo>/app/public/models
// Frame of both outputs: meters, y up, feet at 0, +x = the person's left, +z = front.
// Each mesh node carries extras { layer, region } (region only for organs; skin and bones are split by position in the app).
// Nerves: BodyParts3D and the HuBMAP female body model no peripheral nerves, so the nerves layer is the brain and spinal cord
// (plus the nerves of the eye on the female body).
// The skin is smoothed to a mannequin shape at the groin (the demo audience includes minors).
import fs from 'node:fs';
import path from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { quantize, reorder, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const [bpDir, femaleGlb, outDir] = process.argv.slice(2);
const objDir = path.join(bpDir, 'partof_BP3D_4.0_obj_99');
await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;

// ---------- BodyParts3D index: concept -> files, file -> most specific name ----------
const elements = new Map();
const rows = [];
for (const line of fs.readFileSync(path.join(bpDir, 'partof_element_parts.txt'), 'utf8').split(/\r?\n/).slice(1)) {
  const [concept, name, file] = line.split('\t');
  if (!file) continue;
  const f = file.trim();
  if (!elements.has(concept)) elements.set(concept, []);
  elements.get(concept).push(f);
  rows.push([concept, name, f]);
}
const fileName = new Map();
for (const [concept, name, f] of rows) {
  const n = elements.get(concept).length;
  const prev = fileName.get(f);
  if (!prev || n < prev.n) fileName.set(f, { name, n });
}
const files = (concepts) => [...new Set(concepts.flatMap((c) => elements.get(c) ?? []))];
const LIMB_BONE = /(humerus|radius|ulna|femur|patella|tibia|fibula|clavicle|scapula|metacarpal|metatarsal|phalanx|talus|calcaneus|cuneiform|cuboid|navicular|scaphoid|lunate|hamate|capitate|trapezium|trapezoid|pisiform|triquetral|sesamoid)/i;
const NOT_BONE = /(artery|vein|nerve|muscle|tract|levator|branch|fascia|ligament|tendon|retinaculum|bursa|joint|capsule)/i;
const limbBones = rows.filter(([, name]) => LIMB_BONE.test(name) && !NOT_BONE.test(name)).map(([, , f]) => f);
const SKELETON = [...new Set([...files(['FMA23881']), ...limbBones])];

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

// BodyParts3D is mm, z up, face toward -y, +x = the person's left. Convert to the shared frame.
const skin0 = readObj(path.join(objDir, `${elements.get('FMA7163')[0]}.obj`)).pos;
let minZ = Infinity, cx = 0, cy = 0;
for (let i = 0; i < skin0.length; i += 3) { minZ = Math.min(minZ, skin0[i + 2]); cx += skin0[i]; cy += skin0[i + 1]; }
cx /= skin0.length / 3; cy /= skin0.length / 3;
const toM = (x, y, z) => [(x - cx) / 1000, (z - minZ) / 1000, -(y - cy) / 1000];

/** Merge BodyParts3D files into one mesh in the shared frame */
function loadBp(fileIds) {
  const pos = [], idx = [];
  for (const f of fileIds) {
    const o = readObj(path.join(objDir, `${f}.obj`));
    const base = pos.length / 3;
    for (let i = 0; i < o.pos.length; i += 3) pos.push(...toM(o.pos[i], o.pos[i + 1], o.pos[i + 2]));
    for (const k of o.idx) idx.push(k + base);
  }
  return { pos, idx };
}

function merge(meshes) {
  const pos = [], idx = [];
  for (const m of meshes) {
    const base = pos.length / 3;
    for (const v of m.pos) pos.push(v);
    for (const k of m.idx) idx.push(k + base);
  }
  return { pos, idx };
}

const bounds = (pos) => {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], pos[i + k]); max[k] = Math.max(max[k], pos[i + k]); }
  return { min, max, center: min.map((v, k) => (v + max[k]) / 2) };
};

// ---------- Groin smoothing (mannequin shape) ----------
const smoothstep = (e0, e1, v) => { const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** Presses skin near the center line onto a smooth front limit between the belly and the thighs; returns the vertices touched. */
function neutralize(pos, { yLow, yHigh, halfWidth, knots }) {
  const limit = (y) => {
    for (let k = 1; k < knots.length; k++) {
      const [y0, z0] = knots[k - 1], [y1, z1] = knots[k];
      if (y <= y1) return z0 + ((y - y0) / (y1 - y0)) * (z1 - z0);
    }
    return Infinity;
  };
  const touched = [];
  for (let i = 0; i < pos.length; i += 3) {
    const [x, y, z] = [pos[i], pos[i + 1], pos[i + 2]];
    const ax = Math.abs(x);
    if (ax > halfWidth || y < yLow || y > yHigh || z < -0.05) continue;
    touched.push(i / 3);
    const w = (1 - smoothstep(halfWidth * 0.25, halfWidth * 0.9, ax)) * smoothstep(yLow, yLow + 0.04, y) * (1 - smoothstep(yHigh - 0.04, yHigh, y));
    const lim = limit(y);
    if (z > -0.04 && z > lim) pos[i + 2] = z + (lim - z) * w;
  }
  return touched;
}
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

/** Shares vertices that sit at the same spot (to 0.05 mm), so the simplifier can collapse edges; drops degenerate triangles */
function weldPositions(mesh) {
  const key = new Map(), pos = [], idx = [], map = new Uint32Array(mesh.pos.length / 3);
  for (let v = 0; v < mesh.pos.length / 3; v++) {
    const k = `${Math.round(mesh.pos[v * 3] * 20000)},${Math.round(mesh.pos[v * 3 + 1] * 20000)},${Math.round(mesh.pos[v * 3 + 2] * 20000)}`;
    let n = key.get(k);
    if (n === undefined) { n = pos.length / 3; key.set(k, n); pos.push(mesh.pos[v * 3], mesh.pos[v * 3 + 1], mesh.pos[v * 3 + 2]); }
    map[v] = n;
  }
  for (let t = 0; t < mesh.idx.length; t += 3) {
    const a = map[mesh.idx[t]], b = map[mesh.idx[t + 1]], c = map[mesh.idx[t + 2]];
    if (a !== b && b !== c && a !== c) idx.push(a, b, c);
  }
  return { pos, idx };
}

// ---------- Write one model ----------
async function writeModel(out, groups, copyright) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene('body');
  for (const g of groups) {
    const welded = weldPositions(g.mesh);
    let P = new Float32Array(welded.pos);
    let I = new Uint32Array(welded.idx);
    const before = I.length / 3;
    if (before > g.tris) {
      const target = g.tris * 3;
      let simp = I;
      for (const err of [0.005, 0.02, 0.08, 0.3]) {
        [simp] = MeshoptSimplifier.simplify(I, P, 3, target, err, []);
        if (simp.length <= target * 1.3) break;
      }
      I = simp;
    }
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
    scene.addChild(doc.createNode(g.id).setMesh(doc.createMesh(g.id).addPrimitive(prim)).setExtras({ layer: g.layer, region: g.region ?? null }));
    console.log(`  ${g.id}: ${before} -> ${NI.length / 3} triangles`);
  }
  doc.getRoot().setDefaultScene(scene);
  doc.getRoot().getAsset().copyright = copyright;
  doc.createExtension(KHRMeshQuantization).setRequired(true);
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  await doc.transform(weld(), reorder({ encoder: MeshoptEncoder }), quantize({ quantizePosition: 14 }));
  const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  await io.write(out, doc);
  console.log(`  ${path.basename(out)}: ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}

// ---------- Male ----------
const BP_CREDIT = 'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International.';
const brainFiles = new Set(files(['FMA50801']));
const eyeFiles = new Set(files(['FMA12514', 'FMA12515']));
const male = {
  skin: loadBp(files(['FMA7163'])),
  skeleton: loadBp(SKELETON),
  brain: loadBp([...brainFiles]),
  eyes: loadBp([...eyeFiles]),
  heart: loadBp(files(['FMA7088'])),
  vessels: loadBp(files(['FMA3734'])),
  lungs: loadBp(files(['FMA7309', 'FMA7310', 'FMA7394'])),
  digestive: loadBp(files(['FMA7131', 'FMA7148', 'FMA7197', 'FMA7198', 'FMA7202', 'FMA7200', 'FMA7201'])),
  urinary: loadBp(files(['FMA7204', 'FMA7205', 'FMA15900'])),
  nerves: loadBp([...new Set(rows.filter(([, name]) => /(nerve|spinal cord|plexus|cauda equina)/i.test(name) && !/(artery|vein|nerves of eye)/i.test(name)).map(([, , f]) => f))].filter((f) => !brainFiles.has(f) && !eyeFiles.has(f))),
};
relax(male.skin.pos, male.skin.idx, neutralize(male.skin.pos, {
  yLow: 0.68, yHigh: 0.96, halfWidth: 0.08,
  knots: [[0.68, -0.03], [0.74, -0.02], [0.79, 0.02], [0.83, 0.045], [0.86, 0.05], [0.92, 0.072], [0.96, 0.088]],
}), 120);

const organ = (id, region, mesh, tris) => ({ id, layer: 'organs', region, mesh, tris });
console.log('male');
await writeModel(path.join(outDir, 'body-male.glb'), [
  { id: 'skin', layer: 'skin', mesh: male.skin, tris: 26000 },
  { id: 'skeleton', layer: 'skeleton', mesh: male.skeleton, tris: 80000 },
  { id: 'nerves', layer: 'nerves', region: 'chest', mesh: male.nerves, tris: 4000 },
  { id: 'brain', layer: 'nerves', region: 'head', mesh: male.brain, tris: 12000 },
  organ('eyes', 'head', male.eyes, 1200),
  organ('heart', 'chest', male.heart, 6000),
  organ('vessels', 'chest', male.vessels, 2500),
  organ('lungs', 'chest', male.lungs, 7000),
  organ('digestive', 'abdomen', male.digestive, 14000),
  organ('urinary', 'abdomen', male.urinary, 2500),
], `${BP_CREDIT} Simplified and merged for HealthLens.`);

// ---------- Female ----------
const fio = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const fdoc = await fio.read(femaleGlb);
const fNodes = new Map();
fdoc.getRoot().listScenes()[0].traverse((n) => fNodes.set(n.getName(), n));
const F_FEET = 0.7926; // the source's feet are at y = -0.7926 m
function loadF(names) {
  const pos = [], idx = [];
  for (const name of names) {
    const top = fNodes.get(name);
    if (!top) throw new Error(`female: no node ${name}`);
    top.traverse((n) => {
      const m = n.getMesh(); if (!m) return;
      const M = n.getWorldMatrix();
      for (const p of m.listPrimitives()) {
        const a = p.getAttribute('POSITION'); const v = [0, 0, 0];
        const base = pos.length / 3;
        for (let i = 0; i < a.getCount(); i++) {
          a.getElement(i, v);
          pos.push(M[0] * v[0] + M[4] * v[1] + M[8] * v[2] + M[12], M[1] * v[0] + M[5] * v[1] + M[9] * v[2] + M[13] + F_FEET, M[2] * v[0] + M[6] * v[1] + M[10] * v[2] + M[14]);
        }
        const ind = p.getIndices();
        if (ind) for (let i = 0; i < ind.getCount(); i++) idx.push(ind.getScalar(i) + base);
        else for (let i = 0; i < a.getCount(); i++) idx.push(base + i);
      }
    });
  }
  return { pos, idx };
}
const female = {
  skin: loadF(['VH_F_skin']),
  skeleton: loadF(['VH_F_sternum', 'VH_F_manubrium', 'VH_F_pelvis', 'VH_F_vertebral_column', 'VH_F_lower_limb_R', 'VH_F_lower_limb_L']),
  brain: loadF(['Allen_brain']),
  eyes: loadF(['VH_F_eyes']),
  heart: loadF(['VH_F_heart']),
  vessels: loadF(['VH_F_blood_vasculature']),
  lungs: loadF(['VH_F_lungs', 'VH_F_larynx', 'VH_F_tracheobronchial_tree']),
  digestive: loadF(['VH_F_liver', 'VH_F_pancreas', 'VH_F_biliary_tree', 'VH_F_gallbladder_', 'VH_F_small_intestine', 'VH_F_colon']),
  urinary: loadF(['VH_F_upper_urinary_tract', 'VH_F_urinary_bladder']),
  nerves: loadF(['VH_F_spinal_cord', 'VH_F_nerves_of_eye']),
};

// Borrowed male bones, grouped by name
const BORROW = {
  skull: /(frontal bone|parietal bone|occipital bone|temporal bone|sphenoid|ethmoid|mandible|maxilla|zygomatic|nasal bone|lacrimal bone|vomer|palatine bone|nasal concha|hyoid|tooth|incisor|canine|premolar|molar|malleus|incus|stapes|skull|cranium)/i,
  thorax: /(\brib\b|costal cartilage|clavicle|scapula)/i,
  arm: /(humerus|radius|ulna|scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate|metacarpal|phalanx of (left|right) (thumb|index finger|middle finger|ring finger|little finger)|sesamoid bone of (left|right) (hand|thumb))/i,
  foot: /(talus|calcaneus|navicular|cuboid|cuneiform|metatarsal|phalanx of (left|right) (big toe|second toe|third toe|fourth toe|little toe)|sesamoid bone of (left|right) (foot|big toe))/i,
};
const sideOf = (name) => (/\bleft\b/i.test(name) ? 1 : /\bright\b/i.test(name) ? -1 : 0);
const borrowed = { skull: [], thorax: [], arm: { 1: [], [-1]: [] }, foot: { 1: [], [-1]: [] } };
for (const f of SKELETON) {
  const name = fileName.get(f)?.name ?? '';
  if (BORROW.skull.test(name)) borrowed.skull.push(f);
  else if (BORROW.thorax.test(name) && !/sternum|manubrium|xiphoid/i.test(name)) borrowed.thorax.push(f);
  else if (BORROW.arm.test(name) && sideOf(name)) borrowed.arm[sideOf(name)].push(f);
  else if (BORROW.foot.test(name) && sideOf(name)) borrowed.foot[sideOf(name)].push(f);
}
console.log('borrowed bones: skull', borrowed.skull.length, 'thorax', borrowed.thorax.length,
  'arms', borrowed.arm[1].length, borrowed.arm[-1].length, 'feet', borrowed.foot[1].length, borrowed.foot[-1].length);

const fHeight = bounds(female.skin.pos).max[1];
const mHeight = bounds(male.skin.pos).max[1];
const s = fHeight / mHeight;
/** p' = s * (p - from) + to, in place */
const fit = (mesh, from, to) => { for (let i = 0; i < mesh.pos.length; i += 3) for (let k = 0; k < 3; k++) mesh.pos[i + k] = s * (mesh.pos[i + k] - from[k]) + to[k]; return mesh; };

// Arm slope (dx per dy) from skin points well clear of the torso
function armSlope(pos, side, minX) {
  const pts = [];
  for (let i = 0; i < pos.length; i += 3) if (pos[i] * side > minX && pos[i + 1] > 0.8 && pos[i + 1] < 1.3) pts.push([pos[i], pos[i + 1]]);
  const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  let sxy = 0, syy = 0; for (const [x, y] of pts) { sxy += (x - mx) * (y - my); syy += (y - my) ** 2; }
  return sxy / syy;
}
const brainM = bounds(male.brain.pos).center, brainF = bounds(female.brain.pos).center;
const lungsM = bounds(male.lungs.pos).center, lungsF = bounds(female.lungs.pos).center;
const fSkull = fit(loadBp(borrowed.skull), brainM, brainF);
const fThorax = fit(loadBp(borrowed.thorax), lungsM, lungsF);
const arms = [1, -1].map((side) => {
  const arm = fit(loadBp(borrowed.arm[side]), lungsM, lungsF);
  // Turn the arm at the shoulder (top of the humerus) until it runs along her arm
  const humerus = loadBp(borrowed.arm[side].filter((f) => /humerus/i.test(fileName.get(f).name)));
  fit(humerus, lungsM, lungsF);
  const hb = bounds(humerus.pos);
  const pivot = [hb.center[0], hb.max[1] - 0.025, hb.center[2]];
  const angle = Math.atan2(1, armSlope(female.skin.pos, side, 0.22)) - Math.atan2(1, armSlope(male.skin.pos, side, 0.2));
  const c = Math.cos(angle), sn = Math.sin(angle);
  for (let i = 0; i < arm.pos.length; i += 3) {
    const x = arm.pos[i] - pivot[0], y = arm.pos[i + 1] - pivot[1];
    arm.pos[i] = pivot[0] + c * x - sn * y;
    arm.pos[i + 1] = pivot[1] + sn * x + c * y;
  }
  console.log(`  arm ${side > 0 ? 'left' : 'right'} turned ${(angle * 180 / Math.PI).toFixed(1)} deg`);
  return arm;
});
const feet = [1, -1].map((side) => {
  const mTibia = bounds(loadBp(SKELETON.filter((f) => new RegExp(`${side > 0 ? 'left' : 'right'} tibia`, 'i').test(fileName.get(f)?.name ?? ''))).pos);
  const fLeg = bounds(loadF([side > 0 ? 'VH_F_lower_limb_L' : 'VH_F_lower_limb_R']).pos);
  return fit(loadBp(borrowed.foot[side]), [mTibia.center[0], mTibia.min[1], mTibia.center[2]], [fLeg.center[0], fLeg.min[1], fLeg.center[2]]);
});
female.skeleton = merge([female.skeleton, fSkull, fThorax, ...arms, ...feet]);

const fb = bounds(female.skin.pos);
console.log('female height', fHeight.toFixed(3), 'scale for borrowed bones', s.toFixed(3), 'skin x', fb.min[0].toFixed(3), fb.max[0].toFixed(3));
// The source skin has some inward-facing patches (at the groin, where that anatomy is modeled separately and not used
// here); the app draws skin double-sided so they show as skin.

console.log('female');
await writeModel(path.join(outDir, 'body-female.glb'), [
  { id: 'skin', layer: 'skin', mesh: female.skin, tris: 26000 },
  { id: 'skeleton', layer: 'skeleton', mesh: female.skeleton, tris: 80000 },
  { id: 'nerves', layer: 'nerves', region: 'chest', mesh: female.nerves, tris: 6000 },
  { id: 'brain', layer: 'nerves', region: 'head', mesh: female.brain, tris: 12000 },
  organ('eyes', 'head', female.eyes, 1200),
  organ('heart', 'chest', female.heart, 6000),
  organ('vessels', 'chest', female.vessels, 8000),
  organ('lungs', 'chest', female.lungs, 9000),
  organ('digestive', 'abdomen', female.digestive, 14000),
  organ('urinary', 'abdomen', female.urinary, 3000),
], 'Human Reference Atlas, 3D Reference Organ Set for Female v1.10, Kristen Browne and Heidi Schlehlein, HuBMAP, CC BY 4.0, built on the Visible Human Project of the U.S. National Library of Medicine. '
  + `Skull, ribs, shoulders, arms and feet: ${BP_CREDIT} Simplified, fitted and merged for HealthLens.`);
