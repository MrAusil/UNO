import type { CardColor } from '@/types/game';

export const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

export const COLOR_HEX: Record<CardColor, string> = {
  red: '#E63946',
  blue: '#457B9D',
  green: '#2A9D8F',
  yellow: '#E9C46A',
  wild: '#6a0dad',
};

export const COLOR_LABEL: Record<CardColor, string> = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  yellow: 'Yellow',
  wild: 'Wild',
};

export const CARD_VALUE_LABEL: Record<string, string> = {
  skip: '⊘',
  reverse: '↺',
  draw_two: '+2',
  wild: 'W',
  wild_draw_four: 'W+4',
};

export const GAME_SPEED_MULTIPLIER = {
  slow: 1.5,
  normal: 1,
  fast: 0.6,
};

export const MAX_HAND_SIZE = 25;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const DEFAULT_TURN_TIMER = 30;

export const SOCKET_EVENTS = {
  // Server → Client
  PLAYER_JOIN: 'player_join',
  PLAYER_LEAVE: 'player_leave',
  ROOM_UPDATE: 'room_update',
  GAME_START: 'game_start',
  DEAL_CARDS: 'deal_cards',
  CARD_PLAYED: 'card_played',
  DRAW_CARDS: 'draw_cards',
  TURN_CHANGE: 'turn_change',
  COLOR_SELECTED: 'color_selected',
  UNO_CALLED: 'uno_called',
  GAME_OVER: 'game_over',
  CHAT_MESSAGE: 'chat_message',
  TIMER_UPDATE: 'timer_update',
  ERROR: 'error',
  PLAYER_READY: 'player_ready',
  SETTINGS_UPDATED: 'settings_updated',
  PLAYER_KICKED: 'player_kicked',

  // Client → Server
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  START_GAME: 'start_game',
  PLAY_CARD: 'play_card',
  DRAW_CARD: 'draw_card',
  CHOOSE_COLOR: 'choose_color',
  CALL_UNO: 'call_uno',
  CHALLENGE_UNO: 'challenge_uno',
  SEND_CHAT: 'send_chat',
  SET_READY: 'set_ready',
  UPDATE_SETTINGS: 'update_settings',
  KICK_PLAYER: 'kick_player',
} as const;

export const SOUND_ENABLED_KEY = 'uno_sound_enabled';
export const PLAYER_NAME_KEY = 'uno_player_name';
export const PLAYER_AVATAR_KEY = 'uno_player_avatar';
