import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'node:path'; // 追加

import importRoutes from './routes/importRoutes.js';
import teachingFilesRoutes from './routes/teachingFilesRoutes.js';
import fetchAndSaveDataRoutes from './routes/fetchAndSaveDataRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import ptinfoRoutes from './routes/ptinfoRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
const prisma = new PrismaClient();

// CORS設定
const corsOptions = {
  origin: 'http://localhost:3000', // フロントエンドのURL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // JSONボディのパースとサイズ制限
app.use(express.urlencoded({ limit: '50mb', extended: true })); // URLエンコードされたボディのパースとサイズ制限

// 静的ファイルの提供
app.use(express.static(path.resolve('public'))); // pathを定義

// ルートの登録
app.use('/api/import', authMiddleware, importRoutes); // ptinfoのインポート
app.use('/api/teaching-files', authMiddleware, teachingFilesRoutes); // TeachingFileのインポート
app.use('/api/fetch-4d-data', fetchAndSaveDataRoutes); // このルートが認証不要の場合
app.use('/api/doctors', authMiddleware, doctorRoutes);
app.use('/api/ptinfos', authMiddleware, ptinfoRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/schedules', authMiddleware, scheduleRoutes);
app.use('/api/auth', authRoutes); // 認証ルート

// フロントエンドの静的ファイルを提供
app.use(express.static(path.resolve('public')));

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'ファイルサイズが大きすぎます。最大許容量は50MBです。' });
  }
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しています`);
});