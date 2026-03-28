'use client';

import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardBackProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animate?: boolean;
  style?: React.CSSProperties;
  count?: number;
  onClick?: () => void;
  label?: string;
}

const sizeConfig = {
  xs: 'w-10 h-14',
  sm: 'w-14 h-20',
  md: 'w-20 h-28',
  lg: 'w-28 h-40',
};

const textSizeConfig = {
  xs: 'text-xs',
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function CardBack({
  size = 'md',
  animate = false,
  style,
  count,
  onClick,
  label = 'Draw pile',
}: CardBackProps) {
  const card = (
    <div
      className={clsx(
        sizeConfig[size],
        'relative rounded-xl overflow-hidden cursor-pointer',
        'card-back-pattern border border-white/10',
        onClick && 'hover:scale-105 transition-transform'
      )}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={label}
      tabIndex={onClick ? 0 : -1}
      style={{
        boxShadow: 'var(--card-shadow)',
        ...style,
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      {/* Inner border */}
      <div className="absolute inset-0.5 rounded-[10px] border border-white/10 pointer-events-none" />

      {/* Center UNO logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={clsx(
            textSizeConfig[size],
            'font-display text-white font-bold',
            'bg-red-600 rounded-full flex items-center justify-center rotate-[-20deg]',
            size === 'xs' ? 'w-6 h-8' : size === 'sm' ? 'w-9 h-12' : size === 'md' ? 'w-12 h-16' : 'w-16 h-20'
          )}
        >
          UNO
        </div>
      </div>

      {/* Count badge */}
      {count !== undefined && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-uno-red text-white text-xs font-mono font-bold flex items-center justify-center border-2 border-black/30 z-10">
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  );

  if (!animate) return card;

  return (
    <motion.div
      animate={{
        y: [0, -3, 0],
        rotate: [0, 1, 0, -1, 0],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {card}
    </motion.div>
  );
}
