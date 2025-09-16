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

  "leather-black":{ id:"leather-black",label:"leather black",  baseColorMap:"/maps/Material/leather_black_ao.jpg",normalMap:"/maps/Material/leather_black_normal.jpg", occlusionMap:"/maps/Material/leather_black_ao.jpg", roughness:0.6, metallic:0.0 },
  "wood-eiche":     { id:"wood-eiche",     label:"Dunkle eiche",     baseColorMap:"/maps/Material/wood-eiche.png", roughness:0.5, metallic:0.0, normalScale:1 },
  "plastic-blue":  { id:"plastic-blue",  label:"plastic blue",  baseColorHex:"#084de2ff", roughness:0.7, metallic:1.0 },
  "Wood-eich":   { id:"Wood-eich",   label:"Natural eiche",   baseColorMap:"/maps/Material/Wood-eich.png", roughness:0.35, metallic:0.1 },

  "342202-volt-barhocker-rot":  { id:"342202-volt-barhocker-rot",  label:"342202 volt barhocker rot",  baseColorMap:"/maps/Material/342202_volt_barhocker_rot.png",  roughness:0.6,  metallic:0.1 },
  "342202-volt-barhocker-weiss":{ id:"342202-volt-barhocker-weiss",label:"342202 volt barhocker weiss",baseColorMap:"/maps/Material/342202_volt_barhocker_weiss.png",roughness:0.6, metallic:0.1 },
  "342203-volt-barhocker-blau": { id:"342203-volt-barhocker-blau", label:"342203 volt barhocker blau", baseColorMap:"/maps/Material/342203_volt_barhocker_blau.png", roughness:0.6,  metallic:0.1 },

  //ALU
  "aluminium":  { id:"aluminium",  label:"aluminium",  baseColorMap:"/maps/Material/aluminium.png", roughness:0.2, metallic:0.9 },
  "aluminium-1":                { id:"aluminium-1",label:"Aluminium 1",               baseColorMap:"/maps/Material/aluminium_1.jpg",           roughness:0.2, metallic:0.9 },
  "aluminium-jpg":              { id:"aluminium-jpg",label:"Aluminium jpg",           baseColorMap:"/maps/Material/aluminium.jpg",             roughness:0.2, metallic:0.9 },

  "steel":                      { id:"steel",      label:"Steel",                     baseColorMap:"/maps/Material/Steel.jpg",                  roughness:0.2, metallic:0.9 },
  "chrom":                      { id:"chrom",      label:"Chrom",                     baseColorMap:"/maps/Material/Chrom.png",                  roughness:0.1, metallic:1.0 },
  "chrom-matt":     { id:"chrom-matt", label:"Chrom Matt",                baseColorMap:"/maps/Material/Chrom-Matt.png",             roughness:0.2, metallic:1.0 },

  //Metall 
  "metalgrid01":                { id:"metalgrid01",label:"Metal.Grid.01",             baseColorMap:"/maps/Material/Metal.Grid.01.jpg",          roughness:0.2, metallic:0.9 },
  "metalgrid03":                { id:"metalgrid03",label:"Metal.Grid.03",             baseColorMap:"/maps/Material/Metal.Grid.03.jpg",          roughness:0.2, metallic:0.9 },
  "metalgrid04":                { id:"metalgrid04",label:"Metal.Grid.04",             baseColorMap:"/maps/Material/Metal.Grid.04.jpg",          roughness:0.2, metallic:0.9 },
  "gitter":                     { id:"gitter",     label:"Gitter",                    baseColorMap:"/maps/Material/Gitter.jpg",                 roughness:0.6, metallic:0.1 },
  "zaun-a":  { id:"zaun-a",     label:"Zaun a",                    baseColorMap:"/maps/Material/zaun_a.jpg",                 roughness:0.6, metallic:0.1 },


  //holz

  "holz":                       { id:"holz",       label:"Holz",                      baseColorMap:"/maps/Material/Holz.jpg",                   roughness:0.5, metallic:0.1 },
  "holz-ahorn":                 { id:"holz-ahorn", label:"Holz ahorn",                baseColorMap:"/maps/Material/holz-ahorn.jpg",             roughness:0.5, metallic:0.1 },
  "holz-buche":                 { id:"holz-buche", label:"Holz buche",                baseColorMap:"/maps/Material/holz-buche.jpg",             roughness:0.5, metallic:0.1 },
  "holz-eiche":                 { id:"holz-eiche", label:"Holz eiche",                baseColorMap:"/maps/Material/holz-eiche.jpg",             roughness:0.5, metallic:0.1 },
  "holz-eiche2":                { id:"holz-eiche2",label:"Holz eiche2",               baseColorMap:"/maps/Material/holz-eiche2.jpg",            roughness:0.5, metallic:0.1 },
  "holz-esche":                 { id:"holz-esche", label:"Holz esche",                baseColorMap:"/maps/Material/holz-esche.jpg",             roughness:0.5, metallic:0.1 },
  "holz-esche2":                { id:"holz-esche2",label:"Holz esche2",               baseColorMap:"/maps/Material/holz-esche2.jpg",            roughness:0.5, metallic:0.1 },
  "holz-kirsch":                { id:"holz-kirsch",label:"Holz kirsch",               baseColorMap:"/maps/Material/holz-kirsch.jpg",            roughness:0.5, metallic:0.1 },
  "eiche-natur":                { id:"eiche-natur",label:"Eiche Natur",               baseColorMap:"/maps/Material/Eiche-Natur.png",            roughness:0.45, metallic:0.1 },
  "nussbaum":                   { id:"nussbaum",   label:"Nussbaum",                  baseColorMap:"/maps/Material/Nussbaum.png",               roughness:0.5, metallic:0.1 },
  "osb-material":               { id:"osb-material",label:"OSB Material",             baseColorMap:"/maps/Material/OSB_Material.jpg",           roughness:0.6, metallic:0.05 },
  "wood04":                     { id:"wood04",     label:"Wood04",                    baseColorMap:"/maps/Material/wood04.jpg",                 roughness:0.5, metallic:0.1 },
