//add items to cart
exports.addToCart = async (req, res) => {
    const { email, fabric_id, product_id, quantity } = req.body;

    console.log('Received data:', { email, fabric_id, product_id, quantity });

    try {
        // Trim and log email
        const trimmedEmail = email.trim();
        console.log('Checking user with email:', trimmedEmail);

        // Check if the email is valid
        const user = await query('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if fabric_id or product_id is provided
        if (!fabric_id && !product_id) {
            return res.status(400).json({ message: 'Either fabric_id or product_id must be provided' });
        }

        // If fabric_id is provided, update the email in the fabric table
        if (fabric_id) {
            await query('UPDATE fabric SET email = ? WHERE fabric_id = ?', [trimmedEmail, fabric_id]);
        }

        // If product_id is provided, update the email in the products table
        if (product_id) {
            await query('UPDATE Products SET email = ? WHERE product_id = ?', [trimmedEmail, product_id]);
        }

        // Check if the item already exists in the cart
        const existingItem = await query(
            'SELECT * FROM cart WHERE email = ? AND (fabric_id = ? OR product_id = ?)',
            [trimmedEmail, fabric_id, product_id]
        );

        if (existingItem.length > 0) {
            // Update the quantity if the item already exists
            await query(
                'UPDATE cart SET quantity = ? WHERE email = ? AND (fabric_id = ? OR product_id = ?)',
                [quantity, trimmedEmail, fabric_id, product_id]
            );
            console.log(`Updated quantity for existing item in cart for ${trimmedEmail}`);
        } else {
            // Insert the new item into the cart
            await query(
                'INSERT INTO cart (email, fabric_id, product_id, quantity) VALUES (?, ?, ?, ?)',
                [trimmedEmail, fabric_id, product_id, quantity]
            );
            console.log(`Inserted new item into cart for ${trimmedEmail}`);
        }

        res.status(201).json({ message: 'Item added to cart and database updated successfully!' });
    } catch (error) {
        console.error('Error in /cart/add:', error); // Log error details
        res.status(500).json({ error: error.message });
    }
};

//get cart by email
exports.getCart = async (req, res) => {
    const { email } = req.params;

    try {
        // Query to fetch the cart details by email
        const cartItems = await query('SELECT fabric_id, product_id, quantity FROM cart WHERE email = ?', [email]);

        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'No items found in the cart for this email' });
        }

        res.status(200).json(cartItems);
    } catch (error) {
        console.error('Error fetching cart details:', error);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to clear the cart for a specific user
exports.clearCart =  async (req, res) => {
    const email = req.params.email.trim();

    console.log('Clearing cart for user with email:', email);

    try {
        // Check if the user exists
        const user = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all items in the cart for the user
        await query('DELETE FROM cart WHERE email = ?', [email]);
        console.log(`Cleared cart for ${email}`);

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error in /cart/clear:', error); // Log error details
        res.status(500).json({ error: error.message });
    }
};

// api to fetch fabrics from cart
exports.getFabricsOnly =  async (req, res) => {
    const { email } = req.params;

    try {
        const results = await query(
            'SELECT * FROM cart WHERE email = ? AND product_id IS NULL',
            [email]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'No items found with product_id NULL for this email.' });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching cart items with product_id NULL:', error);
        res.status(500).json({ error: error.message });
    }
};

// api to fetch dresses from cart
exports.getProductsOnly = async (req, res) => {
    const { email } = req.params;

    try {
        const results = await query(
            'SELECT * FROM cart WHERE email = ? AND fabric_id IS NULL',
            [email]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'No items found with fabric_id NULL for this email.' });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching cart items with fabric_id NULL:', error);
        res.status(500).json({ error: error.message });
    }
};
