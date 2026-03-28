'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, Wifi, WifiOff, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { connectSocket } from '@/lib/socket';
import { useSocketStore } from '@/store/socketStore';
import { usePlayerStore } from '@/store/playerStore';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FloatingCards } from '@/components/animations/FloatingCards';
import { AVATARS } from '@/types/player';
import { modalVariants, staggerContainerVariants, playerJoinVariants } from '@/utils/animationUtils';
import { useSocket } from '@/hooks/useSocket';

type Mode = null | 'create' | 'join';

export default function HomePage() {
  // Initialize socket connection
  useSocket();

  const { isConnected, isConnecting, error: socketError } = useSocketStore();
  const { localPlayer } = usePlayerStore();
  const { createRoom, joinRoom } = useRoom();

  const [mode, setMode] = useState<Mode>(null);
  const [playerName, setPlayerName] = useState(localPlayer?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(localPlayer?.avatar || AVATARS[0]);
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure socket is connected
  useEffect(() => {
    connectSocket();
  }, []);

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createRoom(playerName.trim(), selectedAvatar);
    if (!result.success) {
      setError(result.error || 'Failed to create room');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim() || roomCode.trim().length < 4) {
      setError('Please enter a valid room code');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await joinRoom(roomCode.trim().toUpperCase(), playerName.trim(), selectedAvatar);
    if (!result.success) {
      setError(result.error || 'Failed to join room');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-uno-dark relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-radial from-red-900/10 via-transparent to-transparent" />
      <FloatingCards />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-300 text-xs font-mono tracking-wider uppercase">
              Multiplayer
            </span>
          </div>

          <h1
            className="font-display text-white mb-3"
            style={{ fontSize: 'clamp(3rem, 10vw, 5.5rem)', lineHeight: 0.9, letterSpacing: '0.02em' }}
          >
            UNO
          </h1>

          <p className="text-white/50 font-body text-lg">
            Play UNO online with friends
          </p>

          {/* Connection status */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {isConnected ? (
              <span className="flex items-center gap-1 text-emerald-400/70 text-xs font-mono">
                <Wifi size={10} /> Server connected
              </span>
            ) : isConnecting ? (
              <span className="flex items-center gap-1 text-yellow-400/70 text-xs font-mono">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  ◌
                </motion.div> Connecting…
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400/70 text-xs font-mono">
                <WifiOff size={10} /> Offline — check server
              </span>
            )}
          </div>
        </motion.div>

        {/* Mode selection / form */}
        <AnimatePresence mode="wait">
          {mode === null ? (
            <motion.div
              key="mode-select"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-4"
            >
              <Button
                variant="primary"
                size="xl"
                fullWidth
                icon={<Play size={20} />}
                onClick={() => setMode('create')}
              >
                Create Room
              </Button>
              <Button
                variant="outline"
                size="xl"
                fullWidth
                icon={<Users size={20} />}
                onClick={() => setMode('join')}
              >
                Join Room
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-5"
            >
              {/* Back button */}
              <button
                onClick={() => { setMode(null); setError(null); }}
                className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm font-body transition-colors w-fit"
              >
                ← Back
              </button>

              <h2 className="font-display text-2xl text-white">
                {mode === 'create' ? 'Create a Room' : 'Join a Room'}
              </h2>

              {/* Avatar picker */}
              <div>
                <p className="text-sm font-body text-white/50 mb-2">Choose your avatar</p>
                <div className="grid grid-cols-8 gap-1.5">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`text-xl p-1 rounded-lg transition-all ${
                        selectedAvatar === emoji
                          ? 'bg-white/20 scale-110 ring-2 ring-white/40'
                          : 'hover:bg-white/10'
                      }`}
                      aria-label={`Select avatar ${emoji}`}
                      aria-pressed={selectedAvatar === emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <Input
                label="Your Name"
                placeholder="Enter your name…"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    mode === 'create' ? handleCreate() : (roomCode ? handleJoin() : undefined);
                  }
                }}
              />

              {/* Room code (join only) */}
              {mode === 'join' && (
                <Input
                  label="Room Code"
                  placeholder="Enter 6-letter code…"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="uppercase tracking-widest"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                />
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm font-body bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<ChevronRight size={18} />}
                onClick={mode === 'create' ? handleCreate : handleJoin}
                disabled={!isConnected}
              >
                {mode === 'create' ? 'Create Room' : 'Join Room'}
              </Button>

              {!isConnected && (
                <p className="text-center text-xs text-white/30 font-body">
                  Waiting for server connection…
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/20 text-xs font-body mt-8"
        >
          2–8 players · Real-time multiplayer · No account needed
        </motion.p>
      </div>
    </main>
  );
}
