// Interior floor layouts for the 3D factory buildings. Shown when the camera
// zooms inside a zone (see FactoryScene). Every equipment item is hoverable and
// shows its share of the parent stage's power / carbon — data lives in
// factoryEquipment (dashboard-data.ts) so numbers reconcile with stage totals.
import type { JSX, ReactNode } from "react";
import { Html } from "@react-three/drei";
import { CircleAlert } from "lucide-react";

import { factoryEquipment, type FactoryEquipment, type FactoryStageDatum } from "@/lib/dashboard-data";

export type Vec3 = [number, number, number];

export const C = {
  steel: "#5d6875", steelDark: "#3d4650", steelLight: "#7d8794",
  ember: "#ff7a3d", teal: "#3ec6da", amber: "#ecb64e", green: "#43d18f",
  ground: "#10161d", pad: "#3ec6da", floor: "#232b34",
};

/* ---------- shared primitives (also used by FactoryScene exteriors) ---------- */
export function Block({ position, size, color = C.steel, rotation, emissive, glow = 0, metalness = 0.35, roughness = 0.55 }: {
  position: Vec3; size: Vec3; color?: string; rotation?: Vec3; emissive?: string; glow?: number; metalness?: number; roughness?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} emissive={emissive ?? "#000000"} emissiveIntensity={glow} />
    </mesh>
  );
}

export function Cyl({ position, args, color = C.steel, rotation, emissive, glow = 0, metalness = 0.5, roughness = 0.45 }: {
  position: Vec3; args: [number, number, number, number?]; color?: string; rotation?: Vec3; emissive?: string; glow?: number; metalness?: number; roughness?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[args[0], args[1], args[2], args[3] ?? 20]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} emissive={emissive ?? "#000000"} emissiveIntensity={glow} />
    </mesh>
  );
}

/* ---------- cutaway shell shown instead of the solid building ---------- */
export function CutawayShell({ hit }: { hit: Vec3 }) {
  const [w, h, d] = hit;
  return (
    <group>
      <Block position={[0, 0.05, 0]} size={[w - 0.15, 0.1, d - 0.15]} color={C.floor} metalness={0.1} roughness={0.9} />
      {([[-1, -1], [-1, 1], [1, -1], [1, 1]] as const).map(([sx, sz]) => (
        <Block key={`${sx}${sz}`} position={[sx * (w / 2 - 0.1), h / 2, sz * (d / 2 - 0.1)]} size={[0.12, h, 0.12]} color={C.steelDark} />
      ))}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={C.teal} transparent opacity={0.05} depthWrite={false} metalness={0} roughness={1} />
      </mesh>
    </group>
  );
}

/* ---------- hover card for one piece of equipment ---------- */
function EquipmentCard({ eq, stage }: { eq: FactoryEquipment; stage: FactoryStageDatum }) {
  const kw = Math.round((stage.power * eq.powerShare) / 100);
  const co2 = ((stage.carbon * eq.carbonShare) / 100).toFixed(2);
  return (
    <div className="w-[215px] rounded-lg border border-teal/40 bg-surface/95 backdrop-blur-md px-3 py-2.5 shadow-xl">
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] font-medium text-foreground">{eq.name}</span>
        <span className="text-[10.5px] font-mono text-muted-foreground">{eq.zh}</span>
      </div>
      <div className="mt-0.5 text-[10.5px] text-muted-foreground leading-snug">{eq.role}</div>
      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px] font-mono">
        <span className="text-muted-foreground">P</span>
        <span className="text-right text-foreground">{kw} kW · {eq.powerShare}%</span>
        <span className="text-muted-foreground">CO₂e</span>
        <span className="text-right text-gold">{co2} t/t · {eq.carbonShare}%</span>
      </div>
      {eq.hotspot && (
        <div className="mt-1.5 flex items-center gap-1 rounded border border-warning/40 bg-warning/[0.08] px-1.5 py-1 text-[10px] text-warning">
          <CircleAlert className="h-3 w-3 shrink-0" /> Main emission source · 主排放源
        </div>
      )}
    </div>
  );
}

