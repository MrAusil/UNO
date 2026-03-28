const generateDeck = require('../utils/deckGenerator');
const shuffle = require('../utils/shuffle');
const isValidPlay = require('../utils/cardValidator');

class UnoEngine {
    constructor(roomState) {
        this.roomState = roomState;
        // ensure game state is initialized
        if (!this.roomState.gameState) {
            this.roomState.gameState = this._createInitialGameState();
        }
    }

    _createInitialGameState() {
        return {
            deck: [],
            discardPile: [],
            currentPlayerIndex: 0,
            direction: 1, // 1 for clockwise, -1 for counter-clockwise
            currentColor: null,
            startTime: Date.now(),
            endTime: null,
            winner: null,
            totalMoves: 0
        };
    }

    initializeGame() {
        let deck = shuffle(generateDeck());

        // Deal 7 cards to each player
        this.roomState.players.forEach(player => {
            player.hand = deck.splice(0, 7);
            player.calledUNO = false;
            player.connected = true; // explicitly set connected here
        });

        let firstCard = deck.pop();
        // Re-draw if first card is wild draw 4 or just let it be (standard rule says keep drawing)
        while (firstCard.color === 'wild' && firstCard.value === 'wild_draw_four') {
            deck.push(firstCard);
            deck = shuffle(deck);
            firstCard = deck.pop();
        }

        this.roomState.gameState.deck = deck;
        this.roomState.gameState.discardPile = [firstCard];

        this.roomState.gameState.currentColor = firstCard.color === 'wild' ? null : firstCard.color;
        // If it's a wild, the first player chooses the color, but for simplicity let's handle it by letting the first player play anything

        if (firstCard.value === 'reverse') {
            this.roomState.gameState.direction = -1;
            this.nextTurn();
        } else if (firstCard.value === 'skip') {
            this.nextTurn();
        }

        // Set first currentPlayerIndex to 0 (host typically or first joined)

        return this.roomState;
    }

    getCurrentPlayer() {
        return this.roomState.players[this.roomState.gameState.currentPlayerIndex];
    }

    nextTurn() {
        let { currentPlayerIndex, direction } = this.roomState.gameState;
        const playerCount = this.roomState.players.length;

        currentPlayerIndex = (currentPlayerIndex + direction) % playerCount;
        if (currentPlayerIndex < 0) currentPlayerIndex += playerCount;

        this.roomState.gameState.currentPlayerIndex = currentPlayerIndex;
    }

    drawCard(playerId, quantity = 1) {
        const playerIndex = this.roomState.players.findIndex(p => p.playerId === playerId);
        if (playerIndex === -1) throw new Error('Player not found');
        const player = this.roomState.players[playerIndex];

        const drawnCards = [];
        for (let i = 0; i < quantity; i++) {
            if (this.roomState.gameState.deck.length === 0) {
                // Reshuffle discard pile
                const topCard = this.roomState.gameState.discardPile.pop();
                this.roomState.gameState.deck = shuffle(this.roomState.gameState.discardPile);
                this.roomState.gameState.discardPile = [topCard];
            }
            if (this.roomState.gameState.deck.length > 0) {
                const card = this.roomState.gameState.deck.pop();
                player.hand.push(card);
                drawnCards.push(card);
            }
        }

        // reset uno call just in case
        player.calledUNO = false;

        return drawnCards;
    }

    playCard(playerId, cardToPlay) {
        const playerIndex = this.roomState.gameState.currentPlayerIndex;
        const player = this.roomState.players[playerIndex];

        if (player.playerId !== playerId) {
            throw new Error('Not your turn');
        }

        // Check if player has the card
        const cardIndex = player.hand.findIndex(c => c.id === cardToPlay.id);
        if (cardIndex === -1) {
            throw new Error('Card not in hand');
        }

        const topCard = this.roomState.gameState.discardPile[this.roomState.gameState.discardPile.length - 1];
        const currentColor = this.roomState.gameState.currentColor;

        if (!isValidPlay(cardToPlay, topCard, currentColor)) {
            throw new Error('Invalid card played');
        }

        // remove card from hand
        player.hand.splice(cardIndex, 1);
        this.roomState.gameState.discardPile.push(cardToPlay);
        this.roomState.gameState.currentColor = cardToPlay.color !== 'wild' ? cardToPlay.color : null; // Needs choice
        this.roomState.gameState.totalMoves++;

        // check win condition
        if (player.hand.length === 0) {
            this.roomState.status = 'Finished';
            this.roomState.gameState.winner = player;
            this.roomState.gameState.endTime = Date.now();
            return { cardPlayed: cardToPlay, gameOver: true };
        }

        // handle special cards
        let action = null;
        let nextPlayerSkip = false;

        if (cardToPlay.value === 'reverse') {
            this.roomState.gameState.direction *= -1;
            // In 2 player, reverse acts as skip
            if (this.roomState.players.length === 2) {
                nextPlayerSkip = true;
            }
        } else if (cardToPlay.value === 'skip') {
            nextPlayerSkip = true;
        } else if (cardToPlay.value === 'draw_two') {
            action = { type: 'draw', amount: 2 };
            nextPlayerSkip = true;
        } else if (cardToPlay.value === 'wild_draw_four') {
            action = { type: 'draw', amount: 4 };
            nextPlayerSkip = true;
        }

        if (cardToPlay.color === 'wild') {
            action = { ...action, type: action?.type === 'draw' ? 'wildDraw4' : 'wild' };
        }

        // Note: color choice for wild should be handled in another event or with the playCard payload
        return { cardPlayed: cardToPlay, gameOver: false, action, nextPlayerSkip };
    }

    applyPenalty(playerId) {
        // Failure to call UNO penalty is 2 cards
        this.drawCard(playerId, 2);
    }
}

module.exports = UnoEngine;
