const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../config/env');
const User = require('../models/User');

const loginAnonymously = async (req, res, next) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const playerId = uuidv4();
        const token = jwt.sign({ playerId, username }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ token, playerId, username });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginAnonymously
};
