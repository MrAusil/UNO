import { create } from 'zustand';
import type { GameState, ChatMessage, CardColor } from '@/types/game';
import type { Player } from '@/types/player';
import type { Room, RoomSettings } from '@/types/room';
import { DEFAULT_ROOM_SETTINGS } from '@/types/room';

interface GameStore {
  // Room state
  room: Room | null;
  
  // Game state
  gameState: GameState;
  
  // Chat
  chatMessages: ChatMessage[];
  unreadCount: number;
  isChatOpen: boolean;
  
  // UI state
  showColorPicker: boolean;
  showUnoButton: boolean;
  showWinScreen: boolean;
  pendingWildCardId: string | null;
  
  // Actions - Room
  setRoom: (room: Room) => void;
  updateRoom: (partial: Partial<Room>) => void;
  clearRoom: () => void;
  
  // Actions - Game
  setGameState: (state: Partial<GameState>) => void;
  updatePlayers: (players: Player[]) => void;
  setCurrentPlayer: (playerId: string) => void;
  setCurrentColor: (color: CardColor) => void;
  setDiscardTop: (card: import('@/types/game').Card) => void;
  setDeckCount: (count: number) => void;
  setTurnTimer: (time: number) => void;
  resetGame: () => void;
  
  // Actions - Chat
  addChatMessage: (message: ChatMessage) => void;
  clearUnread: () => void;
  toggleChat: () => void;
  
  // Actions - UI
  setShowColorPicker: (show: boolean, cardId?: string) => void;
  setShowUnoButton: (show: boolean) => void;
  setShowWinScreen: (show: boolean) => void;
}

const initialGameState: GameState = {
  gameId: null,
  status: 'waiting',
  players: [],
  currentPlayerId: null,
  direction: 'clockwise',
  deckCount: 108,
  discardPile: [],
  currentColor: null,
  turnTimer: 30,
  maxTurnTime: 30,
  round: 1,
  winner: null,
  unoCallerId: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  room: null,
  gameState: initialGameState,
  chatMessages: [],
  unreadCount: 0,
  isChatOpen: false,
  showColorPicker: false,
  showUnoButton: false,
  showWinScreen: false,
  pendingWildCardId: null,

  setRoom: (room) => set({ room }),
  
  updateRoom: (partial) =>
    set((state) => ({
      room: state.room ? { ...state.room, ...partial } : null,
    })),
  
  clearRoom: () => set({ room: null }),

  setGameState: (partial) =>
    set((state) => ({
      gameState: { ...state.gameState, ...partial },
    })),

  updatePlayers: (players) =>
    set((state) => ({
      gameState: { ...state.gameState, players },
    })),

  setCurrentPlayer: (playerId) =>
    set((state) => ({
      gameState: { ...state.gameState, currentPlayerId: playerId },
    })),

  setCurrentColor: (color) =>
    set((state) => ({
      gameState: { ...state.gameState, currentColor: color },
    })),

  setDiscardTop: (card) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        discardPile: [card, ...state.gameState.discardPile].slice(0, 10),
      },
    })),

  setDeckCount: (count) =>
    set((state) => ({
      gameState: { ...state.gameState, deckCount: count },
    })),

  setTurnTimer: (time) =>
    set((state) => ({
      gameState: { ...state.gameState, turnTimer: time },
    })),

  resetGame: () =>
    set({ gameState: initialGameState, showWinScreen: false }),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message].slice(-100),
      unreadCount: state.isChatOpen ? 0 : state.unreadCount + 1,
    })),

  clearUnread: () => set({ unreadCount: 0 }),

  toggleChat: () =>
    set((state) => ({
      isChatOpen: !state.isChatOpen,
      unreadCount: !state.isChatOpen ? 0 : state.unreadCount,
    })),

  setShowColorPicker: (show, cardId) =>
    set({ showColorPicker: show, pendingWildCardId: cardId || null }),

  setShowUnoButton: (show) => set({ showUnoButton: show }),

  setShowWinScreen: (show) => set({ showWinScreen: show }),
}));
