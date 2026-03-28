const logger = require('../utils/logger');
const roomService = require('../services/roomService');
const playerService = require('../services/playerService');
const gameLogic = require('../game/gameLogic');
const setupVoiceHandlers = require('./voiceHandlers');

// For turn timer
const timers = new Map();

const setTurnTimer = (io, roomCode, gameLogicRef) => {
    if (timers.has(roomCode)) {
        clearTimeout(timers.get(roomCode));
    }

    // 20 sec turn timer
    const timer = setTimeout(async () => {
        try {
            logger.info(`Turn timer expired for room ${roomCode}`);
            // Auto draw a card if time expires
            const roomState = await roomService.getRoomState(roomCode);
            if (roomState && roomState.status === 'In Game') {
                const currentPlayer = roomState.players[roomState.gameState.currentPlayerIndex];

                const result = await gameLogicRef.drawCard(roomCode, currentPlayer.playerId);

                io.to(roomCode).emit('turn_timer_expired', { playerId: currentPlayer.playerId });
                io.to(roomCode).emit('cards_drawn', {
                    playerId: currentPlayer.playerId,
                    numCards: 1,
                    drawnCards: result.drawnCards,
                    roomState: result.roomState
                });
                // Emit who's next
                const nextState = await roomService.getRoomState(roomCode);
                const nextPlayer = nextState.players[nextState.gameState.currentPlayerIndex];
                io.to(roomCode).emit('turn_changed', {
                    currentPlayerId: nextPlayer.playerId,
                    timer: 20,
                    roomState: nextState
                });

                setTurnTimer(io, roomCode, gameLogicRef);
            }
        } catch (err) {
            logger.error('Error in turn timer:', err.message);
        }
    }, 20000);

    timers.set(roomCode, timer);
};

const resolveRoomCode = (socket, payload) => {
    if (!payload) return socket.roomCode;
    if (typeof payload === 'string') return payload;
    return payload.roomCode || socket.roomCode;
};