/* ---------- hoverable equipment wrapper: geometry + hit volume + ring + card ---------- */
type InteriorProps = {
  stage: FactoryStageDatum;
  hoveredEq: string | null;
  onHover: (k: string | null) => void;
};

function Item({ stage, hoveredEq, onHover, eqKey, position, hit, children }: InteriorProps & {
  eqKey: string; position: Vec3; hit: Vec3; children: ReactNode;
}) {
  const eq = factoryEquipment[stage.key]?.find((e) => e.key === eqKey);
  if (!eq) return null;
  const id = `${stage.key}:${eqKey}`;
  const hovered = hoveredEq === id;
  const ringR = Math.max(hit[0], hit[2]) * 0.62;
  const ringColor = eq.hotspot ? C.amber : C.teal;
  return (
    <group position={position}>
      {children}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.115, 0]}>
        <ringGeometry args={[ringR, ringR + 0.06, 28]} />
        <meshBasicMaterial color={ringColor} transparent opacity={hovered ? 0.9 : 0} depthWrite={false} />
      </mesh>
      <mesh
        position={[0, hit[1] / 2 + 0.1, 0]}
        onPointerOver={(e) => { e.stopPropagation(); onHover(id); }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <boxGeometry args={hit} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hovered && (
        <Html position={[0, hit[1] + 0.55, 0]} center zIndexRange={[60, 0]} style={{ pointerEvents: "none" }}>
          <EquipmentCard eq={eq} stage={stage} />
        </Html>
      )}
    </group>
  );
}

/* ================= per-zone interiors (positions are zone-local) ================= */

function SinteringInterior(p: InteriorProps) {
  return (
    <group>
      <Item {...p} eqKey="bins" position={[-1.25, 0, -0.8]} hit={[0.8, 1.0, 0.6]}>
        {[-0.2, 0.2].map((x) => (
          <group key={x}>
            <Block position={[x, 0.72, 0]} size={[0.32, 0.5, 0.4]} color={C.steelLight} />
            <Cyl position={[x, 0.32, 0]} args={[0.05, 0.17, 0.3]} color={C.steelDark} />
          </group>
        ))}
      </Item>
      <Item {...p} eqKey="drum" position={[-1.25, 0, 0.5]} hit={[0.9, 0.7, 0.6]}>
        <Cyl position={[0, 0.4, 0]} args={[0.22, 0.22, 0.8]} rotation={[0.12, 0, Math.PI / 2]} color={C.steelLight} />
        <Block position={[-0.32, 0.18, 0]} size={[0.14, 0.24, 0.3]} color={C.steelDark} />
        <Block position={[0.32, 0.18, 0]} size={[0.14, 0.24, 0.3]} color={C.steelDark} />
      </Item>
      <Item {...p} eqKey="ignition" position={[-0.5, 0, -0.15]} hit={[0.5, 0.8, 0.7]}>
        <Block position={[0, 0.52, 0]} size={[0.4, 0.34, 0.55]} color={C.steelDark} />
        <Block position={[0, 0.32, 0]} size={[0.34, 0.06, 0.48]} color={C.ember} emissive={C.ember} glow={1.8} />
      </Item>
      <Item {...p} eqKey="strand" position={[0.45, 0, -0.15]} hit={[1.5, 0.7, 0.75]}>
        <Block position={[0, 0.3, 0]} size={[1.4, 0.22, 0.6]} color={C.steelDark} />
        <Block position={[0, 0.44, 0]} size={[1.36, 0.06, 0.52]} color={C.ember} emissive={C.ember} glow={1.5} />
        {[-0.5, 0, 0.5].map((x) => (
          <Block key={x} position={[x, 0.12, 0]} size={[0.1, 0.14, 0.5]} color={C.steel} />
        ))}
      </Item>
      <Item {...p} eqKey="cooler" position={[1.1, 0, 0.72]} hit={[0.9, 0.5, 0.9]}>
        <mesh position={[0, 0.22, 0]} rotation-x={-Math.PI / 2} castShadow>
          <torusGeometry args={[0.32, 0.11, 12, 28]} />
          <meshStandardMaterial color={C.steelLight} metalness={0.5} roughness={0.5} />
        </mesh>
      </Item>
      <Item {...p} eqKey="esp" position={[1.15, 0, -0.85]} hit={[0.8, 1.2, 0.6]}>
        <Block position={[0, 0.55, 0]} size={[0.66, 0.8, 0.45]} color={C.steelLight} />
        <Cyl position={[-0.15, 1.2, 0]} args={[0.06, 0.08, 0.6]} color={C.steelDark} />
        <Cyl position={[0.15, 1.2, 0]} args={[0.06, 0.08, 0.6]} color={C.steelDark} />
      </Item>
    </group>
  );
}

