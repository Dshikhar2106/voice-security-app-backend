const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./src/routes/index');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Static file serving for uploads inside src folder
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Middleware setup
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(bodyParser.json());

// Enable CORS
const corsOptions = {
  origin: 'http://localhost:3000',  // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Routes
app.use('/api/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
