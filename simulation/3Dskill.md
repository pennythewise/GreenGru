---
name: mock-3d-factory-scene
description: Build a mock/stylized 3D facility scene in a React web app — a factory floor, warehouse digital twin, plant room, server room, or any "walk-around industrial space with live status data" visualization — using React Three Fiber. Use this whenever the user asks to visualize a factory, warehouse, production line, machine room, or any physical facility in 3D on the web, even if they don't say "React Three Fiber" or "three.js" explicitly, and even if they just say "make it 3D" or "like a digital twin." Also trigger for requests to add interactive click-to-inspect 3D objects, animated pipes/conveyors/particles (steam, mist, sparks) to a web scene, or a live-data-driven 3D dashboard. Not for photorealistic CAD, game development, or VR/AR builds — this is for fast, good-looking mock/stylized scenes.
---

# Mock 3D Factory Scene

Build a stylized (not photorealistic) 3D facility scene that runs in a browser, driven by live app state — the kind of thing that makes a demo look impressive fast: a room full of equipment where lights, pipes, and particles react to real data, and clicking a machine flies the camera in to inspect it.

This pattern is reverse-engineered from a working smart-farm 3D visualization and generalizes to any facility (factory floor, warehouse, server room, plant room).

## Stack

| Package | Version (known-working) | Purpose |
|---|---|---|
| `three` | ^0.184 | Core 3D engine |
| `@react-three/fiber` | ^9.6 | React renderer for three.js — `<Canvas>`, `useFrame`, `useThree` |
| `@react-three/drei` | ^10.7 | Helpers — `OrbitControls`, `Environment`, `Center`, `Text`, `useGLTF`, `useTexture` |
| `@react-three/postprocessing` + `postprocessing` | ^3.0 | `Selection`/`Select`/`EffectComposer`/`Outline` for hover/click glow highlight |
| `@react-three/csg` | ^4.0 | Boolean geometry — cut vents/doorways into walls |
| `three-stdlib` | latest | GLTF TypeScript types |
| `zustand` | ^5.0 | Global store for live state (equipment on/off, sensor values, which object is selected) |

Scaffold with `npm create vite@latest my-app -- --template react-ts`, then `npm install three @react-three/fiber @react-three/drei @react-three/postprocessing @react-three/csg three-stdlib zustand @types/three`.

Don't reach for a game engine (Unity/Unreal) or raw WebGL — R3F gets a convincing result in a fraction of the code because the scene graph is just React components.

## Build order

Work through these in order — each step depends on the last. See [references/patterns.md](references/patterns.md) for copy-paste-ready code for every pattern named here.

**1. Canvas + lighting rig.** One top-level component renders `<Canvas shadows camera={{position, fov}}>`. Inside: a background `<color>`, `hemisphereLight` + `ambientLight` + `directionalLight` (`castShadow`, `shadow-mapSize={[2048,2048]}`), and a low-intensity `<Environment preset="warehouse">` for realistic metal/plastic reflections. This lighting combo (not just one light) is what makes flat-shaded primitives look like real objects instead of a CAD wireframe.

**2. Room shell.** Floor + walls are just `boxGeometry` meshes with `meshStandardMaterial` (tune `roughness`/`metalness` for concrete vs. metal). To cut a vent, doorway, or window into a wall, wrap it in `@react-three/csg`'s `<Geometry><Base>...<Subtraction>...</Subtraction></Base></Geometry>` — this does real boolean subtraction so the hole looks physically cut, not just painted on.

**3. Equipment — two build methods, pick per-object:**
- **Procedural primitives** (racks, control boxes, tanks-as-cylinders): stack `boxGeometry`/`cylinderGeometry`/`sphereGeometry` meshes. Use `emissive` + `emissiveIntensity` on small parts as fake status LEDs, driven by a live boolean. Fastest option — use it for anything generic or repeated many times.
- **Imported GLTF/GLB assets** (a specific machine, robot arm, distinctive prop): download a free-license low-poly model, drop `.gltf`/`.glb` + textures into `public/models/<name>/` with a `license.txt`, load with `useGLTF('/models/<name>/scene.gltf')`, destructure `nodes`/`materials`, apply a diffuse texture via `useTexture` if needed, and call `useGLTF.preload(path)` at module scope so it's cached before first render. Use this for the one or two "hero" props that need to look distinctive.

**4. Connective/utility pieces** — these sell the "alive" feeling more than the equipment does:
- **Pipes/conveyors**: a `THREE.QuadraticBezierCurve3` fed into `<tubeGeometry args={[curve, segments, radius, radialSegments, false]}/>`. Swap the material color when a `flow`/`active` boolean is true.
- **Particles** (steam, mist, sparks, dust): a `<points>` mesh with a manually built `Float32Array` of random positions, mutated every frame in `useFrame` (drift/loop math), rendered with `pointsMaterial` + `THREE.AdditiveBlending` for glow.
- **Alert/status beacons**: a small emissive sphere + `pointLight` pulsing via `Math.sin(clock.elapsedTime * speed)` in `useFrame`.

**5. Live data wiring.** Create a zustand store holding whatever drives the scene: equipment on/off states, sensor readings, an alerts list, and the currently-"inspected" object id. Each 3D component reads only the slice it needs via a selector (`useStore(s => s.thing)`) — this is what makes the scene feel reactive rather than static, and keeps re-renders cheap.

**6. Interactivity — click to inspect.** Wrap selectable objects so hovering shows a glowing outline (`Selection`/`Select`/`EffectComposer`/`Outline` from `@react-three/postprocessing`) and clicking stores a target camera position/lookAt that a small `CameraRig` component lerps toward every frame via `useFrame` + `useThree()`. Finish with `<OrbitControls makeDefault target minDistance maxDistance maxPolarAngle>` for free-look the rest of the time.

## Assembling the final scene

The top-level scene component is just a flat, declarative list — resist the urge to nest logic into it:

```
<Canvas>
  <CameraRig />
  <color background />
  {lights}
  <Environment />
  <RoomShell />
  <Selection><EffectComposer><Outline /></EffectComposer>
    <group>
      {equipment instances, each wrapped in a click-to-inspect selector}
    </group>
  </Selection>
  <OrbitControls />
</Canvas>
```

Repeated equipment (a row of machines, a grid of pallets) comes from one reusable component + a hardcoded layout array of `{id, position, rotation}` mapped with `.map()` — don't hand-place 20 similar objects. For per-instance visual variety (slightly different rotation/scale per item) use deterministic pseudo-randomness like `Math.sin(index * 1.9)` instead of `Math.random()`, so the layout stays stable across re-renders instead of jittering every time state changes elsewhere.

Compose bigger set-pieces (e.g. "a full machine station" = frame + status lights + sensor + attached props) as their own components taking `layout` + live-state props, so the top-level scene never grows past a flat list of positioned components.

## Adapting the metaphor to a factory

| Farm original | Factory equivalent |
|---|---|
| Plant racks | Machine stations / workbenches |
| Grow lights | Status/indicator lights |
| Water tank + pump + pipes | Coolant/hydraulic tank + pump + pipes (same tube-curve technique) |
| Humidity mist | Steam / smoke / welding sparks (same particle technique) |
| Sensor nodes | IoT sensors / PLC modules |
| Alert markers on diseased plants | Alert beacons on faulted machines |
| Shipping container shell | Warehouse/factory shell |

Drive it all from one zustand store tracking which stations are running / idle / faulted — that single source of truth is what makes the whole scene animate coherently instead of each object having its own disconnected logic.
