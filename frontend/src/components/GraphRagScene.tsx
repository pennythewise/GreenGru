/**
 * Interactive 3D Graph RAG scene — same stack as FactoryScene
 * (@react-three/fiber + drei OrbitControls). Drag to orbit, scroll to zoom,
 * grab nodes to pull them around; evidence-path edges stay highlighted.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import type { GraphRagEdge, GraphRagNode } from "@/lib/api";
import { cn } from "@/lib/utils";

const LAYER_HEIGHT: Record<string, number> = {
  emission: -0.9,
  process: 0.15,
  material: 0.85,
  customs: 1.45,
  boundary: 2.1,
  policy: 2.7,
  bat: 2.7,
  rubric: 2.9,
};

type Vec3 = [number, number, number];

function shortLabel(n: GraphRagNode, isZh: boolean): string {
  if (n.cn_code) return `CN ${n.cn_code}`;
  if (n.tag) return n.tag.replace(/_/g, " ");
  const raw = (isZh ? n.name_zh : n.name_en) || n.id;
  const cleaned = raw
    .replace(/（[^）]*）/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (isZh) return cleaned.length > 12 ? `${cleaned.slice(0, 12)}…` : cleaned;
  return cleaned.length > 20 ? `${cleaned.slice(0, 20)}…` : cleaned;
}

function initPositions(nodes: GraphRagNode[]): Record<string, Vec3> {
  if (!nodes.length) return {};
  const xs = nodes.map((n) => n.x ?? 0);
  const ys = nodes.map((n) => n.y ?? 0);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = 9;
  const out: Record<string, Vec3> = {};
  for (const n of nodes) {
    const nx = ((((n.x ?? 0) - minX) / spanX) * 2 - 1) * scale;
    const nz = ((((n.y ?? 0) - minY) / spanY) * 2 - 1) * scale;
    const ny = LAYER_HEIGHT[n.layer] ?? 0.4;
    out[n.id] = [nx, ny, nz];
  }
  return out;
}

function GraphEdge({
  from,
  to,
  hot,
  rel,
  showRel,
}: {
  from: Vec3;
  to: Vec3;
  hot: boolean;
  rel: string;
  showRel: boolean;
}) {
  const mid: Vec3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + 0.15, (from[2] + to[2]) / 2];
  return (
    <group>
      <Line
        points={[from, to]}
        color={hot ? "#3ec6da" : "#3d4a58"}
        lineWidth={hot ? 2.4 : 1.1}
        transparent
        opacity={hot ? 0.95 : 0.45}
      />
      {showRel && (
        <Html position={mid} center distanceFactor={14} style={{ pointerEvents: "none" }}>
          <span
            className={cn(
              "whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-mono border shadow-sm",
              hot
                ? "bg-background/95 border-teal/50 text-teal"
                : "bg-background/80 border-border text-muted-foreground",
            )}
          >
            {rel}
          </span>
        </Html>
      )}
    </group>
  );
}

function DraggableNode({
  node,
  position,
  hot,
  isEnd,
  isZh,
  selected,
  onSelect,
  onPosition,
  onDragState,
}: {
  node: GraphRagNode;
  position: Vec3;
  hot: boolean;
  isEnd: boolean;
  isZh: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onPosition: (id: string, pos: Vec3) => void;
  onDragState: (dragging: boolean) => void;
}) {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const plane = useMemo(() => new THREE.Plane(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const label = shortLabel(node, isZh);
  const r = isEnd ? 0.38 : hot ? 0.3 : 0.22;

  const project = (e: ThreeEvent<PointerEvent>) => {
    camera.getWorldDirection(camDir);
    plane.setFromNormalAndCoplanarPoint(camDir.clone().negate(), new THREE.Vector3(...position));
    e.ray.intersectPlane(plane, hit);
    return hit;
  };

  return (
    <group position={position}>
      {isEnd && (
        <mesh>
          <sphereGeometry args={[r + 0.18, 24, 24]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.18} />
        </mesh>
      )}
      <mesh
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (!dragging.current) document.body.style.cursor = "auto";
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          gl.domElement.setPointerCapture(e.pointerId);
          dragging.current = true;
          onDragState(true);
          document.body.style.cursor = "grabbing";
          const p = project(e);
          offset.set(position[0] - p.x, position[1] - p.y, position[2] - p.z);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          if (gl.domElement.hasPointerCapture(e.pointerId)) {
            gl.domElement.releasePointerCapture(e.pointerId);
          }
          const wasDrag = dragging.current;
          dragging.current = false;
          onDragState(false);
          document.body.style.cursor = "auto";
          // Treat as select only if we didn't move much — still fine to open card
          if (wasDrag) onSelect(node.id);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          e.stopPropagation();
          const p = project(e);
          onPosition(node.id, [p.x + offset.x, p.y + offset.y, p.z + offset.z]);
        }}
      >
        <sphereGeometry args={[r, 28, 28]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hot || selected ? 0.35 : 0.12}
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>
      <Html
        position={[0, r + 0.35, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: "none" }}
        zIndexRange={[40, 0]}
      >
        <div
          className={cn(
            "whitespace-nowrap rounded-full border px-2 py-0.5 text-[10.5px] font-medium shadow-sm backdrop-blur-sm bg-background/90",
            hot || selected || isEnd ? "text-foreground" : "text-muted-foreground border-border",
          )}
          style={{
            borderColor: hot || selected || isEnd ? node.color : undefined,
          }}
        >
          <span
            className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
            style={{ background: node.color }}
          />
          {label}
        </div>
      </Html>
    </group>
  );
}

function GraphWorld({
  nodes,
  edges,
  endpointIds,
  highlightIds,
  isZh,
  showAllEdgeLabels,
  selectedId,
  onSelect,
}: {
  nodes: GraphRagNode[];
  edges: GraphRagEdge[];
  endpointIds: string[];
  highlightIds: Set<string>;
  isZh: boolean;
  showAllEdgeLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [positions, setPositions] = useState(() => initPositions(nodes));
  const [dragging, setDragging] = useState(false);
  const nodeKey = nodes.map((n) => n.id).join("|");

  useEffect(() => {
    setPositions(initPositions(nodes));
  }, [nodeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <>
      <hemisphereLight args={["#8fa0b5", "#0d1319", 0.85]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 14, 6]} intensity={1.35} castShadow />
      <directionalLight position={[-6, 6, -8]} intensity={0.35} />

      <mesh rotation-x={-Math.PI / 2} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#0d1319" roughness={0.95} metalness={0.05} />
      </mesh>
      <gridHelper args={[36, 36, "#1c2630", "#141b24"]} position={[0, -1.19, 0]} />

      {edges.map((e, i) => {
        const a = positions[e.source];
        const b = positions[e.target];
        if (!a || !b) return null;
        const hot = highlightIds.has(e.source) && highlightIds.has(e.target);
        return (
          <GraphEdge
            key={`${e.source}-${e.target}-${e.rel}-${i}`}
            from={a}
            to={b}
            hot={hot}
            rel={e.rel || "RELATED"}
            showRel={hot || showAllEdgeLabels}
          />
        );
      })}

      {nodes.map((n) => {
        const pos = positions[n.id];
        if (!pos || !byId.has(n.id)) return null;
        return (
          <DraggableNode
            key={n.id}
            node={n}
            position={pos}
            hot={highlightIds.has(n.id)}
            isEnd={endpointIds.includes(n.id)}
            isZh={isZh}
            selected={selectedId === n.id}
            onSelect={(id) => onSelect(selectedId === id ? null : id)}
            onPosition={(id, next) => setPositions((prev) => ({ ...prev, [id]: next }))}
            onDragState={setDragging}
          />
        );
      })}

      <OrbitControls
        makeDefault
        enabled={!dragging}
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={42}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.6, 0]}
      />
    </>
  );
}

export function GraphRagScene({
  nodes,
  edges,
  endpointIds,
  highlightIds,
  isZh,
  showAllEdgeLabels = false,
  fullscreen = false,
}: {
  nodes: GraphRagNode[];
  edges: GraphRagEdge[];
  endpointIds: string[];
  highlightIds: Set<string>;
  isZh: boolean;
  showAllEdgeLabels?: boolean;
  fullscreen?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => () => {
    document.body.style.cursor = "auto";
  }, []);

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border border-border bg-[#0d1319]",
        fullscreen ? "h-full min-h-[520px]" : "h-[480px]",
      )}
    >
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 10, 16], fov: 42 }}>
        <GraphWorld
          nodes={nodes}
          edges={edges}
          endpointIds={endpointIds}
          highlightIds={highlightIds}
          isZh={isZh}
          showAllEdgeLabels={showAllEdgeLabels}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-2 left-3 text-[10px] font-mono text-muted-foreground/85">
        {isZh
          ? "拖拽空白处旋转 · 滚轮缩放 · 抓取节点拖拽 · 点击节点查看"
          : "drag empty · orbit · scroll zoom · grab nodes · click for details"}
      </div>

      {selected && (
        <div className="absolute left-3 top-3 max-w-xs rounded-md border border-border bg-background/95 backdrop-blur px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: selected.color }} />
            <span className="text-[12px] font-medium text-foreground truncate">
              {isZh ? selected.name_zh : selected.name_en}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-mono text-muted-foreground leading-relaxed">
            {selected.layer}
            {selected.cn_code ? ` · CN ${selected.cn_code}` : ""}
            {selected.operator ? ` · ${selected.operator}` : ""}
            {selected.stage ? ` · ${selected.stage}` : ""}
            {selected.tag ? ` · ${selected.tag}` : ""}
          </p>
          <button
            type="button"
            className="pointer-events-auto mt-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedId(null)}
          >
            {isZh ? "关闭" : "Close"}
          </button>
        </div>
      )}
    </div>
  );
}
