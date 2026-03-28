const redisConfig = require('../config/redis');

const PLAYER_PREFIX = 'player:';
const inMemorySessions = new Map();

const savePlayerSession = async (playerId, data) => {
    if (!redisConfig.redisClient) {
        inMemorySessions.set(playerId, data);
        return;
    }
    await redisConfig.redisClient.set(`${PLAYER_PREFIX}${playerId}`, JSON.stringify(data));
    // Keep session alive for 24h
    await redisConfig.redisClient.expire(`${PLAYER_PREFIX}${playerId}`, 24 * 60 * 60);
};

const getPlayerSession = async (playerId) => {
    if (!redisConfig.redisClient) return inMemorySessions.get(playerId) || null;
    const data = await redisConfig.redisClient.get(`${PLAYER_PREFIX}${playerId}`);
    return data ? JSON.parse(data) : null;
};

const removePlayerSession = async (playerId) => {
    if (!redisConfig.redisClient) {
        inMemorySessions.delete(playerId);
        return;
    }
    await redisConfig.redisClient.del(`${PLAYER_PREFIX}${playerId}`);
};

module.exports = {
    savePlayerSession,
    getPlayerSession,
    removePlayerSession
};
