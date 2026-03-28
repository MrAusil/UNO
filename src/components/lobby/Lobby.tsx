'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, Users, Settings, Crown, LogOut,
  Play, Shield, Wifi, WifiOff,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useSocketStore } from '@/store/socketStore';
import { useRoom } from '@/hooks/useRoom';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Chat } from '@/components/game/Chat';
import { RoomSettingsPanel } from './RoomSettingsPanel';
import { playerJoinVariants } from '@/utils/animationUtils';
import { VoiceControls } from '@/components/VoiceControls';

export function Lobby() {
  const { room } = useGameStore();
  const { localPlayer } = usePlayerStore();
  const { isConnected } = useSocketStore();
  const { startGame, leaveRoom, kickPlayer, copyInviteLink, setReady } = useRoom();
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  if (!room) return null;

  const isHost = localPlayer?.isHost;
  const readyCount = room.players.filter((p) => p.isReady).length;
  const canStart = room.players.length >= 2 && readyCount === room.players.length;
  const localPlayerReady = room.players.find((p) => p.id === localPlayer?.id)?.isReady;

  const handleCopy = () => {
    copyInviteLink(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    setStartLoading(true);
    setStartError(null);
    const result = await startGame();
    if (!result.success) {
      setStartError(result.error || 'Failed to start game');
    }
    setStartLoading(false);
  };

  return (
    <div className="min-h-screen bg-uno-dark flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl text-white tracking-wider">UNO</h1>
          <div className={`flex items-center gap-1.5 ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span className="text-xs font-mono">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Room code */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <span className="text-white/40 text-xs font-body">Room</span>
            <span className="font-mono font-bold text-white tracking-widest">{room.code}</span>
            <button
              onClick={handleCopy}
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Copy room code"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          <VoiceControls />

          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut size={14} />}
            onClick={leaveRoom}
          >
            Leave
          </Button>
        </div>
      </header>

      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Main lobby area */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Players section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-white/50" />
                <h2 className="font-body font-semibold text-white/70 text-sm">
                  Players ({room.players.length}/{room.settings.maxPlayers})
                </h2>
              </div>
              <Badge variant={canStart ? 'success' : 'warning'}>
                {readyCount}/{room.players.length} ready
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {room.players.map((player) => (
                  <motion.div
                    key={player.id}
                    variants={playerJoinVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <Avatar
                      playerId={player.id}
                      emoji={player.avatar}
                      name={player.name}
                      size="md"
                      isHost={player.isHost}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-body font-semibold text-white truncate text-sm">
                          {player.name}
                        </span>
                        {player.id === localPlayer?.id && (
                          <Badge variant="info" size="sm">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {player.isHost && (
                          <span className="text-[10px] text-yellow-400 font-body flex items-center gap-0.5">
                            <Crown size={10} /> Host
                          </span>
                        )}
                        {!player.isConnected && (
                          <Badge variant="danger" size="sm">Disconnected</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${player.isReady ? 'bg-emerald-400' : 'bg-white/20'}`}
                        title={player.isReady ? 'Ready' : 'Not ready'}
                      />

                      {isHost && player.id !== localPlayer?.id && (
                        <button
                          onClick={() => kickPlayer(player.id)}
                          className="text-white/20 hover:text-red-400 transition-colors p-1 rounded"
                          aria-label={`Kick ${player.name}`}
                          title="Kick player"
                        >
                          <Shield size={12} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, room.settings.maxPlayers - room.players.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 text-white/20"
                >
                  <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                    <span className="text-xl">+</span>
                  </div>
                  <span className="text-sm font-body">Waiting for player…</span>
                </div>
              ))}
            </div>
          </div>

          {/* Invite section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/50 text-xs font-body mb-2">Invite link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-xs font-mono text-white/40 truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/room/${room.code}` : `.../${room.code}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={copied ? <Check size={14} /> : <Copy size={14} />}
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Settings toggle */}
          {isHost && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-body transition-colors"
            >
              <Settings size={14} />
              {showSettings ? 'Hide settings' : 'Show room settings'}
            </button>
          )}

          <AnimatePresence>
            {showSettings && isHost && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <RoomSettingsPanel settings={room.settings} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {startError && (
            <p className="text-red-400 text-sm font-body text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {startError}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!isHost && (
              <Button
                variant={localPlayerReady ? 'secondary' : 'primary'}
                size="lg"
                fullWidth
                onClick={() => setReady(!localPlayerReady)}
              >
                {localPlayerReady ? '✓ Ready!' : 'Ready Up'}
              </Button>
            )}

            {isHost && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<Play size={18} />}
                onClick={handleStart}
                loading={startLoading}
                disabled={!canStart}
              >
                {canStart ? 'Start Game' : `Waiting for players (${readyCount}/${room.players.length} ready)`}
              </Button>
            )}
          </div>
        </div>

        {/* Chat sidebar */}
        <div className="w-72 border-l border-white/10 flex flex-col hidden md:flex">
          <div className="p-3 border-b border-white/10">
            <h3 className="text-sm font-body font-semibold text-white/50">Room Chat</h3>
          </div>
          <div className="flex-1 min-h-0">
            <Chat compact />
          </div>
        </div>
      </div>
    </div>
  );
}
