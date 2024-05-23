const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.defaultLogin);
router.get('/google', authController.googleLogin);

module.exports = router;
