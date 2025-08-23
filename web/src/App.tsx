import React, { useEffect, useMemo, useState } from "react";
import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "YOUR_ENTRA_APP_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: "http://localhost:5173"
  },
  cache: { cacheLocation: "localStorage", storeAuthStateInCookie: false }
};
const API_BASE = "http://localhost:7071/api";

type Furniture = {
  id: string; name: string; supplier: string; category: string; color: string;
  dimensions?: string; price?: number; glbUrl?: string; [k: string]: any;
};

async function fetchJSON(url: string, token?: string) {
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default function App() {
  const msal = useMemo(() => new PublicClientApplication(msalConfig), []);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  const [list, setList] = useState<Furniture[]>([]);
  const [filtered, setFiltered] = useState<Furniture[]>([]);
  const [active, setActive] = useState<Furniture | null>(null);

  const [supplier, setSupplier] = useState(""); const [category, setCategory] = useState("");
  const [color, setColor] = useState(""); const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchJSON(`${API_BASE}/furniture`)
      .then((rows) => { console.log('Loaded furniture', rows); setList(rows); setFiltered(rows); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let data = [...list];
    if (supplier) data = data.filter(x => x.supplier === supplier);
    if (category) data = data.filter(x => x.category === category);
    if (color) data = data.filter(x => x.color === color);
    if (keyword) {
      const k = keyword.toLowerCase();
      data = data.filter(x => `${x.name} ${x.category} ${x.color} ${x.supplier}`.toLowerCase().includes(k));
    }
    setFiltered(data);
  }, [supplier, category, color, keyword, list]);

  const suppliers = Array.from(new Set(list.map(x => x.supplier).filter(Boolean))).sort();
  const categories = Array.from(new Set(list.map(x => x.category).filter(Boolean))).sort();
  const colors = Array.from(new Set(list.map(x => x.color).filter(Boolean))).sort();

  return (
    <div style={{ fontFamily: "Inter, system-ui, Arial", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ position: "sticky", top: 0, background: "#fff", borderBottom: "1px solid #e5e7eb", padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "#0f172a", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700 }}>F</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Möbelinformationsplattform (GLB)</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 16, padding: 16 }}>
        <div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Filter</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Lieferant</div>
              <select value={supplier} onChange={e => setSupplier(e.target.value)}>
                <option value="">Alle</option>
                {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Kategorie</div>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Alle</option>
                {categories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Farbe</div>
              <select value={color} onChange={e => setColor(e.target.value)}>
                <option value="">Alle</option>
                {colors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Stichwort</div>
              <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Name/ID/..." />
            </div>
          </div>

          <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, height: "48vh", overflow: "auto" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Ergebnisse ({filtered.length})</div>
            <div style={{ display: "grid", gap: 8 }}>
              {filtered.map(item => (
                <button key={item.id} onClick={() => setActive(item)} style={{ textAlign: "left", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: active?.id===item.id? "#eef2ff":"#fff" }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{item.supplier} · {item.category} · {item.color}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, height: "78vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600 }}>Modellvorschau</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{active?.glbUrl ? active.glbUrl : "Bitte links ein Element auswählen"}</div>
            </div>
            <div style={{ flex: 1, padding: 12 }}>
              {active?.glbUrl ? (
                <model-viewer
                  src={active.glbUrl}
                  alt={active.name}
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  shadow-softness="0.9"
                  style={{ width: "100%", height: "100%", background: "#1e293b", borderRadius: 12 }}
                  exposure="1.0"
                ></model-viewer>
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#000", borderRadius: 12, display: "grid", placeItems: "center", color: "#64748b" }}>
                  Kein Modell ausgewählt
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Information</div>
            {active ? (
              <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{active.name}</div>
                <div>Lieferant: <span style={{ color: "#475569" }}>{active.supplier}</span></div>
                <div>Kategorie: <span style={{ color: "#475569" }}>{active.category}</span></div>
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
