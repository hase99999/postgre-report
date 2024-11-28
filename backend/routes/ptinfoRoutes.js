import express from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import multer from 'multer';
import xml2js from 'xml2js';

const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// JSONファイルから患者情報をインポートしてbirthフィールドを更新するAPI
router.post('/import/json', upload.single('file'), async (req, res) => {
  try {
    const jsonData = fs.readFileSync(req.file.path, 'utf8');
    const ptinfos = JSON.parse(jsonData);

    for (const ptinfo of ptinfos) {
      if (ptinfo.birth) {
        const birthDate = new Date(ptinfo.birth);
        if (!isNaN(birthDate)) {
          await prisma.ptinfo.update({
            where: { ptnumber: ptinfo.ptnumber },
            data: { birth: birthDate },
          });
        } else {
          console.error(`Invalid date for ptnumber ${ptinfo.ptnumber}: ${ptinfo.birth}`);
        }
      }
    }

    fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
    res.status(200).json({ message: 'Ptinfo birth dates updated successfully' });
  } catch (err) {
    console.error('Error importing ptinfo data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// XMLファイルから患者情報をインポートしてbirthフィールドを更新するAPI
router.post('/import/xml', upload.single('file'), async (req, res) => {
  try {
    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xmlData, async (err, result) => {
      if (err) {
        console.error('Error parsing XML data:', err);
        return res.status(500).json({ error: 'Error parsing XML data' });
      }

      const ptinfos = result.ptinfos.ptinfo; // XMLの構造に応じて調整
      if (!ptinfos) {
        console.error('No ptinfos found in XML data');
        return res.status(400).json({ error: 'No ptinfos found in XML data' });
      }

      try {
        for (const ptinfo of ptinfos) {
          if (ptinfo.birth) {
            const birthDate = new Date(ptinfo.birth);
            if (!isNaN(birthDate)) {
              await prisma.ptinfo.update({
                where: { ptnumber: ptinfo.ptnumber },
                data: { birth: birthDate },
              });
            } else {
              console.error(`Invalid date for ptnumber ${ptinfo.ptnumber}: ${ptinfo.birth}`);
            }
          }
        }

        fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
        res.status(200).json({ message: 'Ptinfo birth dates updated successfully' });
      } catch (err) {
        console.error('Error importing ptinfo data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } catch (err) {
    console.error('Error importing ptinfo data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 患者情報一覧を取得するAPI
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, searchTerm = '' } = req.query;
  const skip = (page - 1) * limit;
  try {
    const ptinfos = await prisma.ptinfo.findMany({
      where: {
        ptnumber: searchTerm ? parseInt(searchTerm, 10) : undefined,
      },
      skip: parseInt(skip, 10),
      take: parseInt(limit, 10),
    });
    const total = await prisma.ptinfo.count({
      where: {
        ptnumber: searchTerm ? parseInt(searchTerm, 10) : undefined,
      },
    });

    // 取得したデータをログに表示
    console.log('Fetched ptinfos from DB:', ptinfos);
    console.log('Total ptinfos count:', total);

    res.json({ ptinfos, total });
  } catch (error) {
    console.error('Error fetching patient info:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 特定の患者情報を取得するAPI
router.get('/:ptnumber', async (req, res) => {
  const { ptnumber } = req.params;
  try {
    const ptinfo = await prisma.ptinfo.findUnique({
      where: { ptnumber: parseInt(ptnumber, 10) },
      include: {
        reports: {
          select: {
            id: true,
            examdate: true,
            modality: true,
            doctor: true,
            department: true,
            imagediag: true,
          },
        },
      },
    });
    if (!ptinfo) {
      return res.status(404).json({ error: 'Ptinfo not found' });
    }
    console.log('Fetched ptinfo from DB:', ptinfo); // デバッグ用

    res.json(ptinfo);
  } catch (err) {
    console.error('Error fetching ptinfo:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 患者情報を全削除するAPI
router.delete('/all', async (req, res) => {
  try {
    await prisma.ptinfo.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "Ptinfo_id_seq" RESTART WITH 1;`; // IDをリセット
    res.json({ message: 'All ptinfos deleted and ID reset' });
  } catch (err) {
    console.error('Error deleting ptinfos:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;