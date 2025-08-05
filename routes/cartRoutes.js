const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController.js');

router.post('/add', cartController.addToCart);
router.get('/:email', cartController.getCart);
router.delete('/clear/:email', cartController.clearCart);
router.get('/product-null/:email', cartController.getFabricsOnly);
router.get('/fabric-null/:email', cartController.getProductsOnly);

module.exports = router;
