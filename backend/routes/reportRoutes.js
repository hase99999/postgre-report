import express from 'express';
import fs from 'fs';
import multer from 'multer';
import xml2js from 'xml2js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// レポート一覧を取得するAPI
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const reports = await prisma.report.findMany({
      skip: parseInt(offset),
      take: parseInt(limit),
      select: {
        id: true,
        examdate: true,
        ptnumber: true,
        ptinfo: {
          select: {
            ptname: true,
          },
        },
        modality: true,
        department: true,
        imagediag: true,
      },
    });
    const total = await prisma.report.count();
    console.log('Fetched reports from DB:', reports); // デバッグ用
    res.json({ reports, total });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 特定のレポートを取得するAPI
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Received request for report with ID: ${id}`); // req.paramsの内容をログ表示
  try {
    const report = await prisma.report.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        examdate: true,
        ptnumber: true,
        ptinfo: {
          select: {
            ptname: true,
          },
        },
        modality: true,
        department: true,
        imagediag: true,
        report: true,
      },
    });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    console.log('Fetched report from DB:', report); // デバッグ用
    res.json(report);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/// XMLファイルからレポート情報をインポートするAPI
router.post('/report/xml', upload.single('file'), async (req, res) => {
  try {
    console.log('Received file:', req.file); // デバッグ情報を追加
    const xmlData = fs.readFileSync(req.file.path, 'utf8');
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
              interesting: report.interesting,
              inputby: report.inputby,
              inputdate: new Date(report.inputdate),
              site: report.site,
              inputtime: new Date(report.inputtime),
            },
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