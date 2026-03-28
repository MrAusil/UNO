'use client';

import { clsx } from 'clsx';
import { VoiceIndicator } from '@/components/VoiceIndicator';

interface AvatarProps {
  playerId?: string;
  emoji: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isActive?: boolean;
  isHost?: boolean;
  cardCount?: number;
  className?: string;
}

const sizeConfig = {
  xs: { outer: 'w-7 h-7', emoji: 'text-sm', badge: 'text-[9px] -top-1 -right-1 w-4 h-4' },
  sm: { outer: 'w-9 h-9', emoji: 'text-base', badge: 'text-[9px] -top-1 -right-1 w-4 h-4' },
  md: { outer: 'w-12 h-12', emoji: 'text-2xl', badge: 'text-xs -top-1.5 -right-1.5 w-5 h-5' },
  lg: { outer: 'w-16 h-16', emoji: 'text-3xl', badge: 'text-sm -top-2 -right-2 w-6 h-6' },
  xl: { outer: 'w-20 h-20', emoji: 'text-4xl', badge: 'text-sm -top-2 -right-2 w-7 h-7' },
};

export function Avatar({
  emoji,
  name,
  size = 'md',
  isActive = false,
  isHost = false,
  cardCount,
  className,
  playerId,
}: AvatarProps) {
  const config = sizeConfig[size];

  return (
    <div className={clsx('relative inline-flex flex-col items-center gap-1', className)}>
      <div
        className={clsx(
          config.outer,
          'rounded-full flex items-center justify-center',
          'bg-white/10 border-2 transition-all duration-300',
          isActive
            ? 'border-uno-yellow shadow-[0_0_0_3px_rgba(233,196,106,0.3)] player-active'
            : 'border-white/20',
        )}
        role="img"
        aria-label={`${name}'s avatar: ${emoji}`}
      >
        <span className={config.emoji}>{emoji}</span>
      </div>

      {playerId && <VoiceIndicator playerId={playerId} />}

      {/* Host crown */}
      {isHost && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm">
          👑
        </div>
      )}

      {/* Card count badge */}
      {cardCount !== undefined && (
        <div
          className={clsx(
            'absolute',
            config.badge,
            'rounded-full bg-uno-red text-white font-mono font-bold',
            'flex items-center justify-center border border-black/30',
          )}
        >
          {cardCount}
        </div>
      )}
    </div>
  );
}
