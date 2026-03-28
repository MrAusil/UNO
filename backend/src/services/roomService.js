const redisConfig = require('../config/redis');

const ROOM_PREFIX = 'room:';
const inMemoryRooms = new Map();

const createRoom = async (roomCode, hostId) => {
    const roomState = {
        roomCode,
        hostId,
        players: [],
        gameState: null,
        maxPlayers: 10,
        status: 'Lobby',
        settings: {
            maxPlayers: 8,
            turnTimer: 30,
            maxRounds: 1,
            gameSpeed: 'normal',
            stackDrawCards: false,
            forcePlay: false
        },
        createdAt: Date.now()
    };

    if (redisConfig.redisClient) {
        await redisConfig.redisClient.set(`${ROOM_PREFIX}${roomCode}`, JSON.stringify(roomState));
        // Set expiration for empty rooms to avoid memory leak (e.g., 2 hours)
        await redisConfig.redisClient.expire(`${ROOM_PREFIX}${roomCode}`, 2 * 60 * 60);
    } else {
        inMemoryRooms.set(roomCode, roomState);
    }

    return roomState;
};

const getRoomState = async (roomCode) => {
    if (!redisConfig.redisClient) return inMemoryRooms.get(roomCode) || null;
    const data = await redisConfig.redisClient.get(`${ROOM_PREFIX}${roomCode}`);
    return data ? JSON.parse(data) : null;
};

const updateRoomState = async (roomCode, state) => {
    if (redisConfig.redisClient) {
        await redisConfig.redisClient.set(`${ROOM_PREFIX}${roomCode}`, JSON.stringify(state));
        // Keep room alive while state updates happen
        await redisConfig.redisClient.expire(`${ROOM_PREFIX}${roomCode}`, 2 * 60 * 60);
    } else {
        inMemoryRooms.set(roomCode, state);
    }
};

const deleteRoom = async (roomCode) => {
    if (redisConfig.redisClient) {
        await redisConfig.redisClient.del(`${ROOM_PREFIX}${roomCode}`);
    } else {
        inMemoryRooms.delete(roomCode);
    }
};

module.exports = {
    createRoom,
    getRoomState,
    updateRoomState,
    deleteRoom
};
