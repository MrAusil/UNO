import { create } from 'zustand';
import type { SocketState } from '@/types/socket';

interface SocketStore extends SocketState {
  setConnected: (socketId: string) => void;
  setDisconnected: () => void;
  setConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
  updatePing: () => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  isConnected: false,
  isConnecting: false,
  socketId: null,
  error: null,
  lastPing: 0,

  setConnected: (socketId) =>
    set({ isConnected: true, isConnecting: false, socketId, error: null }),

  setDisconnected: () =>
    set({ isConnected: false, isConnecting: false, socketId: null }),

  setConnecting: (isConnecting) => set({ isConnecting }),

  setError: (error) => set({ error }),

  updatePing: () => set({ lastPing: Date.now() }),
}));
