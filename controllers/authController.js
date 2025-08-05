const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db.js');


exports.register =  async (req, res) => {
    const { username, email, phone_number, password, user_type, address } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const result = await query(
            'INSERT INTO users (username, email, phone_number, password, user_type, address) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, phone_number, hashedPassword, user_type, address]
        );

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Get user from the database
        const results = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Create JWT token
        const token = jwt.sign({ email: user.email, user_type: user.user_type }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

