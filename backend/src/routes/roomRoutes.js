const express = require('express');
const { createRoom, joinRoom, getRoom } = require('../controllers/roomController');
const { createRoomLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.post('/create', createRoomLimiter, createRoom);
router.post('/join', joinRoom);
router.get('/:code', getRoom);

module.exports = router;
