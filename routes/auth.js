const { Router } = require('express');
// const { body } = require('express-validator/check');
// const User = require('../models/user');
const authController = require('../controllers/auth');

const router = Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

module.exports = router;
