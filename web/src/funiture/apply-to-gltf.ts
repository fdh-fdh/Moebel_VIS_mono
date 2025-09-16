// src/furniture/apply-to-gltf.ts
import * as THREE from "three";
import type { ResolvedMaterialPlan, MaterialRuntimeOverride } from "./types";
import { MATERIALS } from "./materials";

async function loadTexture(path: string, loader: THREE.TextureLoader, cache: Map<string, THREE.Texture>) {
  if (cache.has(path)) return cache.get(path)!;
  const tex = await new Promise<THREE.Texture>((res, rej) => loader.load(path, res, undefined, rej));
  tex.flipY = false; // glTF 约定
  cache.set(path, tex);
  return tex;
}

async function buildThreeMaterial(presetId: string, override?: MaterialRuntimeOverride, cache?: Map<string, THREE.Texture>) {
  const p = MATERIALS[presetId];
  if (!p) throw new Error(`Material preset not found: ${presetId}`);

  const loader = new THREE.TextureLoader();
  const tc = cache ?? new Map<string, THREE.Texture>();

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.baseColorHex ?? "#ffffff"),
    roughness: p.roughness ?? 0.5,
    metalness: p.metallic ?? 0.0,
  });

  if (p.baseColorMap) mat.map = await loadTexture(p.baseColorMap, loader, tc);
  if (p.normalMap)    mat.normalMap = await loadTexture(p.normalMap, loader, tc);
  if (p.occlusionMap) mat.aoMap = await loadTexture(p.occlusionMap, loader, tc);
  if (p.normalScale != null) mat.normalScale = new THREE.Vector2(p.normalScale, p.normalScale);

  if (override?.baseColorHex) mat.color = new THREE.Color(override.baseColorHex);
  if (override?.roughness != null) mat.roughness = override.roughness;
  if (override?.metallic != null)  mat.metalness = override.metallic;
  if (override?.normalScale != null) mat.normalScale = new THREE.Vector2(override.normalScale, override.normalScale);

  mat.needsUpdate = true;
  return mat;
}

export async function applyResolvedMaterialsToGLTF(root: THREE.Group, plan: ResolvedMaterialPlan) {
  const texCache = new Map<string, THREE.Texture>();
  const index: Record<string, THREE.Mesh[]> = {};

  root.traverse(obj => {
    const mesh = obj as THREE.Mesh;
    if (!(mesh as any).isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const keys = [mesh.name, ...mats.map(m => m?.name).filter(Boolean) as string[]];
    keys.filter(Boolean).forEach(k => {
      index[k] = index[k] || [];
      index[k].push(mesh);
    });
  });

  for (const a of plan.assignments) {
    const threeMat = await buildThreeMaterial(a.materialId, a.override, texCache);
    for (const slot of a.appliesToMaterials) {
      (index[slot] || []).forEach(mesh => { mesh.material = threeMat; });
    }
  }
}