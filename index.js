const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const userRoutes = require('./src/routes/index');

require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());

// Enable CORS
// app.use(cors()); // Default configuration allows all origins

// If you want more control, use the following CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE' , 'PATCH'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
app.use(cors(corsOptions));

// Routes
app.use('/api/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
