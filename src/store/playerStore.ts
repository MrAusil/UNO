import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player } from '@/types/player';
import type { Card } from '@/types/game';
import { PLAYER_NAME_KEY, PLAYER_AVATAR_KEY } from '@/lib/constants';

interface PlayerStore {
  localPlayer: Player | null;
  hand: Card[];
  sessionId: string | null;

  setLocalPlayer: (player: Player) => void;
  setHand: (hand: Card[]) => void;
  addCards: (cards: Card[]) => void;
  removeCard: (cardId: string) => void;
  clearHand: () => void;
  setSessionId: (id: string) => void;
  updatePlayerName: (name: string) => void;
  updatePlayerAvatar: (avatar: string) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      localPlayer: null,
      hand: [],
      sessionId: null,

      setLocalPlayer: (player) => set({ localPlayer: player }),

      setHand: (hand) => set({ hand }),

      addCards: (cards) =>
        set((state) => ({ hand: [...state.hand, ...cards] })),

      removeCard: (cardId) =>
        set((state) => ({
          hand: state.hand.filter((c) => c.id !== cardId),
        })),

      clearHand: () => set({ hand: [] }),

      setSessionId: (id) => set({ sessionId: id }),

      updatePlayerName: (name) => {
        const player = get().localPlayer;
        if (player) {
          set({ localPlayer: { ...player, name } });
        }
      },

      updatePlayerAvatar: (avatar) => {
        const player = get().localPlayer;
        if (player) {
          set({ localPlayer: { ...player, avatar } });
        }
      },

      reset: () =>
        set({
          localPlayer: null,
          hand: [],
          sessionId: null,
        }),
    }),
    {
      name: 'uno-player-store',
      partialize: (state) => ({
        localPlayer: state.localPlayer
          ? { name: state.localPlayer.name, avatar: state.localPlayer.avatar }
          : null,
      }),
    }
  )
);
