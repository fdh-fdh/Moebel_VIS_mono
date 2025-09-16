// src/furniture/types.ts
export type MaterialPreset = {
  id: string;
  label: string;
  baseColorMap?: string;
  baseColorHex?: string;
  normalMap?: string;
  occlusionMap?: string;
  roughness?: number;   // 0-1
  metallic?: number;    // 0-1
  normalScale?: number; // 0..∞
};

export type MaterialRuntimeOverride = {
  baseColorHex?: string;
  roughness?: number;
  metallic?: number;
  normalScale?: number;
};

export type FeatureId = string;   // e.g. "Sitze innere"
export type SlotId = string;      // 对应 glTF 内的材质名或网格名，例如 "seat_cover"

export type AutoRule = {
  when?: {
    textIncludes?: string[];        // 在 name/description 里搜词
    colorEquals?: string | string[];
    supplierEquals?: string | string[];
  };
  choose: {
    materialId?: string;
    oneOf?: string[];
    tint?: string;                  // 运行时覆写颜色
    metallic?: number;
    roughness?: number;
  };
};

export type FeatureSpec = {
  id: FeatureId;
  label: string;
  appliesToMaterials: SlotId[];
  allowedMaterials?: string[];     // 可选：限定候选集
  auto?: AutoRule[];               // 自动材质规则（自上而下优先）
};

export type CategorySlotSpec = Record<string, FeatureSpec[]>; // key = 家具类别

export type FurnitureItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  articleNo?: string;
  supplier?: string;
  unit?: string;
  color?: string;
  version?: string;
  storagePath?: string;
  glbUrl?: string;
};

export type ResolvedFeature = {
  featureId: FeatureId;
  appliesToMaterials: SlotId[];
  materialId: string;
  override?: MaterialRuntimeOverride;
};

export type ResolvedMaterialPlan = {
  itemId: string;
  category: string;
  glbUrl?: string;
  assignments: ResolvedFeature[];
};