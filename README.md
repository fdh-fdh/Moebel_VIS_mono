# Material Visualization (WebXR) — brain storming: WORKING ON.....

This feature lets you use **one GLB** per furniture type and swap **materials (color/texture)** per **semantic slot** (e.g. `Seat`, `Legs`) from a shared **material library**. It works in the regular viewer and in **WebXR** AR.

---

## 0) Prerequisites

- **HTTPS** for WebXR on devices (desktop can use `localhost` but no AR possible, only on https) . Easiest: start Vite dev server and expose via a tunnel (Cloudflare/ngrok), or use local HTTPS cert (mkcert).
- Ensure `web/index.html` includes `<model-viewer>`:
  ```html
  <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
  ```

---

## 1) GLB semantic rules (how slots map to model)

- In your DCC (e.g. Blender), assign **separate materials** to parts you want to swap (e.g. `Seat`, `Legs`) and **name the materials** with those semantic IDs.
- (Optional) Put the semantic in glTF `material.extras.slot = "Seat"`.

### How to see what your GLB exposes
**Fast (in-app):** log materials after load
```ts
// inside ModelViewer.tsx, in the "load" handler
await el.updateComplete;
console.log("[Materials]", el.model?.materials.map((m:any)=>m.name));
console.log("[Meshes]", el.model?.meshes.map((mesh:any)=>({
  name: mesh.name, primitives: mesh.primitives.map((p:any)=>p.material?.name)
})));
```

**CLI (clear layout):**
```bash
npm i -g @gltf-transform/cli
gltf-transform inspect your-model.glb
```

> The names you see (e.g. `Seat`, `Legs`) must match the **slot IDs** below.

---

## 2) Project structure

```
web/
  public/
    maps/                # put texture files here (jpg/png/ktx2)
      oak_basecolor.jpg
  src/
    components/
      ModelViewer.tsx    # WebXR viewer + scene-graph edits
      MaterialsPanel.tsx # UI to pick materials per slot
    lib/
      materialLibrary.ts # global material presets
      slotSpecs.ts       # per-category slot definitions
```

---

## 3) Define the **Material Library**

`web/src/lib/materialLibrary.ts`
```ts
export type MaterialPreset = {
  id: string; label: string;
  baseColorHex?: string; metallic?: number; roughness?: number;
  baseColorMap?: string; normalMap?: string; occlusionMap?: string; normalScale?: number;
};

export const MATERIALS: Record<string, MaterialPreset> = {
  "fabric-gray":  { id:"fabric-gray",  label:"织物·灰", baseColorHex:"#B7BBC2", roughness:0.9, metallic:0.0 },
  "leather-black":{ id:"leather-black",label:"皮革·黑", baseColorHex:"#0B0B0B", roughness:0.6, metallic:0.0 },
  "wood-oak":     { id:"wood-oak",     label:"橡木",     baseColorMap:"/maps/oak_basecolor.jpg", roughness:0.8 },
  "metal-black":  { id:"metal-black",  label:"金属·黑", baseColorHex:"#111111", roughness:0.4, metallic:1.0 },
};
```

> Put textures under `web/public/maps/...`, then reference them as `/maps/xxx.jpg`.

---

## 4) Define **slots** per category

`web/src/lib/slotSpecs.ts`
```ts
export type SlotSpec = {
  id: string; label: string;
  appliesToMaterials: string[];   // GLB material names to edit
  allowedMaterials: string[];     // IDs from MATERIALS
};

export const CATEGORY_SLOTS: Record<string, SlotSpec[]> = {
  "Barhocker": [
    { id:"Seat", label:"坐垫", appliesToMaterials:["Seat"], allowedMaterials:["fabric-gray","leather-black"] },
    { id:"Legs", label:"椅腿", appliesToMaterials:["Legs"], allowedMaterials:["wood-oak","metal-black"] },
  ],
};
```

---

## 5) Viewer & runtime material edits

`web/src/components/ModelViewer.tsx` exposes:
- `edits`: array of **material edits** (color/roughness/texture + target material names)
- `openAR()` + `canActivateAR()` for WebXR
- `arModes="webxr"` to **force WebXR** only

Example usage in `App.tsx`:
```tsx
import type { MaterialEdit } from "./components/ModelViewer";
import { MATERIALS } from "./lib/materialLibrary";
import { CATEGORY_SLOTS } from "./lib/slotSpecs";

// build edits from current assignment (slot -> materialId)
const edits: MaterialEdit[] = useMemo(() => {
  const slotDefs = CATEGORY_SLOTS[active?.category ?? ""] ?? [];
  return slotDefs.flatMap(s => {
    const preset = MATERIALS[assignment[s.id] ?? ""];
    if (!preset) return [];
    return [{
      appliesToMaterials: s.appliesToMaterials,
      baseColorHex: preset.baseColorHex,
      metallic: preset.metallic,
      roughness: preset.roughness,
      baseColorMap: preset.baseColorMap,
      normalMap: preset.normalMap,
      occlusionMap: preset.occlusionMap,
      normalScale: preset.normalScale,
    }];
  });
}, [active?.category, assignment]);

<ModelViewer
  ref={viewerRef}
  src={active?.glbUrl}
  alt={active?.name}
  enableAR
  arModes="webxr"        // ← only WebXR
  arScale="fixed"
  arPlacement="floor"
  xrEnvironment
  autoRotate
  cameraControls
  edits={edits}
/>
```

---

## 6) Materials Panel (UI)

`web/src/components/MaterialsPanel.tsx` shows allowed materials per slot and updates the **assignment** (`slotId -> materialId`). Wire it next to the viewer:

```tsx
<MaterialsPanel
  open={materialsOpen}
  onClose={() => setMaterialsOpen(false)}
  slots={CATEGORY_SLOTS[active?.category ?? ""] ?? []}
  assignment={assignment}
  onChange={(slotId, materialId) =>
    setAssignment(prev => ({ ...prev, [slotId]: materialId }))
  }
/>
```

---

## 7) Troubleshooting

- **No material changes:** GLB material names don’t match `appliesToMaterials`. Inspect via console/CLI.
- **Textures not applied:** check 404s (`/maps/...`), and CORS if loading from another origin.
- **AR can’t activate:** not on HTTPS / device doesn’t support WebXR / iframe missing permission.
- **Performance:** keep GLB small; use **KTX2** textures and **Draco/Meshopt** compression.

---
