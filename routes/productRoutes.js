const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/fabric', productController.getAllFabrics);
router.get('/fabric/:fabric_id', productController.getFabricById);
router.get('/products', productController.getAllProducts);
router.get('/products/:product_id', productController.getProductById);

module.exports = router;
