// Get all fabric data
exports.getAllFabrics = async (req, res) => {
    try {
        // Fetch all fabric data from the database
        const results = await query('SELECT * FROM fabric');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all product data
exports.getAllProducts =  async (req, res) => {
    try {
        // Fetch all product data from the database
        const results = await query('SELECT * FROM Products');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific fabric by ID
exports.getFabricById = async (req, res) => {
    const { fabric_id } = req.params;

    try {
        // Fetch the specific fabric data from the database
        const results = await query('SELECT * FROM fabric WHERE fabric_id = ?', [fabric_id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Fabric not found' });
        }

        res.json(results[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific product by ID
exports.getProductById = async (req, res) => {
    const { product_id } = req.params;

    try {
        // Fetch the specific product data from the database
        const results = await query('SELECT * FROM Products WHERE product_id = ?', [product_id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(results[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};