'use client';

import { LogOut, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useRoom } from '@/hooks/useRoom';
import { useSocketStore } from '@/store/socketStore';
import { soundManager } from '@/utils/soundManager';
import { OpponentsArea } from '@/components/game/OpponentPlayer';
import { GameTable } from '@/components/game/GameTable';
import { PlayerHand } from '@/components/game/PlayerHand';
import { TurnTimer } from '@/components/game/TurnTimer';
import { UnoButton } from '@/components/game/UnoButton';
import { Chat } from '@/components/game/Chat';
import { ColorPickerModal } from '@/components/game/ColorPickerModal';
import { WinScreen } from '@/components/game/WinScreen';
import { Avatar } from '@/components/ui/Avatar';
import { VoiceControls } from '@/components/VoiceControls';

export function GameBoard() {
  const { gameState, localPlayer, otherPlayers } = useGameState();
  const { leaveRoom } = useRoom();
  const { isConnected } = useSocketStore();
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  return (
    <div className="min-h-screen table-felt flex flex-col overflow-hidden relative">
      {/* Noise overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl text-white tracking-wider">UNO</span>
          <div className={`flex items-center gap-1 ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
          </div>
        </div>

        {/* Local player info */}
        {localPlayer && (
          <div className="flex items-center gap-2">
            <Avatar
              playerId={localPlayer.id}
              emoji={localPlayer.avatar}
              name={localPlayer.name}
              size="xs"
              isHost={localPlayer.isHost}
            />
            <span className="text-white/70 text-sm font-body hidden sm:block">
              {localPlayer.name}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 hover:text-white transition-all"
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          <VoiceControls />

          <div className="relative">
            <Chat />
          </div>

          <button
            onClick={leaveRoom}
            className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all"
            aria-label="Leave game"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Game layout */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Opponents area - top */}
        <div className="p-4">
          <OpponentsArea
            players={otherPlayers}
            currentPlayerId={gameState.currentPlayerId}
          />
        </div>

        {/* Center game table */}
        <div className="flex-1 flex items-center justify-center px-4 min-h-0">
          <GameTable />
        </div>

        {/* Bottom section - player area */}
        <div className="pb-2">
          {/* Timer */}
          <div className="px-6 mb-2">
            <TurnTimer />
          </div>

          {/* UNO button */}
          <div className="flex justify-center mb-2">
            <UnoButton />
          </div>

          {/* Player hand */}
          <PlayerHand />
        </div>
      </div>

      {/* Modals */}
      <ColorPickerModal />
      <WinScreen />
    </div>
  );
}
