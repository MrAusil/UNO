'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { useGameState } from '@/hooks/useGameState';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { isWildCard, sortHand } from '@/utils/cardUtils';
import { Card } from '@/components/cards/Card';
import type { Card as CardType } from '@/types/game';

export function PlayerHand() {
  const { hand, isMyTurn, playableCardIds, gameState } = useGameState();
  const { setShowColorPicker } = useGameStore();
  const { removeCard } = usePlayerStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);

  const sortedHand = sortHand(hand);

  const handleCardClick = useCallback(
    async (card: CardType) => {
      if (!isMyTurn || !playableCardIds.includes(card.id)) return;
      if (playingCardId) return; // Already playing

      if (isWildCard(card)) {
        setSelectedCardId(card.id);
        setShowColorPicker(true, card.id);
        return;
      }

      setPlayingCardId(card.id);

      const socket = getSocket();
      socket.emit('play_card', { cardId: card.id }, (response) => {
        if (response.success) {
          removeCard(card.id);
        }
        setPlayingCardId(null);
      });
    },
    [isMyTurn, playableCardIds, playingCardId, setShowColorPicker, removeCard]
  );

  if (hand.length === 0 && gameState.status === 'playing') return null;

  return (
    <div
      className="w-full flex flex-col items-center gap-3 py-4"
      aria-label="Your hand"
    >
      {/* Turn indicator */}
      {isMyTurn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-uno-yellow text-sm font-display tracking-widest uppercase"
        >
          ✦ Your Turn ✦
        </motion.div>
      )}

      {/* Cards */}
      <div
        className="flex items-end justify-center gap-1 overflow-x-auto pb-2 max-w-full px-4 player-hand-mobile"
        role="list"
        aria-label={`Your ${hand.length} card${hand.length !== 1 ? 's' : ''}`}
      >
        <AnimatePresence mode="popLayout">
          {sortedHand.map((card, i) => {
            const isPlayable = isMyTurn && playableCardIds.includes(card.id);
            const isPlaying = playingCardId === card.id;

            return (
              <motion.div
                key={card.id}
                layout
                initial={{ scale: 0, y: 50, rotate: -10 }}
                animate={{
                  scale: isPlaying ? 0 : 1,
                  y: isPlaying ? -60 : 0,
                  rotate: isPlaying ? 0 : 0,
                  opacity: isPlaying ? 0 : 1,
                }}
                exit={{ scale: 0, y: -60, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                  delay: i * 0.03,
                }}
                style={{ zIndex: i }}
                role="listitem"
              >
                <Card
                  card={card}
                  isPlayable={isPlayable}
                  onClick={() => handleCardClick(card)}
                  size="md"
                  animate={false}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Card count */}
      <div className="text-xs text-white/40 font-mono">
        {hand.length} card{hand.length !== 1 ? 's' : ''} in hand
      </div>
    </div>
  );
}
