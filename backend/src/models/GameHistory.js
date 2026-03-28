const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true
    },
    players: [{
        type: String
    }],
    winner: {
        type: String
    },
    duration: {
        type: Number
    },
    moves: {
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('GameHistory', gameHistorySchema);
