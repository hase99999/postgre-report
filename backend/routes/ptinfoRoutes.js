import express from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import multer from 'multer';
import xml2js from 'xml2js';
import authMiddleware from '../middleware/authMiddleware.js'; // 認証ミドルウェアのインポート

const prisma = new PrismaClient();
const router = express.Router();

// Multer のストレージ設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // アップロード先のディレクトリを指定
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // ファイル名を設定
  },
});

const upload = multer({ storage });

// JSONファイルから患者情報をインポートしてアップサートするAPI
router.post('/import/json', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    console.log('受信したファイル:', req.file); // デバッグログ

    console.log('開始: JSONファイルの読み込み');
    const jsonData = fs.readFileSync(req.file.path, 'utf8');
    console.log('JSONファイルの読み込み完了');

    console.log('開始: JSONデータの解析');
    let ptinfos;
    try {
      ptinfos = JSON.parse(jsonData);
    } catch (parseErr) {
      console.error('JSONの解析に失敗しました:', parseErr);
      return res.status(400).json({ error: 'JSONの解析に失敗しました。ファイルの形式を確認してください。' });
    }
    console.log('JSONデータの解析完了');

    if (!ptinfos.records || !Array.isArray(ptinfos.records)) {
      return res.status(400).json({ error: '"records" フィールドが存在し、配列である必要があります。' });
    }

    const records = ptinfos.records;
    console.log(`インポート対象のレコード数: ${records.length}`);

    // バッチ処理のための設定
    const BATCH_SIZE = 100;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const upsertPromises = batch.map(ptinfo => {
        if (!ptinfo.ptnumber) {
          console.warn('ptnumberが存在しないレコードをスキップします。', ptinfo);
          return null;
        }

        // ptnumber を整数として扱う
        const ptnumberInt = parseInt(ptinfo.ptnumber, 10);
        if (isNaN(ptnumberInt)) {
          console.warn('ptnumberが整数ではないレコードをスキップします。', ptinfo);
          return null;
        }

        return prisma.ptinfo.upsert({
          where: { ptnumber: ptnumberInt },
          update: {
            ptname: ptinfo.ptname,
            ptage: ptinfo.ptage,
            birth: ptinfo.birth ? new Date(ptinfo.birth) : undefined,
            sex: ptinfo.sex,
            // 他のフィールドがあれば追加
          },
          create: {
            ptnumber: ptnumberInt,
            ptname: ptinfo.ptname,
            ptage: ptinfo.ptage,
            birth: ptinfo.birth ? new Date(ptinfo.birth) : undefined,
            sex: ptinfo.sex,
            // 他のフィールドがあれば追加
          },
        });
      }).filter(promise => promise !== null);

      await prisma.$transaction(upsertPromises);
      console.log(`バッチ ${Math.floor(i / BATCH_SIZE) + 1} のアップサートが完了しました。`);
    }

    fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
    console.log('Ptinfoデータが正常にインポートおよびアップサートされました。');
    res.status(200).json({ message: 'Ptinfoデータが正常にインポートおよびアップサートされました。' });
  } catch (err) {
    console.error('Ptinfoデータのインポート中にエラーが発生しました:', err);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// XMLファイルから患者情報をインポートしてbirthフィールドを更新するAPI
router.post('/import/xml', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    console.log('受信したファイル:', req.file); // デバッグログ

    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    const parser = new xml2js.Parser({ explicitArray: false });

    console.log('開始: XMLデータの解析');
    parser.parseString(xmlData, async (err, result) => {
      if (err) {
        console.error('XMLデータの解析中にエラーが発生しました:', err);
        return res.status(500).json({ error: 'XMLデータの解析中にエラーが発生しました。' });
      }

      const ptinfos = result.ptinfos.ptinfo; // XMLの構造に応じて調整
      if (!ptinfos) {
        console.error('XMLデータにptinfosが見つかりません。');
        return res.status(400).json({ error: 'XMLデータにptinfosが見つかりません。' });
      }

      const records = Array.isArray(ptinfos) ? ptinfos : [ptinfos];
      console.log(`インポート対象のレコード数: ${records.length}`);

      // バッチ処理のための設定
      const BATCH_SIZE = 100;
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const upsertPromises = batch.map(ptinfo => {
          if (!ptinfo.ptnumber) {
            console.warn('ptnumberが存在しないレコードをスキップします。', ptinfo);
            return null;
          }

          const ptnumberInt = parseInt(ptinfo.ptnumber, 10);
          if (isNaN(ptnumberInt)) {
            console.warn('ptnumberが整数ではないレコードをスキップします。', ptinfo);
            return null;
          }

          return prisma.ptinfo.upsert({
            where: { ptnumber: ptnumberInt },
            update: {
              birth: ptinfo.birth ? new Date(ptinfo.birth) : undefined,
              // 他のフィールドも必要に応じて更新
            },
            create: {
              ptnumber: ptnumberInt,
              birth: ptinfo.birth ? new Date(ptinfo.birth) : undefined,
              // 他のフィールドも必要に応じて作成
            },
          });
        }).filter(promise => promise !== null);

        await prisma.$transaction(upsertPromises);
        console.log(`バッチ ${Math.floor(i / BATCH_SIZE) + 1} のアップサートが完了しました。`);
      }

      fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
      console.log('Ptinfo birth datesが正常にアップデートされました。');
      res.status(200).json({ message: 'Ptinfo birth datesが正常にアップデートされました。' });
    });
  } catch (err) {
    console.error('Ptinfoデータのインポート中にエラーが発生しました:', err);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// 患者情報一覧を取得するAPI
router.get('/', authMiddleware, async (req, res) => {
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
    console.log('DBから取得したptinfos:', ptinfos);
    console.log('総ptinfos数:', total);

    res.json({ ptinfos, total });
  } catch (error) {
    console.error('患者情報の取得中にエラーが発生しました:', error);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// 患者情報の詳細を取得するAPI
router.get('/:ptnumber', authMiddleware, async (req, res) => {
  const { ptnumber } = req.params;
  console.log('ptnumber:', ptnumber); // デバッグ用
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
      return res.status(404).json({ error: 'Ptinfoが見つかりません。' });
    }

    res.json(ptinfo);
  } catch (error) {
    console.error('Ptinfoの取得中にエラーが発生しました:', error);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// 患者情報を全削除するAPI
router.delete('/all', authMiddleware, async (req, res) => {
  try {
    await prisma.ptinfo.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "Ptinfo_id_seq" RESTART WITH 1;`; // IDをリセット
    res.json({ message: '全てのptinfosが削除され、IDがリセットされました。' });
  } catch (err) {
    console.error('全てのptinfosの削除中にエラーが発生しました:', err);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

export default router;