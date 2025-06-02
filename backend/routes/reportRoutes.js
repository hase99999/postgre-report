import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import xml2js from 'xml2js';
import fs from 'fs';

const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// レポート一覧を取得するAPI
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, ptnumber } = req.query;
  console.log('Received query params:', { page, limit, ptnumber }); // デバッグ用
  const offset = (page - 1) * limit;

  try {
    const where = ptnumber ? { ptnumber: parseInt(ptnumber, 10) } : {};

    const reports = await prisma.report.findMany({
      skip: parseInt(offset, 10),
      take: parseInt(limit, 10),
      where,
      include: {
        ptinfo: {
          select: {
            ptname: true,
          },
        },
      },
    });
    const total = await prisma.report.count({ where });
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
  console.log(`Received request for report with ID: ${id}`); // デバッグ用
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
        clinicaldiag: true,
        imagediag: true,
        report: true,
      },
    });
    if (!report) {
      console.error('Report not found for ID:', id); // デバッグ用
      return res.status(404).json({ error: 'Report not found' });
    }
    console.log('Fetched report from DB:', report); // デバッグ用
    res.json(report);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// XMLファイルからレポート情報をインポートするAPI
router.post('/import/xml', upload.single('file'), async (req, res) => {
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
        let successCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;
        let missingReportCount = 0;
        
        const reportsArray = Array.isArray(reports) ? reports : [reports];
        
        for (const report of reportsArray) {
          try {
            const ptnumber = parseInt(report.ptnumber);
            if (isNaN(ptnumber)) {
              console.error(`無効な患者番号形式です: ${report.ptnumber}`);
              errorCount++;
              continue;
            }
            
            // 患者データの存在確認
            const ptExists = await prisma.ptinfo.findUnique({
              where: { ptnumber }
            });
            
            if (!ptExists) {
              console.error(`患者番号 ${ptnumber} は存在しません。レコードをスキップします。`);
              errorCount++;
              continue;
            }
            
            // 日付処理
            const examdate = new Date(report.examdate);
            if (isNaN(examdate.getTime())) {
              console.error(`検査日の形式が不正: ${report.examdate}`);
              errorCount++;
              continue;
            }
            
            // 重複チェック
            const existingReport = await prisma.report.findFirst({
              where: {
                ptnumber,
                examdate,
                modality: report.modality || null,
                department: report.department || ''
              }
            });
            
            if (existingReport) {
              console.log(`重複レポートをスキップ: 患者番号=${ptnumber}, 日付=${report.examdate}, モダリティ=${report.modality || 'なし'}`);
              duplicateCount++;
              continue;
            }
            
            // reportフィールドの確認
            if (!report.report) {
              console.warn(`警告: 患者番号=${ptnumber} のレポート本文が空です`);
              missingReportCount++;
            }
            
            await prisma.report.create({
              data: {
                examdate,
                ptnumber,
                modality: report.modality || null,
                doctor: report.doctor || null,
                department: report.department || '',
                clinicaldiag: report.clinicaldiag || '',
                imagediag: report.imagediag || '',
                report: report.report || '',
                finaldiag: report.finaldiag || '',
                interesting: report.interesting || '',
                inputby: report.inputby || '',
                inputdate: new Date(report.inputdate || examdate),
                site: report.site || '',
                inputtime: new Date(report.inputtime || report.inputdate || examdate),
              },
            });
            successCount++;
          } catch (err) {
            console.error('XMLレポートデータ処理エラー:', err);
            errorCount++;
          }
        }

        fs.unlinkSync(req.file.path);
        res.status(200).json({ 
          message: `XML処理完了: ${successCount}件成功, ${errorCount}件失敗, ${duplicateCount}件重複, ${missingReportCount}件レポート本文なし` 
        });
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

// JSONファイルからレポート情報をインポートするAPI - エラー詳細表示対応版
router.post('/import/json', upload.single('file'), async (req, res) => {
  try {
    console.log('レポートJSONインポート開始');
    
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
    let reports = [];
    if (Array.isArray(jsonData)) {
      reports = jsonData;
      console.log('配列形式のJSONデータを検出');
    } else if (jsonData.reports && Array.isArray(jsonData.reports)) {
      reports = jsonData.reports;
      console.log('reportsプロパティを持つオブジェクト形式のJSONデータを検出');
    } else {
      console.error('対応していないJSONフォーマット');
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: '対応していないJSONフォーマットです。' });
    }
    
    console.log(`処理するレコード数: ${reports.length}件`);
    
    // サンプルデータの表示（デバッグ用）
    if (reports.length > 0) {
      console.log('サンプルデータ:', JSON.stringify(reports[0], null, 2));
    }

    // データ処理
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    let missingReportCount = 0;
    
    for (const report of reports) {
      try {
        // 患者番号を整数に確実に変換してから検索する
        const ptnumber = parseInt(report.ptnumber);
        if (isNaN(ptnumber)) {
          console.error(`無効な患者番号形式です: ${report.ptnumber}`);
          errorCount++;
          continue;
        }

        // 整数型として検索
        const ptExists = await prisma.ptinfo.findUnique({
          where: { ptnumber }  // 整数型で検索
        });

        if (!ptExists) {
          console.error(`患者番号 ${ptnumber} は存在しません。レコードをスキップします。`);
          errorCount++;
          continue;
        }
        
        // 日付処理にデフォルト値を設定
        const examdate = report.examdate ? new Date(report.examdate) : new Date();
        const inputdate = report.inputdate ? new Date(report.inputdate) : new Date();
        const inputtime = report.inputtime ? new Date(report.inputtime) : examdate;
        
        if (isNaN(examdate.getTime())) {
          console.error(`検査日の形式が不正: ${report.examdate}`);
          errorCount++;
          continue;
        }
        
        // 重複チェック
        const existingReport = await prisma.report.findFirst({
          where: {
            ptnumber,
            examdate,
            modality: report.modality || null,
            department: report.department || ''
          }
        });
        
        if (existingReport) {
          console.log(`重複レポートをスキップ: 患者番号=${ptnumber}, 日付=${examdate.toISOString()}, モダリティ=${report.modality || 'なし'}`);
          duplicateCount++;
          continue;
        }
        
        // reportフィールドの確認
        if (!report.report) {
          console.warn(`警告: 患者番号=${ptnumber} のレポート本文が空です`);
          missingReportCount++;
        }
        
        // データ登録
        await prisma.report.create({
          data: {
            examdate,
            ptnumber,
            modality: report.modality || null,
            doctor: report.doctor || null,
            department: report.department || '',
            clinicaldiag: report.clinicaldiag || '',
            imagediag: report.imagediag || '',
            report: report.report || '',
            finaldiag: report.finaldiag || '',
            interesting: report.interesting || '',
            inputby: report.inputby || '',
            inputdate,
            site: report.site || '',
            inputtime,
          },
        });
        successCount++;
      } catch (err) {
        console.error('レポートデータ処理エラー:', err);
        // 詳細なエラー情報を表示
        if (err.meta) {
          console.error('エラー詳細:', err.meta);
        }
        errorCount++;
      }
    }
    
    // 一時ファイルの削除
    fs.unlinkSync(req.file.path);
    console.log('一時ファイルを削除しました');
    
    console.log(`処理結果: ${successCount}件成功, ${errorCount}件失敗, ${duplicateCount}件重複, ${missingReportCount}件レポート本文なし`);
    return res.status(200).json({ 
      success: true, 
      message: `処理完了: ${successCount}件成功, ${errorCount}件失敗, ${duplicateCount}件重複, ${missingReportCount}件レポート本文なし` 
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
    // CSVインポート処理（実装予定）
    return res.status(501).json({ message: 'CSVインポートは現在実装中です。' });
  } catch (err) {
    console.error('CSVインポート中にエラーが発生しました:', err);
    return res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// JSONエクスポート用のエンドポイント
router.get('/export/json', async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        ptinfo: {
          select: {
            ptname: true,
          },
        },
      }
    });
    
    res.json(reports);
  } catch (err) {
    console.error('JSONエクスポート中にエラーが発生しました:', err);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// XMLエクスポート用のエンドポイント
router.get('/export/xml', async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        ptinfo: {
          select: {
            ptname: true,
          },
        },
      }
    });
    
    // XMLデータ形式に変換
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({ reports: { report: reports } });
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('XMLエクスポート中にエラーが発生しました:', err);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

// 既にパース済みのXMLデータを受け取るエンドポイント
router.post('/import/xml-data', async (req, res) => {
  try {
    const reports = req.body;
    if (!Array.isArray(reports)) {
      return res.status(400).json({ error: 'データは配列形式で送信してください' });
    }
    
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    let missingReportCount = 0;
    
    for (const report of reports) {
      try {
        // 患者番号を整数に変換
        const ptnumber = parseInt(report.ptnumber);
        if (isNaN(ptnumber)) {
          console.error(`無効な患者番号形式です: ${report.ptnumber}`);
          errorCount++;
          continue;
        }
        
        // 患者データの存在確認
        const ptExists = await prisma.ptinfo.findUnique({
          where: { ptnumber }
        });
        
        if (!ptExists) {
          console.error(`患者番号 ${ptnumber} は存在しません。レコードをスキップします。`);
          errorCount++;
          continue;
        }
        
        // 日付の処理
        const examdate = report.examdate ? new Date(report.examdate) : new Date();
        const inputdate = report.inputdate ? new Date(report.inputdate) : new Date();
        const inputtime = report.inputtime ? new Date(report.inputtime) : examdate;
        
        if (isNaN(examdate.getTime())) {
          console.error(`検査日の形式が不正: ${report.examdate}`);
          errorCount++;
          continue;
        }
        
        // 重複チェック
        const existingReport = await prisma.report.findFirst({
          where: {
            ptnumber,
            examdate,
            modality: report.modality || null,
            department: report.department || ''
          }
        });
        
        if (existingReport) {
          console.log(`重複レポートをスキップ: 患者番号=${ptnumber}, 日付=${examdate.toISOString()}, モダリティ=${report.modality || 'なし'}`);
          duplicateCount++;
          continue;
        }
        
        // reportフィールドの確認
        if (!report.report) {
          console.warn(`警告: 患者番号=${ptnumber} のレポート本文が空です`);
          missingReportCount++;
        }
        
        // レポートデータの作成
        await prisma.report.create({
          data: {
            examdate,
            ptnumber,
            modality: report.modality || null,
            doctor: report.doctor || null,
            department: report.department || '',
            clinicaldiag: report.clinicaldiag || '',
            imagediag: report.imagediag || '',
            report: report.report || '',  // レポート本文
            finaldiag: report.finaldiag || '',
            interesting: report.interesting || '',
            inputby: report.inputby || '',
            inputdate,
            site: report.site || '',
            inputtime
          }
        });
        successCount++;
      } catch (err) {
        console.error('レポートデータ処理エラー:', err);
        if (err.meta) {
          console.error('エラー詳細:', err.meta);
        }
        errorCount++;
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: `処理完了: ${successCount}件成功, ${errorCount}件失敗, ${duplicateCount}件重複, ${missingReportCount}件レポート本文なし` 
    });
  } catch (err) {
    console.error('XMLデータインポート中にエラーが発生しました:', err);
    res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
});

export default router;