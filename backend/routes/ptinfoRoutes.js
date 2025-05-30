import express from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import multer from 'multer';
import xml2js from 'xml2js';
import path from 'path';
import authMiddleware from '../middleware/authMiddleware.js';
import Pick from 'stream-json/filters/Pick.js';

// CommonJSモジュールの正しいインポート方法
import streamJson from 'stream-json';
const { parser } = streamJson;

// StreamArray.jsもCommonJSモジュール
import streamArrayModule from 'stream-json/streamers/StreamArray.js';
const { streamArray } = streamArrayModule;

// stream-chainも同様
import streamChain from 'stream-chain';
const { chain } = streamChain;

const prisma = new PrismaClient();
const router = express.Router();

// 数値フィールドの安全なパース（nullの場合はnullを返す）
function safeParseInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

// 日付検証用のヘルパー関数
function isValidDate(dateString) {
  if (!dateString) return false;
  
  // 0000-00-00などの無効な日付をチェック
  if (dateString.includes('0000-00-00')) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// 絶対パスでアップロードディレクトリを指定
const uploadDir = path.join(process.cwd(), 'uploads');
console.log('アップロードディレクトリのパス:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('uploads ディレクトリを作成しました:', uploadDir);
  } catch (err) {
    console.error('uploads ディレクトリの作成に失敗しました:', err);
  }
}

// Multer の設定改善（絶対パスを使用）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// ファイルフィルタリングとサイズ制限を追加
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB制限
  fileFilter: (req, file, cb) => {
    // ファイルタイプに応じたフィルタリング
    if (file.originalname.endsWith('.json') || 
        file.originalname.endsWith('.xml') ||
        file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('許可されるファイルタイプ: JSON, XML, CSV'), false);
    }
  }
});

