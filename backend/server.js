import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import doctorRoutes from './routes/doctorRoutes.js';
import ptinfoRoutes from './routes/ptinfoRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import importRoutes from './routes/importRoutes.js';
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import teachingFileRoutes from './routes/teachingFileRoutes.js';

const prisma = new PrismaClient();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/doctors', doctorRoutes);
app.use('/api/ptinfos', ptinfoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/import', importRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teaching-files', teachingFileRoutes);

app.use('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});