// src/furniture/resolver.ts
import type { CategorySlotSpec, FurnitureItem, ResolvedFeature, ResolvedMaterialPlan, FeatureSpec } from "./types";

const textHas = (t: string | undefined, needles: string[] = []) =>
  (t||"" ).toLowerCase() && needles.some(n => (t||"").toLowerCase().includes(n.toLowerCase()));

function pickMaterialByRules(feature: FeatureSpec, item: FurnitureItem) {
  const { auto = [], allowedMaterials } = feature;
  for (const rule of auto) {
    const w = rule.when;
    let hit = true;
    if (w?.textIncludes) hit = hit && textHas(item.name + " " + item.description, w.textIncludes);
    if (w?.colorEquals) {
      const colors = Array.isArray(w.colorEquals) ? w.colorEquals : [w.colorEquals];
      hit = hit && colors.some(c => (item.color||"").toLowerCase() === c.toLowerCase());
    }
    if (w?.supplierEquals) {
      const sups = Array.isArray(w.supplierEquals) ? w.supplierEquals : [w.supplierEquals];
      hit = hit && sups.some(s => (item.supplier||"").toLowerCase() === s.toLowerCase());
    }
    if (hit) {
      if (rule.choose.materialId) {
        if (!allowedMaterials || allowedMaterials.includes(rule.choose.materialId)) {
          return {
            materialId: rule.choose.materialId,
            override: {
              baseColorHex: rule.choose.tint,
              metallic: rule.choose.metallic,
              roughness: rule.choose.roughness,
            }
          };
        }
      }
      if (rule.choose.oneOf?.length) {
        const list = allowedMaterials ? rule.choose.oneOf.filter(id => allowedMaterials.includes(id)) : rule.choose.oneOf;
        if (list.length) return { materialId: list[0], override: {
          baseColorHex: rule.choose.tint,
          metallic: rule.choose.metallic,
          roughness: rule.choose.roughness,
        }};
      }
    }
  }
  if (allowedMaterials?.length) return { materialId: allowedMaterials[0] };
  return null;
}

export function resolveMaterialsForItem(item: FurnitureItem, slotSpecs: CategorySlotSpec): ResolvedMaterialPlan {
  const specs = slotSpecs[item.category] || [];
  const assignments: ResolvedFeature[] = [];
  for (const f of specs) {
    const picked = pickMaterialByRules(f, item) as any;
    if (picked) {
      assignments.push({
        featureId: f.id,
        appliesToMaterials: f.appliesToMaterials,
        materialId: picked.materialId,
        override: picked.override,
      });
    }
  }
  return { itemId: item.id, category: item.category, glbUrl: item.glbUrl, assignments };
}