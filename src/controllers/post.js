const db = require('../db/connection');
const bcrypt = require('bcrypt'); // Import bcrypt for hashing passwords
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const useragent = require('useragent');
const multer = require("multer");
const express = require("express");
const path = require('path');
const fs = require('fs');
  
  
// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create the directory if it doesn't exist
}

// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // File naming convention
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 10MB
});

// Set up Multer for file upload

const savePostData = (req, res) => {
    console.log("Request Body:", req.body);
    console.log("File Information:", req.file);
  
    // Destructure the data from the request body
    const { text, userId, filetype } = req.body;
    const filePath = req.file ? `http://localhost:4000/uploads/${req.file.filename}` : null; // Corrected
  
    // Validation to ensure all fields are provided
    if (!text || !filePath || !filetype || !userId) {
      return res.status(400).json({ error: "All fields are required." });
    }
  
    // SQL Query to save post data into the database
    const sql = "INSERT INTO post (text, file, filetype, userId) VALUES (?, ?, ?, ?)";
    const values = [text, filePath, filetype, userId];
    console.log(filePath);
  
    // Database query to insert the post into the database
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ error: "Database error." });
      }
  
      console.log("Post saved successfully to the database.");
      // Return success response with post ID
      res.status(200).json({ message: "Post saved successfully!", postId: result.insertId });
    });
  };
  
const getPosts = (req, res) => {
    // SQL query to get all posts and join with user table based on userId
    const sql = `
      SELECT 
        post.id AS postId,
        post.text,
        post.file,
        post.filetype,
        post.userId,
        post.date,
        users.name,
        users.email
      FROM post
      JOIN users ON post.userId = users.id`;  // Assuming "userId" is the foreign key in post table
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ error: "Database error." });
      }
  
      // Map through the results to include the file URL for each post
      const posts = results.map(post => {
        const fileUrl = post.file;
  console.log(fileUrl);
        return {
          postId: post.postId,
          content: post.text,
          media: fileUrl,  // If file exists, return the file URL
          filetype: post.filetype,
          userId: post.userId,
          user: post.name,  // Include user data
          email: post.email  ,
          date : post.date       // Include user email (or any other data)
        };
      });
  
      res.status(200).json({ posts });
    });
  };


  const getMyPosts = (req, res) => {
    // Assuming `userId` is passed as a query parameter or from the request body
    const { userId } = req.query;  // Use `req.query` if the userId is passed as a query param
  
    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }
  
    // SQL query to get posts for the specific user based on userId
    const sql = `
      SELECT 
        post.id AS postId,
        post.text,
        post.file,
        post.filetype,
        post.userId,
        users.name AS username,
        users.email AS userEmail,
        post.date
      FROM post
      JOIN users ON post.userId = users.id
      WHERE post.userId = ?`;  // Filtering posts by the given userId
  
    // Run the query
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ error: "Database error." });
      }
  
      // Map through the results to include the file URL for each post
      const posts = results.map(post => {
        const fileUrl = post.file ? `http://localhost:4000/uploads/${path.basename(post.file)}` : null;
  
        return {
          postId: post.postId,
          content: post.text,
          media: fileUrl,  // If file exists, return the file URL
          filetype: post.filetype,
          userId: post.userId,
          user: post.username,  // Include user data (user name)
          email: post.userEmail, // Include user email
          date: post.date // Include date
        };
      });
  
      // Return the posts for the specific user
      res.status(200).json({ posts });
    });
  };
  

  module.exports = {
    savePostData,
    upload,
    getPosts,
    getMyPosts
  };
  