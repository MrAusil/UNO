'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useSocketStore } from '@/store/socketStore';
import { connectSocket, getSocket } from '@/lib/socket';
import { normalizeRoomState } from '@/lib/normalizers';
import { useSocket } from '@/hooks/useSocket';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { Lobby } from '@/components/lobby/Lobby';
import { GameBoard } from '@/components/game/GameBoard';
import { ConnectionError } from '@/components/ui/ConnectionError';
import { AVATARS } from '@/types/player';

type PageState = 'loading' | 'lobby' | 'game' | 'error';

export default function RoomPage() {
  const params = useParams<{ roomCode: string }>();
  const router = useRouter();
  const roomCode = params.roomCode?.toUpperCase();

  // Initialize socket
  useSocket();

  // Initialize WebRTC voice chat
  useVoiceChat();

  const { room, gameState } = useGameStore();
  const { localPlayer } = usePlayerStore();
  const { isConnected, error: socketError } = useSocketStore();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Auto-join room if we have a room code but no room yet
  useEffect(() => {
    if (!isConnected) return;
    if (room?.code === roomCode) {
      setPageState(gameState.status === 'playing' ? 'game' : 'lobby');
      return;
    }

    // If not in room, try auto-join with stored player info
    if (roomCode && !room) {
      const storedName = localStorage.getItem('uno_player_name') || 'Player';
      const storedAvatar = localStorage.getItem('uno_player_avatar') || AVATARS[0];

      const socket = getSocket();
      socket.emit(
        'join_room',
        { roomCode, playerName: storedName, avatar: storedAvatar },
        (response) => {
          if (response.success && response.room) {
            const normalized = normalizeRoomState(response.room as never);
            const localPlayer = normalized.players.find((player) => player.id === response.playerId);
            useGameStore.getState().setRoom(normalized.room);
            useGameStore.getState().setGameState(normalized.gameState);
            if (localPlayer) {
              usePlayerStore.getState().setLocalPlayer(localPlayer);
              usePlayerStore.getState().setHand(localPlayer.hand || []);
            }
            setPageState('lobby');
          } else {
            setJoinError(response.error || 'Could not join this room');
            setPageState('error');
          }
        }
      );
    }
  }, [isConnected, roomCode, room, gameState.status]);

  // Update page state when game status changes
  useEffect(() => {
    if (!room) return;
    if (gameState.status === 'playing') {
      setPageState('game');
    } else if (gameState.status === 'waiting') {
      setPageState('lobby');
    }
  }, [gameState.status, room]);

  // Handle socket connection established with existing room
  useEffect(() => {
    if (room) {
      setPageState(gameState.status === 'playing' ? 'game' : 'lobby');
    }
  }, [room, gameState.status]);

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-uno-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
          />
          <p className="text-white/40 text-sm font-body">
            {isConnected ? 'Joining room…' : 'Connecting to server…'}
          </p>
        </div>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-uno-dark flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🎴</div>
          <h2 className="font-display text-2xl text-white mb-2">Room Not Found</h2>
          <p className="text-white/40 text-sm font-body mb-6">
            {joinError || `Room "${roomCode}" doesn't exist or is full.`}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-uno-red text-white rounded-xl font-body font-semibold hover:bg-red-500 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (socketError && !isConnected) {
    return <ConnectionError message={socketError} />;
  }

  if (pageState === 'game') {
    return <GameBoard />;
  }

  return <Lobby />;
}
