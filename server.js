const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

// フロントエンドの静的ファイルを提供
app.use(express.static(path.join(__dirname, 'public')));

// APIエンドポイントの設定
app.get('/api/reports', async (req, res) => {
  console.log('Fetching reports...');
  try {
    const reports = await prisma.report.findMany();
    console.log('Fetched reports:', reports);
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/ptinfos', async (req, res) => {
  console.log('Fetching ptinfos...');
  try {
    const ptinfos = await prisma.ptinfo.findMany();
    console.log('Fetched ptinfos:', ptinfos);
    res.json(ptinfos);
  } catch (err) {
    console.error('Error fetching patient information:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/doctors', async (req, res) => {
  console.log('Fetching doctors...');
  try {
    const doctors = await prisma.doctor.findMany();
    console.log('Fetched doctors:', doctors);
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// その他のリクエストはフロントエンドのindex.htmlを返す
app.get('*', (req, res) => {
  console.log('Serving index.html...');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});