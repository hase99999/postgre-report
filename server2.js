const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 5000;

// CORSを有効にする
app.use(cors());

// JSONボディのパースを有効にする
app.use(express.json());

// サンプルデータ
let reports = [
  { id: 1, name: 'Report 1' },
  { id: 2, name: 'Report 2' },
  { id: 3, name: 'Report 3' },
];

// エンドポイントを定義
app.get('/reports', (req, res) => {
  res.json(reports);
});

app.post('/reports', (req, res) => {
  const newReport = { id: reports.length + 1, name: req.body.name };
  reports.push(newReport);
  res.status(201).json(newReport);
});

app.put('/reports/:id', (req, res) => {
  const report = reports.find(r => r.id === parseInt(req.params.id));
  if (!report) return res.status(404).send('Report not found');
  report.name = req.body.name;
  res.json(report);
});

app.delete('/reports/:id', (req, res) => {
  reports = reports.filter(r => r.id !== parseInt(req.params.id));
  res.status(204).send();
});

// 静的ファイルを提供
app.use(express.static(path.join(__dirname, 'build')));

// すべてのリクエストをindex.htmlにリダイレクト
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});