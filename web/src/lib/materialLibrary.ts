// src/lib/materialLibrary.ts
export type MaterialPreset = {
  id: string;
  label: string;
  baseColorHex?: string;     // 纯色（可选）
  metallic?: number;         // 0..1
  roughness?: number;        // 0..1
  baseColorMap?: string;     // /maps/xxx.jpg（可选）
  normalMap?: string;        // /maps/xxx.jpg（可选）
  occlusionMap?: string;     // /maps/xxx.jpg（可选）
  normalScale?: number;      // 法线强度（可选）
};

export const MATERIALS: Record<string, MaterialPreset> = {
  "aluminium":  { id:"aluminium",  label:"aluminium",  baseColorMap:"/maps/Material/aluminium.png", roughness:0.2, metallic:0.9 },
  "leather-black":{ id:"leather-black",label:"leather black",  baseColorHex:"#0B0B0B", roughness:0.6, metallic:0.0 },
  "wood-eiche":     { id:"wood-eiche",     label:"Dunkle eiche",     baseColorMap:"/maps/Material/wood-eiche.png", roughness:0.5, metallic:0.0, normalScale:1 },
  "plastic-blue":  { id:"plastic-blue",  label:"plastic blue",  baseColorHex:"#084de2ff", roughness:0.7, metallic:1.0 },
  "Wood-eich":   { id:"Wood-eich",   label:"Natural eiche",   baseColorMap:"/maps/Material/Wood-eich.png", roughness:0.35, metallic:0.1 },
};

// 可选：一个小助手
export const getMaterial = (id: string) => MATERIALS[id];