'use client';

import { useEffect, useCallback, useRef } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { makeSystemMessage, normalizeRoomState } from '@/lib/normalizers';
import { useSocketStore } from '@/store/socketStore';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { soundManager } from '@/utils/soundManager';
import type { GameSocket } from '@/lib/socket';

export function useSocket() {
  const socketRef = useRef<GameSocket | null>(null);
  const { setConnected, setDisconnected, setConnecting, setError } = useSocketStore();
  const { setGameState, setRoom, updateRoom, addChatMessage, setShowColorPicker, setShowWinScreen } = useGameStore();
  const { setHand, setLocalPlayer } = usePlayerStore();

  const setupEventListeners = useCallback((socket: GameSocket) => {
    const syncRoomState = (roomState?: unknown) => {
      if (!roomState) return;

      const normalized = normalizeRoomState(roomState as never);
      const localPlayerId = usePlayerStore.getState().localPlayer?.id;
      const localPlayer = normalized.players.find((player) => player.id === localPlayerId);

      setRoom(normalized.room);
      setGameState(normalized.gameState);

      if (localPlayer) {
        setLocalPlayer(localPlayer);
        setHand(localPlayer.hand || []);
      }
    };

    socket.on('connect', () => {
      setConnected(socket.id ?? '');
    });

    socket.on('disconnect', () => {
      setDisconnected();
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setDisconnected();
    });

    socket.on('room_update', ({ roomState }) => {
      syncRoomState(roomState);
    });

    socket.on('player_joined', ({ playerName, roomState }) => {
      syncRoomState(roomState);
      soundManager.play('player_join');
      addChatMessage(makeSystemMessage(`${playerName} joined the room`));
    });

    socket.on('player_left', ({ playerId, roomState }) => {
      const currentRoom = useGameStore.getState().room;
      const player = currentRoom?.players.find((entry) => entry.id === playerId);
      syncRoomState(roomState);
      addChatMessage(makeSystemMessage(`${player?.name || 'A player'} left the room`));
    });

    socket.on('game_started', ({ roomState }) => {
      syncRoomState(roomState);
      soundManager.play('player_join');
    });

    socket.on('card_played', ({ roomState, chosenColor }) => {
      syncRoomState(roomState);
      if (chosenColor) {
        setGameState({ currentColor: chosenColor });
      }
      soundManager.play('card_play');
    });

    socket.on('cards_drawn', ({ roomState }) => {
      syncRoomState(roomState);
      soundManager.play('card_draw');
    });

    socket.on('turn_changed', ({ currentPlayerId, timer, roomState }) => {
      syncRoomState(roomState);
      setGameState({ currentPlayerId, turnTimer: timer });

      const localPlayerId = usePlayerStore.getState().localPlayer?.id;
      if (currentPlayerId === localPlayerId) {
        soundManager.play('turn_start');
      }
    });

    socket.on('uno_called', ({ playerName, roomState }) => {
      syncRoomState(roomState);
      soundManager.play('uno_call');
      addChatMessage(makeSystemMessage(`${playerName} called UNO!`, 'game-event'));
    });

    socket.on('uno_challenge', ({ success, targetId, roomState }) => {
      syncRoomState(roomState);
      const targetPlayer = useGameStore.getState().room?.players.find((player) => player.id === targetId);
      addChatMessage(
        makeSystemMessage(
          success
            ? `${targetPlayer?.name || 'A player'} was penalized for missing UNO`
            : 'UNO challenge failed',
          'game-event'
        )
      );
    });

    socket.on('game_over', ({ roomState }) => {
      syncRoomState(roomState);
      setGameState({ status: 'finished' });
      setShowWinScreen(true);
      soundManager.play('game_win');
    });

    socket.on('chat_message', (message) => {
      addChatMessage(message);
      soundManager.play('chat');
    });

    socket.on('timer_update', ({ timeLeft }) => {
      setGameState({ turnTimer: timeLeft });
      if (timeLeft <= 5) {
        soundManager.play('timer_low');
      }
    });

    socket.on('error', ({ message }) => {
      setError(message);
      soundManager.play('error');
    });

    socket.on('settings_updated', ({ settings, roomState }) => {
      syncRoomState(roomState);
      updateRoom({ settings });
    });

    socket.on('player_ready', ({ roomState }) => {
      syncRoomState(roomState);
    });

    socket.on('color_selected', ({ color }) => {
      setGameState({ currentColor: color });
      setShowColorPicker(false);
    });

    socket.on('player_kicked', ({ playerId, roomState }) => {
      syncRoomState(roomState);
      const localPlayerId = usePlayerStore.getState().localPlayer?.id;
      if (playerId === localPlayerId) {
        disconnectSocket();
        setDisconnected();
      }
    });
  }, [setConnected, setDisconnected, setError, setGameState, setRoom, updateRoom, addChatMessage, setHand, setLocalPlayer, setShowColorPicker, setShowWinScreen]);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;
    setConnecting(true);
    setupEventListeners(socket);

    return () => {
      socket.removeAllListeners();
    };
  }, [setupEventListeners, setConnecting]);

  const emit = useCallback((
    event: string,
    ...args: unknown[]
  ) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      (socket as unknown as { emit: (...a: unknown[]) => void }).emit(event, ...args);
    }
  }, []);

  return {
    socket: socketRef.current,
    emit,
    isConnected: useSocketStore.getState().isConnected,
  };
}
