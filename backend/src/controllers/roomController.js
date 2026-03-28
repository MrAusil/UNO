const { v4: uuidv4 } = require('uuid');
const roomService = require('../services/roomService');

const createRoom = async (req, res, next) => {
    try {
        const { playerId } = req.body; // In real app, might come from req.user
        if (!playerId) {
            return res.status(400).json({ message: 'playerId is required' });
        }

        // Generate room code (6 chars)
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create room in Redis
        await roomService.createRoom(roomCode, playerId);

        res.status(201).json({ roomCode, hostId: playerId });
    } catch (error) {
        next(error);
    }
};

const joinRoom = async (req, res, next) => {
    try {
        const { roomCode, playerId } = req.body;
        if (!roomCode || !playerId) {
            return res.status(400).json({ message: 'roomCode and playerId are required' });
        }

        const room = await roomService.getRoomState(roomCode);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.status !== 'Lobby') {
            return res.status(403).json({ message: 'Game already started or finished' });
        }

        if (room.players.length >= room.maxPlayers) {
            return res.status(403).json({ message: 'Room is full' });
        }

        res.status(200).json({ roomCode, room });
    } catch (error) {
        next(error);
    }
};

const getRoom = async (req, res, next) => {
    try {
        const { code } = req.params;
        const room = await roomService.getRoomState(code);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ roomCode: code, room });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRoom,
    joinRoom,
    getRoom
};
