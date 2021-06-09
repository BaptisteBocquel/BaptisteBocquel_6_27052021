const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// CREATE SAUCE
router.post('/',auth, multer, sauceCtrl.createSauce);

// MODIFY SAUCE
router.put('/:id',auth, multer, sauceCtrl.modifySauce);

//DELETE SAUCE
router.delete('/:id',auth, sauceCtrl.deleteSauce);

// GET ONE SAUCE
router.get('/:id',auth, sauceCtrl.getOneSauce);

// GET ALL SAUCE
router.get('/',auth, sauceCtrl.getAllSauce);

// LIKE OR DISLIKE SAUCE
router.post('/:id/like', auth, sauceCtrl.likeDislikeSauce);

// EXPORTS FOR USE IN APP
module.exports = router;