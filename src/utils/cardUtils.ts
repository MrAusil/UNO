import type { Card, CardColor, CardValue } from '@/types/game';

export function canPlayCard(card: Card, topCard: Card, currentColor: CardColor): boolean {
  if (card.color === 'wild') return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

export function getCardLabel(card: Card): string {
  const specialLabels: Partial<Record<CardValue, string>> = {
    skip: '⊘',
    reverse: '↺',
    draw_two: '+2',
    wild: 'W',
    wild_draw_four: '+4',
  };
  return specialLabels[card.value] ?? card.value;
}

export function getCardPoints(card: Card): number {
  const numVal = parseInt(card.value);
  if (!isNaN(numVal)) return numVal;
  if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw_two') return 20;
  if (card.value === 'wild' || card.value === 'wild_draw_four') return 50;
  return 0;
}

export function isWildCard(card: Card): boolean {
  return card.color === 'wild';
}

export function isActionCard(card: Card): boolean {
  return ['skip', 'reverse', 'draw_two', 'wild', 'wild_draw_four'].includes(card.value);
}

export function getColorClass(color: CardColor): string {
  const classes: Record<CardColor, string> = {
    red: 'card-red',
    blue: 'card-blue',
    green: 'card-green',
    yellow: 'card-yellow',
    wild: 'card-wild',
  };
  return classes[color];
}

export function getColorHex(color: CardColor): string {
  const hex: Record<CardColor, string> = {
    red: '#E63946',
    blue: '#457B9D',
    green: '#2A9D8F',
    yellow: '#E9C46A',
    wild: '#6a0dad',
  };
  return hex[color];
}

export function getColorGlow(color: CardColor): string {
  const glows: Record<CardColor, string> = {
    red: '0 0 20px rgba(230, 57, 70, 0.7)',
    blue: '0 0 20px rgba(69, 123, 157, 0.7)',
    green: '0 0 20px rgba(42, 157, 143, 0.7)',
    yellow: '0 0 20px rgba(233, 196, 106, 0.7)',
    wild: '0 0 20px rgba(106, 13, 173, 0.7)',
  };
  return glows[color];
}

export function sortHand(hand: Card[]): Card[] {
  const colorOrder: Record<CardColor, number> = {
    red: 0,
    blue: 1,
    green: 2,
    yellow: 3,
    wild: 4,
  };

  return [...hand].sort((a, b) => {
    const colorDiff = colorOrder[a.color] - colorOrder[b.color];
    if (colorDiff !== 0) return colorDiff;
    return a.value.localeCompare(b.value);
  });
}

export function generateCardId(): string {
  return `card-${Math.random().toString(36).substr(2, 9)}`;
}

export function getPlayableCards(hand: Card[], topCard: Card, currentColor: CardColor): string[] {
  return hand
    .filter((card) => canPlayCard(card, topCard, currentColor))
    .map((card) => card.id);
}
