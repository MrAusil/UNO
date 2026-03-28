'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { normalizeRoomState } from '@/lib/normalizers';
import { PLAYER_AVATAR_KEY, PLAYER_NAME_KEY } from '@/lib/constants';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useSocketStore } from '@/store/socketStore';
import type { RoomSettings } from '@/types/room';

export function useRoom() {
  const router = useRouter();
  const { setRoom, setGameState, clearRoom } = useGameStore();
  const { setLocalPlayer, setHand, clearHand } = usePlayerStore();
  const { isConnected } = useSocketStore();

  const createRoom = useCallback(
    async (playerName: string, avatar: string, settings?: Partial<RoomSettings>) => {
      const socket = getSocket();
      return new Promise<{ success: boolean; code?: string; error?: string }>((resolve) => {
        socket.emit('create_room', { playerName, avatar, settings }, (response) => {
          if (response.success && response.room) {
            const normalized = normalizeRoomState(response.room as never);
            const localPlayer = normalized.players.find((player) => player.id === response.playerId);

            setRoom(normalized.room);
            setGameState(normalized.gameState);
            setHand(localPlayer?.hand || []);
            if (localPlayer) {
              setLocalPlayer(localPlayer);
            }

            localStorage.setItem(PLAYER_NAME_KEY, playerName);
            localStorage.setItem(PLAYER_AVATAR_KEY, avatar);

            router.push(`/room/${normalized.room.code}`);
            resolve({ success: true, code: normalized.room.code });
            return;
          }

          resolve({ success: false, error: response.error });
        });
      });
    },
    [router, setGameState, setHand, setLocalPlayer, setRoom]
  );

  const joinRoom = useCallback(
    async (roomCode: string, playerName: string, avatar: string) => {
      const socket = getSocket();
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        socket.emit('join_room', { roomCode, playerName, avatar }, (response) => {
          if (response.success && response.room) {
            const normalized = normalizeRoomState(response.room as never);
            const localPlayer = normalized.players.find((player) => player.id === response.playerId);

            setRoom(normalized.room);
            setGameState(normalized.gameState);
            setHand(localPlayer?.hand || []);
            if (localPlayer) {
              setLocalPlayer(localPlayer);
            }

            localStorage.setItem(PLAYER_NAME_KEY, playerName);
            localStorage.setItem(PLAYER_AVATAR_KEY, avatar);

            router.push(`/room/${roomCode}`);
            resolve({ success: true });
            return;
          }

          resolve({ success: false, error: response.error });
        });
      });
    },
    [router, setGameState, setHand, setLocalPlayer, setRoom]
  );

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    const roomCode = useGameStore.getState().room?.code;
    socket.emit('leave_room', roomCode ? { roomCode } : undefined);
    clearRoom();
    clearHand();
    router.push('/');
  }, [router, clearRoom, clearHand]);

  const startGame = useCallback(async () => {
    const socket = getSocket();
    const roomCode = useGameStore.getState().room?.code;
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit('start_game', roomCode ? { roomCode } : undefined, (response) => {
        resolve(response);
      });
    });
  }, []);

  const updateSettings = useCallback(async (settings: Partial<RoomSettings>) => {
    const socket = getSocket();
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit('update_settings', settings, (response) => {
        resolve(response);
      });
    });
  }, []);

  const kickPlayer = useCallback(async (playerId: string) => {
    const socket = getSocket();
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit('kick_player', { playerId }, (response) => {
        resolve(response);
      });
    });
  }, []);

  const setReady = useCallback((isReady: boolean) => {
    const socket = getSocket();
    socket.emit('set_ready', { isReady });
  }, []);

  const copyInviteLink = useCallback((roomCode: string) => {
    const link = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(link).catch(() => {
      const el = document.createElement('textarea');
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
  }, []);

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    updateSettings,
    kickPlayer,
    setReady,
    copyInviteLink,
    isConnected,
  };
}
