const express = require('express');
const { saveUserData, loginUser , getProfile  , updateProfile} = require('../controllers/auth');
const {savePostData , upload , getPosts , getMyPosts, likePost, addComment, getComments} = require('../controllers/post');


const router = express.Router();

// Route to save user data
router.post('/register',  saveUserData);
router.post('/login',  loginUser);
router.patch('/update' , updateProfile);
router.get('/profile',  getProfile);
router.get('/getPosts',  getPosts);
router.get('/getMyPosts',  getMyPosts);
router.post('/createPost',  upload.single("file") ,  savePostData);
router.post('/likePost',    likePost);
router.post('/addComment',    addComment);
router.get('/comments' , getComments)

module.exports = router;
