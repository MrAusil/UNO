const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { CLIENT_URL } = require('./config/env');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/room', roomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// Error Handling
app.use(errorHandler);

module.exports = app;
