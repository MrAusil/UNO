const express = require('express');
const { loginAnonymously } = require('../controllers/authController');
const router = express.Router();

router.post('/login', loginAnonymously);

module.exports = router;