function MeltingInterior(p: InteriorProps) {
  return (
    <group>
      <Item {...p} eqKey="scrap" position={[-1.2, 0, 0.6]} hit={[0.8, 0.6, 0.7]}>
        <Block position={[0, 0.14, 0]} size={[0.7, 0.18, 0.6]} color={C.steelDark} />
        {[[-0.15, 0.3, 0.1], [0.12, 0.34, -0.08], [0, 0.42, 0.05]].map((q, i) => (
          <Block key={i} position={q as Vec3} size={[0.2, 0.14, 0.18]} rotation={[0, i * 0.7, 0]} color="#4a5461" />
        ))}
      </Item>
      <Item {...p} eqKey="ladle" position={[-1.2, 0, -0.55]} hit={[0.6, 0.8, 0.6]}>
        <Cyl position={[0, 0.4, 0]} args={[0.24, 0.19, 0.5]} color={C.steelDark} />
        <Cyl position={[0, 0.66, 0]} args={[0.19, 0.19, 0.05]} color={C.ember} emissive={C.ember} glow={2.2} />
      </Item>
      <Item {...p} eqKey="bof" position={[-0.3, 0, -0.3]} hit={[0.8, 1.3, 0.8]}>
        <Cyl position={[0, 0.62, 0]} args={[0.4, 0.3, 0.9]} color={C.steelDark} />
        <Cyl position={[0, 1.1, 0]} args={[0.26, 0.26, 0.07]} color={C.ember} emissive={C.ember} glow={2.2} />
        <Cyl position={[0, 1.5, 0]} args={[0.03, 0.03, 0.7]} color={C.steelLight} />
      </Item>
      <Item {...p} eqKey="og" position={[-0.3, 0, 0.62]} hit={[0.7, 1.4, 0.5]}>
        <Block position={[0, 0.7, 0]} size={[0.5, 1.0, 0.35]} color={C.steelLight} />
        <Cyl position={[0, 1.35, 0]} args={[0.09, 0.09, 0.4]} rotation={[Math.PI / 2.6, 0, 0]} color={C.steelDark} />
      </Item>
      <Item {...p} eqKey="lf" position={[0.62, 0, 0.45]} hit={[0.7, 1.1, 0.7]}>
        <Cyl position={[0, 0.36, 0]} args={[0.26, 0.22, 0.5]} color={C.steelDark} />
        <Block position={[0, 0.75, 0]} size={[0.6, 0.1, 0.5]} color={C.steelLight} />
        {[-0.12, 0, 0.12].map((x) => (
          <Cyl key={x} position={[x, 0.62, 0]} args={[0.025, 0.025, 0.4]} color="#20262e" emissive={C.ember} glow={0.6} />
        ))}
      </Item>
      <Item {...p} eqKey="caster" position={[1.15, 0, -0.4]} hit={[0.8, 0.9, 0.8]}>
        <Block position={[0, 0.6, -0.15]} size={[0.55, 0.5, 0.3]} color={C.steelLight} />
        <Block position={[0, 0.3, 0.18]} size={[0.5, 0.08, 0.5]} rotation={[-0.5, 0, 0]} color={C.steelDark} />
        <Block position={[0, 0.13, 0.32]} size={[0.42, 0.04, 0.3]} color={C.ember} emissive={C.ember} glow={1.6} />
      </Item>
    </group>
  );
}

