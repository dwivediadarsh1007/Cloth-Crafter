const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const upload = require('../middleware/multerConfig.js'); // for image upload

router.post('/profile', userController.getProfile);
router.post('/profile/upload_image', upload.single('profile_image'), userController.uploadImage);
router.get('/profile/image/:email', userController.getImage);

module.exports = router;
