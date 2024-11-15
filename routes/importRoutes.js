const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const importController = require('../controllers/importController');

router.post('/json', importController.importJson);
router.post('/csv', upload.single('file'), importController.importCsv);
router.post('/xml', upload.single('file'), importController.importXml);

module.exports = router;