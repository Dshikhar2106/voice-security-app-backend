const db = require('../db/connection');
const bcrypt = require('bcrypt'); // Import bcrypt for hashing passwords
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const useragent = require('useragent');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: "game.guys.1432@gmail.com", // Your Gmail address
      pass: "xerarbfdwtxrmyff",         // Your Gmail app password
    },
  });


const saveUserData = async (req, res) => {
  console.log(req.body);
  const { name, email, dob, gender, number, password, confirmPassword } = req.body;

  // Validation
  if (!name || !email || !dob || !gender || !number || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
    const generateRandomNumber = () => {
        return Math.floor(100000 + Math.random() * 900000); 
      };
      
      const randomNumber = generateRandomNumber();
     console.log(randomNumber);
    // SQL query to insert data
    const sql =
      'INSERT INTO users (name, email, dob, gender, number, image, password, bio , pPin) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)';
    const values = [name, email, dob, gender, number, '', hashedPassword, '' , randomNumber];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error saving user:', err);
        return res.status(500).json({ error: 'Database error.' });
      }
      const mailOptions = {
        from: 'game.guys.1432@gmail.com', // Sender address
        to: email,                   // Receiver email(s)
        subject: "Congrats! You are succesfully registered",         // Subject line
        text: `Your Security pin is ${randomNumber} , keep remeember this pin you need thi for various steps`,      // Plain text body

      };
      
      // Step 3: Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log("Error while sending email:", error);
        }
        console.log("Email sent successfully:", info.response);
      });
      res.status(200).json({ message: 'User saved successfully!', userId: result.insertId });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Server error while saving user data.' });
  }
};


const loginUser = (req, res) => {
    const { email, password } = req.body;
  
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
  
    // SQL query to find user by email
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error.' });
      }
  
      // Check if user exists
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      const user = results[0]; // First user result
  
      // Compare the provided password with the hashed password in the database
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ error: 'Server error.' });
        }
  
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid credentials.' });
        }
  
        // Generate a JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email }, // Payload
          '1234567890', // Secret key
          { expiresIn: '8h' } // Token expiration time
        );
  
        // Get device and browser info
        const agent = useragent.parse(req.headers['user-agent']);
        const browserInfo = `${agent.family} ${agent.major}`;
        const osInfo = `${agent.os.family} ${agent.os.major}`;
        const deviceInfo = `${agent.device.family || 'Unknown Device'}`;
        const loginTime = new Date().toLocaleString();
  
        // Send email to user
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: 'game.guys.1432@gmail.com',
            pass: 'xerarbfdwtxrmyff', // Use environment variables for security
          },
        });
  
        const mailOptions = {
          from: 'game.guys.1432@gmail.com',
          to: email,
          subject: 'Login Notification',
          html: `
            <h3>Login Alert</h3>
            <p>Hello ${user.name},</p>
            <p>You have successfully logged in to your account. Here are the details:</p>
            <ul>
              <li><strong>Login Time:</strong> ${loginTime}</li>
              <li><strong>Browser:</strong> ${browserInfo}</li>
              <li><strong>Operating System:</strong> ${osInfo}</li>
              <li><strong>Device:</strong> ${deviceInfo}</li>
            </ul>
            <p>If this wasn't you, please reset your password immediately.</p>
          `,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send login email.' });
          }
  
          console.log('Email sent:', info.response);
          // Respond with the token and user details
          res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              pin: user.pPin,
            },
          });
        });
      });
    });
  };



// Get profile information of the currently logged-in user
const getProfile = (req, res) => {
    // Get the token from request headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ error: 'Authorization required.' });
    }
  
    // Verify the token
    jwt.verify(token, '1234567890', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
 
      // SQL query to get user details from the database
      const sql = 'SELECT * FROM users WHERE id = ?';
      db.query(sql, [decoded.id], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error.' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ error: 'User not found.' });
        }
  
        // Send user profile data
        const user = results[0];
        res.status(200).json({
          message: 'Profile retrieved successfully.',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            dob: user.dob,
            gender: user.gender,
            number: user.number,
            image: user.image,
            pPin : user.pPin
          },
        });
      });
    });
  };


  const updateProfile = (req, res) => {
    console.log(req.body);
    // Get the token from request headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization required.' });
    }
  
    // Verify the token
    jwt.verify(token, '1234567890', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
  
      // Get user ID from decoded token
      const userId = decoded.id;
      
      // Get updated data from the request body
      const { name, email, dob, gender, number, image, pPin } = req.body;
   
      // Create an array to hold the updated fields
      const updatedFields = [];
      const updateValues = [];
      
      if (name) {
        updatedFields.push('name = ?');
        updateValues.push(name);
      }
      if (email) {
        updatedFields.push('email = ?');
        updateValues.push(email);
      }
      if (dob) {
        updatedFields.push('dob = ?');
        updateValues.push(dob);
      }
      if (gender) {
        updatedFields.push('gender = ?');
        updateValues.push(gender);
      }
      if (number) {
        updatedFields.push('number = ?');
        updateValues.push(number);
      }
      if (image) {
        updatedFields.push('image = ?');
        updateValues.push(image);
      }
      if (pPin) {
        updatedFields.push('pPin = ?');
        updateValues.push(pPin);
      }
  
      // Add the user ID to the update values for WHERE condition
      updateValues.push(userId);
  
      // Create the SQL query
      const sql = `UPDATE users SET ${updatedFields.join(', ')} WHERE id = ?`;
  
      // Execute the query to update the user profile
      db.query(sql, updateValues, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error.' });
        }
  
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found or no changes made.' });
        }
  
        // Return success message
        res.status(200).json({
          message: 'Profile updated successfully.',
        });
      });
    });
  };
  

module.exports = {
  saveUserData,
  loginUser,
  getProfile,
  updateProfile
};
