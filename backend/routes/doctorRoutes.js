import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

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

export default router;