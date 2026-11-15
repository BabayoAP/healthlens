import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { FigureRegionId } from '../lib/bodyRegions';
import type { RegionView } from '../lib/bodyView';
import { useTheme } from '../lib/theme';
import { StatusBadge } from './StatusBadge';

/**
 * Draggable 3D hologram of the body figure (Body map). Same regions, statuses and
 * click-to-select as the 2D <BodyFigure>; it only changes how the figure looks.
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

type Part = { geo: THREE.BufferGeometry; pos: [number, number, number]; rotZ?: number; scale?: [number, number, number] };

/** Facing the viewer, like the 2D figure: the person's left side is on the viewer's right (+x). */
function partsFor(id: FigureRegionId, coarse = false): Part[] {
  // Smooth shells for the glow; coarse ones for the wire lattice so it reads as a scan, not a net
  const limb = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, coarse ? 2 : 5, coarse ? 8 : 18);
  const ball = (r: number) => new THREE.SphereGeometry(r, coarse ? 10 : 24, coarse ? 7 : 16);
  switch (id) {
    case 'head': return [
      { geo: ball(0.15), pos: [0, 1.69, 0], scale: [1, 1.14, 1.04] },
      { geo: new THREE.CylinderGeometry(0.06, 0.07, 0.14, coarse ? 8 : 16), pos: [0, 1.51, 0] },
    ];
    case 'chest': return [{ geo: limb(0.2, 0.2), pos: [0, 1.26, 0], scale: [1.27, 1, 0.66] }];
    case 'abdomen': return [{ geo: limb(0.17, 0.12), pos: [0, 0.92, 0], scale: [1.16, 1, 0.62] }];
    case 'left-arm': return [{ geo: limb(0.056, 0.6), pos: [0.37, 1.1, 0], rotZ: 0.13 }];
    case 'right-arm': return [{ geo: limb(0.056, 0.6), pos: [-0.37, 1.1, 0], rotZ: -0.13 }];
    case 'left-leg': return [{ geo: limb(0.078, 0.7), pos: [0.11, 0.42, 0], rotZ: 0.03 }];
    case 'right-leg': return [{ geo: limb(0.078, 0.7), pos: [-0.11, 0.42, 0], rotZ: -0.03 }];
  }
}

/** Glass shell that glows at its edges (fresnel rim), the hologram look. */
const VERT = `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform vec3 uColor; uniform float uStrength;
varying vec3 vN; varying vec3 vV;
void main() {
  float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
  gl_FragColor = vec4(uColor, (0.12 + rim * 0.88) * uStrength);
}`;

function cssColor(name: string): THREE.Color {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || '#38e1ff');
}

interface Scene {
  shells: Map<FigureRegionId, THREE.ShaderMaterial>;
  wires: Map<FigureRegionId, THREE.MeshBasicMaterial>;
  groups: Map<FigureRegionId, THREE.Group>;
  rings: THREE.MeshBasicMaterial[];
  pickables: THREE.Mesh[];
}

export function BodyFigure3D({ views, selectedId, onPick, onUnavailable }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const [hover, setHover] = useState<FigureRegionId>();
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
    camera.position.set(0, 1.15, 4.4);

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.95, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 2.4;
    controls.maxDistance = 6.5;
    controls.minPolarAngle = Math.PI * 0.3;
    controls.maxPolarAngle = Math.PI * 0.58;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 1.1;
    controls.addEventListener('start', () => { controls.autoRotate = false; });

    const s: Scene = { shells: new Map(), wires: new Map(), groups: new Map(), rings: [], pickables: [] };
    const ids: FigureRegionId[] = ['head', 'chest', 'abdomen', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
    for (const id of ids) {
      const group = new THREE.Group();
      const shell = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color() }, uStrength: { value: 1 } },
      });
      const wire = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, depthWrite: false, opacity: 0.18 });
      const coarse = partsFor(id, true);
      partsFor(id).forEach((p, i) => {
        const mesh = new THREE.Mesh(p.geo, shell);
        const lattice = new THREE.Mesh(coarse[i].geo, wire);
        for (const m of [mesh, lattice]) {
          m.position.set(...p.pos);
          if (p.rotZ) m.rotation.z = p.rotZ;
          if (p.scale) m.scale.set(...p.scale);
        }
        mesh.userData.region = id;
        s.pickables.push(mesh);
        group.add(mesh, lattice);
      });
      world.add(group);
      s.shells.set(id, shell);
      s.wires.set(id, wire);
      s.groups.set(id, group);
    }

    // Scan platform under the feet
    for (const [r, w, o] of [[0.46, 0.012, 0.9], [0.62, 0.006, 0.5], [0.8, 0.004, 0.3]] as const) {
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + w, 96), mat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      world.add(ring);
      s.rings.push(mat);
    }
    scene.current = s;

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
      return ray.intersectObjects(s.pickables, false)[0]?.object.userData.region;
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

  // Color each part by status (theme-aware), brighter when selected or hovered
  useEffect(() => {
    const s = scene.current;
    if (!s) return;
    const accent = cssColor('--accent');
    const color = { ok: cssColor('--ok'), watch: cssColor('--watch'), act: cssColor('--act') };
    const light = theme === 'light';
    for (const { region, status } of views) {
      const c = status ? color[status] : accent;
      const on = region.id === selectedId || region.id === hover;
      const shell = s.shells.get(region.id)!;
      shell.uniforms.uColor.value.copy(c);
      shell.uniforms.uStrength.value = (on ? 1 : status && status !== 'ok' ? 0.85 : 0.6) * (light ? 0.9 : 1);
      shell.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      shell.needsUpdate = true;
      const wire = s.wires.get(region.id)!;
      wire.color.copy(c);
      wire.opacity = on ? 0.5 : light ? 0.28 : 0.16;
      s.groups.get(region.id)!.scale.setScalar(region.id === selectedId ? 1.035 : 1);
    }
    for (const r of s.rings) r.color.copy(accent);
  }, [views, selectedId, hover, theme]);

  const shown = views.find((v) => v.region.id === (hover ?? selectedId));

  return (
    <div ref={host} className={`holo${hover ? ' holo-hover' : ''}`} aria-hidden="true">
      {shown && (
        <p className="holo-label">
          {shown.region.label}
          {shown.status && <StatusBadge status={shown.status} />}
        </p>
      )}
      <p className="holo-hint">Drag to turn · scroll to zoom · click a part</p>
    </div>
  );
}

export default BodyFigure3D;
