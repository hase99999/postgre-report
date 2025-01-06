import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 文字列からNULLバイトおよびその他の制御文字を削除する関数
 */
const sanitizeString = (str) => {
  if (typeof str === 'string') {
    // NULLバイトを除去し、その他の制御文字も削除
    return str.replace(/\0/g, '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
  }
  return str;
};

/**
 * オブジェクト内のすべての文字列フィールドを再帰的にサニタイズする関数
 * @param {Object} obj - サニタイズ対象のオブジェクト
 * @returns {Object} サニタイズされたオブジェクト
 */
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  } else if (obj !== null && typeof obj === 'object') {
    const sanitizedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitizedObj[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitizedObj;
  }
  return obj;
};

/**
 * 文字列が有効なUTF-8であることを確認する関数
 */
const isValidUTF8 = (str) => {
  try {
    Buffer.from(str, 'utf-8').toString('utf-8');
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * TeachingFileにJSONデータをインポートするコントローラー
 */
export const importTeachingFiles = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      console.log('ファイルがアップロードされていません。');
      return res.status(400).json({ message: 'ファイルがアップロードされていません。' });
    }

    console.log('受信したファイル:', file.originalname);
    console.log('ファイルサイズ:', file.size);
    console.log('ファイルタイプ:', file.mimetype);

    const fileContentStr = file.buffer.toString('utf-8');
    console.log('ファイル内容:', fileContentStr);

    let teachingFiles;
    try {
      teachingFiles = JSON.parse(fileContentStr);
      console.log('解析されたteachingFiles:', JSON.stringify(teachingFiles, null, 2));
    } catch (parseError) {
      console.error('JSONの解析エラー:', parseError);
      return res.status(400).json({ message: 'JSONの解析に失敗しました。' });
    }

    // ptnumberがundefinedでないレコードのみをフィルタリング
    teachingFiles = teachingFiles.filter(file => file.ptnumber);
    console.log(`ptnumberでフィルタリングされたteachingFilesの数: ${teachingFiles.length}`);

    const ptnumbers = [...new Set(teachingFiles.map(file => file.ptnumber))];
    console.log('確認するPTNumbers:', ptnumbers);

    const existingPtinfos = await prisma.ptinfo.findMany({
      where: {
        ptnumber: { in: ptnumbers },
      },
      select: { ptnumber: true },
    });

    const existingPtnumbers = existingPtinfos.map(pt => pt.ptnumber);
    const invalidPtnumbers = ptnumbers.filter(pt => !existingPtnumbers.includes(pt));

    if (invalidPtnumbers.length > 0) {
      console.warn('無効なptnumbers:', invalidPtnumbers);
      // invalidPtnumbersを持つteachingFilesを除外
      teachingFiles = teachingFiles.filter(file => existingPtnumbers.includes(file.ptnumber));
      console.log(`無効なptnumbersを除外後のteachingFilesの数: ${teachingFiles.length}`);
    }

    // 必須フィールドの確認とサニタイズ
    let validTeachingFiles = teachingFiles.filter(file => {
      const isValid = file.seaquentail && file.site && file.field && file.ptnumber;
      if (!isValid) {
        console.warn('無効なteachingFileエントリー:', file);
      }
      return isValid;
    }).map(file => {
      const sanitizedFile = sanitizeObject(file); // 全フィールドを再帰的にサニタイズ
      return {
        seaquentail: parseInt(sanitizedFile.seaquentail, 10), // Int型に変換
        site: sanitizedFile.site,
        field: sanitizedFile.field,
        ptnumber: parseInt(sanitizedFile.ptnumber, 10), // Int型に変換
        dicomid: parseInt(sanitizedFile.dicomid, 10), // Int型に変換
        agesex: sanitizedFile.agesex,
        pthistory: sanitizedFile.pthistory,
        answer: sanitizedFile.answer,
        explanation: sanitizedFile.explanation,
        registration: sanitizedFile.registrationdate ? new Date(sanitizedFile.registrationdate) : new Date(),
        registname: sanitizedFile.registname,
        difficultylevel: parseInt(sanitizedFile.difficultylevel, 10), // Int型に変換
        pathology: sanitizedFile.pathology,
        publication: Boolean(sanitizedFile.publication), // Boolean型に変換
      };
    }).filter(file => {
      // 追加のサニタイズチェック
      return Object.values(file).every(value => {
        if (typeof value === 'string') {
          return !/\0/.test(value) && isValidUTF8(value);
        }
        return true;
      });
    });

    console.log(`有効なteachingFilesの数（サニタイズおよびUTF-8確認後）: ${validTeachingFiles.length}`);

    if (validTeachingFiles.length === 0) {
      console.warn('有効なteachingFileデータが含まれていません。');
      return res.status(400).json({ error: '有効なteachingFileデータが含まれていません。' });
    }

    // データ挿入前の再確認
    validTeachingFiles.forEach((file, index) => {
      Object.entries(file).forEach(([key, value]) => {
        if (typeof value === 'string' && /\0/.test(value)) {
          console.warn(`Record ${index} - Field "${key}" still contains NULL bytes.`);
        }
        if (typeof value === 'string' && !isValidUTF8(value)) {
          console.warn(`Record ${index} - Field "${key}" contains invalid UTF-8 characters.`);
        }
      });
    });

    // Prismaのバッチ挿入制限を考慮して、データを小さなバッチに分割
    const BATCH_SIZE = 100; // 分割するサイズ（必要に応じて調整）
    let totalInserted = 0;

    for (let i = 0; i < validTeachingFiles.length; i += BATCH_SIZE) {
      const chunk = validTeachingFiles.slice(i, i + BATCH_SIZE);
      try {
        const createdBatch = await prisma.teachingFile.createMany({
          data: chunk,
          skipDuplicates: true, // seaquentailが重複する場合はスキップ
        });
        console.log(`バッチ ${Math.floor(i / BATCH_SIZE) + 1} で作成されたteachingFilesの数: ${createdBatch.count}`);
        totalInserted += createdBatch.count;
      } catch (err) {
        console.error(`バッチ ${Math.floor(i / BATCH_SIZE) + 1} の挿入中にエラーが発生しました:`, err);

        // エラーが発生したバッチを個別に処理して問題のレコードを特定
        for (const [index, record] of chunk.entries()) {
          try {
            await prisma.teachingFile.create({
              data: record,
            });
            console.log(`バッチ ${Math.floor(i / BATCH_SIZE) + 1} - Record ${index} inserted successfully.`);
            totalInserted += 1;
          } catch (recordErr) {
            console.error(`バッチ ${Math.floor(i / BATCH_SIZE) + 1} - Record ${index} の挿入中にエラーが発生しました:`, recordErr);
            console.log('問題のレコード:', record);
          }
        }
      }
    }

    console.log(`作成されたteachingFilesの総数: ${totalInserted}`);

    return res.status(201).json({ message: 'Teaching filesが正常にインポートされました。', count: totalInserted });
  } catch (error) {
    console.error('Teaching filesのインポート中にエラーが発生しました:', error.message);
    return res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  } finally {
    await prisma.$disconnect();
  }
};