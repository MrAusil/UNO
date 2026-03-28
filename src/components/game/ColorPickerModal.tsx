'use client';

import { motion } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { Modal } from '@/components/ui/Modal';
import type { CardColor } from '@/types/game';
import { COLORS, COLOR_HEX, COLOR_LABEL } from '@/lib/constants';

export function ColorPickerModal() {
  const { showColorPicker, pendingWildCardId, setShowColorPicker } = useGameStore();
  const { removeCard } = usePlayerStore();

  const handleColorSelect = (color: CardColor) => {
    const socket = getSocket();

    if (pendingWildCardId) {
      socket.emit(
        'play_card',
        { cardId: pendingWildCardId, chosenColor: color },
        (response) => {
          if (response.success) {
            removeCard(pendingWildCardId);
          }
        }
      );
    } else {
      socket.emit('choose_color', { color });
    }

    setShowColorPicker(false);
  };

  return (
    <Modal
      isOpen={showColorPicker}
      title="Choose a Color"
      closable={false}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-white/60 text-sm font-body text-center">
          Select the color to continue playing
        </p>

        <div className="grid grid-cols-2 gap-3">
          {COLORS.map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorSelect(color)}
              className="h-20 rounded-xl font-display text-white text-xl uppercase tracking-wider transition-all border-2 border-white/20 hover:border-white/40 color-option"
              style={{
                backgroundColor: COLOR_HEX[color],
                boxShadow: `0 4px 20px ${COLOR_HEX[color]}40`,
              }}
              aria-label={`Choose ${COLOR_LABEL[color]}`}
            >
              {COLOR_LABEL[color]}
            </motion.button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
