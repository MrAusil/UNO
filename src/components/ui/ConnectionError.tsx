'use client';

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { connectSocket } from '@/lib/socket';

interface ConnectionErrorProps {
  message?: string;
}

export function ConnectionError({ message }: ConnectionErrorProps) {
  const handleRetry = () => {
    connectSocket();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-uno-dark gap-6 p-4">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-white/30"
      >
        <WifiOff size={48} />
      </motion.div>

      <div className="text-center">
        <h2 className="font-display text-2xl text-white mb-2">Connection Lost</h2>
        <p className="text-white/40 text-sm font-body max-w-xs">
          {message || "Can't reach the game server. Check your connection and try again."}
        </p>
      </div>

      <Button
        variant="primary"
        size="md"
        icon={<RefreshCw size={16} />}
        onClick={handleRetry}
      >
        Retry Connection
      </Button>
    </div>
  );
}
