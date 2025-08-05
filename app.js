const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');  // To read the CA certificate

const app = express();

app.use(express.json());
app.use('/uploads', express.static('uploads'));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/measurements', require('./routes/measurementRoutes'));
app.use('/api/alter_clothes', require('./routes/alterationRoutes'));
app.use('/api/customize_clothes', require('./routes/customizationRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/vacancy', require('./routes/vacancyRoutes'));

module.exports = app;
