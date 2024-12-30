// filepath: /Users/dj/Documents/JAVAscript/postgre-sql/backend/index.js
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; // Prismaクライアントのインポート

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// CORSの設定（必要に応じて設定）
app.use(cors());

// ミドルウェアの設定
app.use(express.json({ limit: '10mb' })); // ペイロードサイズを10MBに設定
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 認証ルートの設定
app.use('/api/auth', authRoutes);

// 保護されたルートの例
app.get('/api/doctors', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const doctors = await prisma.doctor.findMany({
      take: limit,
      skip: (page - 1) * limit,
    });
    console.log('Fetched doctors from DB:', doctors);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// その他のルートやミドルウェア

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});