const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');  // To read the CA certificate


require('dotenv').config();


const app = express();
app.use(express.json());

// Configure the storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Initialize Multer with the storage configuration
const upload = multer({ storage: storage });

// Database connection to TiDB Cloud
const pool = mysql.createPool({
    host: process.env.DB_HOST,  // TiDB Host
    port: 4000,  // TiDB Port
    user: process.env.DB_USER,  // TiDB Username
    password: process.env.DB_PASSWORD,  // TiDB Password
    database: process.env.DB_NAME,  // Database name
    ssl: {
        ca: fs.readFileSync(process.env.SSL_CA_CERT) // Path to your CA certificate
    },
    connectionLimit: 10,  // Adjust the connection limit as per your need
});

// Helper function to execute SQL queries
const query = (sql, params) => new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
    });
});

// Test the TiDB Cloud connection
pool.getConnection((err, connection) => {
    if (err) {
        console.log("CA Loaded:", fs.existsSync(process.env.SSL_CA_CERT)); // should return true
        console.error('Error connecting to TiDB Cloud:', err.message);
        return;
    }
    console.log('Connected to TiDB Cloud successfully!');
    connection.release();  // Release the connection back to the pool
});

// Your existing endpoints and Multer setup remain unchanged here...

// User registration endpoint
app.post('/register', async (req, res) => {
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
});

// User login endpoint
app.post('/login', async (req, res) => {
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
});


// Insert or update measurements for a user
app.post('/measurements', async (req, res) => {
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
});
// and so on 
// Get measurements for a user by email
app.get('/measurements/:email', async (req, res) => {
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
});

app.post('/alter_clothes', upload.single('image'), async (req, res) => {
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
});

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static('uploads'));


// post into customize_clothes

// API to upload and save customize_clothes data
app.post('/customize_clothes', upload.single('image'), async (req, res) => {
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
});

// get api for the customize_clothe
app.get('/customize_clothes/:email', async (req, res) => {
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
});

// DELETE API to remove alter_clothes records by email
app.delete('/alter_clothes/:email', async (req, res) => {
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
});


// DELETE API to remove customize_clothes records by email
app.delete('/customize_clothes/:email', async (req, res) => {
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
});


//get api for alter_clothes

app.get('/alter_clothes/:email', async (req, res) => {
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
}); 

    // Get user details for the profile page using email (without JWT)
    app.post('/profile', async (req, res) => {
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
        }
    });



    // API to upload/update user profile image
    app.post('/profile/upload_image', upload.single('profile_image'), async (req, res) => {
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
    });

    // Get user profile image by email
    app.get('/profile/image/:email', async (req, res) => {
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
    });

