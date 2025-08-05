const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');

router.post('/post', vacancyController.postVacancy);
router.get('/all', vacancyController.getAllVacancies);
router.delete('/delete/:Vacancy_id', vacancyController.deleteVacancy);
router.post('/apply', vacancyController.applyForVacancy);
router.get('/applications', vacancyController.getAllApplications);
router.get('/applications/:email', vacancyController.getApplicationsByEmail);
router.put('/applications/status', vacancyController.updateApplicationStatus);

module.exports = router;
