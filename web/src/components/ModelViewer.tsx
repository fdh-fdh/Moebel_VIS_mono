import React, {
  forwardRef, memo, useEffect, useImperativeHandle, useRef,
} from "react";

export type ModelViewerHandle = {
  openAR: () => void;
  canActivateAR: () => boolean;
};

type Props = {
  src?: string;
  iosSrc?: string;
  alt?: string;
  enableAR?: boolean;
  arModes?: string;
  arScale?: "fixed" | "auto";
  arPlacement?: "floor" | "wall";
  xrEnvironment?: boolean;
  autoRotate?: boolean;
  cameraControls?: boolean;
  exposure?: number | string;
  shadowIntensity?: number | string;
  shadowSoftness?: number | string;
  style?: React.CSSProperties;
  className?: string;
  onLoad?: (ev: Event) => void;
  onError?: (ev: Event) => void;
};

const ModelViewer = forwardRef<ModelViewerHandle, Props>(function ModelViewer(
  {
    src, iosSrc, alt = "3D model",
    enableAR = true, arModes = "webxr scene-viewer quick-look",
    arScale = "fixed", arPlacement = "floor", xrEnvironment = true,
    autoRotate = true, cameraControls = true,
    exposure = 1.0, shadowIntensity = 1, shadowSoftness = 0.9,
    style, className, onLoad, onError,
  },
  ref
) {
  const elRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    openAR: () => elRef.current?.activateAR?.(),
    canActivateAR: () => !!elRef.current?.canActivateAR,
  }));

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

  if (!src) {
    return (
      <div
        style={{ width: "100%", height: "100%", display: "grid", placeItems: "center",
                 background: "#0b1220", color: "#94a3b8", borderRadius: 12, ...style }}
        className={className}
      >
        Kein Modell ausgewählt
      </div>
    );
  }

  return (
    <model-viewer
      ref={elRef}
      src={src}
      alt={alt}
      ar={enableAR as any}
      ar-modes={enableAR ? (arModes as any) : undefined}
      ar-scale={enableAR ? (arScale as any) : undefined}
      ar-placement={enableAR ? (arPlacement as any) : undefined}
      xr-environment={xrEnvironment as any}
      ios-src={iosSrc as any}
      camera-controls={cameraControls as any}
      auto-rotate={autoRotate as any}
      exposure={String(exposure) as any}
      shadow-intensity={String(shadowIntensity) as any}
      shadow-softness={String(shadowSoftness) as any}
      style={{ width: "100%", height: "100%", background: "#1e293b", borderRadius: 12, ...style }}
      class={className as any}
    />
  );
});

export default memo(ModelViewer);