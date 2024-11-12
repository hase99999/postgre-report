const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const app = express();
const prisma = new PrismaClient();

// PostgreSQLの接続設定
const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

// フロントエンドの静的ファイルを提供
app.use('/static', express.static(path.join(__dirname, 'public')));

// APIエンドポイントの設定
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany();
    console.log('Fetched doctors:', doctors);
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports');
    console.log('Fetched reports:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/ptinfos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ptinfos');
    console.log('Fetched ptinfos:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching patient information:', err);
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