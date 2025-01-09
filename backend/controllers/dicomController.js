import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Dicomデータのバリデーションスキーマ
const DicomSchema = z.object({
  pt_ID: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number().int().positive().max(2147483647, { message: 'pt_IDは32ビット整数の範囲内でなければなりません。' })),

  seq_num: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number().int().positive({ message: 'seq_numは正の整数でなければなりません。' })),

  ex_date: z.string().refine((date) => {
    // 正規表現で 'YYYY-MM-DD' または 'YYYY-MM-DDTHH:MM:SSZ' を検証
    const regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z)?$/;
    if (!regex.test(date)) {
      console.error(`日付形式不一致: "${date}"`);
      return false;
    }
    const parsedDate = Date.parse(date);
    if (isNaN(parsedDate)) {
      console.error(`無効な日付: "${date}"`);
      return false;
    }
    return true; // バリデーション成功時に true を返す
  }, {
    message: '有効な日付形式（YYYY-MM-DD または YYYY-MM-DDTHH:MM:SSZ）である必要があります。',
  }),

  modality: z.string(), // 空文字列を許容

  image_num: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number().int().nonnegative({ message: 'image_numは非負の整数でなければなりません。' })),

  seriespath: z.string()
    .nonempty({ message: 'seriespathは空であってはなりません。' }),
});
/**
 * importDicom コントローラー
 */
/**
 * importDicom コントローラー
 */
export const importDicom = async (req, res) => {
  try {
    if (!req.file) {
      console.warn('アップロードされたファイルがありません。');
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    const jsonString = req.file.buffer.toString('utf-8');
    let dicomData;

    try {
      dicomData = JSON.parse(jsonString);
      console.log('受信した Dicom データ:', dicomData);
    } catch (parseError) {
      console.error('JSONのパースに失敗しました:', parseError);
      return res.status(400).json({ error: 'アップロードされたファイルのJSON形式が正しくありません。' });
    }

    if (!Array.isArray(dicomData)) {
      console.warn('Dicomデータが配列ではありません:', dicomData);
      return res.status(400).json({ error: 'Dicomデータは配列である必要があります。' });
    }

    try {
      // 既存の ptnumber を取得
      const existingPtnumbers = new Set(
        (await prisma.ptinfo.findMany({
          select: { ptnumber: true },
        })).map(pt => pt.ptnumber)
      );

      const validDicomData = [];

      // for-of ループを使用して各エントリをバリデート
      for (let index = 0; index < dicomData.length; index++) {
        const item = dicomData[index];

        try {
          console.log(`バリデーション対象エントリ ${index + 1}:`, JSON.stringify(item, null, 2));
          const validatedItem = DicomSchema.parse(item);

          // pt_ID が存在するか確認
          if (!existingPtnumbers.has(validatedItem.pt_ID)) {
            console.warn(`エントリ ${index + 1} のpt_ID (${validatedItem.pt_ID}) がPtinfoに存在しないためスキップします。`, item);
            continue;
          }

          validDicomData.push(validatedItem); // バリデーション成功時のみ追加
        } catch (zodError) {
          console.error(`エントリ ${index + 1} のバリデーションエラー:`, zodError.errors);
          console.error(`エントリ ${index + 1} のデータ:`, JSON.stringify(item, null, 2));
          // エラーが発生しても処理を続行
        }
      }

      if (validDicomData.length === 0) {
        console.warn('有効なDicomデータが存在しません。');
        return res.status(400).json({ error: '有効なDicomデータが存在しません。' });
      }

      // データベースに複数のDicomレコードを作成
      const createdDicoms = await prisma.dicom.createMany({
        data: validDicomData,
        skipDuplicates: true, // 重複をスキップ（必要に応じて）
      });

      console.log(`成功: ${createdDicoms.count} 件のDicomデータがインポートされました。`);
      res.status(201).json({
        message: 'Dicomデータが正常にインポートされました。',
        count: createdDicoms.count,
      });
    } catch (error) {
      console.error('Dicomデータのインポートに失敗しました:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }

      res.status(500).json({ error: 'Dicomデータのインポートに失敗しました。' });
    }
  } catch (error) {
    console.error('Dicomインポート中に予期せぬエラーが発生しました:', error);
    res.status(500).json({ error: '予期せぬエラーが発生しました。' });
  }
};
// backend/controllers/dicomController.js


// Dicom一覧取得
export const getDicoms = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    const dicoms = await prisma.dicom.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });

    const total = await prisma.dicom.count();
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: dicoms,
      pagination: {
        total,
        page,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Dicom一覧の取得に失敗しました:', error);
    res.status(500).json({ error: 'Dicom一覧の取得に失敗しました。' });
  }
};

// Dicom詳細取得
export const getDicomById = async (req, res) => {
  const { id } = req.params;

  try {
    const dicom = await prisma.dicom.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!dicom) {
      return res.status(404).json({ error: 'Dicomが見つかりません。' });
    }

    res.json(dicom);
  } catch (error) {
    console.error('Dicom詳細の取得に失敗しました:', error);
    res.status(500).json({ error: 'Dicom詳細の取得に失敗しました。' });
  }
};