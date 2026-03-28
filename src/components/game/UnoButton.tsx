'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { useGameState } from '@/hooks/useGameState';
import { soundManager } from '@/utils/soundManager';

export function UnoButton() {
  const { shouldShowUno, gameState, localPlayer } = useGameState();
  const [hasCalled, setHasCalled] = useState(false);

  const handleCallUno = () => {
    if (hasCalled) return;
    setHasCalled(true);
    const socket = getSocket();
    socket.emit('call_uno');
    soundManager.play('uno_call');
    setTimeout(() => setHasCalled(false), 5000);
  };

  // Show challenge button for other players with 1 card who haven't called UNO
  const challengeable = gameState.players.find(
    (p) =>
      p.id !== localPlayer?.id &&
      p.cardCount === 1 &&
      !p.hasCalledUno
  );

  return (
    <AnimatePresence>
      {(shouldShowUno || challengeable) && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="flex flex-col gap-2 items-center"
        >
          {shouldShowUno && !hasCalled && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCallUno}
              className="uno-btn px-8 py-3 rounded-full bg-uno-red text-white font-display text-2xl tracking-widest uppercase border-4 border-red-300/30"
              aria-label="Call UNO!"
            >
              UNO!
            </motion.button>
          )}

          {shouldShowUno && hasCalled && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-red-400 font-display text-xl tracking-wider"
            >
              UNO called! 🎴
            </motion.div>
          )}

          {challengeable && !shouldShowUno && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const socket = getSocket();
                socket.emit('challenge_uno', { targetPlayerId: challengeable.id });
              }}
              className="px-5 py-2 rounded-full bg-orange-600 text-white font-display text-lg tracking-wider uppercase border-2 border-orange-400/30 hover:bg-orange-500 transition-colors"
              aria-label={`Challenge ${challengeable.name} for not calling UNO`}
            >
              Challenge! ({challengeable.name} forgot UNO)
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
