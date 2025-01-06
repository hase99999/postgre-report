import express from 'express';
import multer from 'multer';
import xml2js from 'xml2js';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';
import { importTeachingFiles } from '../controllers/teachingFileController.js'; // 追加
import { Readable } from 'stream';

const prisma = new PrismaClient();
const router = express.Router();

// Multerのメモリストレージ設定
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/json', 'text/csv', 'application/xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON, CSV, and XML are allowed.'));
    }
  },
});

// バッチサイズを設定
const BATCH_SIZE = 1000;

/**
 * TeachingFileにJSONデータをインポートするAPI
 */
router.post('/import', upload.single('file'), importTeachingFiles);

/**
 * CSV形式のデータをインポートするAPI
 */
router.post('/schedule/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('ファイルがアップロードされていません。');
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    console.log('受信したCSVファイル:', req.file.originalname);
    console.log('ファイルサイズ:', req.file.size);
    console.log('ファイルタイプ:', req.file.mimetype);

    const results = [];
    const csvParser = csv();

    // Readableストリームを作成してfile.bufferをパイプ
    const readableFile = new Readable();
    readableFile._read = () => {}; // no-op
    readableFile.push(req.file.buffer);
    readableFile.push(null);

    readableFile
      .pipe(csvParser)
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const validSchedules = [];
          for (const schedule of results) {
            const ptnumber = parseInt(schedule.ptid);
            if (isNaN(ptnumber)) {
              console.warn(`Invalid ptnumber: ${schedule.ptid}`);
              continue;
            }
            const ptinfo = await prisma.ptinfo.findUnique({
              where: { ptnumber },
            });
            if (ptinfo) {
              validSchedules.push({
                ptnumber,
                examdate: schedule.examdate ? new Date(schedule.examdate) : null,
                examtime: schedule.examtime ? new Date(schedule.examtime) : null,
                department: schedule.department,
                doctor: schedule.doctor,
                ivrname: schedule.ivrname || null,
                memo: schedule.memo || null,
                inputter: schedule.inputter || null,
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

          res.status(200).json({ message: 'CSV data imported successfully', count: validSchedules.length });
        } catch (err) {
          console.error('Error importing CSV data:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      })
      .on('error', (error) => {
        console.error('CSVのパース中にエラーが発生しました:', error.message);
        res.status(500).json({ error: 'CSVのパース中にエラーが発生しました。' });
      });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'ファイルサイズが大きすぎます。最大許容量は50MBです。' });
    }
    console.error('Error importing CSV data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * JSON形式のデータをインポートするAPI
 */
router.post('/schedule/json', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('ファイルがアップロードされていません。');
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    console.log('受信したJSONファイル:', req.file.originalname);
    console.log('ファイルサイズ:', req.file.size);
    console.log('ファイルタイプ:', req.file.mimetype);

    const jsonData = req.file.buffer.toString('utf8');
    const schedules = JSON.parse(jsonData);
    const validSchedules = [];

    for (const schedule of schedules) {
      const ptnumber = parseInt(schedule.ptid);
      if (isNaN(ptnumber)) {
        console.warn(`Invalid ptnumber: ${schedule.ptid}`);
        continue;
      }
      const ptinfo = await prisma.ptinfo.findUnique({
        where: { ptnumber },
      });
      if (ptinfo) {
        validSchedules.push({
          ptnumber,
          examdate: schedule.examdate ? new Date(schedule.examdate) : null,
          examtime: schedule.examtime ? new Date(schedule.examtime) : null,
          department: schedule.department,
          doctor: schedule.doctor,
          ivrname: schedule.ivrname || null,
          memo: schedule.memo || null,
          inputter: schedule.inputter || null,
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

    res.status(200).json({ message: 'JSON data imported successfully', count: validSchedules.length });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'ファイルサイズが大きすぎます。最大許容量は50MBです。' });
    }
    console.error('Error importing JSON data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * JSONファイルから患者情報をインポートするAPI
 */
router.post('/patient-import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('ファイルがアップロードされていません。');
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    console.log('受信した患者情報ファイル:', req.file.originalname);
    console.log('ファイルサイズ:', req.file.size);
    console.log('ファイルタイプ:', req.file.mimetype);

    const jsonData = req.file.buffer.toString('utf8');
    const ptinfos = JSON.parse(jsonData);

    for (const ptinfo of ptinfos) {
      if (ptinfo.birth) {
        await prisma.ptinfo.updateMany({
          where: { ptnumber: ptinfo.ptnumber },
          data: { birth: new Date(ptinfo.birth) },
        });
      }
      // 他のフィールドの処理が必要ならここに追加
    }

    res.status(200).json({ message: 'Ptinfo birth dates updated successfully', count: ptinfos.length });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'ファイルサイズが大きすぎます。最大許容量は50MBです。' });
    }
    console.error('Error importing ptinfo data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * XML形式のデータをインポートするAPI
 */
router.post('/schedule/xml', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('ファイルがアップロードされていません。');
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    console.log('受信したXMLファイル:', req.file.originalname);
    console.log('ファイルサイズ:', req.file.size);
    console.log('ファイルタイプ:', req.file.mimetype);

    const xmlData = req.file.buffer.toString('utf8');
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xmlData, async (err, result) => {
      if (err) {
        console.error('Error parsing XML data:', err);
        return res.status(500).json({ error: 'Error parsing XML data' });
      }

      const schedules = result.Root?.Schedule; // XMLの構造に応じて調整
      if (!schedules) {
        console.error('No schedules found in XML data');
        return res.status(400).json({ error: 'No schedules found in XML data' });
      }

      try {
        const validSchedules = [];
        for (const schedule of schedules) {
          const ptnumber = parseInt(schedule.ptid);
          if (isNaN(ptnumber)) {
            console.warn(`Invalid ptnumber: ${schedule.ptid}`);
            continue;
          }
          const ptinfo = await prisma.ptinfo.findUnique({
            where: { ptnumber },
          });
          if (ptinfo) {
            validSchedules.push({
              ptnumber,
              examdate: schedule.examdate ? new Date(schedule.examdate) : null,
              examtime: schedule.examtime ? new Date(schedule.examtime) : null,
              department: schedule.department,
              doctor: schedule.doctor,
              ivrname: schedule.ivrname || null,
              memo: schedule.memo || null,
              inputter: schedule.inputter || null,
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

        res.status(200).json({ message: 'XML data imported successfully', count: validSchedules.length });
      } catch (err) {
        console.error('Error importing XML data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'ファイルサイズが大きすぎます。最大許容量は50MBです。' });
    }
    console.error('Error importing XML data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * XMLファイルからレポート情報をインポートするAPI
 */
router.post('/report/xml', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('ファイルがアップロードされていません。');
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    console.log('Received XML file:', req.file.originalname); // デバッグ情報を追加
    const xmlData = req.file.buffer.toString('utf8');
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xmlData, async (err, result) => {
      if (err) {
        console.error('Error parsing XML data:', err);
        return res.status(500).json({ error: 'Error parsing XML data' });
      }

      console.log('Parsed XML data:', result); // デバッグ情報を追加

      const reports = result.reports?.report; // XMLの構造に応じて調整
      if (!reports) {
        console.error('No reports found in XML data');
        return res.status(400).json({ error: 'No reports found in XML data' });
      }

      try {
        for (const report of reports) {
          let inputtime;
          try {
            inputtime = report.inputtime
              ? new Date(`1970-01-01T${report.inputtime}Z`)
              : null;
            if (isNaN(inputtime.getTime())) {
              throw new Error('Invalid date');
            }
          } catch (error) {
            console.warn('Invalid inputtime, using default value:', report.inputtime);
            inputtime = new Date('1970-01-01T00:00:00Z'); // ダミーデータを使用
          }

          await prisma.report.create({
            data: {
              examdate: new Date(report.examdate),
              ptnumber: parseInt(report.ptnumber),
              modality: report.modality,
              doctor: report.doctor || null,
              department: report.department,
              clinicaldiag: report.clinicaldiag,
              imagediag: report.imagediag,
              report: report.report,
              finaldiag: report.finaldiag,
              interesting: report.interesting || '', // 修正
              inputby: report.inputby,
              inputdate: new Date(report.inputdate),
              site: report.site,
              inputtime: inputtime, // 修正
            },
          });
        }

        res.status(200).json({ message: 'XML data imported successfully' });
      } catch (err) {
        console.error('Error importing XML data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'ファイルサイズが大きすぎます。最大許容量は50MBです。' });
    }
    console.error('Error importing XML data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * JSONファイルからレポート情報をインポートするAPI
 */
router.post('/report/json', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('ファイルがアップロードされていません。');
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    console.log('Received JSON file:', req.file.originalname); // デバッグ情報を追加
    const jsonData = req.file.buffer.toString('utf8');
    const reports = JSON.parse(jsonData);

    for (const report of reports) {
      console.log('Processing report:', report); // デバッグ情報を追加
      await prisma.report.create({
        data: {
          examdate: new Date(report.examdate),
          ptnumber: parseInt(report.ptnumber),
          modality: report.modality,
          doctor: report.doctor,
          department: report.department,
          clinicaldiag: report.clinicaldiag,
          imagediag: report.imagediag,
          report: report.report,
          finaldiag: report.finaldiag,
          interesting: report.interesting,
          inputby: report.inputby,
          inputdate: new Date(report.inputdate),
          site: report.site,
          inputtime: new Date(report.inputtime),
        },
      });
    }

    res.status(200).json({ message: 'JSON data imported successfully', count: reports.length });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'ファイルサイズが大きすぎます。最大許容量は50MBです。' });
    }
    console.error('Error importing JSON data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;