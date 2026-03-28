'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X } from 'lucide-react';
import { clsx } from 'clsx';
import { getSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { chatMessageVariants } from '@/utils/animationUtils';
import type { ChatMessage } from '@/types/game';

const PLAYER_COLORS = [
  'text-red-400', 'text-blue-400', 'text-emerald-400',
  'text-yellow-400', 'text-purple-400', 'text-pink-400',
  'text-orange-400', 'text-teal-400',
];

function getPlayerColor(playerId: string): string {
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length];
}

interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
}

function ChatMessageItem({ message, isOwn }: ChatMessageProps) {
  if (message.type === 'system') {
    return (
      <motion.div
        variants={chatMessageVariants}
        initial="initial"
        animate="animate"
        className="text-center text-xs text-white/40 font-body py-0.5"
      >
        {message.message}
      </motion.div>
    );
  }

  if (message.type === 'game-event') {
    return (
      <motion.div
        variants={chatMessageVariants}
        initial="initial"
        animate="animate"
        className="text-center text-xs text-uno-yellow font-body py-0.5 font-semibold"
      >
        {message.message}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={chatMessageVariants}
      initial="initial"
      animate="animate"
      className={clsx(
        'flex flex-col gap-0.5',
        isOwn ? 'items-end' : 'items-start'
      )}
    >
      {!isOwn && (
        <span className={clsx('text-[10px] font-body font-medium', getPlayerColor(message.playerId))}>
          {message.playerName}
        </span>
      )}
      <div
        className={clsx(
          'px-2.5 py-1.5 rounded-xl text-xs font-body max-w-[85%] break-words',
          isOwn
            ? 'bg-uno-red/80 text-white rounded-tr-sm'
            : 'bg-white/10 text-white/90 rounded-tl-sm'
        )}
      >
        {message.message}
      </div>
    </motion.div>
  );
}

interface ChatProps {
  compact?: boolean;
}

export function Chat({ compact = false }: ChatProps) {
  const { chatMessages, isChatOpen, unreadCount, toggleChat, clearUnread } = useGameStore();
  const { localPlayer } = usePlayerStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (isChatOpen) {
      clearUnread();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen, clearUnread]);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const socket = getSocket();
    socket.emit('send_chat', { message: trimmed });
    setInput('');
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
          <AnimatePresence initial={false}>
            {chatMessages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                isOwn={msg.playerId === localPlayer?.id}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-2 border-t border-white/10">
          <div className="flex gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              maxLength={200}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/25"
              aria-label="Chat message"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-1.5 rounded-lg bg-uno-red/80 text-white disabled:opacity-40 hover:bg-uno-red transition-colors"
              aria-label="Send message"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-all"
        aria-label={`${isChatOpen ? 'Close' : 'Open'} chat${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <MessageSquare size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-uno-red text-white text-[10px] font-mono font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-72 h-80 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl z-30"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <span className="text-sm font-body font-semibold text-white/70">Chat</span>
              <button onClick={toggleChat} className="text-white/40 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <Chat compact />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
