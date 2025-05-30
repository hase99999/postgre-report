import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDoctors() {
  try {
    const doctors = await prisma.doctor.findMany();
    
    console.log(`医師データ: ${doctors.length}件`);
    console.log(JSON.stringify(doctors, null, 2));
    
  } catch (error) {
    console.error('医師データの取得中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDoctors();