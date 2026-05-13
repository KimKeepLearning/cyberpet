import { useEffect, useState } from "react";
import { useMachine } from "@xstate/react";
import { petMachine } from "./petMachine";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PetRenderer } from "./PetRenderer";
import "./App.css";

function App() {
  const [state, send] = useMachine(petMachine);
  const [, setAssets] = useState<Record<string, string> | null>(null);

  // 模拟：“只上传我的专属宠物形象，打通AI生成动画并在后台加载”
  useEffect(() => {
    const generateAIPetAssets = async () => {
      console.log("正在使用自家宠物形象并提取目标特征生成动作序列...");

      setTimeout(() => {
        setAssets({
          idle: "😺",
          eating: "🍖😸",
          drinking: "💧😸",
          sleeping: "💤😸",
          petting: "😽",
          belly: "😻 (专属主人的肚皮)"
        });
        console.log("AI 动作序列生成并加载完成！");
      }, 1500);
    };

    generateAIPetAssets();
  }, []);

  return (
    <main className="container" data-tauri-drag-region>
      {/* 宠物本身也可以触发拖拽，且长按会触发宠物抚摸反馈 */}
      <div
        className={`pet ${state.value}`}
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
        onPointerDown={(e) => {
          if (e.button === 0) {
            getCurrentWindow().startDragging();
            send({ type: 'INTERACT_START' });
          }
        }}
        onPointerUp={() => send({ type: 'INTERACT_END' })}
        onPointerLeave={() => send({ type: 'INTERACT_END' })}
        title="长按摸摸我，或者拖拽移动"
      >
        <PetRenderer currentState={state.value as string} />
      </div>
    </main>
  );
}

export default App;
