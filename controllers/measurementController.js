
//add or update measurements.
exports.addOrUpdate =  async (req, res) => {
    const { email, chest_size, waist_size, hip_size, height, shoulder_width } = req.body;

    try {
        // Check if the measurements for this user already exist
        const results = await query('SELECT * FROM Measurements WHERE email = ?', [email]);

        if (results.length > 0) {
            // Update the measurements if they already exist
            await query(
                'UPDATE Measurements SET chest_size = ?, waist_size = ?, hip_size = ?, height = ?, shoulder_width = ? WHERE email = ?',
                [chest_size, waist_size, hip_size, height, shoulder_width, email]
            );
            return res.status(200).json({ message: 'Measurements updated successfully!' });
        } else {
            // Insert new measurements if they don't exist
            await query(
                'INSERT INTO Measurements (email, chest_size, waist_size, hip_size, height, shoulder_width) VALUES (?, ?, ?, ?, ?, ?)',
                [email, chest_size, waist_size, hip_size, height, shoulder_width]
            );
            return res.status(201).json({ message: 'Measurements added successfully!' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get measurements for a user by email
exports.getMeasurements = async (req, res) => {
    const { email } = req.params;

    try {
        // Fetch the user's measurements from the database
        const results = await query('SELECT chest_size, waist_size, hip_size, height, shoulder_width FROM Measurements WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Measurements not found for this user.' });
        }

        const measurements = results[0];
        res.json(measurements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
