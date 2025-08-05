// // Serve static files from the 'uploads' folder
// app.use('/uploads', express.static('uploads'));


// API to upload and save customize_clothes data
exports.addClothData = async (req, res) => {
    const { email, category, design_inspiration } = req.body;
    const imagePath = req.file ? req.file.path : null; // Path to the uploaded image

    try {
        // Insert the data into the customize_clothes table
        const result = await query(
            'INSERT INTO customize_clothes (email, category, design_inspiration, image_path) VALUES (?, ?, ?, ?)',
            [email, category, design_inspiration, imagePath]
        );

        res.status(201).json({ message: 'Customization added successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get api for the customize_clothe
exports.getClothByEmail =  async (req, res) => {
    const { email } = req.params;

    try {
        // Fetch the customization data for the given email
        const results = await query('SELECT * FROM customize_clothes WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No customizations found for this user.' });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//delete customize clothes
exports.deleteClothByEmail =  async (req, res) => {
    const { email } = req.params;

    try {
        // Check if the record exists for the given email
        const result = await query('SELECT * FROM customize_clothes WHERE email = ?', [email]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No customization records found for this user.' });
        }

        // Delete the records from the customize_clothes table
        await query('DELETE FROM customize_clothes WHERE email = ?', [email]);

        res.status(200).json({ message: 'Customization records deleted successfully.' });
    } catch (error) {
        console.error('Error occurred while deleting customization records:', error);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }   
};