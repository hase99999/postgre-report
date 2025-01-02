import express from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// 環境変数の設定
dotenv.config();

// authMiddlewareのインポート
import authMiddleware from './middleware/authMiddleware.js';

// ルートモジュールのインポート
import doctorRoutes from './routes/doctorRoutes.js';
import ptinfoRoutes from './routes/ptinfoRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import importRoutes from './routes/importRoutes.js';
import authRoutes from './routes/authRoutes.js';
import fetchAndSaveDataRoutes from './routes/fetchAndSaveDataRoutes.js'; // インポート確認

const app = express();
const prisma = new PrismaClient();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ルートの設定
app.use('/api/fetch-4d-data', fetchAndSaveDataRoutes); // エンドポイントのマッピング
app.use('/api/doctors', authMiddleware, doctorRoutes);
app.use('/api/ptinfos', authMiddleware, ptinfoRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/schedules', authMiddleware, scheduleRoutes);
app.use('/api/import', authMiddleware, importRoutes);
app.use('/api/auth', authRoutes); // 認証ルート

// フロントエンドの静的ファイルを提供
app.use(express.static(path.resolve('public')));

// その他のリクエストはフロントエンドのindex.htmlを返す
app.get('*', (req, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});

// サーバーの起動
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});