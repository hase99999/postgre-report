import './utils/logger.js'; // これを最初にインポートして、他のログがキャプチャされるようにする
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import multer from 'multer'; // Multerのエラーハンドリング用に追加

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

// multerエラー専用のハンドリング
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multerエラーの詳細:', err);
    return res.status(400).json({ 
      error: `ファイルアップロードエラー: ${err.message}`,
      code: err.code
    });
  }
  next(err);
});

// 一般的なエラーハンドリング
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    console.error('ペイロードが大きすぎます:', err);
    return res.status(413).json({ message: 'リクエストボディが大きすぎます。' });
  }
  
  console.error('予期しないエラー:', err);
  if (err.stack) {
    console.error('スタックトレース:', err.stack);
  }
  
  res.status(500).json({ message: '内部サーバーエラーが発生しました。' });
});

const PORT = 3001;

// サーバーのタイムアウト設定を調整
const server = app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しています`);
});

// タイムアウト設定を増やす（5分=300000ミリ秒）
server.timeout = 300000;

// 未処理のプロミス拒否と例外をキャッチ
process.on('uncaughtException', (err) => {
  console.error('キャッチされない例外:', err);
  // サーバーを正常にシャットダウン
  server.close(() => {
    console.log('サーバーをシャットダウンしました。');
    process.exit(1);
  });
  
  // タイムアウトが発生した場合、強制終了
  setTimeout(() => {
    console.error('グレースフルシャットダウンがタイムアウトしました。強制終了します。');
    process.exit(1);
  }, 5000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のプロミス拒否:', reason);
});