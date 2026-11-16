import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { FigureRegionId } from '../lib/bodyRegions';
import { buildBodyMesh, REGION_ORDER, type BodyMesh } from '../lib/bodyMesh';
import type { RegionView } from '../lib/bodyView';
import { useTheme } from '../lib/theme';
import { StatusBadge } from './StatusBadge';

/**
 * Draggable 3D mannequin (Body map). Same regions, statuses and click-to-select as the 2D
 * <BodyFigure>, built from the same shape (`lib/bodyShape.ts`) so both share a silhouette.
 * It is one seamless surface (`lib/bodyMesh.ts`); flagged regions are shaded by vertex color.
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

// One mesh for the whole session: built once in a worker, then reused every time the 3D view opens
let meshPromise: Promise<BodyMesh> | undefined;
function loadMesh(): Promise<BodyMesh> {
  meshPromise ??= new Promise<BodyMesh>((resolve) => {
    try {
      const w = new Worker(new URL('../lib/bodyMesh.worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e) => { resolve(e.data); w.terminate(); };
      w.onerror = () => resolve(buildBodyMesh());
    } catch {
      resolve(buildBodyMesh());
    }
  });
  return meshPromise;
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

interface Scene {
  body: THREE.Mesh;
  weights: Float32Array;
}

export function BodyFigure3D({ views, selectedId, onPick, onUnavailable }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const [hover, setHover] = useState<FigureRegionId>();
  const [ready, setReady] = useState(false);
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
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
    camera.position.set(0, 0.98, 4.1);

    // Studio lighting: soft sky fill, a warm key from the front right, a cool rim from behind
    world.add(new THREE.HemisphereLight(0xffffff, 0x3a3836, 1.1));
    const key = new THREE.DirectionalLight(0xfff4e8, 1.7);
    key.position.set(2.5, 4, 3.5);
    const rim = new THREE.DirectionalLight(0xdfe8ff, 1.2);
    rim.position.set(-3, 2.5, -3);
    world.add(key, rim);

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.9, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 1.6;
    controls.maxDistance = 6.5;
    controls.minPolarAngle = Math.PI * 0.3;
    controls.maxPolarAngle = Math.PI * 0.58;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.8;
    controls.addEventListener('start', () => { controls.autoRotate = false; });

    let alive = true;
    const geo = new THREE.BufferGeometry();
    const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0, vertexColors: true }));
    world.add(body);
    loadMesh().then((m) => {
      if (!alive) return;
      geo.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
      geo.setIndex(new THREE.BufferAttribute(m.indices, 1));
      geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(m.positions.length), 3));
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      scene.current = { body, weights: m.weights };
      setReady(true);
    });
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 48), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.002;
    world.add(shadow);

    // Size to the container
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

    // Click (not drag) picks a part; hovering highlights it
    const ray = new THREE.Raycaster();
    const hit = (e: PointerEvent): FigureRegionId | undefined => {
      const r = renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const sc = scene.current;
      const face = sc && ray.intersectObject(sc.body, false)[0]?.face;
      if (!face) return undefined;
      // The region that owns this spot of the surface
      const R = REGION_ORDER.length;
      let best = 0;
      for (let r = 1; r < R; r++) if (sc.weights[face.a * R + r] > sc.weights[face.a * R + best]) best = r;
      return REGION_ORDER[best];
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
      scene.current = null;
    };
  }, []);

  // Mannequin white for OK parts; flagged regions are shaded in their status color, blending softly at the edges.
  // The selected or hovered region is lifted a little toward white.
  useEffect(() => {
    const sc = scene.current;
    if (!sc) return;
    const base = new THREE.Color(theme === 'light' ? '#f3f1ec' : '#d8d5ce');
    const tint = { ok: [cssColor('--ok'), 0.1], watch: [cssColor('--watch'), 1], act: [cssColor('--act'), 1] } as const;
    const white = new THREE.Color('#ffffff');
    const cols = REGION_ORDER.map((id) => {
      const v = views.find((x) => x.region.id === id);
      const [c, amount] = v?.status ? tint[v.status] : [base, 0];
      const col = base.clone().lerp(c, amount);
      return col.lerp(white, id === selectedId ? 0.22 : id === hover ? 0.12 : 0);
    });
    const R = REGION_ORDER.length;
    const attr = sc.body.geometry.getAttribute('color') as THREE.BufferAttribute;
    const out = attr.array as Float32Array;
    for (let v = 0; v < out.length / 3; v++) {
      let r = 0, g = 0, b = 0;
      for (let k = 0; k < R; k++) {
        const w = sc.weights[v * R + k];
        if (w < 0.002) continue;
        r += cols[k].r * w; g += cols[k].g * w; b += cols[k].b * w;
      }
      out[v * 3] = r; out[v * 3 + 1] = g; out[v * 3 + 2] = b;
    }
    attr.needsUpdate = true;
  }, [views, selectedId, hover, theme, ready]);

  const shown = views.find((v) => v.region.id === (hover ?? selectedId));

  return (
    <div ref={host} className={`holo${hover ? ' holo-hover' : ''}`} aria-hidden="true">
      {shown && (
        <p className="holo-label">
          {shown.region.label}
          {shown.status && <StatusBadge status={shown.status} />}
        </p>
      )}
      <p className="holo-hint">{ready ? 'Drag to turn · scroll to zoom · click a part' : 'Building the figure…'}</p>
    </div>
  );
}

export default BodyFigure3D;
