import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";
import React, { useEffect, useMemo, useState, useRef } from "react";
import ModelViewer, { type MaterialEdit, ModelViewerHandle } from "./components/ModelViewer";
import MaterialsPanel, { type SlotAssignment } from "./components/MaterialsPanel";
import { CATEGORY_SLOTS, type SlotSpec } from "./lib/slotSpecs";
import { MATERIALS } from "./lib/materialLibrary";



// === MSAL & API (for ms authentication) ===
const msalConfig = {
  auth: {
    clientId: "YOUR_ENTRA_APP_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: "http://localhost:5173",
  },
  cache: { cacheLocation: "localStorage", storeAuthStateInCookie: false },
};
const API_BASE = (import.meta as any).env.VITE_API_BASE ?? "http://localhost:7071/api";

// === Types === defined through the JSON schema
export type Furniture = {
  id: string;
  name: string;
  supplier: string;
  category: string;
  description: string;
  color: string;
  dimensions?: string;
  price?: number;
  slug?: string;
  articleNo?: string;
  unit?: string;
  version?: string;
  storagePath?: string;
  glbUrl?: string;
  iosUrl?: string;
};

// 仅用于保存 dumpScene() 的结果（调试/生成 slots）
type SceneInfo = {
  materials: string[];
  meshes: { name: string; materials: (string | null)[] }[];
  variants: string[];
};

