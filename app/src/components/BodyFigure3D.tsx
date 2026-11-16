import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { FigureRegionId } from '../lib/bodyRegions';
import { regionAt } from '../lib/anatomy';
import type { RegionView } from '../lib/bodyView';
import { useTheme } from '../lib/theme';
import { StatusBadge } from './StatusBadge';

/**
 * Draggable 3D anatomy figure (Body map), built from BodyParts3D (CC BY 4.0, © The Database Center
 * for Life Science): skin, skeleton and the main organs, simplified into `public/models/body.glb`
 * (see `scripts/build-body.mjs`). Three layers can be shown or hidden, like an anatomy atlas: with
 * skin on top of organs, the skin turns see-through. Each organ takes the status color of the body
 * part it sits in; skin and bones are split into parts by position (`lib/anatomy.ts`).
 * Drag to turn, scroll or pinch to zoom, click a part to open it.
 * The region list next to it stays the keyboard and screen-reader way in.
 */

interface Props {
  views: RegionView[];
  selectedId?: FigureRegionId;
  onPick: (id: FigureRegionId) => void;
  /** Called when the browser can't draw 3D, so the page can fall back to 2D */
  onUnavailable?: () => void;
}

export type Layer = 'skin' | 'organs' | 'skeleton';
const LAYERS: { id: Layer; label: string }[] = [
  { id: 'skin', label: 'Skin' },
  { id: 'organs', label: 'Organs' },
  { id: 'skeleton', label: 'Skeleton' },
];

/** Natural colors, so the figure reads as anatomy; status color is blended on top */
const NATURAL: Record<string, string> = {
  skin: '#e8cdb8', skeleton: '#ebe3cf', brain: '#e3b2b0', eyes: '#f4f1ea', heart: '#b8443f',
  aorta: '#c2504a', lungs: '#e09a9a', digestive: '#d7a07a', urinary: '#a5524a',
};

const MODEL_URL = `${import.meta.env.BASE_URL}models/body.glb`;
let modelPromise: Promise<THREE.Group> | undefined;
function loadModel(): Promise<THREE.Group> {
  modelPromise ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(MODEL_URL).then((g) => g.scene);
  return modelPromise;
}

/** Soft contact shadow under the feet */
function shadowTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.45)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function cssColor(name: string): THREE.Color {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || '#888888');
}

interface Part {
  id: string;
  layer: Layer;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  /** Organs: the one region they belong to. Skin / skeleton: a region per vertex. */
  region?: FigureRegionId;
  vertexRegions?: FigureRegionId[];
}

