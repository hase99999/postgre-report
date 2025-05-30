import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';
import authMiddleware from '../middleware/authMiddleware.js';

const prisma = new PrismaClient();
const router = express.Router();

// multerの設定
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB制限
});

// ドクター情報一覧を取得するAPI
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const doctors = await prisma.doctor.findMany({
      skip: parseInt(offset),
      take: parseInt(limit),
      select: {
        docid: true,
        docname: true,
        department: true,
        hospital: true,
        level: true,
        employeeNumber: true,
      },
    });
    const total = await prisma.doctor.count();
    console.log('Fetched doctors from DB:', doctors); // デバッグ用
    res.json({ doctors, total });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 特定のドクター情報を取得するAPI
router.get('/:docid', async (req, res) => {
  const { docid } = req.params;
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { docid: parseInt(docid) },
      select: {
        docid: true,
        docname: true,
        department: true,
        hospital: true,
        level: true,
        employeeNumber: true,
      },
    });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    console.log('Fetched doctor from DB:', doctor); // デバッグ用
    res.json(doctor);
  } catch (err) {
    console.error('Error fetching doctor:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 新しいドクターを作成するAPI
router.post('/', async (req, res) => {
  const { docname, department, password, hospital, level, employeeNumber } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = await prisma.doctor.create({
      data: {
        docname,
        department,
        password: hashedPassword,
        hospital,
        level,
        employeeNumber,
      },
    });

    res.status(201).json(newDoctor);
  } catch (err) {
    console.error('Error creating doctor:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// JSONインポート用のエンドポイント
router.post('/import/json', upload.single('file'), async (req, res) => {
  try {
    console.log('JSONインポート開始');
    
    if (!req.file) {
      console.error('ファイルがアップロードされていません');
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }
    
    console.log(`アップロードされたファイル: ${req.file.originalname}, サイズ: ${req.file.size}バイト`);

    // ファイルの読み込み
    const content = fs.readFileSync(req.file.path, 'utf8');
    
    // JSONのパース
    let jsonData;
    try {
      jsonData = JSON.parse(content);
      console.log('JSONパース成功');
    } catch (parseErr) {
      console.error('JSONパースエラー:', parseErr);
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'JSONファイルの解析に失敗しました。' });
    }

    // データ取得
    let doctors = [];
    if (Array.isArray(jsonData)) {
      doctors = jsonData;
      console.log('配列形式のJSONデータを検出');
    } else if (jsonData.doctors && Array.isArray(jsonData.doctors)) {
      doctors = jsonData.doctors;
      console.log('doctorsプロパティを持つオブジェクト形式のJSONデータを検出');
    } else {
      console.error('対応していないJSONフォーマット');
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: '対応していないJSONフォーマットです。' });
    }
    
    console.log(`処理するレコード数: ${doctors.length}件`);

    // データ処理（upsert）
    let successCount = 0;
    let errorCount = 0;
    
    for (const doctor of doctors) {
      try {
        // employeeNumberがあれば更新、なければ作成
        if (doctor.employeeNumber) {
          await prisma.doctor.upsert({
            where: { employeeNumber: doctor.employeeNumber },
            update: {
              docname: doctor.docname,
              department: doctor.department,
              level: parseInt(doctor.level || '0'),
              hospital: doctor.hospital || '',
              // パスワードは更新しない（または必要に応じて）
            },
            create: {
              docname: doctor.docname,
              department: doctor.department,
              level: parseInt(doctor.level || '0'),
              hospital: doctor.hospital || '',
              employeeNumber: doctor.employeeNumber,
              // 新規作成時のみパスワードを設定
              password: await bcrypt.hash('password123', 10)
            },
          });
          successCount++;
        } else {
          console.error('employeeNumberが不足しているレコードをスキップ');
          errorCount++;
        }
      } catch (err) {
        console.error('医師データ処理エラー:', err);
        errorCount++;
      }
    }
    
    // 一時ファイルの削除
    fs.unlinkSync(req.file.path);
    console.log('一時ファイルを削除しました');
    
    console.log(`処理結果: ${successCount}件成功, ${errorCount}件失敗`);
    return res.status(200).json({ 
      success: true, 
      message: `処理完了: ${successCount}件成功, ${errorCount}件失敗` 
    });
    
  } catch (err) {
    console.error('JSONインポート中にエラーが発生しました:', err);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    return res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// CSVインポート用のエンドポイント
router.post('/import/csv', upload.single('file'), async (req, res) => {
  try {
    console.log('CSVインポート開始');
    
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }
    
    // CSVパース処理はライブラリを利用するか独自実装が必要です
    // CSVからJSONへの変換後、上記のJSONインポート処理と同様に処理します
    
    return res.status(200).json({ 
      success: true, 
      message: `CSVインポートは現在実装中です` 
    });
    
  } catch (err) {
    console.error('CSVインポート中にエラーが発生しました:', err);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    return res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// XMLインポート用のエンドポイント（オプション）
router.post('/import/xml', upload.single('file'), async (req, res) => {
  // XMLインポート処理（必要に応じて実装）
  return res.status(501).json({ message: 'XMLインポートは現在実装中です' });
});

// JSONエクスポート用のエンドポイント
router.get('/export/json', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        docid: true,
        docname: true,
        department: true,
        hospital: true,
        level: true,
        employeeNumber: true,
      }
    });
    
    res.json(doctors);
  } catch (err) {
    console.error('JSONエクスポート中にエラーが発生しました:', err);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// XMLエクスポート用のエンドポイント
router.get('/export/xml', async (req, res) => {
  // XMLエクスポート処理（必要に応じて実装）
  return res.status(501).json({ message: 'XMLエクスポートは現在実装中です' });
});

export default router;