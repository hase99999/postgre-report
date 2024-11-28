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
        examdate: {
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
        examdate: {
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

// 特定のスケジュールを取得するAPI
router.get('/:id', async (req, res) => {
  const { id } = req.params;
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

export default router;