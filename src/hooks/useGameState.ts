'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { getPlayableCards } from '@/utils/cardUtils';

export function useGameState() {
  const gameState = useGameStore((state) => state.gameState);
  const hand = usePlayerStore((state) => state.hand);
  const localPlayer = usePlayerStore((state) => state.localPlayer);

  const isMyTurn = useMemo(
    () => gameState.currentPlayerId === localPlayer?.id,
    [gameState.currentPlayerId, localPlayer?.id]
  );

  const topCard = useMemo(
    () => gameState.discardPile[0] ?? null,
    [gameState.discardPile]
  );

  const playableCardIds = useMemo(() => {
    if (!isMyTurn || !topCard || !gameState.currentColor) return [];
    return getPlayableCards(hand, topCard, gameState.currentColor);
  }, [isMyTurn, hand, topCard, gameState.currentColor]);

  const shouldShowUno = useMemo(
    () => isMyTurn && hand.length === 1,
    [isMyTurn, hand.length]
  );

  const otherPlayers = useMemo(
    () => gameState.players.filter((p) => p.id !== localPlayer?.id),
    [gameState.players, localPlayer?.id]
  );

  const isGameActive = gameState.status === 'playing';
  const isGameFinished = gameState.status === 'finished';
  const isWaiting = gameState.status === 'waiting';

  const timerPercent = useMemo(
    () =>
      gameState.maxTurnTime > 0
        ? (gameState.turnTimer / gameState.maxTurnTime) * 100
        : 100,
    [gameState.turnTimer, gameState.maxTurnTime]
  );

  return {
    gameState,
    hand,
    localPlayer,
    isMyTurn,
    topCard,
    playableCardIds,
    shouldShowUno,
    otherPlayers,
    isGameActive,
    isGameFinished,
    isWaiting,
    timerPercent,
  };
}
