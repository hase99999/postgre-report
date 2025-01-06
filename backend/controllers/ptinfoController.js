import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

/**
 * Get a paginated list of ptinfos.
 * 
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getPtinfos = async (req, res) => {
  console.log('Fetching ptinfos...');
  const { page = 1, limit = 100 } = req.query; // デフォルトで1ページ目、100件ずつ表示
  const offset = (page - 1) * limit;
  
  try {
    const ptinfos = await prisma.ptinfo.findMany({
      skip: parseInt(offset),
      take: parseInt(limit),
    });
    
    const total = await prisma.ptinfo.count();
    console.log('Fetched ptinfos:', ptinfos);
    
    res.json({ total, ptinfos });
  } catch (err) {
    console.error('Error fetching patient information:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Delete a specific ptinfo by ID.
 * Also deletes related Report records.
 * 
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const deletePtinfo = async (req, res) => {
  const { id } = req.params;
  
  try {
    // まず関連するReportレコードを削除
    await prisma.report.deleteMany({
      where: { ptnumber: BigInt(id) },
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
};

/**
 * Import ptinfo data from an uploaded file.
 * 
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const importPtinfo = async (req, res) => {
  try {
    console.log('Received request at /api/import');
    const file = req.file;
    
    if (!file) {
      console.log('No file uploaded.');
      return res.status(400).json({ message: 'ファイルがアップロードされていません。' });
    }

    console.log('Received file:', file.originalname);
    console.log('File size:', file.size);
    console.log('File type:', file.mimetype);

    // ファイルの処理ロジックをここに追加
    // 例:
    // 1. JSONファイルのパース
    // 2. データの検証
    // 3. データベースへの保存

    let data;
    if (file.mimetype === 'application/json') {
      const fileContent = fs.readFileSync(file.path, 'utf-8');
      data = JSON.parse(fileContent);
    } else {
      // 他のファイルタイプ（CSVやXML）の処理もここに追加
      return res.status(400).json({ message: 'Unsupported file type.' });
    }

    // データベースに保存するロジック（例）
    const createdEntries = await prisma.ptinfo.createMany({
      data: data.ptinfos, // ファイルの構造に応じて調整
      skipDuplicates: true, // 重複をスキップ
    });

    console.log('Imported ptinfos:', createdEntries);

    // アップロードされたファイルを削除
    fs.unlinkSync(file.path);

    res.status(200).json({ message: 'Ptinfoが正常にインポートされました。', count: createdEntries.count });
  } catch (error) {
    console.error('Error in ptinfo import:', error);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
};