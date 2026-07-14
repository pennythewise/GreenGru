// Dynamic 3D simulated steel factory — client-only (wrapped in <ClientOnly> by Dashboard).
// Five zones keyed 1:1 to factoryFloor / processMatrix stages. Hover a zone to see
// its live V/I/P + carbon intensity; drag to orbit, scroll to zoom, click to focus.
// Zooming into a building swaps its shell for a cutaway interior with hoverable
// equipment (see FactoryInteriors).
import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { CircleAlert, RotateCcw } from "lucide-react";

import { Block, C, CutawayShell, Cyl, ZoneInterior, type Vec3 } from "@/components/FactoryInteriors";
import { factoryFloor, type FactoryStageDatum } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

/* ---------- zone layout (flow left → right, zigzag like the reference map) ---------- */
const LAYOUT: Record<string, { pos: Vec3; hit: Vec3; pad: [number, number] }> = {
  sintering:   { pos: [-9.4, 0,  1.6], hit: [3.4, 2.8, 2.6], pad: [3.6, 2.8] },
  melting:     { pos: [-4.7, 0, -1.6], hit: [3.2, 3.2, 2.6], pad: [3.4, 2.8] },
  rolling:     { pos: [ 0.0, 0,  1.6], hit: [3.8, 2.2, 2.4], pad: [4.0, 2.6] },
  galvanizing: { pos: [ 4.7, 0, -1.6], hit: [3.0, 2.4, 2.4], pad: [3.2, 2.6] },
  finishing:   { pos: [ 9.4, 0,  1.6], hit: [3.2, 2.4, 2.6], pad: [3.4, 2.8] },
};

/* ---------- rising smoke (points, additive) ---------- */
function Smoke({ position, count = 22 }: { position: Vec3; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const seed = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = Math.sin(i * 12.9898) * 0.22;
      arr[i * 3 + 1] = (i / count) * 2.2;
      arr[i * 3 + 2] = Math.sin(i * 78.233) * 0.22;
    }
    return arr;
  }, [count]);
  useFrame((_, delta) => {
    const attr = ref.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!attr) return;
    for (let i = 0; i < count; i++) {
      let y = attr.getY(i) + delta * (0.45 + (i % 5) * 0.09);
      if (y > 2.2) y = 0;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
  });
  return (
    <points ref={ref} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[seed, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.2} color="#9aa4ae" transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ---------- flickering molten-metal light ---------- */
function MoltenGlow({ position }: { position: Vec3 }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (light.current)
      light.current.intensity = 2.4 + Math.sin(clock.elapsedTime * 7) * 0.7 + Math.sin(clock.elapsedTime * 13) * 0.35;
  });
  return <pointLight ref={light} position={position} color={C.ember} distance={7} intensity={2.4} />;
}

/* ---------- pulsing alert beacon (warn stages) ---------- */
function Beacon({ position }: { position: Vec3 }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const k = (Math.sin(clock.elapsedTime * 4) + 1) / 2;
    if (mat.current) mat.current.emissiveIntensity = 0.5 + k * 2.6;
    if (light.current) light.current.intensity = 0.4 + k * 1.8;
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial ref={mat} color={C.amber} emissive={C.amber} emissiveIntensity={1} />
      </mesh>
      <pointLight ref={light} color={C.amber} distance={4} />
    </group>
  );
}