function RollingInterior(p: InteriorProps) {
  return (
    <group>
      {/* strip line through the mill */}
      <Block position={[0.25, 0.16, 0.2]} size={[3.0, 0.03, 0.3]} color={C.ember} emissive={C.ember} glow={1.2} />
      <Item {...p} eqKey="reheat" position={[-1.55, 0, -0.25]} hit={[0.8, 1.0, 0.9]}>
        <Block position={[0, 0.45, 0]} size={[0.7, 0.7, 0.8]} color={C.steelLight} />
        <Block position={[0.36, 0.32, 0]} size={[0.04, 0.3, 0.4]} color={C.ember} emissive={C.ember} glow={2.0} />
      </Item>
      <Item {...p} eqKey="rough" position={[-0.65, 0, 0.2]} hit={[0.5, 1.0, 0.8]}>
        <Block position={[0, 0.5, 0]} size={[0.3, 0.85, 0.7]} color={C.steelDark} />
        <Cyl position={[0, 0.3, 0]} args={[0.09, 0.09, 0.74]} rotation={[Math.PI / 2, 0, 0]} color={C.steelLight} />
      </Item>
      <Item {...p} eqKey="finish" position={[0.35, 0, 0.2]} hit={[1.0, 1.0, 0.8]}>
        {[-0.3, 0, 0.3].map((x) => (
          <group key={x}>
            <Block position={[x, 0.48, 0]} size={[0.2, 0.8, 0.68]} color={C.steelDark} />
            <Cyl position={[x, 0.28, 0]} args={[0.07, 0.07, 0.7]} rotation={[Math.PI / 2, 0, 0]} color={C.steelLight} />
          </group>
        ))}
      </Item>
      <Item {...p} eqKey="laminar" position={[1.15, 0, 0.2]} hit={[0.5, 0.6, 0.7]}>
        <Block position={[0, 0.42, 0]} size={[0.4, 0.08, 0.6]} color={C.steelLight} />
        <Block position={[0, 0.28, 0]} size={[0.36, 0.16, 0.5]} color="#7fd8e8" emissive={C.teal} glow={0.7} metalness={0.1} roughness={0.3} />
      </Item>
      <Item {...p} eqKey="coiler" position={[1.72, 0, 0.2]} hit={[0.55, 0.7, 0.7]}>
        <Cyl position={[0, 0.32, 0]} args={[0.24, 0.24, 0.4]} rotation={[0, 0, Math.PI / 2]} color="#8b97a5" metalness={0.85} roughness={0.3} />
        <Block position={[0, 0.1, 0.24]} size={[0.5, 0.12, 0.1]} color={C.steelDark} />
      </Item>
    </group>
  );
}

function GalvanizingInterior(p: InteriorProps) {
  return (
    <group>
      <Item {...p} eqKey="clean" position={[-1.1, 0, 0.4]} hit={[0.8, 0.6, 0.7]}>
        {[-0.18, 0.18].map((x) => (
          <Block key={x} position={[x, 0.22, 0]} size={[0.3, 0.3, 0.55]} color={C.steelLight} />
        ))}
        <Block position={[0, 0.4, 0]} size={[0.7, 0.04, 0.5]} color={C.steelDark} />
      </Item>
      <Item {...p} eqKey="anneal" position={[-0.35, 0, -0.4]} hit={[1.2, 0.8, 0.7]}>
        <Block position={[0, 0.42, 0]} size={[1.1, 0.55, 0.6]} color={C.steelLight} />
        <Block position={[0, 0.42, 0.31]} size={[0.95, 0.08, 0.02]} color={C.ember} emissive={C.ember} glow={1.8} />
      </Item>
      <Item {...p} eqKey="pot" position={[0.55, 0, 0.4]} hit={[0.7, 0.6, 0.7]}>
        <Block position={[0, 0.24, 0]} size={[0.55, 0.44, 0.55]} color={C.steelDark} />
        <Block position={[0, 0.47, 0]} size={[0.46, 0.03, 0.46]} color="#bfe8ee" emissive={C.teal} glow={1.0} metalness={0.9} roughness={0.15} />
      </Item>
      <Item {...p} eqKey="knife" position={[1.05, 0, 0.4]} hit={[0.4, 0.9, 0.5]}>
        <Block position={[0, 0.55, 0]} size={[0.05, 0.5, 0.05]} color={C.steelLight} />
        {[-0.07, 0.07].map((x) => (
          <Block key={x} position={[x, 0.62, 0]} size={[0.03, 0.26, 0.3]} color={C.steelDark} />
        ))}
      </Item>
      <Item {...p} eqKey="spm" position={[0.85, 0, -0.45]} hit={[0.5, 0.9, 0.7]}>
        <Block position={[0, 0.45, 0]} size={[0.28, 0.74, 0.6]} color={C.steelDark} />
        <Cyl position={[0, 0.3, 0]} args={[0.08, 0.08, 0.64]} rotation={[Math.PI / 2, 0, 0]} color={C.steelLight} />
      </Item>
    </group>
  );
}

