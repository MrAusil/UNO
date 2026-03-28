'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Card as CardType } from '@/types/game';
import { getCardLabel, getColorHex, getColorGlow } from '@/utils/cardUtils';
import { cardVariants } from '@/utils/animationUtils';

interface CardProps {
  card: CardType;
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animate?: boolean;
  style?: React.CSSProperties;
}

const sizeConfig = {
  xs: { card: 'w-10 h-14', label: 'text-[10px]', corner: 'text-[8px]', padding: 'p-0.5' },
  sm: { card: 'w-14 h-20', label: 'text-sm', corner: 'text-[9px]', padding: 'p-1' },
  md: { card: 'w-20 h-28', label: 'text-xl', corner: 'text-xs', padding: 'p-1.5' },
  lg: { card: 'w-28 h-40', label: 'text-3xl', corner: 'text-sm', padding: 'p-2' },
};

const colorBg: Record<string, string> = {
  red: 'from-red-500 to-red-700',
  blue: 'from-blue-500 to-blue-800',
  green: 'from-emerald-500 to-emerald-800',
  yellow: 'from-yellow-400 to-yellow-600',
  wild: 'from-purple-600 via-blue-600 to-emerald-600',
};

export const Card = memo(function Card({
  card,
  isPlayable = false,
  isSelected = false,
  onClick,
  size = 'md',
  animate = true,
  style,
}: CardProps) {
  const cfg = sizeConfig[size];
  const label = getCardLabel(card);
  const isWild = card.color === 'wild';
  const colorHex = getColorHex(card.color);

  const cardEl = (
    <div
      className={clsx(
        cfg.card,
        'card-base relative rounded-xl overflow-hidden select-none',
        `bg-gradient-to-br ${colorBg[card.color] || colorBg.wild}`,
        isPlayable && 'cursor-pointer card-playable',
        !isPlayable && onClick && 'card-not-playable',
        isSelected && 'ring-2 ring-white ring-offset-1 ring-offset-transparent',
      )}
      onClick={isPlayable ? onClick : undefined}
      role={isPlayable ? 'button' : 'img'}
      aria-label={`${card.color} ${label} card${isPlayable ? ' (playable)' : ''}`}
      tabIndex={isPlayable ? 0 : -1}
      onKeyDown={isPlayable && onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        boxShadow: isPlayable
          ? `var(--card-shadow), ${getColorGlow(card.color)}`
          : 'var(--card-shadow)',
        ...style,
      }}
    >
      {/* Card border inner highlight */}
      <div className="absolute inset-0.5 rounded-[10px] border border-white/20 pointer-events-none" />

      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

      {/* Top-left corner value */}
      <div className={clsx('absolute top-1 left-1.5', cfg.corner, 'font-display text-white/90 leading-none')}>
        <div>{label}</div>
      </div>

      {/* Bottom-right corner value (rotated) */}
      <div
        className={clsx(
          'absolute bottom-1 right-1.5 rotate-180',
          cfg.corner,
          'font-display text-white/90 leading-none'
        )}
      >
        <div>{label}</div>
      </div>

      {/* Center oval */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full flex items-center justify-center rotate-[-30deg]"
          style={{
            width: '70%',
            height: '80%',
            background: isWild
              ? 'conic-gradient(from 0deg, #E63946 0deg, #E9C46A 90deg, #2A9D8F 180deg, #457B9D 270deg, #E63946 360deg)'
              : 'rgba(0,0,0,0.25)',
          }}
        >
          <div
            className={clsx(
              'font-display text-white font-bold drop-shadow-lg',
              size === 'xs' ? 'text-sm' : size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-4xl'
            )}
            style={{ transform: 'rotate(30deg)' }}
          >
            {label}
          </div>
        </div>
      </div>

      {/* Playable indicator */}
      {isPlayable && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 0 0px ${colorHex}40`,
              `0 0 0 3px ${colorHex}60`,
              `0 0 0 0px ${colorHex}40`,
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );

  if (!animate) return cardEl;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      {cardEl}
    </motion.div>
  );
});
