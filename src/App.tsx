import { useMachine } from "@xstate/react";
import { petMachine } from "./petMachine";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PetRenderer } from "./PetRenderer";
import "./App.css";

function App() {
  const [state, send] = useMachine(petMachine);

  return (
    <main className="container" data-tauri-drag-region>
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
      >
        <PetRenderer currentState={'belly'} />
      </div>
    </main>
  );
}

export default App;