const setupSocketEvents = (io, socket) => {
    const { playerId, username } = socket.user;

    socket.on('disconnect', async () => {
        logger.info(`Player ${username} (${playerId}) disconnected`);

        const session = await playerService.getPlayerSession(playerId);
        if (session && session.roomCode) {
            const { roomCode } = session;
            const roomState = await gameLogic.handleDisconnect(roomCode, playerId);

            if (roomState) {
                io.to(roomCode).emit('player_disconnected', { playerId });

                // Set 60 sec disconnected timer to kick player
                setTimeout(async () => {
                    const rs = await roomService.getRoomState(roomCode);
                    if (rs) {
                        const p = rs.players.find(x => x.playerId === playerId);
                        if (p && !p.connected) {
                            // Player is permanently removed
                            rs.players = rs.players.filter(x => x.playerId !== playerId);
                            await roomService.updateRoomState(roomCode, rs);
                            io.to(roomCode).emit('player_left', { playerId });
                            await playerService.removePlayerSession(playerId);
                        }
                    }
                }, 60000);
            }
        }
    });

    socket.on('create_room', async (data, callback) => {
        try {
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            const roomState = await roomService.createRoom(roomCode, playerId);
            if (data && data.settings) {
                // optionally apply preferences
                roomState.settings = data.settings;
            }

            roomState.players.push({
                playerId,
                username: (data && data.playerName) || username,
                avatar: (data && data.avatar) || socket.user.avatar || 'default',
                hand: [],
                calledUNO: false,
                connected: true,
                isReady: true
            });
            await roomService.updateRoomState(roomCode, roomState);

            socket.join(roomCode);
            socket.roomCode = roomCode;
            await playerService.savePlayerSession(playerId, { socketId: socket.id, roomCode });

            io.to(roomCode).emit('room_update', { roomState });
            if (callback) callback({ success: true, room: roomState, roomCode, playerId });
        } catch (err) {
            logger.error('Error creating room:', err.message);
            if (callback) callback({ success: false, error: err.message });
        }
    });
    socket.on('join_room', async ({ roomCode, playerName, avatar }, callback) => {
        try {
            let roomState = await roomService.getRoomState(roomCode);
            if (!roomState) return callback({ success: false, error: 'Room not found' });
            if (roomState.status !== 'Lobby' && !roomState.players.find(p => p.playerId === playerId)) {
                return callback({ success: false, error: 'Game already started' });
            }

            socket.join(roomCode);
            socket.roomCode = roomCode;

            const existingPlayer = roomState.players.find(p => p.playerId === playerId);

            if (!existingPlayer) {
                if (roomState.players.length >= roomState.maxPlayers) {
                    return callback({ success: false, error: 'Room is full' });
                }
                const newPlayer = {
                    playerId,
                    username: playerName || username,
                    avatar: avatar || socket.user.avatar || 'default',
                    hand: [],
                    calledUNO: false,
                    connected: true,
                    isReady: false
                };
                roomState.players.push(newPlayer);
                await roomService.updateRoomState(roomCode, roomState);
            } else {
                await gameLogic.handleReconnect(roomCode, playerId);
            }

            await playerService.savePlayerSession(playerId, { socketId: socket.id, roomCode });

            io.to(roomCode).emit('player_joined', {
                playerId,
                playerName: playerName || username,
                roomState
            });
            io.to(roomCode).emit('room_update', { roomState });
            if (callback) callback({ success: true, room: roomState, playerId });
        } catch (err) {
            logger.error('Error joining room:', err.message);
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on('leave_room', async (payload, callback) => {
        try {
            if (typeof payload === 'function') {
                callback = payload;
                payload = undefined;
            }
            const roomCode = resolveRoomCode(socket, payload);
            if (!roomCode) {
                if (callback) callback({ error: 'Room code is required' });
                return;
            }
            socket.leave(roomCode);
            const roomState = await roomService.getRoomState(roomCode);
            if (roomState) {
                roomState.players = roomState.players.filter(p => p.playerId !== playerId);
                await roomService.updateRoomState(roomCode, roomState);
                io.to(roomCode).emit('player_left', { playerId, roomState });
                io.to(roomCode).emit('room_update', { roomState });
            }
            await playerService.removePlayerSession(playerId);
            if (callback) callback({ success: true });
        } catch (err) {
            if (callback) callback({ error: err.message });
        }
    });

    socket.on('start_game', async (payload, callback) => {
        try {
            if (typeof payload === 'function') {
                callback = payload;
                payload = undefined;
            }
            const roomCode = resolveRoomCode(socket, payload);
            const roomState = await gameLogic.startGame(roomCode);
            io.to(roomCode).emit('game_started', { roomState });
            io.to(roomCode).emit('room_update', { roomState });

            // Inform about custom states like hand contents individually if we don't want to broadcast everyone's hands.
            // However, typical lightweight implementation sends whole state, but frontend hides other hands.
            // Better API: send specific `cards_dealt` to each socket.

            const currentPlayer = roomState.players[roomState.gameState.currentPlayerIndex];
            io.to(roomCode).emit('turn_changed', {
                currentPlayerId: currentPlayer.playerId,
                timer: 20,
                roomState
            });

            setTurnTimer(io, roomCode, gameLogic);
            if (callback) callback({ success: true });
        } catch (err) {
            if (callback) callback({ error: err.message });
        }
    });

    socket.on('play_card', async ({ roomCode, card, cardId, chosenColor }, callback) => {
        try {
            const resolvedRoomCode = roomCode || socket.roomCode;
            const currentRoom = await roomService.getRoomState(resolvedRoomCode);
            const currentPlayer = currentRoom?.players.find(p => p.playerId === playerId);
            const selectedCard = card || currentPlayer?.hand.find(c => c.id === cardId);

            if (!selectedCard) {
                throw new Error('Card not found');
            }

            const { roomState, result } = await gameLogic.playCard(resolvedRoomCode, playerId, selectedCard, chosenColor);

            io.to(resolvedRoomCode).emit('card_played', {
                playerId,
                card: selectedCard,
                chosenColor,
                roomState
            });
            io.to(resolvedRoomCode).emit('room_update', { roomState });

            if (result.gameOver) {
                if (timers.has(resolvedRoomCode)) clearTimeout(timers.get(resolvedRoomCode));
                io.to(resolvedRoomCode).emit('game_over', { winner: playerId, roomState });
            } else {
                const nextPlayer = roomState.players[roomState.gameState.currentPlayerIndex];
                io.to(resolvedRoomCode).emit('turn_changed', {
                    currentPlayerId: nextPlayer.playerId,
                    timer: 20,
                    roomState
                });
                setTurnTimer(io, resolvedRoomCode, gameLogic);
            }
            if (callback) callback({ success: true });
        } catch (err) {
            if (callback) callback({ error: err.message });
        }
    });

    socket.on('draw_card', async (payload, callback) => {
        try {
            if (typeof payload === 'function') {
                callback = payload;
                payload = undefined;
            }
            const roomCode = resolveRoomCode(socket, payload);
            const { roomState, drawnCards } = await gameLogic.drawCard(roomCode, playerId);
            io.to(roomCode).emit('cards_drawn', {
                playerId,
                numCards: drawnCards.length,
                drawnCards,
                roomState
            });
            io.to(roomCode).emit('room_update', { roomState });

            const nextPlayer = roomState.players[roomState.gameState.currentPlayerIndex];
            io.to(roomCode).emit('turn_changed', {
                currentPlayerId: nextPlayer.playerId,
                timer: 20,
                roomState
            });
            setTurnTimer(io, roomCode, gameLogic);

            if (callback) callback({ success: true, cards: drawnCards });
        } catch (err) {
            if (callback) callback({ error: err.message });
        }
    });

    socket.on('call_uno', async (payload, callback) => {
        try {
            if (typeof payload === 'function') {
                callback = payload;
                payload = undefined;
            }
            const roomCode = resolveRoomCode(socket, payload);
            await gameLogic.callUno(roomCode, playerId);
            const roomState = await roomService.getRoomState(roomCode);
            io.to(roomCode).emit('uno_called', { playerId, playerName: username, roomState });
            io.to(roomCode).emit('room_update', { roomState });
            if (callback) callback({ success: true });
        } catch (err) {
            if (callback) callback({ error: err.message });
        }
    });

    socket.on('send_chat', ({ roomCode, message }, callback) => {
        const resolvedRoomCode = roomCode || socket.roomCode;
        if (!resolvedRoomCode) {
            if (callback) callback({ success: false, error: 'Room code is required' });
            return;
        }
        io.to(resolvedRoomCode).emit('chat_message', {
            playerId,
            playerName: username,
            message,
            timestamp: Date.now(),
            type: 'chat',
            id: `${playerId}-${Date.now()}`
        });
        if (callback) callback({ success: true });
    });

    socket.on('set_ready', async ({ isReady }, callback) => {
        try {
            const roomCode = socket.roomCode;
            const roomState = await roomService.getRoomState(roomCode);
            if (!roomState) throw new Error('Room not found');

            const player = roomState.players.find(p => p.playerId === playerId);
            if (!player) throw new Error('Player not found');

            player.isReady = !!isReady;
            await roomService.updateRoomState(roomCode, roomState);

            io.to(roomCode).emit('player_ready', { playerId, isReady: player.isReady, roomState });
            io.to(roomCode).emit('room_update', { roomState });
            if (callback) callback({ success: true });
        } catch (err) {
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on('update_settings', async (settings, callback) => {
        try {
            const roomCode = socket.roomCode;
            const roomState = await roomService.getRoomState(roomCode);
            if (!roomState) throw new Error('Room not found');
            if (roomState.hostId !== playerId) throw new Error('Only the host can update settings');

            roomState.settings = { ...roomState.settings, ...settings };
            roomState.maxPlayers = roomState.settings.maxPlayers;
            await roomService.updateRoomState(roomCode, roomState);

            io.to(roomCode).emit('settings_updated', { settings: roomState.settings, roomState });
            io.to(roomCode).emit('room_update', { roomState });
            if (callback) callback({ success: true });
        } catch (err) {
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on('kick_player', async ({ playerId: targetPlayerId }, callback) => {
        try {
            const roomCode = socket.roomCode;
            const roomState = await roomService.getRoomState(roomCode);
            if (!roomState) throw new Error('Room not found');
            if (roomState.hostId !== playerId) throw new Error('Only the host can kick players');

            roomState.players = roomState.players.filter(player => player.playerId !== targetPlayerId);
            await roomService.updateRoomState(roomCode, roomState);
            await playerService.removePlayerSession(targetPlayerId);

            io.to(roomCode).emit('player_kicked', { playerId: targetPlayerId, roomState });
            io.to(roomCode).emit('room_update', { roomState });
            if (callback) callback({ success: true });
        } catch (err) {
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on('challenge_uno', async ({ targetPlayerId }, callback) => {
        try {
            const roomCode = socket.roomCode;
            const roomState = await roomService.getRoomState(roomCode);
            if (!roomState) throw new Error('Room not found');

            const targetPlayer = roomState.players.find(player => player.playerId === targetPlayerId);
            if (!targetPlayer) throw new Error('Target player not found');

            const success = targetPlayer.hand.length === 1 && !targetPlayer.calledUNO;
            if (success) {
                const engine = new (require('../game/unoEngine'))(roomState);
                engine.applyPenalty(targetPlayerId);
                await roomService.updateRoomState(roomCode, engine.roomState);
            }

            const updatedRoomState = await roomService.getRoomState(roomCode);
            io.to(roomCode).emit('uno_challenge', { challengerId: playerId, targetId: targetPlayerId, success, roomState: updatedRoomState });
            io.to(roomCode).emit('room_update', { roomState: updatedRoomState });
            if (callback) callback({ success: true });
        } catch (err) {
            if (callback) callback({ success: false, error: err.message });
        }
    });

    // Initialize Voice WebRTC handlers
    setupVoiceHandlers(io, socket);

};

module.exports = setupSocketEvents;
