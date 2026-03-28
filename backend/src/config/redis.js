const { createClient } = require('redis');
const { REDIS_URL } = require('./env');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
    try {
        const client = createClient({
            url: REDIS_URL,
            socket: {
                connectTimeout: 2000,
                reconnectStrategy: false
            }
        });
        client.on('error', () => { }); // swallow connection errors locally
        await Promise.race([
            client.connect(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 2500))
        ]);
        client.on('error', (err) => logger.error('Redis Client Error', err));
        logger.info('Redis client connected');
        redisClient = client;
    } catch (error) {
        logger.warn('Failed to connect to Redis. Running without Redis adapter.');
    }
};

module.exports = {
    get redisClient() { return redisClient; },
    connectRedis
};
