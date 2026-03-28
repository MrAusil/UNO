const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const playerService = require('../services/playerService');

const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            // Support for anonymous frontend
            const { v4: uuidv4 } = require('uuid');
            socket.user = { playerId: uuidv4(), username: 'Guest_' + Math.floor(Math.random() * 1000) };
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded;

        // Resume session if exists
        const session = await playerService.getPlayerSession(decoded.playerId);
        if (session && session.roomCode) {
            socket.roomCode = session.roomCode;
        }

        next();
    } catch (error) {
        // Authenticated connection failed, fallback to anonymous
        const { v4: uuidv4 } = require('uuid');
        socket.user = { playerId: uuidv4(), username: 'Guest_' + Math.floor(Math.random() * 1000) };
        next();
    }
};

module.exports = socketAuthMiddleware;
