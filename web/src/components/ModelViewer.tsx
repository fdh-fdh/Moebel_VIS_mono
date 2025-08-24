import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

/** 运行时材质编辑（scene-graph API） */
export type MaterialEdit = {
  /** 目标材质名列表（需与 GLB 中材质名一致，如 "Seat", "Legs"）。为空则跳过，防止整模叠加 */
  appliesToMaterials?: string[];
  baseColorHex?: string;         // "#RRGGBB"
  metallic?: number;             // 0..1
  roughness?: number;            // 0..1
  baseColorMap?: string;         // 贴图 URL
  normalMap?: string;            // 法线贴图 URL
  occlusionMap?: string;         // AO 贴图 URL
  normalScale?: number;          // 法线强度
};

export type ModelViewerHandle = {
  /** 调起 WebXR AR（相当于 <model-viewer>.activateAR()） */
  openAR: () => void;
  /** 是否可以激活 AR（存在 canActivateAR 即认为可用） */
  canActivateAR: () => boolean;
  /**
   * 导出当前场景信息：材质名、mesh→材质映射、可用变体列表
   * 用于调试/生成 slotSpec
   */
  dumpScene: () => Promise<{
    materials: string[];
    meshes: { name: string; materials: (string | null)[] }[];
    variants: string[];
  }>;
};

type Props = {
  src?: string;                  // GLB/GLTF URL
  iosSrc?: string;               // 可选：USDZ（iOS Quick Look）
  alt?: string;

  /** 材质变体名（GLB 含 KHR_materials_variants 时可用） */
  variantName?: string;

  /** 运行时材质编辑（不依赖 KHR 扩展） */
  edits?: MaterialEdit[];

  // AR / WebXR
  enableAR?: boolean;
  arModes?: string;              // 默认 "webxr"
  arScale?: "fixed" | "auto";
  arPlacement?: "floor" | "wall";
  xrEnvironment?: boolean;

  // Viewer 交互与渲染
  autoRotate?: boolean;
  cameraControls?: boolean;
  exposure?: number | string;
  shadowIntensity?: number | string;
  shadowSoftness?: number | string;

  // 外观
  style?: React.CSSProperties;
  className?: string;

  // 事件
  onLoad?: (ev: Event) => void;
  onError?: (ev: Event) => void;

  /** 可选：右下角调试面板（材质/网格/变体） */
  debug?: boolean;
};

/** Hex -> RGBA [0..1] */
function hexToRGBA(hex: string): [number, number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b, 1];
}

/** 自定义元素是否“升级”成功（v3 API 可用） */
function isUpgraded(el: any) {
  return el && typeof el.updateComplete !== "undefined";
}

