const express = require('express');
const { saveUserData } = require('../controllers/auth');

const router = express.Router();

// Route to save user data
router.post('/register', saveUserData);

module.exports = router;
