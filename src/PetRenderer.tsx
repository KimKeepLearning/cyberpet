import React, { useRef, useEffect } from 'react';
import { Application, Text, TextStyle } from 'pixi.js';

interface PetRendererProps {
  currentState: string;
}

export const PetRenderer: React.FC<PetRendererProps> = ({ currentState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    const initPixi = async () => {
      if (!canvasRef.current) return;

      const app = new Application();
      await app.init({
        canvas: canvasRef.current,
        width: 150,
        height: 150,
        backgroundAlpha: 0, // 彻底透明化 WebGL 背景
        antialias: true
      });
      appRef.current = app;

      // TODO: 这里是未来集成 Spine / Live2D 的骨骼绑定原点
      // await Assets.load('pet-model.json');
      // const pet = new Spine(skeletonData);
      
      // 当前：我们用 Pixi 内置的文本/图形渲染占位，模拟骨骼状态切换
      const style = new TextStyle({
        fontSize: 60,
        align: 'center',
      });
      
      const petSprite = new Text({ text: "😺", style });
      petSprite.anchor.set(0.5);
      // 放置到画布正中心
      petSprite.x = app.screen.width / 2;
      petSprite.y = app.screen.height / 2;

      app.stage.addChild(petSprite);

      // 实现呼吸动画渲染循环
      let tick = 0;
      app.ticker.add(() => {
        tick += 0.05;
        petSprite.y = app.screen.height / 2 + Math.sin(tick) * 5; // 上下呼吸浮动
      });
    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(false, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // 监听 XState 传来的状态变更，动态驱动 WebGL 画布内容更新
  useEffect(() => {
    if (!appRef.current) return;
    
    // 拿到场景内的那个根元素（未来这将是执行 pet.state.setAnimation(...) 代码的地方）
    const petSprite = appRef.current.stage.children[0] as Text;
    if (!petSprite) return;

    switch (currentState) {
      case 'idle': petSprite.text = "😺"; break;
      case 'eating': petSprite.text = "🍗"; break;
      case 'drinking': petSprite.text = "💧"; break;
      case 'sleeping': petSprite.text = "💤"; break;
      case 'petting': petSprite.text = "😽"; break;
      case 'belly': petSprite.text = "😻"; break;
      default: petSprite.text = "😺"; break;
    }
  }, [currentState]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};