export function BodyFigure3D({ views, selectedId, onPick, onUnavailable }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const parts = useRef<Part[]>([]);
  const [hover, setHover] = useState<FigureRegionId>();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ skin: true, organs: true, skeleton: false });
  const theme = useTheme();
  const pickRef = useRef(onPick);
  const failRef = useRef(onUnavailable);
  useEffect(() => { pickRef.current = onPick; failRef.current = onUnavailable; });

  // Build the scene once
  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      failRef.current?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.prepend(renderer.domElement);

    const world = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 30);
    camera.position.set(0, 0.95, 3.9);

    world.add(new THREE.HemisphereLight(0xffffff, 0x3a3836, 1.15));
    const key = new THREE.DirectionalLight(0xfff4e8, 1.6);
    key.position.set(2.5, 4, 3.5);
    const rim = new THREE.DirectionalLight(0xdfe8ff, 1.1);
    rim.position.set(-3, 2.5, -3);
    world.add(key, rim);

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.88, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 0.8;
    controls.maxDistance = 6;
    controls.minPolarAngle = Math.PI * 0.25;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.7;
    controls.addEventListener('start', () => { controls.autoRotate = false; });

    let alive = true;
    loadModel().then((model) => {
      if (!alive) return;
      const root = model.clone(true);
      const list: Part[] = [];
      root.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        const extras = (o.userData ?? {}) as { layer?: Layer; region?: FigureRegionId | null };
        const id = o.name;
        const layer = extras.layer ?? 'organs';
        const geo = o.geometry as THREE.BufferGeometry;
        geo.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({ roughness: layer === 'skin' ? 0.6 : 0.45, metalness: 0, side: THREE.FrontSide });
        o.material = material;
        const part: Part = { id, layer, mesh: o, material, region: extras.region ?? undefined };
        if (!part.region) {
          // Skin and bones span the whole body: give every vertex its body part
          const p = geo.getAttribute('position') as THREE.BufferAttribute;
          const v = new THREE.Vector3();
          part.vertexRegions = Array.from({ length: p.count }, (_, i) => {
            v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
            return regionAt(v.x, v.y);
          });
          geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(p.count * 3), 3));
          material.vertexColors = true;
        }
        if (layer === 'skin') o.renderOrder = 2;
        list.push(part);
      });
      root.updateMatrixWorld(true);
      world.add(root);
      parts.current = list;
      setState('ready');
    }).catch(() => { if (alive) setState('error'); });

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.4, 48), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.002;
    world.add(shadow);

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // Click (not drag) picks a part; hovering highlights it. Only visible layers can be hit.
    const ray = new THREE.Raycaster();
    const hit = (e: PointerEvent): FigureRegionId | undefined => {
      const r = renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const visible = parts.current.filter((p) => p.mesh.visible);
      // A see-through skin should not block the organs behind it
      const solid = visible.filter((p) => !(p.layer === 'skin' && p.material.transparent));
      const order = solid.length ? [solid, visible] : [visible];
      for (const group of order) {
        const h = ray.intersectObjects(group.map((p) => p.mesh), false)[0];
        if (!h) continue;
        const part = group.find((p) => p.mesh === h.object)!;
        return part.region ?? regionAt(h.point.x, h.point.y);
      }
      return undefined;
    };
    let down: { x: number; y: number } | undefined;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) {
        const id = hit(e);
        if (id) pickRef.current(id);
      }
      down = undefined;
    };
    const onMove = (e: PointerEvent) => { if (!e.buttons) setHover(hit(e)); };
    const onLeave = () => setHover(undefined);
    const c = renderer.domElement;
    c.addEventListener('pointerdown', onDown);
    c.addEventListener('pointerup', onUp);
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerleave', onLeave);

    let frame = 0;
    const tick = () => {
      controls.update();
      renderer.render(world, camera);
      frame = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      controls.dispose();
      c.removeEventListener('pointerdown', onDown);
      c.removeEventListener('pointerup', onUp);
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerleave', onLeave);
      world.traverse((o) => {
        if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); }
      });
      renderer.dispose();
      c.remove();
      parts.current = [];
    };
  }, []);

  useEffect(() => { if (state === 'error') failRef.current?.(); }, [state]);

  // Colors, visibility and see-through skin. Flagged parts take their status color;
  // the selected or hovered part is lifted a little toward white.
  useEffect(() => {
    if (state !== 'ready') return;
    const status = { ok: [cssColor('--ok'), 0], watch: [cssColor('--watch'), 0.65], act: [cssColor('--act'), 0.7] } as const;
    const white = new THREE.Color('#ffffff');
    const colorFor = (base: THREE.Color, region?: FigureRegionId) => {
      const v = region && views.find((x) => x.region.id === region);
      const [c, amount] = v?.status ? status[v.status] : [base, 0];
      const col = base.clone().lerp(c, amount);
      return col.lerp(white, region === selectedId ? 0.25 : region === hover ? 0.14 : 0);
    };
    const xray = layers.skin && (layers.organs || layers.skeleton);
    for (const p of parts.current) {
      p.mesh.visible = layers[p.layer];
      const base = new THREE.Color(NATURAL[p.id] ?? '#cccccc');
      if (p.layer === 'skin') {
        if (p.material.transparent !== xray) {
          p.material.transparent = xray;
          p.material.depthWrite = !xray;
          p.material.needsUpdate = true; // switching transparency needs a new shader
        }
        p.material.opacity = xray ? (theme === 'light' ? 0.22 : 0.18) : 1;
      }
      if (p.vertexRegions) {
        const attr = p.mesh.geometry.getAttribute('color') as THREE.BufferAttribute;
        const out = attr.array as Float32Array;
        const cache = new Map<FigureRegionId, THREE.Color>();
        p.vertexRegions.forEach((r, i) => {
          let col = cache.get(r);
          if (!col) { col = colorFor(base, r); cache.set(r, col); }
          out[i * 3] = col.r; out[i * 3 + 1] = col.g; out[i * 3 + 2] = col.b;
        });
        attr.needsUpdate = true;
        p.material.color.set('#ffffff');
      } else {
        p.material.color.copy(colorFor(base, p.region));
      }
    }
  }, [views, selectedId, hover, theme, layers, state]);

  const shown = views.find((v) => v.region.id === (hover ?? selectedId));
  const toggle = (id: Layer) => setLayers((l) => {
    const next = { ...l, [id]: !l[id] };
    return Object.values(next).some(Boolean) ? next : l; // keep at least one layer on
  });

  return (
    <div ref={host} className={`holo${hover ? ' holo-hover' : ''}`}>
      <div className="holo-layers" role="group" aria-label="Layers to show">
        {LAYERS.map((l) => (
          <button key={l.id} type="button" aria-pressed={layers[l.id]} className={layers[l.id] ? 'on' : ''} onClick={() => toggle(l.id)}>{l.label}</button>
        ))}
      </div>
      {shown && (
        <p className="holo-label" aria-hidden="true">
          {shown.region.label}
          {shown.status && <StatusBadge status={shown.status} />}
        </p>
      )}
      <p className="holo-hint" aria-hidden="true">
        {state === 'ready' ? 'Drag to turn · scroll to zoom · click a part' : state === 'error' ? 'The 3D model could not load.' : 'Loading the anatomy model…'}
      </p>
      <p className="holo-credit">Anatomy: BodyParts3D, © DBCLS, CC BY 4.0</p>
    </div>
  );
}

export default BodyFigure3D;
