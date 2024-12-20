// routes/fetchAndSaveDataRoutes.js
import express from 'express';
import sql from 'mssql';

const router = express.Router();

// 4Dデータベースの接続設定
const config = {
  user: '46086',
  password: '123123123',
  server: '10.245.45.126',
  port: 19815,
  database: 'Reporting system v14',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    debug: {
      packet: true,
      data: true,
      payload: true,
      token: true,
      log: true,
    },
  },
};

// '/api/fetch-4d-data' エンドポイントの定義
router.get('/', async (req, res) => {
  console.log('Received request at /api/fetch-4d-data');
  try {
    await sql.connect(config);
    console.log('Connected to 4D SQL Server successfully');
    const result = await sql.query`SELECT * FROM ptinfo`;
    console.log('Query executed successfully');
    res.json({
      message: '4Dデータベースへの接続に成功しました。',
      data: result.recordset,
    });
  } catch (err) {
    console.error('Error fetching data from 4D:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await sql.close();
    console.log('Connection closed');
  }
});

export default router;