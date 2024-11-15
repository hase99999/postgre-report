const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getReports = async (req, res) => {
  console.log('Fetching reports...');
  try {
    const reports = await prisma.report.findMany();
    console.log('Fetched reports:', reports);
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};