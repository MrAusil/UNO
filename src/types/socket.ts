import type { Card, CardColor, ChatMessage, RoomSettings } from './game';

export interface ServerToClientEvents {
  player_joined: (data: { playerId: string; playerName: string; roomState: unknown }) => void;
  player_left: (data: { playerId: string; roomState?: unknown }) => void;
  room_update: (data: { roomState: unknown }) => void;
  game_started: (data: { roomState: unknown }) => void;
  card_played: (data: { playerId: string; card: Card; chosenColor?: CardColor; roomState: unknown }) => void;
  cards_drawn: (data: { playerId: string; numCards: number; drawnCards?: Card[]; roomState: unknown }) => void;
  turn_changed: (data: { currentPlayerId: string; timer: number; roomState?: unknown }) => void;
  color_selected: (data: { color: CardColor; playerId: string }) => void;
  uno_called: (data: { playerId: string; playerName: string; roomState?: unknown }) => void;
  uno_challenge: (data: { challengerId: string; targetId: string; success: boolean; roomState?: unknown }) => void;
  game_over: (data: { winner: string; roomState: unknown }) => void;
  chat_message: (data: ChatMessage) => void;
  timer_update: (data: { timeLeft: number }) => void;
  error: (data: { message: string; code?: string }) => void;
  connection_restored: () => void;
  player_ready: (data: { playerId: string; isReady: boolean; roomState?: unknown }) => void;
  settings_updated: (data: { settings: RoomSettings; roomState?: unknown }) => void;
  player_kicked: (data: { playerId: string; roomState?: unknown }) => void;
  voice_user_joined: (data: { playerId: string; socketId: string }) => void;
  voice_user_left: (data: { playerId: string; socketId?: string }) => void;
  webrtc_offer: (data: { senderId: string; senderSocketId: string; offer: RTCSessionDescriptionInit }) => void;
  webrtc_answer: (data: { senderId: string; senderSocketId: string; answer: RTCSessionDescriptionInit }) => void;
  webrtc_ice_candidate: (data: { senderId: string; senderSocketId: string; candidate: RTCIceCandidateInit }) => void;
}

export interface ClientToServerEvents {
  create_room: (
    data: { playerName: string; avatar: string; settings?: Partial<RoomSettings> },
    callback: (response: { success: boolean; room?: unknown; roomCode?: string; playerId?: string; error?: string }) => void
  ) => void;
  join_room: (
    data: { roomCode: string; playerName: string; avatar: string },
    callback: (response: { success: boolean; room?: unknown; playerId?: string; error?: string }) => void
  ) => void;
  leave_room: (
    data?: { roomCode?: string },
    callback?: (response: { success?: boolean; error?: string }) => void
  ) => void;
  start_game: (
    data: { roomCode?: string } | undefined,
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;
  play_card: (
    data: { roomCode?: string; cardId: string; chosenColor?: CardColor },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;
  draw_card: (
    data: { roomCode?: string } | undefined,
    callback: (response: { success: boolean; cards?: Card[]; error?: string }) => void
  ) => void;
  choose_color: (data: { color: CardColor }) => void;
  call_uno: (
    data?: { roomCode?: string },
    callback?: (response: { success?: boolean; error?: string }) => void
  ) => void;
  challenge_uno: (
    data: { targetPlayerId: string },
    callback?: (response: { success?: boolean; error?: string }) => void
  ) => void;
  send_chat: (
    data: { roomCode?: string; message: string },
    callback?: (response: { success?: boolean; error?: string }) => void
  ) => void;
  set_ready: (
    data: { isReady: boolean },
    callback?: (response: { success?: boolean; error?: string }) => void
  ) => void;
  update_settings: (
    data: Partial<RoomSettings>,
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;
  kick_player: (
    data: { playerId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;
  join_voice: (
    data: { roomCode?: string },
    callback?: (response: { success: boolean; error?: string }) => void
  ) => void;
  leave_voice: (
    data: { roomCode?: string },
    callback?: (response: { success: boolean; error?: string }) => void
  ) => void;
  webrtc_offer: (data: { targetSocketId: string; offer: RTCSessionDescriptionInit; roomCode?: string }) => void;
  webrtc_answer: (data: { targetSocketId: string; answer: RTCSessionDescriptionInit; roomCode?: string }) => void;
  webrtc_ice_candidate: (data: { targetSocketId: string; candidate: RTCIceCandidateInit; roomCode?: string }) => void;
}

export interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  socketId: string | null;
  error: string | null;
  lastPing: number;
}
