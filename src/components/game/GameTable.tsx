'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { useGameState } from '@/hooks/useGameState';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { getColorHex } from '@/utils/cardUtils';
import { Card } from '@/components/cards/Card';
import { CardBack } from '@/components/cards/CardBack';

export function GameTable() {
  const { gameState, isMyTurn, topCard } = useGameState();
  const { addCards } = usePlayerStore();

  const handleDrawCard = () => {
    if (!isMyTurn) return;

    const socket = getSocket();
    socket.emit('draw_card', undefined, (response: { success: boolean; cards?: import('@/types/game').Card[] }) => {
      if (response.success && response.cards) {
        addCards(response.cards);
      }
    });
  };

  const currentColorHex = gameState.currentColor
    ? getColorHex(gameState.currentColor)
    : '#ffffff';

  const colorLabel: Record<string, string> = {
    red: 'Red', blue: 'Blue', green: 'Green', yellow: 'Yellow', wild: 'Wild',
  };

  return (
    <div className="flex flex-col items-center gap-6 flex-1 justify-center">
      {/* Direction indicator */}
      <motion.div
        className="text-white/40 text-sm font-mono flex items-center gap-2"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {gameState.direction === 'clockwise' ? (
          <>↻ Clockwise</>
        ) : (
          <>↺ Counter-clockwise</>
        )}
      </motion.div>

      {/* Current color indicator */}
      <AnimatePresence mode="wait">
        {gameState.currentColor && (
          <motion.div
            key={gameState.currentColor}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              className="w-6 h-6 rounded-full border-2 border-white/30"
              style={{ backgroundColor: currentColorHex }}
              animate={{
                boxShadow: [
                  `0 0 8px ${currentColorHex}60`,
                  `0 0 20px ${currentColorHex}80`,
                  `0 0 8px ${currentColorHex}60`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-white/60 text-xs font-mono uppercase tracking-wider">
              {colorLabel[gameState.currentColor]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deck and discard pile */}
      <div className="flex items-center gap-12">
        {/* Draw pile */}
        <div className="flex flex-col items-center gap-2">
          <CardBack
            size="lg"
            animate={true}
            count={gameState.deckCount}
            onClick={isMyTurn ? handleDrawCard : undefined}
            label={`Draw pile (${gameState.deckCount} cards)`}
          />
          {isMyTurn && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/50 font-body text-center"
            >
              Click to draw
            </motion.p>
          )}
        </div>

        {/* VS divider */}
        <div className="text-white/20 font-display text-2xl">⟶</div>

        {/* Discard pile */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative"
            style={{
              filter: gameState.currentColor
                ? `drop-shadow(0 0 15px ${currentColorHex}50)`
                : undefined,
            }}
          >
            <AnimatePresence mode="popLayout">
              {topCard ? (
                <motion.div
                  key={topCard.id}
                  initial={{ scale: 0, rotate: -20, y: -30 }}
                  animate={{ scale: 1, rotate: Math.random() * 10 - 5, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Card
                    card={topCard}
                    size="lg"
                    animate={false}
                    isPlayable={false}
                  />
                </motion.div>
              ) : (
                <div className="w-28 h-40 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-white/20 text-sm font-body">Empty</span>
                </div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-xs text-white/40 font-body">Discard pile</p>
        </div>
      </div>
    </div>
  );
}
