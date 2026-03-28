const logger = require('../utils/logger');

const setupVoiceHandlers = (io, socket) => {
    const { playerId, username } = socket.user;

    socket.on('join_voice', ({ roomCode }, callback) => {
        try {
            const resolvedRoomCode = roomCode || socket.roomCode;
            if (!resolvedRoomCode) {
                if (callback) callback({ success: false, error: 'Room code is required' });
                return;
            }

            // Join a specific WebRTC signaling room for voice
            const voiceRoom = `${resolvedRoomCode}_voice`;
            socket.join(voiceRoom);
            
            logger.info(`Player ${username} (${playerId}) joined voice in room ${resolvedRoomCode}`);

            // Notify others in the voice room
            socket.to(voiceRoom).emit('voice_user_joined', {
                playerId,
                socketId: socket.id
            });

            if (callback) callback({ success: true });
        } catch (error) {
            logger.error(`Error joining voice: ${error.message}`);
            if (callback) callback({ success: false, error: error.message });
        }
    });

    socket.on('leave_voice', ({ roomCode }, callback) => {
        try {
            const resolvedRoomCode = roomCode || socket.roomCode;
            if (!resolvedRoomCode) return;

            const voiceRoom = `${resolvedRoomCode}_voice`;
            socket.leave(voiceRoom);

            logger.info(`Player ${username} (${playerId}) left voice in room ${resolvedRoomCode}`);

            socket.to(voiceRoom).emit('voice_user_left', {
                playerId,
                socketId: socket.id
            });

            if (callback) callback({ success: true });
        } catch (error) {
            logger.error(`Error leaving voice: ${error.message}`);
            if (callback) callback({ success: false, error: error.message });
        }
    });

    socket.on('webrtc_offer', ({ targetSocketId, offer, roomCode }) => {
        const resolvedRoomCode = roomCode || socket.roomCode;
        if (!resolvedRoomCode) return;

        io.to(targetSocketId).emit('webrtc_offer', {
            senderId: playerId,
            senderSocketId: socket.id,
            offer
        });
    });

    socket.on('webrtc_answer', ({ targetSocketId, answer, roomCode }) => {
        const resolvedRoomCode = roomCode || socket.roomCode;
        if (!resolvedRoomCode) return;

        io.to(targetSocketId).emit('webrtc_answer', {
            senderId: playerId,
            senderSocketId: socket.id,
            answer
        });
    });

    socket.on('webrtc_ice_candidate', ({ targetSocketId, candidate, roomCode }) => {
        const resolvedRoomCode = roomCode || socket.roomCode;
        if (!resolvedRoomCode) return;

        io.to(targetSocketId).emit('webrtc_ice_candidate', {
            senderId: playerId,
            senderSocketId: socket.id,
            candidate
        });
    });

    // Handle disconnect specifically to leave voice properly
    socket.on('disconnect', () => {
        if (socket.roomCode) {
            const voiceRoom = `${socket.roomCode}_voice`;
            socket.to(voiceRoom).emit('voice_user_left', {
                playerId,
                socketId: socket.id
            });
        }
    });
};

module.exports = setupVoiceHandlers;
