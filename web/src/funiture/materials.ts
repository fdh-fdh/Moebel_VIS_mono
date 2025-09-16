// src/furniture/materials.ts
import type { MaterialPreset } from "./types";

export const MATERIALS: Record<string, MaterialPreset> = {
  aluminium: { id:"aluminium", label:"aluminium", baseColorHex:"#c9ccd1", roughness:0.2, metallic:0.9 },
  "leather-schwarz": { id:"leather-schwarz", label:"Leder schwarz", baseColorMap:"/maps/Material/Leder_schwarz.png", roughness:0.6, metallic:0.0 },
  "leather-white": { id:"leather-white", label:"Leather white", baseColorMap:"/maps/Material/leather_white.jpg", roughness:0.6, metallic:0.0 },
  furnishingsfabricsleatherblack: { id:"furnishingsfabricsleatherblack", label:"Furnishings.Fabrics.Leather.Black", baseColorMap:"/maps/Material/Furnishings.Fabrics.Leather.Black.jpg", roughness:0.6, metallic:0.0 },
  furnishingsfabricsleatherbump: { id:"furnishingsfabricsleatherbump", label:"Furnishings.Fabrics.Leather.Bump", baseColorMap:"/maps/Material/Furnishings.Fabrics.Leather.Bump.jpg", roughness:0.6, metallic:0.0 },
  "wood-eiche": { id:"wood-eiche", label:"Dunkle eiche", baseColorMap:"/maps/Material/wood-eiche.png", roughness:0.5, metallic:0.0 },
  "Wood-eich": { id:"Wood-eich", label:"Natural eiche", baseColorMap:"/maps/Material/Wood-eich.png", roughness:0.35, metallic:0.1 },
  "polster-schwarz": { id:"polster-schwarz", label:"Polster schwarz", baseColorMap:"/maps/Material/Polster_schwarz.png", roughness:0.75, metallic:0.05 },
  "stoff-blau": { id:"stoff-blau", label:"Stoff blau", baseColorMap:"/maps/Material/stoff_blau.png", roughness:0.8, metallic:0.0 },
};