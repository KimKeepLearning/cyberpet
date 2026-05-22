import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface PetRendererProps {
  currentState: string;
}

// 彻底放弃 Suspense，使用原生的 useState + GLTFLoader 防止 Suspense 卡死并捕获具体报错
const PetModel: React.FC<{ currentState: string }> = ({ currentState }) => {
  const [modelScene, setModelScene] = useState<THREE.Group | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState("0%");

  useEffect(() => {
    const loader = new GLTFLoader();
    // 我们换回没有进行过 meshopt 压缩的纯几何体模型（dog_tiny_simplified.glb），因为 gltf-transform optimize 默认加了 meshopt 压缩导致 Threejs 需要额外的解码器配置
    loader.load(
      '/assets/dog_tiny_simplified.glb',
      (gltf) => {
        console.log("加载成功！", gltf);
        
        // 我们手动计算它的大小并把它缩小/居中，防止它太大以至于摄像机在它肚子里
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // 把模型的几何中心移到原点
        gltf.scene.position.x = -center.x;
        gltf.scene.position.y = -center.y;
        gltf.scene.position.z = -center.z;
        
        // 算出最大的一边，强行把模型缩放到只占画面 2 个单位大小
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const scale = 2 / maxDim; // 恢复刚才正好的完美大小
            gltf.scene.scale.setScalar(scale);
            gltf.scene.position.multiplyScalar(scale);
        }

        // 仅保留稍微侧身的效果让我们能看出立体感，去掉破坏画面的垂直下降
        gltf.scene.rotation.y = -Math.PI / 8;

        setModelScene(gltf.scene);
      },
      (xhr) => {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        setProgress(`${percent}%`);
      },
      (err: any) => {
        console.error("加载出错了：", err);
        setErrorMsg(err.message || String(err));
      }
    );
  }, []);

  if (errorMsg) {
    return (
      <Html center>
        <div style={{ color: "white", backgroundColor: "red", padding: "10px", fontSize: "12px", whiteSpace: "nowrap" }}>
          模型解析失败: {errorMsg}
        </div>
      </Html>
    );
  }

  if (!modelScene) {
    return (
      <Html center zIndexRange={[100, 0]}>
        <div style={{ color: "white", backgroundColor: "rgba(0,0,0,0.8)", padding: "10px", borderRadius: "8px", fontSize: "16px", whiteSpace: "nowrap" }}>
          Loading: {progress}
        </div>
        {/* 放一个临时的红色小方块证明 3D 引擎本身没挂 */}
      </Html>
    );
  }

  return <primitive object={modelScene} />;
};

export const PetRenderer: React.FC<PetRendererProps> = ({ currentState }) => {
  return (
    <div style={{ width: '100%', height: '100%', outline: 'none', background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 1000 }} // 恢复最完美的中立摄像机视距
        gl={{ alpha: true, antialias: true }} 
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={2} castShadow />

        <PetModel currentState={currentState} />
      </Canvas>
    </div>
  );
};
