const express = require('express');
const router = express.Router();
const alterationController = require('../controllers/alterationController');
const upload = require('../middleware/multerConfig');

router.post('/', upload.single('image'), alterationController.addAlterationClothes);
router.get('/:email', alterationController.getAlterationClothesByEmail);
router.delete('/:email', alterationController.deleteAlterationClothesByEmail);

module.exports = router;
