import { create } from 'zustand';

interface VoiceState {
  isMicEnabled: boolean;
  micPermissionDenied: boolean;
  speakingPlayers: Record<string, boolean>;
  setMicEnabled: (enabled: boolean) => void;
  setMicPermissionDenied: (denied: boolean) => void;
  setSpeakingPlayers: (players: Record<string, boolean>) => void;
  toggleMicAction: (() => Promise<void>) | null;
  setToggleMicAction: (action: (() => Promise<void>) | null) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isMicEnabled: false,
  micPermissionDenied: false,
  speakingPlayers: {},
  setMicEnabled: (enabled) => set({ isMicEnabled: enabled }),
  setMicPermissionDenied: (denied) => set({ micPermissionDenied: denied }),
  setSpeakingPlayers: (players) => set({ speakingPlayers: players }),
  toggleMicAction: null,
  setToggleMicAction: (action) => set({ toggleMicAction: action }),
}));