// === Utils ===
async function fetchJSON(url: string, token?: string) {
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// === App ===
export default function App() {
  // AR / WebXR
  const viewerRef = useRef<ModelViewerHandle>(null);
  const [arEnabled, setArEnabled] = useState(true);
  const [canAR, setCanAR] = useState(false);
  const handleOpenAR = () => viewerRef.current?.openAR();

  // 调试用：记录模型里的材质/网格/变体
  const [sceneInfo, setSceneInfo] = useState<SceneInfo | null>(null);

  // MSAL（你后面要接入鉴权时再用）
  const msal = useMemo(() => new PublicClientApplication(msalConfig), []);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  // 数据列表
  const [list, setList] = useState<Furniture[]>([]);
  const [filtered, setFiltered] = useState<Furniture[]>([]);
  const [active, setActive] = useState<Furniture | null>(null);

  const [supplier, setSupplier] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [keyword, setKeyword] = useState("");

  //material panel
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const slots = active ? (CATEGORY_SLOTS[active.category] ?? []) : [];
  const [assignment, setAssignment] = useState<SlotAssignment>({});

  useEffect(() => {
    fetchJSON(`${API_BASE}/furniture`)
      .then((rows) => { setList(rows); setFiltered(rows); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let data = [...list];
    if (supplier) data = data.filter((x) => x.supplier === supplier);
    if (category) data = data.filter((x) => x.category === category);
    if (color) data = data.filter((x) => x.color === color);
    if (keyword) {
      const k = keyword.toLowerCase();
      data = data.filter((x) => `${x.name} ${x.category} ${x.color} ${x.supplier}`.toLowerCase().includes(k));
    }
    setFiltered(data);
  }, [supplier, category, color, keyword, list]);

  const suppliers = Array.from(new Set(list.map((x) => x.supplier).filter(Boolean))).sort();
  const categories = Array.from(new Set(list.map((x) => x.category).filter(Boolean))).sort();
  const colors = Array.from(new Set(list.map((x) => x.color).filter(Boolean))).sort();

  // 模型加载完成：打印并记录材质/网格/变体
  const handleModelLoad = async () => {
    console.log("model loaded");
    try {
      const info = await viewerRef.current?.dumpScene();
      if (info) {
        setSceneInfo(info);
        console.log("materials:", info.materials);
        console.log("meshes:", info.meshes);
        console.log("variants:", info.variants);
      }
    } catch (e) {
      console.error("dumpScene failed:", e);
    }
  };

  // 轮询 canActivateAR()，控制按钮可用态
  useEffect(() => {
    const t = setInterval(() => {
      setCanAR(Boolean(viewerRef.current?.canActivateAR?.()));
    }, 500);
    return () => clearInterval(t);
  }, [active?.glbUrl, arEnabled]);

  // 当切换不同家具时，初始化默认选材（每个槽位取第一个 allowed）
useEffect(() => {
  if (!active) { setAssignment({}); return; }
  const init: SlotAssignment = {};
  for (const s of slots) init[s.id] = s.allowedMaterials[0];
  setAssignment(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [active?.id]);

const handleAssign = (slotId: string, materialId: string) =>
  setAssignment(prev => ({ ...prev, [slotId]: materialId }));

// 由 assignment 生成传给 ModelViewer 的 edits
const edits: MaterialEdit[] = React.useMemo(() => {
  const out: MaterialEdit[] = [];
  for (const s of slots) {
    const preset = MATERIALS[assignment[s.id] ?? ""];
    if (!preset) continue;
    out.push({
      appliesToMaterials: s.appliesToMaterials,
      baseColorHex: preset.baseColorHex,
      metallic: preset.metallic,
      roughness: preset.roughness,
      baseColorMap: preset.baseColorMap,
      normalMap: preset.normalMap,
      occlusionMap: preset.occlusionMap,
      normalScale: preset.normalScale,
    });
  }
  return out;
}, [assignment, slots]);



  return (
    <div style={{ fontFamily: "Inter, system-ui, Arial", background: "#000", minHeight: "100vh" }}>
      {/* roof */}
      <div style={{ position: "sticky", top: 0, background: "#fff", borderBottom: "1px solid #e5e7eb", padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "#0f172a", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700 }}>F</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Möbelinformationsplattform (GLB)</div>
        </div>
      </div>

      {/* 3-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 16, padding: 16 }}>
        {/* left: filter & list */}
        <div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Filter</div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Lieferant</div>
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                <option value="">Alle</option>
                {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Kategorie</div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Alle</option>
                {categories.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Farbe</div>
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="">Alle</option>
                {colors.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Stichwort</div>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Name/ID/..." />
            </div>
          </div>

          <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, height: "48vh", overflow: "auto" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Ergebnisse ({filtered.length})</div>
            <div style={{ display: "grid", gap: 8 }}>
              {filtered.map((item) => (
                <button key={item.id} onClick={() => setActive(item)} style={{ textAlign: "left", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: active?.id === item.id ? "#eef2ff" : "#fff" }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{item.supplier} · {item.category} · {item.color}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* middle: model preview card */}
        <div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, height: "78vh", display: "flex", flexDirection: "column" }}>
            {/* header: AR switch + btn */}
            <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600 }}>Modellvorschau</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 12, color: "#334155" }}>
                  <input type="checkbox" checked={arEnabled} onChange={(e) => setArEnabled(e.target.checked)} /> Use AR
                </label>
                <button
                  onClick={handleOpenAR}
                  disabled={!arEnabled || !active?.glbUrl || !canAR}
                  style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}
                >
                  In AR ansehen
                </button>
                <button
                  onClick={() => setMaterialsOpen(true)}
                  style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #cbd5e1", background:"#fff" }}
                >
                  打开材料库
                </button>
              </div>
            </div>

            {/* content: ModelViewer */}
            <div style={{ flex: 1, padding: 12 }}>
              <ModelViewer
                ref={viewerRef}
                src={active?.glbUrl}
                // iosSrc={active?.iosUrl} // 若需要 iOS Quick Look 再开启
                alt={active?.name}
                enableAR={arEnabled}
                arModes="webxr"          // ← 强制只用 WebXR
                arScale="fixed"
                arPlacement="floor"
                xrEnvironment
                autoRotate
                cameraControls
                exposure={1.0}
                shadowIntensity={1}
                shadowSoftness={0.9}
                edits={edits}  
                debug                    // 可选：右下角调试面板
                onLoad={handleModelLoad}
                onError={(e) => console.error("model failed to load", e)}
              />
            </div>

            {/* （可选）在卡片底部简要显示材质名，方便你核对 */}
            {sceneInfo && (
              <div style={{ padding: "8px 12px", borderTop: "1px solid #e5e7eb", fontSize: 12, color: "#475569" }}>
                <div><strong>Materials:</strong> {sceneInfo.materials.join(", ") || "—"}</div>
                {sceneInfo.variants.length > 0 && (
                  <div><strong>Variants:</strong> {sceneInfo.variants.join(", ")}</div>
                )}
              </div>
            )}
          </div>
        </div>
        <MaterialsPanel
            open={materialsOpen}
            onClose={() => setMaterialsOpen(false)}
            slots={slots}
            assignment={assignment}
            onChange={handleAssign}
          /> 
        {/* right: info card */}
        <div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Information</div>
            {active ? (
              <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{active.name}</div>
                <div>ID: <span style={{ color: "#475569" }}>{active.id}</span></div>
                <div>Lieferant: <span style={{ color: "#475569" }}>{active.supplier}</span></div>
                <div>Kategorie: <span style={{ color: "#475569" }}>{active.category}</span></div>
                <div>Lieferant Nr: <span style={{ color: "#475569" }}>{active.articleNo}</span></div>
                <div>Beschreibung: <span style={{ color: "#475569" }}>{active.description}</span></div>
                <div>Adresse: <span style={{ color: "#475569" }}>{active.storagePath}</span></div>
                <div>Farbe: <span style={{ color: "#475569" }}>{active.color}</span></div>
                {active.dimensions && <div>Größe: <span style={{ color: "#475569" }}>{active.dimensions}</span></div>}
                {active.price && <div>Preis: <span style={{ color: "#475569" }}>€{active.price}</span></div>}
              </div>
            ) : (
              <div style={{ color: "#6b7280" }}>Kein Möbel ausgewählt</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}