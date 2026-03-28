const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redisConfig = require('../config/redis');
const socketAuthMiddleware = require('./socketMiddleware');
const setupSocketEvents = require('./socketEvents');
const { CLIENT_URL } = require('../config/env');
const logger = require('../utils/logger');

const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Redis adapter for horizontal scaling
    if (redisConfig.redisClient) {
        const subClient = redisConfig.redisClient.duplicate();
        Promise.all([subClient.connect()]).then(() => {
            io.adapter(createAdapter(redisConfig.redisClient, subClient));
            logger.info('Socket.IO Redis adapter initialized');
        }).catch(err => {
            logger.warn('Failed to initialize Socket.IO Redis adapter', err);
        });
    } else {
        logger.warn('Running without Socket.IO Redis adapter');
    }

    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id} (User: ${socket.user.username})`);

        setupSocketEvents(io, socket);
    });

    return io;
};

module.exports = initializeSocket;
