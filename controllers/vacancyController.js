//posting vacancies
exports.postVacancy = async (req, res) => {
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
};

// Fetch all vacancies
exports.getAllVacancies = async (req, res) => {
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
};

//  applying for the vacancy 
exports.applyForVacancy = async (req, res) => {
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
};

// Fetch all applications
exports.getAllApplications = async (req, res) => {
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
};

// Fetch all applications for a specific email
exports.getApplicationsByEmail = async (req, res) => {
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
};


// Change the status of an application
exports.updateApplicationStatus = async (req, res) => {
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
};

// Delete a vacancy by Vacancy_id
exports.deleteVacancy = async (req, res) => {
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
};
