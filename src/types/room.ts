import type { Player } from './player';
import type { RoomSettings, ChatMessage, GameStatus } from './game';
export type { RoomSettings } from './game';

export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  settings: RoomSettings;
  status: GameStatus;
  chatMessages: ChatMessage[];
  createdAt: number;
}

export interface RoomState {
  room: Room | null;
  isConnecting: boolean;
  error: string | null;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  turnTimer: 30,
  maxRounds: 1,
  gameSpeed: 'normal',
  stackDrawCards: false,
  forcePlay: false,
};
