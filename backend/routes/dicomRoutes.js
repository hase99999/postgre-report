import express from 'express';
import multer from 'multer';
import { getDicoms, getDicomById, importDicom } from '../controllers/dicomController.js';

const router = express.Router();

// Multerの設定（メモリストレージを使用）
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

// POST /api/dicom/import
router.post('/import', upload.single('dicomFile'), importDicom);

// GET /api/dicom?page=1
router.get('/', getDicoms);

// GET /api/dicom/:id
router.get('/:id', getDicomById);

export default router;