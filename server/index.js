import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: WEB_ORIGIN }));

app.use("/models", express.static(path.join(__dirname, "models")));

const dataPath = path.join(__dirname, "furniture.sample.json");
let furniture = [];
try { furniture = JSON.parse(fs.readFileSync(dataPath, "utf-8")); }
catch (e) { console.error("Failed to read furniture.sample.json", e); furniture = []; }

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/furniture", (req, res) => {
  const { supplier = "", category = "", color = "", q = "" } = req.query;
  let rows = furniture;
  if (supplier) rows = rows.filter(x => (x.supplier||"") === supplier);
  if (category) rows = rows.filter(x => (x.category||"") === category);
  if (color) rows = rows.filter(x => (x.color||"") === color);
  if (q) { const k = String(q).toLowerCase(); rows = rows.filter(x => `${x.name} ${x.supplier} ${x.category} ${x.color}`.toLowerCase().includes(k)); }
  res.json(rows);
});

const port = process.env.PORT || 7071;
app.listen(port, () => console.log(`GLB server on http://localhost:${port}`));
