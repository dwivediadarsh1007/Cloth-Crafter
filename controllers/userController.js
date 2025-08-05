 // Get user details for the profile page using email (without JWT)
exports.getProfile =async (req, res) => {
        const { email } = req.body;  // Extract email from the request body

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        try {
            // Fetch the user details from the database
            const results = await query(
                'SELECT username, email, phone_number, address, user_type FROM users WHERE email = ?',
                [email]
            );

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Return the user's details
            const userProfile = results[0];
            res.json(userProfile);
        } catch (error) {
            res.status(500).json({ error: error.message });
}};

 // API to upload/update user profile image
exports.uploadImage = async (req, res) => {
        const { email } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        try {
            // Check if the user exists
            const user = await query('SELECT * FROM users WHERE email = ?', [email]);
            if (user.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Save the file path in the database
            const imagePath = req.file ? req.file.path : null;

            // Update the user's profile image URL in the database
            await query('UPDATE users SET profile_image_url = ? WHERE email = ?', [imagePath, email]);

            res.status(200).json({ message: 'Profile image updated successfully!', imagePath });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
};

// Get user profile image by email
exports.getImage = async (req, res) => {
        const { email } = req.params;

        try {
            const results = await query('SELECT profile_image_url FROM users WHERE email = ?', [email]);

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found or no profile image available.' });
            }

            const profileImageUrl = results[0].profile_image_url;
            res.json({ profileImageUrl });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
};
