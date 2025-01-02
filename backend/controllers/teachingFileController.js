import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * TeachingFileにJSONデータをインポートするコントローラー
 */
export const importTeachingFiles = async (req, res) => {
  let teachingFiles = req.body.records || req.body;

  console.log('Received teachingFiles:', JSON.stringify(teachingFiles, null, 2));

  // ptnumber が undefined でないレコードのみをフィルタリング
  teachingFiles = teachingFiles.filter(file => file.ptnumber !== undefined && file.ptnumber !== null && file.ptnumber !== '');

  // **ここに forEach を追加して ptnumber をログに出力**
  teachingFiles.forEach((file, index) => {
    console.log(`Record ${index + 1}: ptnumber = ${file.ptnumber}`);
  });

  // 重複を排除した ptnumber の取得
  const ptnumbers = [...new Set(teachingFiles.map(file => file.ptnumber))];
  console.log('PTNumbers to check:', ptnumbers);

  try {
    const existingPtinfos = await prisma.ptinfo.findMany({
      where: {
        ptnumber: { in: ptnumbers },
      },
      select: { ptnumber: true },
    });

    const existingPtnumbers = existingPtinfos.map(pt => pt.ptnumber);
    const invalidPtnumbers = ptnumbers.filter(pt => !existingPtnumbers.includes(pt));

    if (invalidPtnumbers.length > 0) {
      console.warn('Invalid ptnumbers:', invalidPtnumbers);
      // 必要に応じて、invalidPtnumbers を処理
    }

    // データのバリデーション
    const validTeachingFiles = teachingFiles.filter(file => {
      const isValid = file.seaquentail && file.site && file.field && file.ptnumber;
      if (!isValid) {
        console.warn('Invalid teachingFile entry:', file);
      }
      return isValid;
    });

    console.log(`Valid teachingFiles count: ${validTeachingFiles.length}`);

    if (validTeachingFiles.length === 0) {
      console.warn('No valid teachingFile data found');
      return res.status(400).json({ error: '有効なteachingFileデータが含まれていません。' });
    }

    // teachingFileを一括作成（重複をスキップ）
    const createdTeachingFiles = await prisma.teachingFile.createMany({
      data: validTeachingFiles.map(file => ({
        seaquentail: file.seaquentail,
        site: file.site,
        field: file.field,
        ptnumber: file.ptnumber,
        dicomid: file.dicomid,
        agesex: file.agesex,
        pthistory: file.pthistory,
        answer: file.answer,
        explanation: file.explanation,
        registration: file.registration ? new Date(file.registration) : new Date(),
        registname: file.registname,
        difficultylevel: file.difficultylevel,
        pathology: file.pathology,
        publication: file.publication,
      })),
      skipDuplicates: true, // seaquentailが重複する場合はスキップ
    });

    console.log(`Created teachingFiles count: ${createdTeachingFiles.count}`);

    return res.status(201).json({ message: 'Teaching filesが正常にインポートされました。', count: createdTeachingFiles.count });
  } catch (error) {
    console.error('Teaching filesのインポート中にエラーが発生しました:', error.message);
    return res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
};