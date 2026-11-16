import { buildBodyMesh } from './bodyMesh';

// Builds the mannequin off the main thread so opening the 3D view never freezes the page
const m = buildBodyMesh();
const out = { positions: m.positions.slice(), indices: m.indices.slice(), weights: m.weights.slice() };
self.postMessage(out, { transfer: [out.positions.buffer, out.indices.buffer, out.weights.buffer] });
