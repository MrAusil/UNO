const http = require('http');
const app = require('./app');
const initializeSocket = require('./socket/socketServer');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { PORT } = require('./config/env');
const logger = require('./utils/logger');

const server = http.createServer(app);

const startServer = async () => {
    try {
        // Database and Redis connections
        await connectDB();
        await connectRedis();

        // Initialize Socket.IO
        initializeSocket(server);

        server.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        logger.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
};

startServer();

// Graceful Shutdown Support
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});
