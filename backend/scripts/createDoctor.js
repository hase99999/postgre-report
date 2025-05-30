import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createDoctors() {
  try {
    console.log('医師データの作成を開始します...');
    
    // パスワードのハッシュ化
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    
    // サンプル医師データ
    const doctors = [
      {
        docname: 'hasegawa takashi',
        department: 'radiology',
        password: hashedPassword,
        level: 0,
        hospital: 'sapporokousei',
        employeeNumber: '46086'
    
      }
    ];
    
    // 医師データの一括作成
    for (const doctor of doctors) {
      // 既存データのチェック
      const existingDoctor = await prisma.doctor.findUnique({
        where: { employeeNumber: doctor.employeeNumber }
      });
      
      if (existingDoctor) {
        console.log(`医師データが既に存在します: ${doctor.docname} (${doctor.employeeNumber})`);
        continue;
      }
      
      // 新規作成
      const createdDoctor = await prisma.doctor.create({
        data: doctor
      });
      
      console.log(`医師データを作成しました: ${createdDoctor.docname} (ID: ${createdDoctor.docid})`);
    }
    
    console.log('医師データの作成が完了しました');
    
  } catch (error) {
    console.error('医師データの作成中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDoctors();