// filepath: /Users/dj/Documents/JAVAscript/postgre-sql/backend/controllers/teachingFileController.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * TeachingFileにJSONデータをインポートするコントローラー
 */
export const importTeachingFiles = async (req, res) => {
  const teachingFiles = req.body;

  if (!Array.isArray(teachingFiles)) {
    return res.status(400).json({ error: 'データ形式が無効です。配列形式のteachingFileオブジェクトを送信してください。' });
  }

  try {
    // ptnumberの存在を確認
    const ptnumbers = [...new Set(teachingFiles.map(file => file.ptnumber))];
    const existingPtinfos = await prisma.ptinfo.findMany({
      where: {
        ptnumber: { in: ptnumbers },
      },
      select: { ptnumber: true },
    });

    const existingPtnumbers = existingPtinfos.map(pt => pt.ptnumber);
    const invalidPtnumbers = ptnumbers.filter(pt => !existingPtnumbers.includes(pt));

    if (invalidPtnumbers.length > 0) {
      return res.status(400).json({ error: `存在しない ptnumber が含まれています: ${invalidPtnumbers.join(', ')}` });
    }

    // teachingFileを一括作成（重複をスキップ）
    const createdTeachingFiles = await prisma.teachingFile.createMany({
      data: teachingFiles.map(file => ({
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

    return res.status(201).json({ message: 'Teaching filesが正常にインポートされました。', count: createdTeachingFiles.count });
  } catch (error) {
    console.error('Teaching filesのインポート中にエラーが発生しました:', error);
    return res.status(500).json({ error: '内部サーバーエラーが発生しました。' });
  }
};