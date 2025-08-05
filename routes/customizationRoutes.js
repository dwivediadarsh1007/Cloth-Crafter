const express = require('express');
const router = express.Router();
const customizationController = require('../controllers/customizationController');
const upload = require('../middleware/multerConfig');

router.post('/', upload.single('image'), customizationController.addClothData);
router.get('/:email', customizationController.getClothByEmail);
router.delete('/:email', customizationController.deleteClothByEmail);

module.exports = router;
