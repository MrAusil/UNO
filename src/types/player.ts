export interface Player {
  id: string;
  name: string;
  avatar: string;
  cardCount: number;
  hand?: import('./game').Card[];
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  hasCalledUno: boolean;
}

export interface LocalPlayer extends Player {
  sessionId: string;
}

export const AVATARS = [
  '🦊', '🐼', '🦁', '🐯', '🦅', '🐸', '🦋', '🦄',
  '🐉', '🦋', '🐺', '🦊', '🐻', '🦝', '🦈', '🦂',
];

export function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}
