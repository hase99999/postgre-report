import express from 'express';
import multer from 'multer';
import { importTeachingFiles } from '../controllers/teachingFileController.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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

// ファイルインポートのルート
router.post('/import', upload.single('file'), importTeachingFiles);

// GET /api/teachingFiles - ページネーション対応でTeachingFileを取得
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [teachingFiles, total] = await Promise.all([
      prisma.teachingFile.findMany({
        skip: skip,
        take: limit,
      }),
      prisma.teachingFile.count(),
    ]);

    res.json({
      data: teachingFiles,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error('Error fetching teaching files:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/teachingFiles/:id - 指定IDのTeachingFileを取得
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const teachingFile = await prisma.teachingFile.findUnique({
      where: { id: parseInt(id, 10) }, // IDが整数の場合
    });

    if (!teachingFile) {
      return res.status(404).json({ error: 'TeachingFile not found' });
    }

    res.json(teachingFile);
  } catch (error) {
    console.error('Error fetching teaching file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;