//leder
  "leder-schwarz":              { id:"leather-schwarz",label:"Leder schwarz",          baseColorMap:"/maps/Material/Leder_schwarz.png",          roughness:0.6, metallic:0.0 },
  "leather-white":              { id:"leather-white",label:"Leather white",          baseColorMap:"/maps/Material/leather_white.jpg",          roughness:0.6, metallic:0.0 },
  "furnishingsfabricsleatherblack": { id:"furnishingsfabricsleatherblack", label:"Furnishings.Fabrics.Leather.Black", baseColorMap:"/maps/Material/Furnishings.Fabrics.Leather.Black.jpg", roughness:0.6, metallic:0.0 },
  "furnishingsfabricsleatherbump":  { id:"furnishingsfabricsleatherbump",  label:"Furnishings.Fabrics.Leather.Bump",  baseColorMap:"/maps/Material/Furnishings.Fabrics.Leather.Bump.jpg",  roughness:0.6, metallic:0.0 },

  //stoff
  "stoff-blau":                 { id:"stoff-blau", label:"Stoff blau",               baseColorMap:"/maps/Material/stoff_blau.png",             roughness:0.8, metallic:0.0 },
  "stoff-green":                { id:"stoff-green",label:"Stoff green",              baseColorMap:"/maps/Material/stoff-green.png",            roughness:0.8, metallic:0.0 },
  "stoff-schwarz":              { id:"stoff-schwarz",label:"Stoff schwarz",         baseColorMap:"/maps/Material/stoff_schwarz.png",          roughness:0.8, metallic:0.0 },
  "polster-schwarz":            { id:"polster-schwarz",label:"Polster schwarz",      baseColorMap:"/maps/Material/Polster_schwarz.png",        roughness:0.75, metallic:0.05 },

  "kunststoff-anthrazit":       { id:"kunststoff-anthrazit",label:"Kunststoff anthrazit", baseColorMap:"/maps/Material/Kunststoff_anthrazit.png", roughness:0.7, metallic:0.1 },

  "asche":                      { id:"asche",      label:"Asche",                    baseColorMap:"/maps/Material/asche.png",                  roughness:0.6, metallic:0.1 },
};


// 可选：一个小助手 
export const getMaterial = (id: string) => MATERIALS[id];