const roomService = require('../services/roomService');
const UnoEngine = require('./unoEngine');
const { saveGameToDb } = require('../services/gameService');

// Handles logic flow combining Redis State and UNO Engine

const startGame = async (roomCode) => {
    const roomState = await roomService.getRoomState(roomCode);
    if (!roomState || roomState.players.length < 2) {
        throw new Error('Not enough players to start');
    }

    roomState.status = 'In Game';

    const engine = new UnoEngine(roomState);
    engine.initializeGame();

    await roomService.updateRoomState(roomCode, roomState);
    return roomState;
};

const playCard = async (roomCode, playerId, card, chosenColor = null) => {
    const roomState = await roomService.getRoomState(roomCode);
    const engine = new UnoEngine(roomState);

    const result = engine.playCard(playerId, card);

    // If wild, set chosen color
    if (card.color === 'wild' && chosenColor) {
        engine.roomState.gameState.currentColor = chosenColor;
    }

    // Handle actions on next player
    if (result.action && result.action.type.includes('draw')) {
        engine.nextTurn();
        const nextPlayerObj = engine.getCurrentPlayer();
        engine.drawCard(nextPlayerObj.playerId, result.action.amount);
        // Draw penalty skips the next player
    } else if (result.nextPlayerSkip) {
        engine.nextTurn();
    }

    if (!result.gameOver) {
        engine.nextTurn();
    }

    // Check if someone didn't call UNO (hand == 1 and calledUNO == false)
    const previousPlayerIndex = (engine.roomState.gameState.currentPlayerIndex - engine.roomState.gameState.direction * (result.nextPlayerSkip && !result.action ? 2 : 1) + engine.roomState.players.length) % engine.roomState.players.length;
    // This logic for finding prev player could be complex, simple alternative:
    // Check all players
    engine.roomState.players.forEach(p => {
        if (p.hand.length === 1 && !p.calledUNO && p.playerId !== playerId && !result.gameOver) {
            // Here we could implement automatic penalty if we wanted, but standard rule is another player has to catch them. We'll skip auto-catch for now or implement if required.
        }
    });


    await roomService.updateRoomState(roomCode, engine.roomState);

    if (result.gameOver) {
        await saveGameToDb(engine.roomState);
    }

    return { roomState: engine.roomState, result };
};

const drawCard = async (roomCode, playerId) => {
    const roomState = await roomService.getRoomState(roomCode);
    const engine = new UnoEngine(roomState);

    // Check if it's player's turn
    const currentPlayer = engine.getCurrentPlayer();
    if (currentPlayer.playerId !== playerId) {
        throw new Error('Not your turn to draw');
    }

    const cards = engine.drawCard(playerId, 1);
    engine.nextTurn();

    await roomService.updateRoomState(roomCode, engine.roomState);
    return { roomState: engine.roomState, drawnCards: cards };
};

const callUno = async (roomCode, playerId) => {
    const roomState = await roomService.getRoomState(roomCode);
    const player = roomState.players.find(p => p.playerId === playerId);

    if (!player) throw new Error('Player not found');
    if (player.hand.length > 2) throw new Error('Cannot call UNO yet');

    player.calledUNO = true;
    await roomService.updateRoomState(roomCode, roomState);
    return roomState;
};

const handleDisconnect = async (roomCode, playerId) => {
    const roomState = await roomService.getRoomState(roomCode);
    if (!roomState) return null;

    const player = roomState.players.find(p => p.playerId === playerId);
    if (player) {
        player.connected = false;
        await roomService.updateRoomState(roomCode, roomState);
    }
    return roomState;
};

const handleReconnect = async (roomCode, playerId) => {
    const roomState = await roomService.getRoomState(roomCode);
    if (!roomState) return null;

    const player = roomState.players.find(p => p.playerId === playerId);
    if (player) {
        player.connected = true;
        await roomService.updateRoomState(roomCode, roomState);
    }
    return roomState;
}

module.exports = {
    startGame,
    playCard,
    drawCard,
    callUno,
    handleDisconnect,
    handleReconnect
};
