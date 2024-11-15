const express = require('express');
const router = express.Router();
const ptinfoController = require('../controllers/ptinfoController');

router.get('/', ptinfoController.getPtinfos);
router.delete('/:id', ptinfoController.deletePtinfo);

module.exports = router;