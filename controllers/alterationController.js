//submit clothes for alteration
exports.addAlterationClothes =  async (req, res) => {
    const { email, category, description } = req.body;

    try {
        // Check if the user exists
        const user = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save the file path in the database
        const imagePath = req.file ? req.file.path : null;

        // Insert into the alter_clothes table
        await query(
            'INSERT INTO alter_clothes (email, category, image_path, description) VALUES (?, ?, ?, ?)',
            [email, category, imagePath, description]
        );

        res.status(201).json({ message: 'Clothes added for alteration successfully!' });
    } catch (error) {
        console.error('Error occurred while processing alteration request:', error); // Log the error
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
};

// DELETE API to remove alter_clothes records by email
exports.deleteAlterationClothesByEmail = async (req, res) => {
    const { email } = req.params;

    try {
        // Check if the record exists for the given email
        const result = await query('SELECT * FROM alter_clothes WHERE email = ?', [email]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No alteration records found for this user.' });
        }

        // Delete the records from the alter_clothes table
        await query('DELETE FROM alter_clothes WHERE email = ?', [email]);

        res.status(200).json({ message: 'Alteration records deleted successfully.' });
    } catch (error) {
        console.error('Error occurred while deleting alteration records:', error);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
};

//get api for alter_clothes
exports.getAlterationClothesByEmail =  async (req, res) => {
    const { email } = req.params;

    try {
        // Fetch the alteration data for the given email
        const results = await query('SELECT * FROM alter_clothes WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No alterations found for this user.' });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 

