import React from "react";
import { MATERIALS } from "../lib/materialLibrary";
import type { SlotSpec } from "../lib/slotSpecs";

export type SlotAssignment = Record<string, string | undefined>; // slotId -> materialId

type Props = {
  open: boolean;
  onClose: () => void;
  slots: SlotSpec[];
  assignment: SlotAssignment;
  onChange: (slotId: string, materialId: string) => void;
};

export default function MaterialsPanel({ open, onClose, slots, assignment, onChange }: Props) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", top:0, right:0, width:400, height:"100vh",
      background:"#fff", borderLeft:"1px solid #e5e7eb", boxShadow:"-6px 0 20px rgba(0,0,0,.08)",
      display:"flex", flexDirection:"column", zIndex:50 }}>
      <div style={{ padding:12, borderBottom:"1px solid #e5e7eb", display:"flex", justifyContent:"space-between" }}>
        <div style={{ fontWeight:600 }}>材料库</div>
        <button onClick={onClose} style={{ border:"1px solid #cbd5e1", borderRadius:8, background:"#fff", padding:"4px 10px" }}>关闭</button>
      </div>
      <div style={{ padding:12, overflow:"auto", display:"grid", gap:12 }}>
        {slots.map(slot => {
          const options = slot.allowedMaterials.map(id => MATERIALS[id]).filter(Boolean);
          return (
            <div key={slot.id} style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
              <div style={{ fontWeight:600, marginBottom:8 }}>{slot.label} <span style={{color:"#64748b"}}>({slot.id})</span></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {options.map(opt => (
                  <button key={opt!.id}
                    onClick={() => onChange(slot.id, opt!.id)}
                    style={{
                      textAlign:"left", padding:8, borderRadius:10,
                      border: assignment[slot.id]===opt!.id ? "2px solid #6366f1":"1px solid #e5e7eb",
                      background:"#fff"
                    }}>
                    <div style={{ fontWeight:600 }}>{opt!.label}</div>
                    <div style={{ fontSize:12, color:"#64748b" }}>
                      {opt!.baseColorHex ? `颜色 ${opt!.baseColorHex}` : (opt!.baseColorMap ? "贴图" : "—")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}