function FinishingInterior(p: InteriorProps) {
  return (
    <group>
      <Item {...p} eqKey="ctl" position={[-1.0, 0, -0.45]} hit={[1.1, 0.7, 0.7]}>
        <Block position={[0, 0.28, 0]} size={[1.0, 0.1, 0.5]} color={C.steelLight} />
        <Block position={[0.2, 0.55, 0]} size={[0.1, 0.45, 0.55]} color={C.steelDark} />
      </Item>
      <Item {...p} eqKey="inspect" position={[-0.25, 0, 0.6]} hit={[0.6, 0.7, 0.6]}>
        <Block position={[0, 0.26, 0]} size={[0.5, 0.08, 0.45]} color={C.steelLight} />
        <Block position={[0, 0.56, 0]} size={[0.4, 0.04, 0.1]} color="#e8f2f6" emissive="#e8f2f6" glow={0.9} />
        <Block position={[-0.2, 0.4, 0]} size={[0.04, 0.3, 0.04]} color={C.steelDark} />
      </Item>
      <Item {...p} eqKey="pack" position={[0.55, 0, -0.5]} hit={[0.6, 0.8, 0.6]}>
        <Block position={[0, 0.22, 0]} size={[0.5, 0.12, 0.5]} color={C.steelDark} />
        <Block position={[0, 0.62, 0]} size={[0.55, 0.08, 0.08]} color={C.amber} />
        <Block position={[0, 0.42, 0]} size={[0.06, 0.36, 0.06]} color={C.steelLight} />
      </Item>
      <Item {...p} eqKey="crane" position={[0.2, 0, 0]} hit={[0.5, 1.9, 0.4]}>
        <Block position={[0, 1.62, 0]} size={[0.16, 0.14, 2.1]} color={C.amber} />
        <Block position={[0, 0.8, -0.95]} size={[0.1, 1.6, 0.1]} color={C.steelDark} />
        <Block position={[0, 0.8, 0.95]} size={[0.1, 1.6, 0.1]} color={C.steelDark} />
        <Block position={[0, 1.45, 0.2]} size={[0.14, 0.2, 0.2]} color={C.steelLight} />
      </Item>
      <Item {...p} eqKey="storage" position={[1.15, 0, 0.55]} hit={[0.9, 0.7, 0.7]}>
        {[-0.28, 0.05, 0.38].map((x, i) => (
          <Cyl key={x} position={[x, 0.26, 0]} args={[0.22, 0.22, 0.3]} rotation={[0, 0, Math.PI / 2]} color={i === 1 ? "#8b97a5" : "#76828f"} metalness={0.85} roughness={0.3} />
        ))}
      </Item>
    </group>
  );
}

const INTERIORS: Record<string, (p: InteriorProps) => JSX.Element> = {
  sintering: SinteringInterior,
  melting: MeltingInterior,
  rolling: RollingInterior,
  galvanizing: GalvanizingInterior,
  finishing: FinishingInterior,
};

export function ZoneInterior(p: InteriorProps) {
  const Interior = INTERIORS[p.stage.key];
  return Interior ? <Interior {...p} /> : null;
}
