const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');  // To read the CA certificate


require('dotenv').config();


const app = express();
app.use(express.json());


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

exports.query = query;
