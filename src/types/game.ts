export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'skip' | 'reverse' | 'draw_two'
  | 'wild' | 'wild_draw_four';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';
export type GameDirection = 'clockwise' | 'counterclockwise';

export interface GameState {
  gameId: string | null;
  status: GameStatus;
  players: Player[];
  currentPlayerId: string | null;
  direction: GameDirection;
  deckCount: number;
  discardPile: Card[];
  currentColor: CardColor | null;
  turnTimer: number;
  maxTurnTime: number;
  round: number;
  winner: Player | null;
  unoCallerId: string | null;
}

export interface RoomSettings {
  maxPlayers: number;
  turnTimer: number;
  maxRounds: number;
  gameSpeed: 'slow' | 'normal' | 'fast';
  stackDrawCards: boolean;
  forcePlay: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'game-event';
}

export interface GameEvent {
  type: string;
  payload: unknown;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  cardCount: number;
  hand?: Card[];
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  hasCalledUno: boolean;
}
