import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// スケジュール一覧を取得するAPI
router.get('/', async (req, res) => {
  const { start, end, limit } = req.query;
  try {
    const queryOptions = {
      where: {
        examstartdatetime: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      include: {
        ptinfo: true,
      },
    };

    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    const schedules = await prisma.schedule.findMany(queryOptions);
    const total = await prisma.schedule.count({
      where: {
        examstartdatetime: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });
    console.log('Fetched schedules from DB:', schedules); // デバッグ用
    res.json({ schedules, total });
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// スケジュールを追加するAPI
router.post('/', async (req, res) => {
  const { examstartdatetime, examenddatetime, ptnumber, department, doctor, ivrname } = req.body;
  try {
    // 日付を正しくパースしてDateオブジェクトを作成
    const startDate = new Date(examstartdatetime);
    const endDate = new Date(examenddatetime);

    // 日付が有効かどうかを確認
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        examstartdatetime: startDate,
        examenddatetime: endDate,
        ptnumber: parseInt(ptnumber),
        department,
        doctor,
        ivrname,
      },
    });
    console.log('Added new schedule to DB:', newSchedule); // デバッグ用
    res.status(201).json(newSchedule);
  } catch (err) {
    console.error('Error adding schedule:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// スケジュールをインポートするAPI
router.post('/import', async (req, res) => {
  const schedules = req.body;
  try {
    for (const schedule of schedules) {
      const ptinfo = await prisma.ptinfo.findUnique({
        where: { ptnumber: parseInt(schedule.ptnumber) },
      });

      if (!ptinfo) {
        console.error(`Ptinfo not found for ptnumber: ${schedule.ptnumber}`);
        continue; // Ptinfoが見つからない場合はスキップ
      }

      await prisma.schedule.create({
        data: {
          examstartdatetime: new Date(schedule.examstartdatetime),
          examenddatetime: new Date(schedule.examenddatetime),
          ptnumber: parseInt(schedule.ptnumber), // ptnumberをIntに変換
          department: schedule.department,
          doctor: schedule.doctor,
          ivrname: schedule.ivrname,
          memo: schedule.memo,
          inputter: schedule.inputter,
        },
      });
    }
    console.log('Imported schedules to DB'); // デバッグ用
    res.status(201).json({ message: 'Schedules imported successfully' });
  } catch (err) {
    console.error('Error importing schedules:', err);
    console.error('Error details:', err); // エラーの詳細をログに出力
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// 特定のスケジュールを取得するAPI
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('id:', id); // デバッグ用
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(id) },
      include: {
        ptinfo: true,
      },
    });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    console.log('Fetched schedule from DB:', schedule); // デバッグ用
    res.json(schedule);
  } catch (err) {
    console.error('Error fetching schedule:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// スケジュールを削除するAPI
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSchedule = await prisma.schedule.delete({
      where: { id: parseInt(id) },
    });
    console.log('Deleted schedule from DB:', deletedSchedule); // デバッグ用
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// スケジュールを更新するAPI
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { examstartdatetime, examenddatetime, ptnumber, department, doctor, ivrname } = req.body;
  try {
    const updatedSchedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        examstartdatetime: new Date(examstartdatetime),
        examenddatetime: new Date(examenddatetime),
        ptnumber,
        department,
        doctor,
        ivrname,
      },
    });
    console.log('Updated schedule in DB:', updatedSchedule); // デバッグ用
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;