'use client';

import { useVoiceStore } from '@/store/voiceStore';

export function VoiceIndicator({ playerId }: { playerId: string }) {
  const { speakingPlayers } = useVoiceStore();
  const isSpeaking = speakingPlayers[playerId];

  if (!isSpeaking) return null;

  return (
    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 animate-pulse border-2 border-slate-900 shadow-[0_0_10px_rgba(34,197,94,0.7)]">
      <div className="w-2 h-2 rounded-full bg-white" />
    </div>
  );
}
