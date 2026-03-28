const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true
    },
    host: {
        type: String,
        required: true
    },
    players: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['Lobby', 'In Game', 'Finished'],
        default: 'Lobby'
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
