const GameHistory = require('../models/GameHistory');
const Room = require('../models/Room');
const logger = require('../utils/logger');

const saveGameToDb = async (roomState) => {
    try {
        const { roomCode, players, gameState, hostId, status } = roomState;

        // Save Game History
        await GameHistory.create({
            roomCode,
            players: players.map(p => p.username),
            winner: gameState.winner ? gameState.winner.username : null,
            duration: gameState.endTime ? Math.floor((gameState.endTime - gameState.startTime) / 1000) : 0,
            moves: gameState.totalMoves || 0
        });

        // Update Room record
        await Room.findOneAndUpdate(
            { roomCode },
            { status, players: players.map(p => p.username), host: hostId },
            { upsert: true }
        );

        logger.info(`Saved game history for room ${roomCode}`);
    } catch (err) {
        logger.error(`Error saving game to DB: ${err.message}`);
    }
};

module.exports = {
    saveGameToDb
};
