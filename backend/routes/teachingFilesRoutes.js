// filepath: /Users/dj/Documents/JAVAscript/postgre-sql/backend/routes/teachingFilesRoutes.js
import express from 'express';
import multer from 'multer';
import { importTeachingFiles } from '../controllers/teachingFileController.js';

const router = express.Router();

// Multerのメモリストレージ設定
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/json', 'text/csv', 'application/xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON, CSV, and XML are allowed.'));
    }
  },
});

router.post('/import', upload.single('file'), importTeachingFiles);

export default router;