const ModelViewer = forwardRef<ModelViewerHandle, Props>(function ModelViewer(
  {
    src,
    iosSrc,
    alt = "3D model",
    variantName,
    edits,

    enableAR = true,
    arModes = "webxr",
    arScale = "fixed",
    arPlacement = "floor",
    xrEnvironment = true,

    autoRotate = true,
    cameraControls = true,
    exposure = 1.0,
    shadowIntensity = 1,
    shadowSoftness = 0.9,

    style,
    className,
    onLoad,
    onError,
    debug = false,
  },
  ref
) {
  const elRef = useRef<any>(null);

  // 调试面板数据
  const [dbgMaterials, setDbgMaterials] = useState<string[]>([]);
  const [dbgMeshes, setDbgMeshes] = useState<{ name: string; materials: (string | null)[] }[]>([]);
  const [dbgVariants, setDbgVariants] = useState<string[]>([]);

  // 依赖数组里的 JSON.stringify 会触发 esbuild 的报错；先在外面算好字符串 key
  const editsKey = JSON.stringify(edits ?? []);

  /** 对外暴露的方法 */
  useImperativeHandle(ref, () => ({
    openAR: () => elRef.current?.activateAR?.(),
    canActivateAR: () => !!elRef.current?.canActivateAR,
    dumpScene: async () => {
      const el = elRef.current as any;
      if (!isUpgraded(el)) return { materials: [], meshes: [], variants: [] };
      await el.updateComplete;

      const materials: string[] = (el.model?.materials ?? []).map((m: any) => m.name);
      const meshes = (el.model?.meshes ?? []).map((mesh: any) => ({
        name: mesh.name,
        materials: mesh.primitives.map((p: any) => p.material?.name ?? null),
      }));
      const variants: string[] = Array.isArray(el.availableVariants) ? el.availableVariants : [];

      return { materials, meshes, variants };
    },
  }));

  /** 绑定外部 onLoad/onError */
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const onL = (e: Event) => onLoad?.(e);
    const onE = (e: Event) => onError?.(e);
    el.addEventListener("load", onL);
    el.addEventListener("error", onE);
    return () => {
      el.removeEventListener("load", onL);
      el.removeEventListener("error", onE);
    };
  }, [onLoad, onError, src]);

  /** 切换 KHR 变体（如果存在） */
  useEffect(() => {
    const el = elRef.current as any;
    if (!isUpgraded(el)) return;
    (async () => {
      await el.updateComplete;
      try {
        el.variantName = variantName ?? undefined;
      } catch {
        // 无扩展或无该变体 → 忽略
      }
    })();
  }, [variantName, src]);

  /** 运行时材质编辑（v3 兼容；不使用 setTextureInfo） */
  useEffect(() => {
    const applyEdits = async () => {
      const el = elRef.current as any;
      if (!isUpgraded(el) || !edits?.length) return;
      await el.updateComplete;

      const model = el.model;
      if (!model) return;

      for (const edit of edits) {
        // 关键防护：没有目标材质名则跳过，避免“整模叠加”
        if (!edit.appliesToMaterials?.length) continue;

        const targets = model.materials.filter((m: any) =>
          edit.appliesToMaterials!.includes(m.name)
        );
        if (!targets.length) continue;

        for (const mat of targets) {
          const pbr = mat.pbrMetallicRoughness;

          if (edit.baseColorHex) pbr.setBaseColorFactor(hexToRGBA(edit.baseColorHex));
          if (typeof edit.metallic === "number") pbr.setMetallicFactor(edit.metallic);
          if (typeof edit.roughness === "number") pbr.setRoughnessFactor(edit.roughness);

          // Base Color（v3：setTexture）
          if (edit.baseColorMap) {
            try {
              const tex = await el.createTexture?.(edit.baseColorMap);
              pbr.baseColorTexture?.setTexture?.(tex);
            } catch {}
          }
          // Normal（支持 normalScale）
          if (edit.normalMap) {
            try {
              const tex = await el.createTexture?.(edit.normalMap);
              const nt = pbr.normalTexture as any;
              nt?.setTexture?.(tex);
              if (typeof edit.normalScale === "number" && nt?.setScale) {
                nt.setScale(edit.normalScale);
              }
            } catch {}
          }
          // Occlusion (AO)
          if (edit.occlusionMap) {
            try {
              const tex = await el.createTexture?.(edit.occlusionMap);
              pbr.occlusionTexture?.setTexture?.(tex);
            } catch {}
          }
        }
      }
    };

    applyEdits();
  }, [src, editsKey]); // 使用预计算的字符串 key，避免直接在依赖里写 JSON.stringify

  /** 调试面板：load 后采集一次数据 */
  useEffect(() => {
    if (!debug) return;
    const el = elRef.current as any;
    if (!el) return;

    const run = async () => {
      if (!isUpgraded(el)) return;
      await el.updateComplete;

      const mats = (el.model?.materials ?? []).map((m: any) => m.name);
      const meshes = (el.model?.meshes ?? []).map((mesh: any) => ({
        name: mesh.name,
        materials: mesh.primitives.map((p: any) => p.material?.name ?? null),
      }));
      const variants: string[] = Array.isArray(el.availableVariants) ? el.availableVariants : [];

      setDbgMaterials(mats);
      setDbgMeshes(meshes);
      setDbgVariants(variants);
    };

    const onL = () => run();
    el.addEventListener("load", onL);
    return () => el.removeEventListener("load", onL);
  }, [debug, src]);

  if (!src) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          background: "#0b1220",
          color: "#94a3b8",
          borderRadius: 12,
          ...style,
        }}
        className={className}
      >
        Kein Modell ausgewählt
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }} className={className}>
      <model-viewer
        ref={elRef}
        src={src}
        alt={alt}
        // AR / WebXR
        ar={enableAR as any}
        ar-modes={enableAR ? (arModes as any) : undefined}
        ar-scale={enableAR ? (arScale as any) : undefined}
        ar-placement={enableAR ? (arPlacement as any) : undefined}
        xr-environment={xrEnvironment as any}
        ios-src={iosSrc as any}
        // 交互 & 渲染
        camera-controls={cameraControls as any}
        auto-rotate={autoRotate as any}
        exposure={String(exposure) as any}
        shadow-intensity={String(shadowIntensity) as any}
        shadow-softness={String(shadowSoftness) as any}
        style={{ width: "100%", height: "100%", background: "#1e293b", borderRadius: 12, ...style }}
      />

      {debug && (
        <div
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            maxWidth: "44%",
            background: "rgba(15,23,42,.92)",
            color: "#e2e8f0",
            padding: 12,
            borderRadius: 12,
            fontSize: 12,
            lineHeight: 1.4,
            boxShadow: "0 6px 20px rgba(0,0,0,.25)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Materials</div>
          <div style={{ wordBreak: "break-all" }}>
            {dbgMaterials.length ? dbgMaterials.join(", ") : "—"}
          </div>

          <div style={{ fontWeight: 700, margin: "10px 0 6px" }}>Meshes → Materials</div>
          <div style={{ maxHeight: 160, overflow: "auto" }}>
            {dbgMeshes.map((m) => (
              <div key={m.name} style={{ marginBottom: 6 }}>
                <div style={{ color: "#93c5fd" }}>{m.name}</div>
                <div style={{ opacity: 0.9 }}>
                  {m.materials.map((mm, i) => `[#${i}] ${mm ?? "(none)"}`).join("  |  ")}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 700, margin: "10px 0 6px" }}>Variants</div>
          <div>{dbgVariants.length ? dbgVariants.join(", ") : "—"}</div>
        </div>
      )}
    </div>
  );
});

export default memo(ModelViewer);