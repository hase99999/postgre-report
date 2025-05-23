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
import dicomRoutes from './routes/dicomRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
const prisma = new PrismaClient();

// CORS設定
const corsOptions = {
  origin: ['http://localhost:3000', 'http://192.168.11.5:3000'], // 複数のオリジンを許可
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '200mb' })); // JSONボディのパースとサイズ制限
app.use(express.urlencoded({ limit: '200mb', extended: true })); // URLエンコードされたボディのパースとサイズ制限

// 静的ファイルの提供
app.use(express.static(path.resolve('public'))); // pathを定義

// ルートの登録
app.use('/api/import', importRoutes);
app.use('/api/teachingFiles', teachingFilesRoutes);
app.use('/api/fetchAndSaveData', fetchAndSaveDataRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/ptinfos', ptinfoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/dicom', dicomRoutes);
app.use('/api/auth', authRoutes);


// エラーハンドリングミドルウェアの追加（上記server.jsの例参照）
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'リクエストボディが大きすぎます。' });
  }
  console.error(err); // サーバー側の詳細なログ
  res.status(500).json({ message: '内部サーバーエラーが発生しました。' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しています`);
});