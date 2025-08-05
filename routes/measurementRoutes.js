const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');

router.post('/', measurementController.addOrUpdate);
router.get('/:email', measurementController.getMeasurements);

module.exports = router;
