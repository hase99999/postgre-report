import dotenv from 'dotenv';
dotenv.config(); // 追加

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import fs from 'fs';
import multer from 'multer';
import xml2js from 'xml2js';
import { PrismaClient } from '@prisma/client';
import doctorRoutes from './backend/routes/doctorRoutes.js';
import ptinfoRoutes from './backend/routes/ptinfoRoutes.js';
import reportRoutes from './backend/routes/reportRoutes.js';
import scheduleRoutes from './backend/routes/scheduleRoutes.js';
import importRoutes from './backend/routes/importRoutes.js';
import authRoutes from './backend/routes/authRoutes.js';
import authMiddleware from './backend/middleware/authMiddleware.js';
import apiRoutes from './backend/routes/api.js'; // 追加

const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

const app = express();

// __dirnameの代わりにimport.meta.urlを使用
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// フロントエンドの静的ファイルを提供
app.use(express.static(path.join(__dirname, 'public')));

// ルートの設定
app.use('/api', apiRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/ptinfos', ptinfoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/import', importRoutes);
app.use('/api/auth', authRoutes);

// 認証が必要なエンドポイントにミドルウェアを適用
app.use('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// その他のリクエストはフロントエンドのindex.htmlを返す
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});