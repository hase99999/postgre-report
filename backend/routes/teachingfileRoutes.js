// filepath: /Users/dj/Documents/JAVAscript/postgre-sql/backend/routes/teachingFileRoutes.js
import express from 'express';
import { importTeachingFiles } from '../controllers/teachingFileController.js';

const router = express.Router();

// TeachingFileデータのインポートエンドポイント
router.post('/import', importTeachingFiles);

export default router;