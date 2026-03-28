/**
 * Validates if played card is allowed based on the top card of the discard pile.
 * @param playedCard - Card player attempts to play
 * @param topCard - Current top card on discard pile
 * @param currentColor - The currently active color (important for wild cards)
 */
const isValidPlay = (playedCard, topCard, currentColor) => {
    // Wild cards can always be played
    if (playedCard.color === 'wild') return true;

    // If colors match (or match the active declared color from a previous Wild)
    if (playedCard.color === currentColor) return true;

    // If values match (e.g., played a Red 5 on a Blue 5, or Red Skip on Blue Skip)
    if (playedCard.value === topCard.value) return true;

    return false;
};

module.exports = isValidPlay;
