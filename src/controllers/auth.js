const db = require('../db/connection');

const saveUserData = (req, res) => {
  const { name, email, dob, gender, number, password, confirmPassword } = req.body;

  // Validation
  if (!name || !email || !dob || !gender || !number || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  // SQL query to insert data
  const sql = 'INSERT INTO users (name, email, dob, gender, number, password) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [name, email, dob, gender, number, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error saving user:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    res.status(200).json({ message: 'User saved successfully!', userId: result.insertId });
  });
};

module.exports = {
  saveUserData,
};
