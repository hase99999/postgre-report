const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDoctors = async (req, res) => {
  console.log('Fetching doctors...');
  try {
    const doctors = await prisma.doctor.findMany();
    console.log('Fetched doctors:', doctors);
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};