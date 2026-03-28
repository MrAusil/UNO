import type { Card, ChatMessage, GameState, GameStatus, RoomSettings } from '@/types/game';
import type { Player } from '@/types/player';
import type { Room } from '@/types/room';
import { DEFAULT_ROOM_SETTINGS } from '@/types/room';

type BackendPlayer = {
  playerId: string;
  username: string;
  avatar?: string;
  hand?: Card[];
  calledUNO?: boolean;
  connected?: boolean;
  isReady?: boolean;
};

type BackendRoomState = {
  roomCode: string;
  hostId: string;
  players: BackendPlayer[];
  gameState?: {
    deck?: Card[];
    discardPile?: Card[];
    currentPlayerIndex?: number;
    direction?: number;
    currentColor?: Card['color'] | null;
    winner?: BackendPlayer | null;
  } | null;
  settings?: Partial<RoomSettings>;
  maxPlayers?: number;
  status?: string;
  createdAt?: number;
};

const mapStatus = (status?: string): GameStatus => {
  if (status === 'In Game') return 'playing';
  if (status === 'Finished') return 'finished';
  return 'waiting';
};

export function normalizeRoomState(roomState: BackendRoomState) {
  const players: Player[] = roomState.players.map((player) => ({
    id: player.playerId,
    name: player.username,
    avatar: player.avatar || 'default',
    cardCount: player.hand?.length || 0,
    hand: player.hand || [],
    isHost: player.playerId === roomState.hostId,
    isReady: player.playerId === roomState.hostId ? true : !!player.isReady,
    isConnected: player.connected !== false,
    score: 0,
    hasCalledUno: !!player.calledUNO,
  }));

  const status = mapStatus(roomState.status);
  const currentPlayer =
    typeof roomState.gameState?.currentPlayerIndex === 'number'
      ? roomState.players[roomState.gameState.currentPlayerIndex] || null
      : null;

  const mergedSettings = {
    ...DEFAULT_ROOM_SETTINGS,
    ...roomState.settings,
    maxPlayers: roomState.settings?.maxPlayers || roomState.maxPlayers || DEFAULT_ROOM_SETTINGS.maxPlayers,
  };

  const room: Room = {
    id: roomState.roomCode,
    code: roomState.roomCode,
    hostId: roomState.hostId,
    players,
    settings: mergedSettings,
    status,
    chatMessages: [],
    createdAt: roomState.createdAt || Date.now(),
  };

  const winner = roomState.gameState?.winner
    ? players.find((player) => player.id === roomState.gameState?.winner?.playerId) || null
    : null;

  const gameState: GameState = {
    gameId: roomState.roomCode,
    status,
    players,
    currentPlayerId: currentPlayer?.playerId || null,
    direction: roomState.gameState?.direction === -1 ? 'counterclockwise' : 'clockwise',
    deckCount: roomState.gameState?.deck?.length || 0,
    discardPile: [...(roomState.gameState?.discardPile || [])].reverse(),
    currentColor: roomState.gameState?.currentColor || null,
    turnTimer: mergedSettings.turnTimer,
    maxTurnTime: mergedSettings.turnTimer,
    round: 1,
    winner,
    unoCallerId: null,
  };

  return { room, gameState, players };
}

export function makeSystemMessage(message: string, type: ChatMessage['type'] = 'system'): ChatMessage {
  return {
    id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    playerId: 'system',
    playerName: 'System',
    message,
    timestamp: Date.now(),
    type,
  };
}
