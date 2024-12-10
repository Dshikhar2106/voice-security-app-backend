const express = require('express');
const { saveUserData, loginUser , getProfile  , updateProfile} = require('../controllers/auth');

const router = express.Router();

// Route to save user data
router.post('/register',  saveUserData);
router.post('/login',  loginUser);
router.patch('/update' , updateProfile)
router.get('/profile',  getProfile);
module.exports = router;
