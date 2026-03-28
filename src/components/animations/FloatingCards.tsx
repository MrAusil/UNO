'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { floatingCardVariants } from '@/utils/animationUtils';

const FLOATING_CARDS = [
  { color: '#E63946', label: '7', delay: 0, x: 5, y: 15, rotate: -15, size: 1 },
  { color: '#457B9D', label: '+2', delay: 1, x: 85, y: 25, rotate: 12, size: 0.85 },
  { color: '#2A9D8F', label: '↺', delay: 2, x: 15, y: 65, rotate: 25, size: 0.7 },
  { color: '#E9C46A', label: '⊘', delay: 0.5, x: 75, y: 70, rotate: -8, size: 0.9 },
  { color: '#6a0dad', label: 'W', delay: 1.5, x: 45, y: 80, rotate: 18, size: 0.75 },
  { color: '#E63946', label: '3', delay: 3, x: 90, y: 50, rotate: -20, size: 0.65 },
  { color: '#2A9D8F', label: '9', delay: 0.8, x: 8, y: 40, rotate: 10, size: 0.8 },
  { color: '#E9C46A', label: '+4', delay: 2.5, x: 55, y: 10, rotate: -5, size: 0.7 },
];

export function FloatingCards() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {FLOATING_CARDS.map((card, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            transform: `rotate(${card.rotate}deg) scale(${card.size})`,
          }}
          variants={floatingCardVariants(card.delay, 15 + i * 2)}
          animate="animate"
        >
          <div
            className="w-20 h-28 rounded-xl border border-white/10 flex items-center justify-center shadow-2xl opacity-20"
            style={{
              background: `linear-gradient(135deg, ${card.color}, ${card.color}99)`,
            }}
          >
            <div className="font-display text-white text-2xl drop-shadow">{card.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
