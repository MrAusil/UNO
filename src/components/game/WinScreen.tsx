'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { useGameStore } from '@/store/gameStore';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { winScreenVariants, backdropVariants } from '@/utils/animationUtils';

export function WinScreen() {
  const { gameState, localPlayer } = useGameState();
  const { showWinScreen, resetGame } = useGameStore();
  const { leaveRoom, startGame } = useRoom();
  const router = useRouter();

  const winner = gameState.winner;
  const isWinner = winner?.id === localPlayer?.id;
  const isHost = localPlayer?.isHost;

  useEffect(() => {
    if (showWinScreen && isWinner) {
      const duration = 5000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E63946', '#E9C46A', '#2A9D8F', '#457B9D'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E63946', '#E9C46A', '#2A9D8F', '#457B9D'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [showWinScreen, isWinner]);

  if (!showWinScreen || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        variants={winScreenVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 bg-gradient-to-b from-uno-card to-uno-surface border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
      >
        {/* Trophy icon */}
        <motion.div
          animate={{ rotate: [-5, 5, -5], y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          {isWinner ? '🏆' : '🎴'}
        </motion.div>

        {/* Winner announcement */}
        <h1 className="font-display text-4xl text-white mb-1">
          {isWinner ? 'You Won!' : `${winner.name} Wins!`}
        </h1>
        <p className="text-white/50 text-sm font-body mb-6">
          {isWinner
            ? 'Congratulations! 🎉'
            : 'Better luck next time!'}
        </p>

        {/* Winner avatar */}
        <div className="flex justify-center mb-6">
          <Avatar
            emoji={winner.avatar}
            name={winner.name}
            size="xl"
            isActive={false}
          />
        </div>

        {/* Scores */}
        {gameState.players.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <h3 className="text-white/50 text-xs font-body uppercase tracking-wider mb-3">
              Final Scores
            </h3>
            <div className="space-y-2">
              {[...gameState.players]
                .sort((a, b) => b.score - a.score)
                .map((player, i) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 text-sm font-body"
                  >
                    <span className="text-white/40 w-5 text-right font-mono">
                      {i + 1}.
                    </span>
                    <span className="text-base">{player.avatar}</span>
                    <span
                      className={
                        player.id === winner.id
                          ? 'text-uno-yellow font-semibold flex-1 text-left'
                          : 'text-white/70 flex-1 text-left'
                      }
                    >
                      {player.name}
                    </span>
                    <span className="text-white/50 font-mono">{player.score}pts</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<Home size={16} />}
            onClick={leaveRoom}
            fullWidth
          >
            Leave
          </Button>
          {isHost && (
            <Button
              variant="primary"
              size="md"
              icon={<RotateCcw size={16} />}
              onClick={async () => {
                resetGame();
                await startGame();
              }}
              fullWidth
            >
              Play Again
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
