// src/lib/slotSpecs.ts
export type SlotSpec = {
  id: string;                   // 槽位ID（业务语义）
  label: string;                // 展示名
  appliesToMaterials: string[]; // GLB 里的材质名（区分大小写）
  allowedMaterials: string[];   // 材料库的 preset ID
};

export const CATEGORY_SLOTS: Record<string, SlotSpec[]> = {
  // 例子：你的类别名需要和数据里的 category 对齐（如 "Barhocker"）
  Barhocker: [
    { id: "Sitze innere", label: "Seat inside", appliesToMaterials: ["seat_cover"], allowedMaterials: ["plastic-blue","leather-black"] },
    { id: "Sitze äußere", label: "Seat outside", appliesToMaterials: ["seat_back"], allowedMaterials: ["wood-eiche","aluminium"] },
    { id: "Beine", label: "Legs", appliesToMaterials: ["Leg_frame"], allowedMaterials: ["wood-eiche","aluminium", "Wood-eich"] },
  ],
};

// 可选的小工具函数
export function getSlotsForCategory(category?: string): SlotSpec[] {
  return CATEGORY_SLOTS[category ?? ""] ?? [];
}