import { setup, assign, fromCallback } from 'xstate';

// 宠物状态上下文，可以用于扩展，比如精力、饱食度、水分
export interface PetContext {
  energy: number;
  hunger: number;
  hydration: number;
  pettingDuration: number;
}

export const petMachine = setup({
  types: {
    context: {} as PetContext,
    events: {} as
      | { type: 'INTERACT_START' }
      | { type: 'INTERACT_END' }
      | { type: 'TICK' }
      | { type: 'FORCE_EAT' }
      | { type: 'FORCE_DRINK' }
      | { type: 'FORCE_SLEEP' }
      | { type: 'WAKE_UP' }
  },
  actors: {
    ticker: fromCallback(({ sendBack }) => {
      const interval = setInterval(() => {
        sendBack({ type: 'TICK' });
      }, 1000);
      return () => clearInterval(interval);
    })
  },
  actions: {
    incrementPetting: assign({
      pettingDuration: ({ context }) => context.pettingDuration + 1
    }),
    resetPetting: assign({
      pettingDuration: 0
    }),
    decreaseStats: assign({
      energy: ({ context }) => Math.max(context.energy - 1, 0),
      hunger: ({ context }) => Math.max(context.hunger - 1, 0),
      hydration: ({ context }) => Math.max(context.hydration - 1, 0)
    }),
    restoreHunger: assign({ hunger: 100 }),
    restoreHydration: assign({ hydration: 100 }),
    restoreEnergy: assign({ energy: 100 })
  },
  guards: {
    isTired: ({ context }) => context.energy < 20,
    isHungry: ({ context }) => context.hunger < 20,
    isThirsty: ({ context }) => context.hydration < 20,
    isBellyTime: ({ context }) => context.pettingDuration >= 3 // 摸3秒后露肚皮
  }
}).createMachine({
  id: 'pet',
  initial: 'idle',
  context: {
    energy: 100,
    hunger: 100,
    hydration: 100,
    pettingDuration: 0
  },
  states: {
    idle: {
      on: {
        INTERACT_START: {
          target: 'petting',
          actions: 'resetPetting'
        },
        FORCE_EAT: 'eating',
        FORCE_DRINK: 'drinking',
        FORCE_SLEEP: 'sleeping'
      },
      after: {
        // 自主行为随机判定
        5000: [
          { target: 'sleeping', guard: 'isTired' },
          { target: 'eating', guard: 'isHungry' },
          { target: 'drinking', guard: 'isThirsty' },
          { target: 'idle' } // 继续发呆
        ]
      }
    },
    eating: {
      after: {
        4000: {
          target: 'idle',
          actions: 'restoreHunger'
        }
      }
    },
    drinking: {
      after: {
        3000: {
          target: 'idle',
          actions: 'restoreHydration'
        }
      }
    },
    sleeping: {
      on: {
        WAKE_UP: 'idle',
        INTERACT_START: 'idle' // 摸它会让它醒来
      },
      after: {
        10000: { target: 'idle', actions: 'restoreEnergy' } // 睡饱了自己醒
      }
    },
    petting: {
      invoke: {
        src: 'ticker'
      },
      on: {
        TICK: [
          { target: 'belly', guard: 'isBellyTime' },
          { actions: 'incrementPetting' }
        ],
        INTERACT_END: 'idle'
      }
    },
    belly: {
      on: {
        INTERACT_END: 'idle'
      }
    }
  }
});