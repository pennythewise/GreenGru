# Mock 3D Factory Scene — Code Patterns

Copy-paste-ready snippets for each build step in [SKILL.md](../SKILL.md). All examples are TypeScript + React Three Fiber.

## Contents
- [1. Canvas + lighting](#1-canvas--lighting)
- [2. Room shell with a cut hole (CSG)](#2-room-shell-with-a-cut-hole-csg)
- [3a. Procedural equipment](#3a-procedural-equipment)
- [3b. GLTF-imported equipment](#3b-gltf-imported-equipment)
- [4a. Pipe / conveyor curve](#4a-pipe--conveyor-curve)
- [4b. Particle effect (steam/mist/sparks)](#4b-particle-effect-steammistsparks)
- [4c. Pulsing alert beacon](#4c-pulsing-alert-beacon)
- [5. Zustand live-state store](#5-zustand-live-state-store)
- [6. Click-to-inspect + camera fly-to](#6-click-to-inspect--camera-fly-to)

---

## 1. Canvas + lighting

```tsx
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'

function FactoryScene() {
  return (
    <Canvas shadows camera={{ position: [-20, 7, 20], fov: 30 }}>
      <color attach="background" args={['#0f172a']} />

      <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#000000" />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Adds realistic reflections to metal/plastic without needing real lights everywhere */}
      <Environment preset="warehouse" environmentIntensity={0.05} />

      {/* ...room shell, equipment, OrbitControls go here... */}
    </Canvas>
  )
}
```

`preset` options worth trying: `"warehouse"`, `"city"`, `"studio"`, `"apartment"`. Keep `environmentIntensity` low (0.05–0.2) or reflections overpower your own lighting.

## 2. Room shell with a cut hole (CSG)

```tsx
import { Geometry, Base, Subtraction } from '@react-three/csg'

function RoomShell() {
  return (
    <group>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[20, 0.2, 20]} />
        <meshStandardMaterial color="#95A5A6" roughness={0.9} />
      </mesh>

      {/* Back wall with a vent hole cut into it */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <meshStandardMaterial color="#D2A56d" roughness={0.7} />
        <Geometry>
          <Base>
            <boxGeometry args={[20, 5, 0.1]} />
          </Base>
          <Subtraction position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.65, 0.65, 1, 32]} />
          </Subtraction>
        </Geometry>
      </mesh>
    </group>
  )
}
```

The `Subtraction` position is relative to the wall's own center, not world space. This is real boolean geometry — cheap to add multiple `<Subtraction>` children for several holes in one wall.

## 3a. Procedural equipment

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

function MachineStation({ running, faulted }: { running: boolean; faulted: boolean }) {
  const ref = useRef<Group>(null)

  useFrame(() => {
    if (ref.current) {
      // subtle idle bob so the scene never looks frozen
      ref.current.position.y = Math.sin(performance.now() * 0.0012) * 0.03
    }
  })

  return (
    <group ref={ref}>
      {/* base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.3, 2.2]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* body */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.15, 2.1, 1.25]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.45} />
      </mesh>

      {/* status light cap — the fake LED that sells "this thing is alive" */}
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[2.85, 0.25, 1]} />
        <meshStandardMaterial
          color={faulted ? '#7f1d1d' : '#14532d'}
          emissive={faulted ? '#ef4444' : '#22c55e'}
          emissiveIntensity={running ? 0.6 : 0.15}
          roughness={0.2}
        />
      </mesh>

      <pointLight
        position={[0, 3, 0]}
        intensity={faulted ? 4 : running ? 1.2 : 0.3}
        color={faulted ? '#fb7185' : '#6ee7b7'}
      />
    </group>
  )
}
```

## 3b. GLTF-imported equipment

```tsx
import { useGLTF, useTexture, Center } from '@react-three/drei'

function RobotArm(props: any) {
  const { nodes, materials } = useGLTF('/models/robot-arm/scene.gltf') as any
  const colorMap = useTexture('/models/robot-arm/textures/diffuse.png', (t) => {
    if (!Array.isArray(t)) t.flipY = false
  })

  return (
    <group {...props} dispose={null}>
      <Center top>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RobotArm_Material_0.geometry}
          scale={0.01}
        >
          <meshStandardMaterial map={colorMap} roughness={0.7} />
        </mesh>
      </Center>
    </group>
  )
}

// preload at module scope so it's cached before first render
useGLTF.preload('/models/robot-arm/scene.gltf')
```

Source models from a permissively-licensed catalog (Sketchfab "downloadable" filter, Poly Haven, Kenney assets). Keep the exact `nodes.<name>.geometry` path by inspecting the loaded GLTF once in the browser console (`console.log(nodes)`), or use `gltfjsx` to auto-generate a typed component. Always keep the model's `license.txt` alongside the asset files.

## 4a. Pipe / conveyor curve

```tsx
import * as THREE from 'three'
import { useMemo } from 'react'

function Pipe({ start, end, mid, color = '#cbd5e1', radius = 0.06, flow = false }: any) {
  const curve = useMemo(() => {
    const midPoint = mid
      ? new THREE.Vector3(...mid)
      : new THREE.Vector3().addVectors(new THREE.Vector3(...start), new THREE.Vector3(...end)).multiplyScalar(0.5)
    return new THREE.QuadraticBezierCurve3(new THREE.Vector3(...start), midPoint, new THREE.Vector3(...end))
  }, [start, mid, end])

  return (
    <mesh castShadow receiveShadow>
      <tubeGeometry args={[curve, 20, radius, 8, false]} />
      <meshStandardMaterial
        color={flow ? '#38bdf8' : color}
        transparent
        opacity={0.85}
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  )
}
```

For a straight conveyor belt instead of a pipe, use an elongated `boxGeometry` and animate the material's texture `offset.x` in `useFrame` to fake motion instead of a tube curve.

## 4b. Particle effect (steam/mist/sparks)

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function SteamEffect({ active = false, position = [0, 0, 0] }: { active?: boolean; position?: number[] }) {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 500

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const phs = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6
      pos[i * 3 + 1] = Math.random() * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
      phs[i] = Math.random() * Math.PI * 2
    }
    return [pos, phs]
  }, [])

  useFrame((state) => {
    if (!pointsRef.current || !active) return
    const arr = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= 0.005 // drift up (steam) — flip sign for falling dust
      if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 4 // loop back to source
      arr[i * 3] += Math.sin(state.clock.elapsedTime * 0.5 + phases[i]) * 0.002 // sway
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={pointsRef} position={position as any}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#a5f3fc" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}
```

For sparks, use a warm color (`#fbbf24`), a shorter lifespan (reset `y` faster), and gravity (`arr[i*3+1] -= 0.02` accelerating) instead of a slow steam drift.

## 4c. Pulsing alert beacon

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function AlertBeacon(props: any) {
  const sphereRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(t * 3) * 0.1
      const s = 1 + Math.sin(t * 6) * 0.1
      sphereRef.current.scale.set(s, s, s)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(t * 6) * 1
    }
  })

  return (
    <group {...props}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} color="#ef4444" distance={2} decay={2} />
    </group>
  )
}
```

## 5. Zustand live-state store

```tsx
import { create } from 'zustand'

interface Station {
  id: string
  running: boolean
  faulted: boolean
}

interface FactoryState {
  stations: Station[]
  inspectedId: string | null
  setInspectedId: (id: string | null) => void
  setStationState: (id: string, patch: Partial<Station>) => void
}

export const useFactoryStore = create<FactoryState>((set) => ({
  stations: [],
  inspectedId: null,
  setInspectedId: (id) => set({ inspectedId: id }),
  setStationState: (id, patch) =>
    set((s) => ({ stations: s.stations.map((st) => (st.id === id ? { ...st, ...patch } : st)) })),
}))
```

Each 3D component should subscribe with a narrow selector, e.g. `const running = useFactoryStore(s => s.stations.find(st => st.id === 'a1')?.running)`, not the whole store — this keeps re-renders scoped to the object that actually changed.

## 6. Click-to-inspect + camera fly-to

```tsx
import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import { useFactoryStore } from './store'

// module-level targets so CameraRig and the click handler can share state
// without extra store churn on every frame
let targetPos: THREE.Vector3 | null = null
let targetLookAt: THREE.Vector3 | null = null

const DEFAULT_POS = new THREE.Vector3(-20, 7, 20)
const DEFAULT_LOOKAT = new THREE.Vector3(0, 1, 0)

function CameraRig() {
  const { camera, controls } = useThree()
  const inspectedId = useFactoryStore((s) => s.inspectedId)

  useEffect(() => {
    if (inspectedId === null) {
      targetPos = DEFAULT_POS.clone()
      targetLookAt = DEFAULT_LOOKAT.clone()
    }
  }, [inspectedId])

  useFrame((_, delta) => {
    if (controls && targetPos && targetLookAt) {
      const c = controls as any
      camera.position.lerp(targetPos, 4 * delta)
      c.target.lerp(targetLookAt, 4 * delta)
      c.update()
      if (camera.position.distanceTo(targetPos) < 0.05) {
        targetPos = null
        targetLookAt = null
      }
    }
  })

  return null
}

function SelectToInspect({ children, id }: { children: React.ReactNode; id: string }) {
  const setInspectedId = useFactoryStore((s) => s.setInspectedId)
  const [hovered, setHovered] = useState(false)

  return (
    <Select enabled={hovered}>
      <group
        onClick={(e) => {
          e.stopPropagation()
          const target = new THREE.Vector3()
          e.object.getWorldPosition(target)
          targetLookAt = target.clone()
          targetPos = new THREE.Vector3(target.x - 6, target.y + 1.2, target.z)
          setInspectedId(id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        {children}
      </group>
    </Select>
  )
}
```

Wrap the whole equipment group in the scene with:

```tsx
import { Selection, EffectComposer, Outline } from '@react-three/postprocessing'

<Selection>
  <EffectComposer autoClear={false}>
    <Outline visibleEdgeColor={0xe5e7eb} hiddenEdgeColor={0xe5e7eb} blur width={1000} edgeStrength={4} />
  </EffectComposer>
  <group>
    <SelectToInspect id="station-1">
      <MachineStation running faulted={false} />
    </SelectToInspect>
    {/* more stations */}
  </group>
</Selection>
```

Tune the per-object camera offset (`target.x - 6, target.y + 1.2`) per object type if some objects need a different viewing angle — e.g. a wall-mounted panel might want the camera pulled straight back on `z` instead of `x`.
