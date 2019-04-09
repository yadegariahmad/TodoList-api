const { Router } =require('express');
const authController = require('../controllers/auth');

const router = Router();

router.put('/signup', authController.signup);

router.post('/login', authController.login);

module.exports = router;
