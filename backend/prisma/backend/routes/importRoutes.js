import express from 'express';
import fs from 'fs';
import multer from 'multer';
import xml2js from 'xml2js';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// バッチサイズを設定
const BATCH_SIZE = 1000;

// CSV形式のデータをインポートするAPI
router.post('/schedule/csv', upload.single('file'), async (req, res) => {
  try {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const validSchedules = [];
          for (const schedule of results) {
            const ptinfo = await prisma.ptinfo.findUnique({
              where: { ptnumber: parseInt(schedule.ptid) },
            });
            if (ptinfo) {
              validSchedules.push({
                ptid: parseInt(schedule.ptid),
                examdate: new Date(schedule.examdate),
                examtime: new Date(schedule.examtime),
                department: schedule.department,
                doctor: schedule.doctor,
                ivrname: schedule.ivrname,
                memo: schedule.memo,
                inputter: schedule.inputter,
              });
            }
          }

          for (let i = 0; i < validSchedules.length; i += BATCH_SIZE) {
            const batch = validSchedules.slice(i, i + BATCH_SIZE);
            await prisma.schedule.createMany({
              data: batch,
              skipDuplicates: true, // 重複をスキップ
            });
          }

          fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
          res.status(200).json({ message: 'CSV data imported successfully' });
        } catch (err) {
          console.error('Error importing CSV data:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
  } catch (err) {
    console.error('Error importing CSV data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// JSON形式のデータをインポートするAPI
router.post('/schedule/json', upload.single('file'), async (req, res) => {
  try {
    const jsonData = fs.readFileSync(req.file.path, 'utf8');
    const schedules = JSON.parse(jsonData);
    const validSchedules = [];
    for (const schedule of schedules) {
      const ptinfo = await prisma.ptinfo.findUnique({
        where: { ptnumber: parseInt(schedule.ptid) },
      });
      if (ptinfo) {
        validSchedules.push({
          ptid: parseInt(schedule.ptid),
          examdate: new Date(schedule.examdate),
          examtime: new Date(schedule.examtime),
          department: schedule.department,
          doctor: schedule.doctor,
          ivrname: schedule.ivrname,
          memo: schedule.memo,
          inputter: schedule.inputter,
        });
      }
    }

    for (let i = 0; i < validSchedules.length; i += BATCH_SIZE) {
      const batch = validSchedules.slice(i, i + BATCH_SIZE);
      await prisma.schedule.createMany({
        data: batch,
        skipDuplicates: true, // 重複をスキップ
      });
    }

    fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
    res.status(200).json({ message: 'JSON data imported successfully' });
  } catch (err) {
    console.error('Error importing JSON data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// XML形式のデータをインポートするAPI
router.post('/schedule/xml', upload.single('file'), async (req, res) => {
  try {
    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xmlData, async (err, result) => {
      if (err) {
        console.error('Error parsing XML data:', err);
        return res.status(500).json({ error: 'Error parsing XML data' });
      }

      const schedules = result.Root.Schedule; // XMLの構造に応じて調整
      if (!schedules) {
        console.error('No schedules found in XML data');
        return res.status(400).json({ error: 'No schedules found in XML data' });
      }

      try {
        const validSchedules = [];
        for (const schedule of schedules) {
          const ptinfo = await prisma.ptinfo.findUnique({
            where: { ptnumber: parseInt(schedule.ptid) },
          });
          if (ptinfo) {
            validSchedules.push({
              ptid: parseInt(schedule.ptid),
              examdate: new Date(schedule.examdate),
              examtime: new Date(schedule.examtime),
              department: schedule.department,
              doctor: schedule.doctor,
              ivrname: schedule.ivrname,
              memo: schedule.memo,
              inputter: schedule.inputter,
            });
          }
        }

        for (let i = 0; i < validSchedules.length; i += BATCH_SIZE) {
          const batch = validSchedules.slice(i, i + BATCH_SIZE);
          await prisma.schedule.createMany({
            data: batch,
            skipDuplicates: true, // 重複をスキップ
          });
        }

        fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
        res.status(200).json({ message: 'XML data imported successfully' });
      } catch (err) {
        console.error('Error importing XML data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } catch (err) {
    console.error('Error importing XML data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;