/* ---------- conveyor tube between zones + hot billets travelling along it ---------- */
function Conveyor({ from, to, offset = 0 }: { from: Vec3; to: Vec3; offset?: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const b1 = useRef<THREE.Mesh>(null);
  const b2 = useRef<THREE.Mesh>(null);
  const curve = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(from[0], 0.45, from[2]),
        new THREE.Vector3((from[0] + to[0]) / 2, 1.15, (from[2] + to[2]) / 2),
        new THREE.Vector3(to[0], 0.45, to[2]),
      ),
    [from, to],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (mat.current) mat.current.emissiveIntensity = 0.5 + (Math.sin(t * 2.5 + offset) + 1) * 0.25;
    if (b1.current) b1.current.position.copy(curve.getPoint((t * 0.14 + offset * 0.13) % 1));
    if (b2.current) b2.current.position.copy(curve.getPoint((t * 0.14 + 0.5 + offset * 0.13) % 1));
  });
  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[curve, 24, 0.07, 8, false]} />
        <meshStandardMaterial ref={mat} color="#4a3626" emissive={C.ember} emissiveIntensity={0.6} metalness={0.4} roughness={0.5} />
      </mesh>
      {[b1, b2].map((r, i) => (
        <mesh key={i} ref={r}>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshStandardMaterial color={C.ember} emissive={C.ember} emissiveIntensity={2.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- zone set-pieces (procedural primitives per skill pattern) ---------- */
function SinteringPlant() {
  return (
    <group>
      <Block position={[-0.3, 0.55, 0]} size={[2.1, 1.1, 1.4]} />
      <Block position={[-0.3, 1.22, 0]} size={[1.5, 0.26, 1.1]} color={C.steelDark} />
      <Cyl position={[-0.95, 1.9, 0.3]} args={[0.11, 0.15, 1.5]} color={C.steelDark} />
      <Cyl position={[0.35, 1.8, -0.3]} args={[0.11, 0.15, 1.3]} color={C.steelDark} />
      <Smoke position={[-0.95, 2.6, 0.3]} />
      <Smoke position={[0.35, 2.4, -0.3]} />
      <Cyl position={[1.25, 0.7, 0.45]} args={[0.34, 0.34, 1.4]} color={C.steelLight} />
      <Cyl position={[1.25, 1.55, 0.45]} args={[0.02, 0.34, 0.3]} color={C.steelDark} />
      <Block position={[1.15, 0.25, -0.6]} size={[0.9, 0.5, 0.5]} color={C.steelDark} />
    </group>
  );
}

function MeltShop() {
  return (
    <group>
      {/* blast furnace: stacked cylinder + cone, ember-lit taphole */}
      <Cyl position={[-0.65, 0.95, 0]} args={[0.52, 0.72, 1.9]} color={C.steelLight} />
      <Cyl position={[-0.65, 2.3, 0]} args={[0.2, 0.52, 0.85]} color={C.steelDark} />
      <Cyl position={[-0.65, 0.08, 0]} args={[0.76, 0.8, 0.16]} color="#2c1a10" emissive={C.ember} glow={1.4} />
      <Smoke position={[-0.65, 2.8, 0]} />
      {/* BOF converter with molten top */}
      <Cyl position={[0.85, 0.72, 0.35]} args={[0.44, 0.34, 1.0]} color={C.steelDark} />
      <Cyl position={[0.85, 1.25, 0.35]} args={[0.3, 0.3, 0.07]} color={C.ember} emissive={C.ember} glow={2.2} />
      <MoltenGlow position={[0.85, 1.7, 0.35]} />
      <Block position={[0.85, 0.12, -0.65]} size={[1.3, 0.24, 0.5]} color={C.steelDark} />
    </group>
  );
}

function RollingMill() {
  return (
    <group>
      <Block position={[0, 0.55, -0.55]} size={[3.3, 1.1, 1.0]} />
      <Block position={[0, 1.18, -0.55]} size={[3.4, 0.16, 1.1]} color={C.steelDark} />
      {/* roller table + red-hot strip */}
      {[-1.3, -0.65, 0, 0.65, 1.3].map((x) => (
        <Cyl key={x} position={[x, 0.24, 0.55]} args={[0.08, 0.08, 0.85]} rotation={[0, 0, Math.PI / 2]} color={C.steelDark} />
      ))}
      <Block position={[0, 0.33, 0.55]} size={[2.9, 0.05, 0.42]} color={C.ember} emissive={C.ember} glow={1.7} />
    </group>
  );
}

function GalvanizingLine() {
  return (
    <group>
      <Block position={[0, 0.62, -0.3]} size={[2.4, 1.24, 1.0]} />
      <Block position={[0, 1.32, -0.3]} size={[2.5, 0.16, 1.1]} color={C.steelDark} />
      {/* zinc bath — molten silver-teal surface */}
      <Block position={[0, 0.26, 0.75]} size={[1.25, 0.52, 0.55]} color={C.steelDark} />
      <Block position={[0, 0.54, 0.75]} size={[1.1, 0.04, 0.42]} color="#bfe8ee" emissive={C.teal} glow={0.9} metalness={0.9} roughness={0.15} />
      <Cyl position={[0.95, 1.7, -0.4]} args={[0.09, 0.12, 0.9]} color={C.steelDark} />
      <Smoke position={[0.95, 2.2, -0.4]} count={14} />
    </group>
  );
}

function FinishingYard() {
  return (
    <group>
      <Block position={[-0.35, 0.7, -0.25]} size={[2.3, 1.4, 1.2]} color={C.steelLight} />
      <Block position={[-0.35, 1.48, -0.25]} size={[2.4, 0.18, 1.3]} color={C.steelDark} />
      {/* finished steel coils */}
      {[-0.75, -0.1, 0.55].map((x, i) => (
        <Cyl key={x} position={[x, 0.3, 0.85]} args={[0.28, 0.28, 0.42]} rotation={[0, 0, Math.PI / 2]} color={i === 1 ? "#8b97a5" : "#76828f"} metalness={0.85} roughness={0.3} />
      ))}
      <Block position={[1.2, 0.26, 0.3]} size={[0.5, 0.5, 0.5]} color="#6d5a41" metalness={0.1} roughness={0.8} />
    </group>
  );
}

const ZONE_BUILDERS: Record<string, () => JSX.Element> = {
  sintering: SinteringPlant,
  melting: MeltShop,
  rolling: RollingMill,
  galvanizing: GalvanizingLine,
  finishing: FinishingYard,
};

/* ---------- hover data card (DOM via drei Html) ---------- */
function ZoneCard({ data }: { data: FactoryStageDatum }) {
  return (
    <div className="w-[200px] rounded-lg border border-teal/40 bg-surface/95 backdrop-blur-md px-3 py-2.5 shadow-xl">
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] font-medium text-foreground">{data.stage}</span>
        <span className="text-[10.5px] font-mono text-muted-foreground">{data.zh}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px] font-mono">
        <span className="text-muted-foreground">V</span><span className="text-right text-foreground">{data.voltage}</span>
        <span className="text-muted-foreground">I</span><span className="text-right text-foreground">{data.current}</span>
        <span className="text-muted-foreground">P</span><span className="text-right text-foreground">{data.power} kW</span>
        <span className="text-muted-foreground">CO₂e</span><span className="text-right text-gold">{data.carbon.toFixed(2)} t/t</span>
      </div>
      {data.warning && (
        <div className="mt-1.5 flex items-start gap-1 rounded border border-warning/40 bg-warning/[0.08] px-1.5 py-1 text-[10px] text-warning">
          <CircleAlert className="h-3 w-3 mt-px shrink-0" /> {data.warning}
        </div>
      )}
    </div>
  );
}

/* ---------- interactive zone wrapper: hover pad + hit volume + data card ----------
   When the camera is inside the zone's radius (interiorOpen), the solid building is
   swapped for a cutaway shell + hoverable interior equipment. */
function Zone({ data, hovered, onHover, onFocus, interiorOpen, hoveredEq, onHoverEq }: {
  data: FactoryStageDatum;
  hovered: boolean;
  onHover: (k: string | null) => void;
  onFocus: (k: string) => void;
  interiorOpen: boolean;
  hoveredEq: string | null;
  onHoverEq: (k: string | null) => void;
}) {
  const layout = LAYOUT[data.key];
  const Builder = ZONE_BUILDERS[data.key];
  if (!layout || !Builder) return null;
  const padColor = data.status === "warn" ? C.amber : C.pad;
  return (
    <group position={layout.pos}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={layout.pad} />
        <meshStandardMaterial color={padColor} transparent opacity={hovered ? 0.22 : 0.06} emissive={padColor} emissiveIntensity={hovered ? 0.8 : 0.1} />
      </mesh>
      {interiorOpen ? (
        <>
          <CutawayShell hit={layout.hit} />
          <ZoneInterior stage={data} hoveredEq={hoveredEq} onHover={onHoverEq} />
        </>
      ) : (
        <Builder />
      )}
      {data.status === "warn" && <Beacon position={[0, layout.hit[1] + 0.35, 0]} />}
      {!interiorOpen && (
        <mesh
          position={[0, layout.hit[1] / 2, 0]}
          onPointerOver={(e) => { e.stopPropagation(); onHover(data.key); }}
          onPointerOut={() => onHover(null)}
          onClick={(e) => { e.stopPropagation(); onFocus(data.key); }}
        >
          <boxGeometry args={layout.hit} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {hovered && !interiorOpen && (
        <Html position={[0, layout.hit[1] + 0.9, 0]} center zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
          <ZoneCard data={data} />
        </Html>
      )}
    </group>
  );
}

/* ---------- interior trigger: opens the closest zone the camera dives into ---------- */
const ZONE_CENTERS = Object.fromEntries(
  Object.entries(LAYOUT).map(([k, v]) => [k, new THREE.Vector3(v.pos[0], 1, v.pos[2])]),
);
// A building opens when the orbit target (what the camera looks at) sits on the
// zone AND the camera is close enough. Camera position alone is wrong: parked in
// front of one building, the camera is often physically nearer a neighbour.
function InteriorSensor({ current, onChange }: { current: string | null; onChange: (k: string | null) => void }) {
  useFrame((state) => {
    const controls = state.controls as unknown as { target: THREE.Vector3 } | null;
    if (!controls) return;
    let best: string | null = null;
    let bestD = Infinity;
    for (const k in ZONE_CENTERS) {
      const d = controls.target.distanceTo(ZONE_CENTERS[k]);
      if (d < bestD) { bestD = d; best = k; }
    }
    if (best) {
      const camD = state.camera.position.distanceTo(ZONE_CENTERS[best]);
      const isCurrent = best === current; // hysteresis so the boundary doesn't flicker
      if (bestD > (isCurrent ? 4.5 : 3.5) || camD > (isCurrent ? 11 : 9)) best = null;
    }
    if (best !== current) onChange(best);
  });
  return null;
}

/* ---------- camera fly-to on click, hands control back after ~1.4s ---------- */
const DEFAULT_CAM = new THREE.Vector3(0, 12.5, 17);
const DEFAULT_TGT = new THREE.Vector3(0, 0.6, 0);

function CameraRig({ focus }: { focus: string | null }) {
  const anim = useRef(0);
  const prev = useRef<string | null>(null);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const tgtPos = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    if (focus !== prev.current) { prev.current = focus; anim.current = 1.4; }
    if (anim.current <= 0) return;
    anim.current -= delta;
    const layout = focus ? LAYOUT[focus] : undefined;
    if (layout) {
      camPos.set(layout.pos[0] + 0.3, 3.6, layout.pos[2] + 5.0);
      tgtPos.set(layout.pos[0], 0.7, layout.pos[2]);
    } else {
      camPos.copy(DEFAULT_CAM);
      tgtPos.copy(DEFAULT_TGT);
    }
    const k = 1 - Math.pow(0.002, delta);
    state.camera.position.lerp(camPos, k);
    const controls = state.controls as unknown as { target: THREE.Vector3; update(): void } | null;
    if (controls) { controls.target.lerp(tgtPos, k); controls.update(); }
  });
  return null;
}

/* ============================================================ */

export function FactoryScene() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [interiorZone, setInteriorZone] = useState<string | null>(null);
  const [hoveredEq, setHoveredEq] = useState<string | null>(null);
  useEffect(() => () => { document.body.style.cursor = "auto"; }, []);
  useEffect(() => {
    document.body.style.cursor = hovered || hoveredEq ? "pointer" : "auto";
  }, [hovered, hoveredEq]);

  const interiorStage = interiorZone ? factoryFloor.find((f) => f.key === interiorZone) : undefined;
  const enterInterior = (k: string | null) => {
    setInteriorZone(k);
    setHovered(null);
    setHoveredEq(null);
  };

  const flow = factoryFloor.map((f) => LAYOUT[f.key]?.pos).filter(Boolean) as Vec3[];

  return (
    <div className="relative h-[400px] rounded-lg overflow-hidden border border-border bg-[#0d1319]">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 12.5, 17], fov: 42 }}>
        <CameraRig focus={focus} />
        <InteriorSensor current={interiorZone} onChange={enterInterior} />
        <hemisphereLight args={["#8fa0b5", "#141a22", 0.75]} />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[8, 14, 6]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-16}
          shadow-camera-right={16}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />
        {/* front fill so near faces aren't crushed to black */}
        <directionalLight position={[-6, 8, 12]} intensity={0.4} />
        {/* ground + subtle grid */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[30, 13]} />
          <meshStandardMaterial color={C.ground} roughness={0.95} metalness={0.05} />
        </mesh>
        <gridHelper args={[30, 30, "#1c2630", "#161e27"]} position={[0, 0.001, 0]} />

        {factoryFloor.map((f) => (
          <Zone
            key={f.key}
            data={f}
            hovered={hovered === f.key}
            onHover={setHovered}
            onFocus={(k) => setFocus((cur) => (cur === k ? null : k))}
            interiorOpen={interiorZone === f.key}
            hoveredEq={hoveredEq}
            onHoverEq={setHoveredEq}
          />
        ))}
        {flow.slice(0, -1).map((from, i) => (
          <Conveyor key={i} from={from} to={flow[i + 1]} offset={i * 1.7} />
        ))}

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2.5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.15}
          target={[0, 0.6, 0]}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-2 left-3 text-[10px] font-mono text-muted-foreground/80">
        drag 旋转 · scroll 缩放 · hover 查看排放 · click/zoom 进入车间
      </div>
      {interiorStage && (
        <div className="pointer-events-none absolute top-2 left-3 inline-flex items-center gap-1.5 rounded border border-teal/40 bg-surface/90 px-2 py-1 text-[10.5px] font-mono text-teal">
          <span className="h-1.5 w-1.5 rounded-full bg-teal pulse-dot" />
          Inside {interiorStage.stage} · {interiorStage.zh} — hover equipment 查看设备
        </div>
      )}
      {(focus || interiorZone) && (
        <button
          onClick={() => { setFocus(null); enterInterior(null); }}
          className={cn(
            "absolute top-2 right-2 inline-flex items-center gap-1 rounded border border-border",
            "bg-surface/90 px-2 py-1 text-[10.5px] font-mono text-muted-foreground hover:text-foreground transition",
          )}
        >
          <RotateCcw className="h-3 w-3" /> Reset view
        </button>
      )}
    </div>
  );
}