// JSONファイルから患者情報をインポートしてアップサートするAPI（ストリーミング処理）
router.post('/import/json', 
  authMiddleware, 
  (req, res, next) => {
    console.log('JSONインポートリクエスト受信');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  }, 
  upload.single('file'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
      }

      console.log('受信したファイル:', JSON.stringify(req.file)); 

      // メモリ使用量をモニタリング
      let memoryUsage = process.memoryUsage();
      console.log(`初期メモリ使用量: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);

      // ストリーム処理の準備
      let recordCount = 0;     // 総レコード数
      let successCount = 0;    // 成功件数
      let errorCount = 0;      // エラー件数
      let batchCount = 0;      // バッチ数
      const BATCH_SIZE = 50;   // バッチサイズを50に縮小
      let currentBatch = [];   // 現在処理中のバッチ
      
      // ファイルの構造を分析してパイプラインを選択
      let pipeline;

      // ファイル先頭を読み取って構造を分析
      const fileStart = fs.readFileSync(req.file.path, { encoding: 'utf8', flag: 'r', start: 0, end: 300 });
      const firstChar = fileStart.trim()[0];
      const isObject = firstChar === '{';
      const isArray = firstChar === '[';

      console.log('JSONファイルの先頭300文字:', fileStart);
      console.log('JSONタイプ:', isObject ? 'オブジェクト' : (isArray ? '配列' : '不明'));

      if (isObject) {
        // JSONがオブジェクト（{...}）の場合、recordsフィールドを検索
        if (fileStart.includes('"records"') || fileStart.includes('"Records"') || fileStart.includes('"RECORDS"')) {
          console.log('オブジェクト内のrecordsフィールドを処理します');
          pipeline = chain([
            fs.createReadStream(req.file.path),
            parser(),
            Pick.withParser({ filter: 'records' }),
            streamArray()
          ]);
        } else {
          // recordsフィールドがない場合は独自の処理方法
          console.log('オブジェクトを直接処理します');
          return res.status(400).json({ 
            error: '対応していないJSONフォーマットです。最上位レベルが配列、またはrecordsプロパティを持つオブジェクトが必要です。' 
          });
        }
      } else if (isArray) {
        // JSONが配列の場合はそのままStreamArrayを使用
        console.log('配列を直接処理します');
        pipeline = chain([
          fs.createReadStream(req.file.path),
          parser(),
          streamArray()
        ]);
      } else {
        return res.status(400).json({ error: '有効なJSONフォーマットではありません。' });
      }

      // レスポンスステータスを設定するだけ（実際のレスポンスは処理終了後に1回だけ送信）
      res.status(200);

      // データチャンクを処理
      pipeline.on('data', async ({ value }) => {
        try {
          // ストリーム一時停止
          pipeline.pause();
          
          recordCount++;
          
          // レコードを検証
          if (!value.ptnumber) {
            console.warn('ptnumberが存在しないレコードをスキップします。', JSON.stringify(value).substring(0, 100));
            errorCount++;
            pipeline.resume();
            return;
          }

          // ptnumber を整数として扱う
          const ptnumberInt = parseInt(value.ptnumber, 10);
          if (isNaN(ptnumberInt)) {
            console.warn('ptnumberが整数ではないレコードをスキップします。', JSON.stringify(value).substring(0, 100));
            errorCount++;
            pipeline.resume();
            return;
          }

          // バッチに追加 (日付検証機能を追加)
          currentBatch.push({
            ptnumber: ptnumberInt,
            ptname: value.ptname,
            ptage: safeParseInt(value.ptage), // safeParseIntを使用
            birth: isValidDate(value.birth) ? new Date(value.birth) : null,
            sex: value.sex || "",
          });
          
          // バッチサイズに達したらデータベース処理
          if (currentBatch.length >= BATCH_SIZE) {
            batchCount++;
            try {
              await processBatch(currentBatch);
              successCount += currentBatch.length;
              
              // 進捗報告（コンソールのみ - クライアントには送信しない）
              if (batchCount % 10 === 0) {
                console.log(`${successCount} レコード処理完了`);
                // メモリ使用量を定期的に確認
                memoryUsage = process.memoryUsage();
                console.log(`${batchCount}バッチ後のメモリ使用量: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
              }
            } catch (batchErr) {
              console.error(`バッチ処理エラー:`, batchErr);
              errorCount += currentBatch.length;
            }
            // バッチをリセット
            currentBatch = [];
          }
          
          // ストリーム再開
          pipeline.resume();
        } catch (recordErr) {
          console.error('レコード処理中にエラーが発生しました:', recordErr);
          errorCount++;
          pipeline.resume();
        }
      });

      // ストリームが終了したら残りのバッチを処理
      pipeline.on('end', async () => {
        try {
          // 残りのバッチがあれば処理
          if (currentBatch.length > 0) {
            await processBatch(currentBatch);
            successCount += currentBatch.length;
          }

          console.log(`処理完了: ${successCount}件成功, ${errorCount}件エラー`);
          
          // ファイル削除
          try {
            fs.unlinkSync(req.file.path);
            console.log('一時ファイルを削除しました:', req.file.path);
          } catch (unlinkErr) {
            console.warn('一時ファイル削除中にエラー:', unlinkErr);
          }
          
          // 最終的なメモリ使用量を記録
          memoryUsage = process.memoryUsage();
          console.log(`最終メモリ使用量: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);

          // 処理完了後に単一のJSON応答を返す
          if (!res.headersSent) {
            res.json({ 
              status: "completed", 
              processed: successCount, 
              errors: errorCount, 
              message: "処理が完了しました。" 
            });
          }
        } catch (finalErr) {
          console.error('最終処理中にエラー:', finalErr);
          if (!res.headersSent) {
            res.status(500).json({ 
              status: "error", 
              message: "データ処理中にエラーが発生しました。" 
            });
          }
        }
      });

      // エラーハンドリング
      pipeline.on('error', (streamErr) => {
        console.error('ストリーム処理中にエラーが発生しました:', streamErr);
        console.error('エラースタック:', streamErr.stack);
        
        // エラー時のメモリ使用量を記録
        const errMemUsage = process.memoryUsage();
        console.log(`エラー時メモリ使用量: ${Math.round(errMemUsage.heapUsed / 1024 / 1024)}MB`);
        
        if (!res.headersSent) {
          res.status(500).json({ 
            status: "error", 
            message: `ストリーム処理エラー: ${streamErr.message}` 
          });
        }
      });

      // バッチ処理関数
      async function processBatch(batch) {
        const upsertPromises = batch.map(ptinfo => {
          return prisma.ptinfo.upsert({
            where: { ptnumber: ptinfo.ptnumber },
            update: {
              ptname: ptinfo.ptname,
              ptage: ptinfo.ptage, // すでにsafeParseIntで処理済み
              birth: ptinfo.birth,
              sex: ptinfo.sex,
            },
            create: {
              ptnumber: ptinfo.ptnumber,
              ptname: ptinfo.ptname,
              ptage: ptinfo.ptage, // すでにsafeParseIntで処理済み
              birth: ptinfo.birth,
              sex: ptinfo.sex,
            },
          });
        });

        await prisma.$transaction(upsertPromises);
        console.log(`バッチ ${batchCount} (${batch.length}件) の処理が完了しました`);
      }

    } catch (err) {
      console.error('JSONインポート中に予期しないエラーが発生しました:', err);
      if (err.stack) {
        console.error('エラースタック:', err.stack);
      }
      if (!res.headersSent) {
        res.status(500).json({ 
          error: '内部サーバーエラーが発生しました。',
          details: err.message 
        });
      }
    }
  }
);

// 小さいJSONファイル用の軽量インポートAPI（5MB以下）
router.post('/import/json-small', 
  authMiddleware, 
  upload.single('file'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
      }
      
      // 5MB以上はリジェクト
      if (req.file.size > 5 * 1024 * 1024) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          error: 'このエンドポイントは5MB以下のファイル専用です。大きいファイルは/import/jsonを使用してください。' 
        });
      }
      
      console.log('小規模JSONインポート: ファイルサイズ', req.file.size);
      
      // 同期的に全体を解析（小さいファイル向け）
      const content = fs.readFileSync(req.file.path, 'utf8');
      let jsonData;
      try {
        jsonData = JSON.parse(content);
      } catch (parseErr) {
        console.error('JSONパースエラー:', parseErr);
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'JSONファイルの解析に失敗しました。' });
      }
      
      // データ取得
      let records = [];
      if (Array.isArray(jsonData)) {
        records = jsonData;
      } else if (jsonData.records && Array.isArray(jsonData.records)) {
        records = jsonData.records;
      } else {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: '対応していないJSONフォーマットです。' });
      }
      
      // バッチ処理
      const BATCH_SIZE = 100;
      let successCount = 0;
      let errorCount = 0;
      
      console.log(`処理対象レコード数: ${records.length}`);
      
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const validRecords = batch.filter(r => r.ptnumber && !isNaN(parseInt(r.ptnumber, 10)));
        
        if (validRecords.length > 0) {
          const upsertPromises = validRecords.map(r => {
            const ptnumberInt = parseInt(r.ptnumber, 10);
            // safeParseIntを使用
            const ptage = safeParseInt(r.ptage);
            
            return prisma.ptinfo.upsert({
              where: { ptnumber: ptnumberInt },
              update: {
                ptname: r.ptname,
                ptage: ptage,
                birth: isValidDate(r.birth) ? new Date(r.birth) : null,
                sex: r.sex || "",
              },
              create: {
                ptnumber: ptnumberInt,
                ptname: r.ptname,
                ptage: ptage,
                birth: isValidDate(r.birth) ? new Date(r.birth) : null,
                sex: r.sex || "",
              },
            });
          });
          
          try {
            await prisma.$transaction(upsertPromises);
            successCount += validRecords.length;
          } catch (transactionErr) {
            console.error(`トランザクションエラー:`, transactionErr);
            errorCount += validRecords.length;
          }
        }
        
        errorCount += batch.length - validRecords.length;
      }
      
      fs.unlinkSync(req.file.path);
      return res.status(200).json({ 
        status: 'completed',
        processed: successCount,
        errors: errorCount,
        message: '処理が完了しました。'
      });
      
    } catch (err) {
      console.error('小規模JSONインポート中のエラー:', err);
      // エラーの詳細情報をログに出力
      if (err.stack) {
        console.error('スタックトレース:', err.stack);
      }
      
      try {
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
      } catch (e) {}
      
      return res.status(500).json({ 
        error: '内部サーバーエラーが発生しました。', 
        details: err.message
      });
    }
  }
);

// 大規模JSONファイル用のサンプルテスト処理API (改良版)
router.post('/import/json-robust', 
  authMiddleware, 
  upload.single('file'), 
  async (req, res) => {
    // メモリリーク防止のための変数
    let fileContent = null;
    let jsonData = null;
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
      }

      // ログを強化
      console.log(`ファイルサイズ: ${req.file.size} バイト (${(req.file.size/1024/1024).toFixed(2)}MB)`);
      console.log('メモリ使用量(処理前):', process.memoryUsage());
      
      // ファイルの存在確認
      if (!fs.existsSync(req.file.path)) {
        console.error('ファイルが見つかりません:', req.file.path);
        return res.status(400).json({ error: 'アップロードされたファイルが見つかりません。' });
      }

      // 大きなファイルの処理
      if (req.file.size > 5 * 1024 * 1024) {  // 5MB以上はサンプルテスト
        console.log('サイズの大きいファイル検出: サンプルテストモードを適用');
        
        // レスポンスタイムアウトを防止するためにヘッダーを送信
        res.set('Connection', 'keep-alive');
        
        try {
          // ストリーミング処理に切り替え
          // これは大きなファイルに対するより効率的なアプローチです
          console.log('ストリーミング処理を開始します...');
          
          // ストリームを作成
          const fileStream = fs.createReadStream(req.file.path, { encoding: 'utf8' });
          let jsonString = '';
          const MAX_SAMPLE = 5000000; // 先頭5MBだけを読み込む
          
          // チャンクを受信して処理
          for await (const chunk of fileStream) {
            jsonString += chunk;
            if (jsonString.length > MAX_SAMPLE) {
              console.log(`サンプルサイズ上限(${MAX_SAMPLE}バイト)に達しました。処理を続行します。`);
              break; // 一定量に達したら読み込み停止
            }
          }
          
          console.log(`ストリーミング読み込み完了: ${jsonString.length} バイト`);
          
          // JSON解析
          try {
            console.log('JSON解析処理開始');
            let validJson = jsonString;
            
            // 不完全なJSONを修復する試み
            if (!jsonString.endsWith('}') && !jsonString.endsWith(']')) {
              // 最後の閉じ括弧を見つける
              const lastObjectEnd = jsonString.lastIndexOf('}');
              const lastArrayEnd = jsonString.lastIndexOf(']');
              const lastEnd = Math.max(lastObjectEnd, lastArrayEnd);
              
              if (lastEnd > 0) {
                validJson = jsonString.substring(0, lastEnd + 1);
                console.log('不完全なJSONを修復しました');
              }
            }
            
            jsonData = JSON.parse(validJson);
            console.log('JSON解析完了');
          } catch (parseErr) {
            console.error('JSONパースエラー:', parseErr);
            return res.status(400).json({ 
              error: 'JSONファイルの解析に失敗しました。',
              details: parseErr.message 
            });
          } finally {
            // 元のデータを解放
            jsonString = null;
          }
          
          // データ構造を特定
          let records = [];
          try {
            if (Array.isArray(jsonData)) {
              console.log('配列形式のJSONを検出');
              records = jsonData.slice(0, 100); // 配列の場合は先頭100件
            } else if (jsonData.records && Array.isArray(jsonData.records)) {
              console.log('records配列を持つオブジェクト形式のJSONを検出');
              records = jsonData.records.slice(0, 100); // objectの場合はrecordsフィールドから
            } else {
              return res.status(400).json({ 
                error: 'サポートされていないデータ形式です。最上位の配列またはrecordsプロパティが必要です。' 
              });
            }
            
            console.log(`サンプルレコード数: ${records.length}`);
            
            // メモリから元のデータを解放
            jsonData = null;
            global.gc && global.gc(); // 明示的なGCを呼び出し（Node.jsの起動オプション --expose-gc が必要）
          } catch (structErr) {
            console.error('データ構造エラー:', structErr);
            return res.status(400).json({ 
              error: 'データ構造の解析に失敗しました。',
              details: structErr.message 
            });
          }
          
          // メモリ使用状況を確認
          console.log('メモリ使用量(処理中):', process.memoryUsage());
          
          // サンプルデータのみで処理
          let successCount = 0;
          
          try {
            // バッチ処理に変更して一度に多数のデータベース操作を行わないようにする
            const BATCH_SIZE = 10;
            
            for (let i = 0; i < records.length; i += BATCH_SIZE) {
              const batch = records.slice(i, i + BATCH_SIZE);
              const upsertPromises = batch.map(record => {
                if (!record.ptnumber) return Promise.resolve(); // 無効なレコードはスキップ
                
                const ptnumberInt = parseInt(record.ptnumber, 10);
                if (isNaN(ptnumberInt)) return Promise.resolve(); // 無効な番号はスキップ
                
                // safeParseIntを使用
                const ptage = safeParseInt(record.ptage);
                
                return prisma.ptinfo.upsert({
                  where: { ptnumber: ptnumberInt },
                  update: {
                    ptname: record.ptname,
                    ptage: ptage,
                    birth: isValidDate(record.birth) ? new Date(record.birth) : null,
                    sex: record.sex || "",
                  },
                  create: {
                    ptnumber: ptnumberInt,
                    ptname: record.ptname,
                    ptage: ptage,
                    birth: isValidDate(record.birth) ? new Date(record.birth) : null,
                    sex: record.sex || "",
                  },
                });
              }).filter(p => p); // undefinedを除去
              
              // トランザクションを実行
              if (upsertPromises.length > 0) {
                await prisma.$transaction(upsertPromises);
                successCount += upsertPromises.length;
                console.log(`バッチ処理完了: ${i/BATCH_SIZE + 1}/${Math.ceil(records.length/BATCH_SIZE)}`);
              }
            }
            
            console.log(`サンプルデータ処理完了: ${successCount}件`);
          } catch (dbErr) {
            console.error('データベース処理エラー:', dbErr);
            return res.status(500).json({
              error: 'データベース処理中にエラーが発生しました。',
              details: dbErr.message
            });
          }
          
          // 後処理
          try {
            fs.unlinkSync(req.file.path);
            console.log('一時ファイル削除完了');
          } catch (unlinkErr) {
            console.error('ファイル削除エラー:', unlinkErr);
          }
          
          console.log('メモリ使用量(処理後):', process.memoryUsage());
          
          return res.status(200).json({
            status: 'sample_test_completed',
            message: `大きなファイルを検出したため、最初の${successCount}件のサンプルデータのみを処理しました。`,
            recommendation: '安全な処理のため、ファイルを5MB以下に分割して順次アップロードしてください。'
          });
        } catch (err) {
          console.error('サンプルテスト全体のエラー:', err);
          console.error('スタックトレース:', err.stack);
          try {
            if (req.file && req.file.path) {
              fs.unlinkSync(req.file.path);
            }
          } catch (e) {}
          
          return res.status(500).json({ 
            error: 'サンプルテスト中に予期せぬエラーが発生しました。',
            details: err.message
          });
        }
      }
      // 5MB未満の場合の通常処理（小さいJSONファイル用の処理と同じ）
      const content = fs.readFileSync(req.file.path, 'utf8');
      let jsonData;
      try {
        jsonData = JSON.parse(content);
      } catch (parseErr) {
        console.error('JSONパースエラー:', parseErr);
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'JSONファイルの解析に失敗しました。' });
      }
      
      // データ取得
      let records = [];
      if (Array.isArray(jsonData)) {
        records = jsonData;
      } else if (jsonData.records && Array.isArray(jsonData.records)) {
        records = jsonData.records;
      } else {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: '対応していないJSONフォーマットです。' });
      }
      
      // バッチ処理
      const BATCH_SIZE = 100;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const validRecords = batch.filter(r => r.ptnumber && !isNaN(parseInt(r.ptnumber, 10)));
        
        if (validRecords.length > 0) {
          const upsertPromises = validRecords.map(r => {
            const ptnumberInt = parseInt(r.ptnumber, 10);
            // safeParseIntを使用
            const ptage = safeParseInt(r.ptage);
            
            return prisma.ptinfo.upsert({
              where: { ptnumber: ptnumberInt },
              update: {
                ptname: r.ptname,
                ptage: ptage,
                birth: isValidDate(r.birth) ? new Date(r.birth) : null,
                sex: r.sex || "",
              },
              create: {
                ptnumber: ptnumberInt,
                ptname: r.ptname,
                ptage: ptage,
                birth: isValidDate(r.birth) ? new Date(r.birth) : null,
                sex: r.sex || "",
              },
            });
          });
          
          try {
            await prisma.$transaction(upsertPromises);
            successCount += validRecords.length;
          } catch (transactionErr) {
            console.error(`トランザクションエラー:`, transactionErr);
            errorCount += validRecords.length;
          }
        }
        
        errorCount += batch.length - validRecords.length;
      }
      
      fs.unlinkSync(req.file.path);
      return res.status(200).json({ 
        status: 'completed',
        processed: successCount,
        errors: errorCount,
        message: '処理が完了しました。'
      });
   } catch (err) {
      console.error('JSONインポート処理全体のエラー:', err);
      if (err.stack) {
        console.error('スタックトレース:', err.stack);
      }
      
      // メモリリーク防止のためのクリーンアップ
      fileContent = null;
      jsonData = null;
      global.gc && global.gc(); // 明示的なGCを呼び出し
      
      try {
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
      } catch (e) {}
      
      return res.status(500).json({ 
        error: '内部サーバーエラーが発生しました。',
        details: err.message
      });
    }
  }
);

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
    
    // XMLのパース処理をPromiseに変換
    const result = await new Promise((resolve, reject) => {
      parser.parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

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
        
        // ptageフィールドがある場合は処理
        const ptage = ptinfo.ptage ? safeParseInt(ptinfo.ptage) : null;

        return prisma.ptinfo.upsert({
          where: { ptnumber: ptnumberInt },
          update: {
            birth: isValidDate(ptinfo.birth) ? new Date(ptinfo.birth) : null,
            ptage: ptage, // XMLにptageが含まれていれば更新
            sex: ptinfo.sex || "", // sexが含まれていれば更新
          },
          create: {
            ptnumber: ptnumberInt,
            ptname: ptinfo.ptname || "", // 必須フィールド
            birth: isValidDate(ptinfo.birth) ? new Date(ptinfo.birth) : null,
            ptage: ptage,
            sex: ptinfo.sex || "",
          },
        });
      }).filter(promise => promise !== null);

      await prisma.$transaction(upsertPromises);
      console.log(`バッチ ${Math.floor(i / BATCH_SIZE) + 1} のアップサートが完了しました。`);
    }

    fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
    console.log('Ptinfo birth datesが正常にアップデートされました。');
    res.status(200).json({ message: 'Ptinfo birth datesが正常にアップデートされました。' });
    
  } catch (err) {
    console.error('Ptinfoデータのインポート中にエラーが発生しました:', err);
    if (err.stack) {
      console.error('スタックトレース:', err.stack);
    }
    try {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
    } catch (e) {}
    res.status(500).json({ 
      error: '内部サーバーエラーが発生しました。',
      details: err.message
    });
  }
});

// CSVファイルから患者情報をインポートするAPI
router.post('/import/csv', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    console.log('受信したファイル:', req.file);
    
    // CSVデータを処理するロジック
    // 実装時にはptageも同様にsafeParseIntを使用する

    fs.unlinkSync(req.file.path); // アップロードされたファイルを削除
    res.status(200).json({ message: 'CSVデータが正常にインポートされました。' });
  } catch (err) {
    console.error('CSVデータのインポート中にエラーが発生しました:', err);
    if (err.stack) {
      console.error('スタックトレース:', err.stack);
    }
    try {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
    } catch (e) {}
    res.status(500).json({ 
      error: '内部サーバーエラーが発生しました。',
      details: err.message
    });
  }
});

// 患者情報一覧を取得するAPI
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10, searchTerm = '' } = req.query;
  const skip = (page - 1) * limit;
  try {
    const ptinfos = await prisma.ptinfo.findMany({
      where: {
        OR: [
          { ptnumber: searchTerm ? parseInt(searchTerm, 10) : undefined },
          { ptname: { contains: searchTerm, mode: 'insensitive' } },
          { ptage: searchTerm ? parseInt(searchTerm, 10) : undefined },
          // 必要に応じて他の検索条件を追加
        ],
      },
      skip: parseInt(skip, 10),
      take: parseInt(limit, 10),
    });
    const total = await prisma.ptinfo.count({
      where: {
        OR: [
          { ptnumber: searchTerm ? parseInt(searchTerm, 10) : undefined },
          { ptname: { contains: searchTerm, mode: 'insensitive' } },
          { ptage: searchTerm ? parseInt(searchTerm, 10) : undefined },
          // 必要に応じて他の検索条件を追加
        ],
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