// Get all fabric data
app.get('/fabric', async (req, res) => {
    try {
        // Fetch all fabric data from the database
        const results = await query('SELECT * FROM fabric');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all product data
app.get('/products', async (req, res) => {
    try {
        // Fetch all product data from the database
        const results = await query('SELECT * FROM Products');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific fabric by ID
app.get('/fabric/:fabric_id', async (req, res) => {
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
});


// Get a specific product by ID
app.get('/products/:product_id', async (req, res) => {
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
});
// ///
app.post('/cart/add', async (req, res) => {
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
});

app.get('/cart/:email', async (req, res) => {
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
});

// Endpoint to clear the cart for a specific user
app.delete('/cart/clear/:email', async (req, res) => {
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
});




// api to fetch fabrics from cart
app.get('/cart/product-null/:email', async (req, res) => {
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
});

// api to fetch dresses from cart
app.get('/cart/fabric-null/:email', async (req, res) => {
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
});




//posting vacancies
app.post('/vacancy/post', async (req, res) => {
    const { email, working_hours, salary_offered } = req.body;

    try {
        // Trim the email to avoid extra spaces
        const trimmedEmail = email.trim();

        // Fetch user's phone_number and address from users table using email
        const user = await query('SELECT phone_number, address FROM users WHERE email = ?', [trimmedEmail]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Destructure phone_number and address from user result
        const { phone_number, address } = user[0];

        // Insert the vacancy into the Vacancy table
        await query(
            'INSERT INTO Vacancy (email, phone_number, address, salary_offered, working_hours) VALUES (?, ?, ?, ?, ?)',
            [trimmedEmail, phone_number, address, salary_offered, working_hours]
        );

        res.status(201).json({ message: 'Vacancy posted successfully!' });
    } catch (error) {
        console.error('Error in /vacancy/post:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch all vacancies
app.get('/vacancy/all', async (req, res) => {
    try {
        // Fetch all vacancies from the Vacancy table
        const vacancies = await query('SELECT * FROM vacancy');

        // Check if there are any vacancies
        if (vacancies.length === 0) {
            return res.status(404).json({ message: 'No vacancies available' });
        }

        // Respond with the list of vacancies
        res.status(200).json({ vacancies });
    } catch (error) {
        console.error('Error in /vacancy/all:', error);
        res.status(500).json({ error: error.message });
    }
});


//  applying for the vacancy 
app.post('/application/apply', async (req, res) => {
    const { email, Vacancy_id } = req.body;

    try {
        const trimmedEmail = email.trim();

        // Fetch user's name, phone_number, and address from users table using email
        const user = await query('SELECT username, phone_number, address FROM users WHERE email = ?', [trimmedEmail]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        app.get('/cart/:email', async (req, res) => {
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
        });


        app.get('/cart/:email', async (req, res) => {
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
        });




        // Check if the vacancy exists
        const vacancy = await query('SELECT * FROM Vacancy WHERE Vacancy_id = ?', [Vacancy_id]);
        if (vacancy.length === 0) {
            return res.status(404).json({ message: 'Vacancy not found' });
        }

        const { username, phone_number, address } = user[0];

        // Insert the application into the Applications table
        await query(
            'INSERT INTO Applications (name, phone_number, Vacancy_id, email, address, status) VALUES (?, ?, ?, ?, ?, ?)',
            [username, phone_number, Vacancy_id, trimmedEmail, address, 'In Review']
        );

        res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (error) {
        console.error('Error in /application/apply:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch all applications
app.get('/applications', async (req, res) => {
    try {
        // Fetch all records from the Applications table
        const applications = await query(`
            SELECT 
                A.name, 
                A.phone_number, 
                A.Vacancy_id, 
                A.email, 
                A.address, 
                A.status, 
                V.Vacancy_id 
            FROM 
                Applications A 
            JOIN 
                Vacancy V 
            ON 
                A.Vacancy_id = V.Vacancy_id;
        `);

        if (applications.length === 0) {
            return res.status(404).json({ message: 'No applications found' });
        }

        // Respond with the fetched applications
        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

// Fetch all applications for a specific email
app.get('/applications/:email', async (req, res) => {
    const { email } = req.params;

    try {
        // Query to fetch applications by email
        const applications = await query(`
            SELECT 
                A.name, 
                A.phone_number, 
                A.Vacancy_id, 
                A.email, 
                A.address, 
                A.status 
            FROM 
                Applications A 
            WHERE 
                A.email = ?;
        `, [email]);

        if (applications.length === 0) {
            return res.status(404).json({ message: 'No applications found for this email' });
        }

        // Respond with the fetched applications
        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});


// Change the status of an application
app.put('/applications/status', async (req, res) => {
    const { Vacancy_id, email, status } = req.body;

    // Check if status is valid
    const validStatuses = ['Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Status must be either Accepted or Rejected' });
    }

    try {
        // Update the status of the application in the Applications table
        const result = await query(`
            UPDATE Applications 
            SET status = ? 
            WHERE Vacancy_id = ? AND email = ?
        `, [status, Vacancy_id, email]);

        // Check if any row was affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Application not found or already updated' });
        }

        res.status(200).json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Error updating application status', error: error.message });
    }
});

// Delete a vacancy by Vacancy_id
app.delete('/vacancy/delete/:Vacancy_id', async (req, res) => {
    const { Vacancy_id } = req.params;

    try {
        // Delete the vacancy from the Vacancy table
        const result = await query('DELETE FROM Vacancy WHERE Vacancy_id = ?', [Vacancy_id]);

        // Check if any rows were affected (i.e., the vacancy was found and deleted)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vacancy not found or already deleted' });
        }

        res.status(200).json({ message: 'Vacancy deleted successfully' });
    } catch (error) {
        console.error('Error deleting vacancy:', error);
        res.status(500).json({ message: 'Error deleting vacancy', error: error.message });
    }
});

app.get('/ping', (req, res) => {
    res.send('Server is running and responding!');
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


