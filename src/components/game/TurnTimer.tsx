'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useGameState } from '@/hooks/useGameState';

export function TurnTimer() {
  const { gameState, isMyTurn, timerPercent } = useGameState();
  const { turnTimer, maxTurnTime, currentPlayerId, players } = gameState;

  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  const isLow = turnTimer <= 10 && turnTimer > 0;
  const isCritical = turnTimer <= 5 && turnTimer > 0;

  const timerColor = isCritical
    ? '#E63946'
    : isLow
    ? '#E9C46A'
    : '#2A9D8F';

  if (!currentPlayerId || gameState.status !== 'playing') return null;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Player name + timer number */}
      <div className="flex items-center justify-between text-xs font-body">
        <span className="text-white/50">
          {isMyTurn ? 'Your turn' : `${currentPlayer?.name || 'Player'}'s turn`}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={turnTimer}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={clsx(
              'font-mono font-bold tabular-nums',
              isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-white/60'
            )}
          >
            {turnTimer}s
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: timerColor }}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </div>

      {/* Critical pulse */}
      {isCritical && isMyTurn && (
        <motion.p
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-xs text-red-400 font-body text-center"
        >
          ⚠ Time running out!
        </motion.p>
      )}
    </div>
  );
}
