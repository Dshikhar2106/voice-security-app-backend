const express = require('express');
const { saveUserData, loginUser , getProfile  , updateProfile} = require('../controllers/auth');
const {savePostData , upload , getPosts , getMyPosts} = require('../controllers/post');


const router = express.Router();

// Route to save user data
router.post('/register',  saveUserData);
router.post('/login',  loginUser);
router.patch('/update' , updateProfile);
router.get('/profile',  getProfile);
router.get('/getPosts',  getPosts);
router.get('/getMyPosts',  getMyPosts);
router.post('/createPost',  upload.single("file") ,  savePostData);
module.exports = router;
