'use client';

import { useState } from 'react';
import { useRoom } from '@/hooks/useRoom';
import type { RoomSettings } from '@/types/room';
import { Button } from '@/components/ui/Button';

interface RoomSettingsPanelProps {
  settings: RoomSettings;
}

export function RoomSettingsPanel({ settings }: RoomSettingsPanelProps) {
  const { updateSettings } = useRoom();
  const [local, setLocal] = useState<RoomSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings(local);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const field = (
    label: string,
    key: keyof RoomSettings,
    type: 'number' | 'select' | 'toggle',
    options?: { value: string; label: string }[],
    min?: number,
    max?: number
  ) => (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-body text-white/60 flex-1">{label}</label>

      {type === 'number' && (
        <input
          type="number"
          value={local[key] as number}
          min={min}
          max={max}
          onChange={(e) =>
            setLocal((prev: RoomSettings) => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))
          }
          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white text-right font-mono focus:outline-none focus:border-white/30"
        />
      )}

      {type === 'select' && options && (
        <select
          value={local[key] as string}
          onChange={(e) => setLocal((prev: RoomSettings) => ({ ...prev, [key]: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white font-body focus:outline-none focus:border-white/30"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-gray-900">
              {o.label}
            </option>
          ))}
        </select>
      )}

      {type === 'toggle' && (
        <button
          onClick={() => setLocal((prev: RoomSettings) => ({ ...prev, [key]: !prev[key] }))}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            local[key] ? 'bg-emerald-500' : 'bg-white/20'
          }`}
          role="switch"
          aria-checked={local[key] as boolean}
          aria-label={label}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              local[key] ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-body font-semibold text-white/60">Room Settings</h3>

      {field('Max Players', 'maxPlayers', 'number', undefined, 2, 8)}
      {field('Turn Timer (seconds)', 'turnTimer', 'number', undefined, 10, 90)}
      {field('Rounds', 'maxRounds', 'number', undefined, 1, 10)}
      {field('Game Speed', 'gameSpeed', 'select', [
        { value: 'slow', label: 'Slow' },
        { value: 'normal', label: 'Normal' },
        { value: 'fast', label: 'Fast' },
      ])}
      {field('Stack Draw Cards', 'stackDrawCards', 'toggle')}
      {field('Force Play', 'forcePlay', 'toggle')}

      <Button
        variant="primary"
        size="sm"
        fullWidth
        loading={saving}
        onClick={handleSave}
      >
        {saved ? '✓ Saved!' : 'Save Settings'}
      </Button>
    </div>
  );
}
