const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');


// CREATE ACCOUNT
router.post('/signup', userCtrl.signup);

//CONNECT TO ACCOUNT
router.post('/login', userCtrl.login);

module.exports = router;