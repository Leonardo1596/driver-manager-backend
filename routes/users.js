const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.post('/auth/sign-up', UserController.register);
router.post('/auth/sign-in', UserController.login);
router.put('/updated/user/:userId', UserController.updateUser);
router.get('/get/user/:userId', UserController.getUser);

module.exports = router;