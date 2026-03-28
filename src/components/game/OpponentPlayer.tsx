'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import type { Player } from '@/types/player';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { CardBack } from '@/components/cards/CardBack';

interface OpponentPlayerProps {
  player: Player;
  isCurrentTurn: boolean;
  position?: 'top' | 'left' | 'right';
}

export function OpponentPlayer({
  player,
  isCurrentTurn,
  position = 'top',
}: OpponentPlayerProps) {
  const cardPreviewCount = Math.min(player.cardCount, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={clsx(
        'flex flex-col items-center gap-2 p-3 rounded-2xl',
        'bg-black/30 backdrop-blur-sm border transition-all duration-300',
        isCurrentTurn
          ? 'border-uno-yellow/50 bg-uno-yellow/5 shadow-[0_0_20px_rgba(233,196,106,0.2)]'
          : 'border-white/10',
        !player.isConnected && 'opacity-40'
      )}
    >
      {/* Avatar + name */}
      <Avatar
        playerId={player.id}
        emoji={player.avatar}
        name={player.name}
        size="md"
        isActive={isCurrentTurn}
        isHost={player.isHost}
        cardCount={player.cardCount}
      />

      <div className="text-center">
        <p
          className={clsx(
            'text-xs font-body font-semibold truncate max-w-[80px]',
            isCurrentTurn ? 'text-uno-yellow' : 'text-white/80'
          )}
        >
          {player.name}
        </p>

        {/* Status badges */}
        <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
          {!player.isConnected && (
            <Badge variant="danger" size="sm">Disconnected</Badge>
          )}
          {player.hasCalledUno && player.cardCount === 1 && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Badge variant="warning" size="sm">UNO!</Badge>
            </motion.div>
          )}
          {isCurrentTurn && (
            <Badge variant="info" size="sm">Playing…</Badge>
          )}
        </div>
      </div>

      {/* Mini card preview */}
      {player.cardCount > 0 && (
        <div className="flex items-center -space-x-3">
          {Array.from({ length: Math.min(cardPreviewCount, 5) }).map((_, i) => (
            <div
              key={i}
              className="transition-transform"
              style={{ zIndex: i }}
            >
              <CardBack size="xs" />
            </div>
          ))}
          {player.cardCount > 5 && (
            <div className="w-6 h-8 rounded bg-white/10 border border-white/10 flex items-center justify-center ml-1">
              <span className="text-white/60 text-[9px] font-mono">
                +{player.cardCount - 5}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface OpponentsAreaProps {
  players: Player[];
  currentPlayerId: string | null;
}

export function OpponentsArea({ players, currentPlayerId }: OpponentsAreaProps) {
  return (
    <div className="flex items-start justify-center gap-4 flex-wrap px-4 py-2">
      <AnimatePresence mode="popLayout">
        {players.map((player) => (
          <OpponentPlayer
            key={player.id}
            player={player}
            isCurrentTurn={player.id === currentPlayerId}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
