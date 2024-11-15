const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const xml2js = require('xml2js');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// フロントエンドの静的ファイルを提供
app.use(express.static(path.join(__dirname, 'public')));

// ルートのインポート
const doctorRoutes = require('./routes/doctorRoutes');
const ptinfoRoutes = require('./routes/ptinfoRoutes');
const reportRoutes = require('./routes/reportRoutes');
const importRoutes = require('./routes/importRoutes');

// ルートの設定
app.use('/api/doctors', doctorRoutes);
app.use('/api/ptinfos', ptinfoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/import', importRoutes);

// 特定のレポートを取得するエンドポイント
app.get('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
    });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// レポートを削除するエンドポイント
app.delete('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.report.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// XML形式のデータをインポートするAPI
app.post('/api/import/report/xml', upload.single('file'), async (req, res) => {
  try {
    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xmlData, async (err, result) => {
      if (err) {
        console.error('Error parsing XML data:', err);
        return res.status(500).json({ error: 'Error parsing XML data' });
      }

      console.log(result); // パース結果を確認
      const reports = result.Root.Reports; // XMLの構造に応じて調整
      if (!reports) {
        console.error('No reports found in XML data');
        return res.status(400).json({ error: 'No reports found in XML data' });
      }

      const batchSize = 1000; // バッチサイズを設定
      for (let i = 0; i < reports.length; i += batchSize) {
        const batch = reports.slice(i, i + batchSize);
        try {
          await prisma.report.createMany({
            data: batch.map(report => ({
              examdate: report.examdate && report.examdate !== "0000-00-00T00:00:00Z" ? new Date(report.examdate) : null,
              ptnumber: parseInt(report.ptnumber), // ここでparseIntを使用してInt型に変換
              modality: report.modality,
              docor: report.docor,
              department: report.department,
              clinicaldiag: report.clinicaldiag,
              imagediag: report.imagediag,
              report: report.report,
              finaldiag: report.finaldiag,
              interesting: report.interesting || '', // デフォルト値を設定
              inputby: report.inputby,
              inputdate: report.inputdate && report.inputdate !== "0000-00-00T00:00:00Z" ? new Date(report.inputdate) : null,
              site: report.site,
              inputtime: report.inputtime && !isNaN(Date.parse(report.inputtime)) ? new Date(report.inputtime) : new Date("2000-01-01T00:00:00Z"), // 無効な日付の場合は特定の日時を設定
              examdetail: report.examdetail,
              dicomid: parseInt(report.dicomid), // ここでparseIntを使用してInt型に変換
              pspnumber: report.pspnumber,
            })),
            skipDuplicates: true, // 重複をスキップ
          });
        } catch (err) {
          console.error('Error importing batch:', err);
          throw err;
        }
      }
      fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
      res.status(200).json({ message: 'Data imported successfully' });
    });
  } catch (err) {
    console.error('Error importing XML data:', err);
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