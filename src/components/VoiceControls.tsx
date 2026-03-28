'use client';

import { useVoiceStore } from '@/store/voiceStore';
import { Mic, MicOff, VolumeX } from 'lucide-react';

export function VoiceControls() {
  const { isMicEnabled, micPermissionDenied, toggleMicAction } = useVoiceStore();

  return (
    <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-full border border-slate-700/50 backdrop-blur-md shadow-lg transition-all hover:bg-slate-800/80">
      <button
        onClick={toggleMicAction || undefined}
        title={micPermissionDenied ? 'Microphone permission denied' : (isMicEnabled ? 'Mute Microphone' : 'Unmute Microphone')}
        className={`p-3 rounded-full flex items-center justify-center transition-all ${
          micPermissionDenied 
            ? 'bg-red-900/50 text-red-500 cursor-not-allowed' 
            : isMicEnabled
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
        }`}
      >
        {micPermissionDenied ? <VolumeX size={20} /> : isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </button>
      
      {micPermissionDenied && (
        <span className="text-xs text-red-400 pr-3 font-medium">Mic Denied</span>
      )}
      {!micPermissionDenied && (
         <span className={`text-xs pr-3 font-medium transition-colors ${isMicEnabled ? 'text-green-400' : 'text-slate-400'}`}>
           {isMicEnabled ? 'Voice Active' : 'Voice Muted'}
         </span>
      )}
    </div>
  );
}
