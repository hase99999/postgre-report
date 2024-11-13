const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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

// JSON形式のデータをインポートするAPI
app.post('/api/import/json', async (req, res) => {
  try {
    const ptinfos = req.body;
    for (const ptinfo of ptinfos) {
      // 無効な日付形式を処理
      const bith = ptinfo.bith && ptinfo.bith !== "0000-00-00T00:00:00Z" ? new Date(ptinfo.bith) : null;
      try {
        await prisma.ptinfo.create({
          data: {
            ptnumber: ptinfo.ptnumber,
            ptname: ptinfo.ptname,
            ptage: ptinfo.ptage,
            bith: bith,
            sex: ptinfo.sex,
          },
        });
      } catch (err) {
        if (err.code === 'P2002') {
          // 重複する場合は更新
          await prisma.ptinfo.update({
            where: { ptnumber: ptinfo.ptnumber },
            data: {
              ptname: ptinfo.ptname,
              ptage: ptinfo.ptage,
              bith: bith,
              sex: ptinfo.sex,
            },
          });
        } else {
          throw err;
        }
      }
    }
    res.status(200).json({ message: 'Data imported successfully' });
  } catch (err) {
    console.error('Error importing JSON data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// CSV形式のデータをインポートするAPI
app.post('/api/import/csv', upload.single('file'), async (req, res) => {
  try {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        // 改行文字や特殊文字を処理
        Object.keys(data).forEach(key => {
          data[key] = data[key].replace(/\r/g, '').trim();
        });
        results.push(data);
      })
      .on('end', async () => {
        for (const ptinfo of results) {
          try {
            // 無効な日付形式を処理
            const bith = ptinfo.bith && ptinfo.bith !== "0000-00-00T00:00:00Z" ? new Date(ptinfo.bith) : null;
            await prisma.ptinfo.create({
              data: {
                ptnumber: parseInt(ptinfo.ptnumber),
                ptname: ptinfo.ptname,
                ptage: parseInt(ptinfo.ptage),
                bith: bith,
                sex: ptinfo.sex,
              },
            });
          } catch (err) {
            if (err.code === 'P2002') {
              // 重複する場合は更新
              await prisma.ptinfo.update({
                where: { ptnumber: parseInt(ptinfo.ptnumber) },
                data: {
                  ptname: ptinfo.ptname,
                  ptage: parseInt(ptinfo.ptage),
                  bith: bith,
                  sex: ptinfo.sex,
                },
              });
            } else {
              throw err;
            }
          }
        }
        fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
        res.status(200).json({ message: 'Data imported successfully' });
      });
  } catch (err) {
    console.error('Error importing CSV data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// レコードを削除するAPI
app.delete('/api/ptinfos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // まず関連するReportレコードを削除
    await prisma.report.deleteMany({
      where: { ptnumber: parseInt(id) },
    });

    // 次にPtinfoレコードを削除
    await prisma.ptinfo.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting record:', err);
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