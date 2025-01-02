const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPtinfos = async (req, res) => {
  console.log('Fetching ptinfos...');
  const { page = 1, limit = 100 } = req.query; // デフォルトで1ページ目、100件ずつ表示
  const offset = (page - 1) * limit;
  try {
    const ptinfos = await prisma.ptinfo.findMany({
      skip: parseInt(offset),
      take: parseInt(limit),
    });
    const total = await prisma.ptinfo.count();
    console.log('Fetched ptinfos:', ptinfos);
    res.json({ total, ptinfos });
  } catch (err) {
    console.error('Error fetching patient information:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deletePtinfo = async (req, res) => {
  const { id } = req.params;
  try {
    // まず関連するReportレコードを削除
    await prisma.report.deleteMany({
      where: { ptnumber: BigInt(id) },
    });

    // 次にPtinfoレコードを削除
    await prisma.ptinfo.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};