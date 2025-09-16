// src/furniture/FurnitureViewer.tsx
import React, { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { FurnitureItem } from "./types";
import { resolveMaterialsForItem } from "./resolver";
import { SLOT_SPECS } from "./slot-specs";
import { applyResolvedMaterialsToGLTF } from "./apply-to-gltf";

// Drei 的 useGLTF 自带缓存与清理
function ModelWithMaterials({ item }: { item: FurnitureItem }) {
  const plan = useMemo(() => resolveMaterialsForItem(item, SLOT_SPECS), [item]);
  const { scene } = useGLTF(item.glbUrl!, true);

  useEffect(() => {
    if (scene) {
      // 关闭场景里自带灯光的影响（若有）
      scene.traverse((o) => {
        if ((o as any).isLight) (o as any).visible = false;
      });
      applyResolvedMaterialsToGLTF(scene as unknown as THREE.Group, plan);
    }
  }, [scene, plan]);

  return <primitive object={scene} />;
}

export function FurnitureViewer({ item, height = 520 }: { item: FurnitureItem; height?: number }) {
  return (
    <div style={{ width: "100%", height }}>
      <Canvas camera={{ position: [0.9, 0.9, 1.8], fov: 45 }} shadows>
        <Suspense fallback={null}>
          {/* 环境光照与简单舞台 */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 2]} intensity={0.9} castShadow />
          <Environment preset="city" />

          <ModelWithMaterials item={item} />
        </Suspense>
        <OrbitControls enablePan enableZoom makeDefault />
      </Canvas>
    </div>
  );
}

// 预加载（可选）：在路由进入前调用
// useGLTF.preload("/path/to/model.glb");