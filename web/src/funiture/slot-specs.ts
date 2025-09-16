// src/furniture/slot-specs.ts
import type { CategorySlotSpec } from "./types";

export const SLOT_SPECS: CategorySlotSpec = {
  Barhocker: [
    {
      id: "Sitze innere",
      label: "Seat inside",
      appliesToMaterials: ["seat_cover"],
      allowedMaterials: [
        "leather-schwarz","leather-white",
        "furnishingsfabricsleatherblack","furnishingsfabricsleatherbump"
      ],
      auto: [
        { when:{ colorEquals:"Schwarz" }, choose:{ materialId:"leather-schwarz" } },
        { choose:{ oneOf:["leather-schwarz","furnishingsfabricsleatherblack","leather-white"] } }
      ]
    },
    {
      id: "Sitze äußere",
      label: "Seat outside",
      appliesToMaterials: ["seat_back"],
      allowedMaterials: ["wood-eiche","aluminium","leder-schwarz","polster-schwarz"],
      auto: [
        { when:{ textIncludes:["Polypropylen"] }, choose:{ oneOf:["polster-schwarz","leather-schwarz"] } },
        { choose:{ oneOf:["wood-eiche","polster-schwarz","leather-schwarz","aluminium"] } }
      ]
    },
    {
      id: "Beine",
      label: "Legs",
      appliesToMaterials: ["Leg_frame"],
      allowedMaterials: ["wood-eiche","aluminium","Wood-eich","leder-schwarz","stoff-blau"],
      auto: [
        { when:{ textIncludes:["Metall schwarz","Gestell: Metall schwarz"] }, choose:{ materialId:"aluminium", tint:"#111111" } },
        { when:{ colorEquals:"Schwarz" }, choose:{ materialId:"aluminium", tint:"#222222" } },
        { choose:{ oneOf:["aluminium","wood-eiche","Wood-eich"] } }
      ]
    }
  ]
};