import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// ログインAPI
router.post('/login', async (req, res) => {
  const { employeeNumber, password } = req.body;

  try {
    console.log('Received login request:', { employeeNumber, password });

    const doctor = await prisma.doctor.findFirst({
      where: { employeeNumber },
    });

    if (!doctor) {
      console.log('Doctor not found');
      return res.status(401).json({ error: 'Invalid employee number or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid employee number or password' });
    }

    const token = jwt.sign({ id: doctor.docid }, SECRET_KEY, { expiresIn: '1h' });

    res.json({
      token,
      employeeNumber: doctor.employeeNumber,
      employeeName: doctor.docname // ここで名前を追加
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;