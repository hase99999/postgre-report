import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetPtinfoData() {
  try {
    console.log('データ削除を開始します...');
    
    // Step 1: すべてのレコードを削除
    const deletedCount = await prisma.ptinfo.deleteMany();
    console.log(`${deletedCount.count}件のレコードを削除しました`);
    
    // Step 2: IDシーケンスをリセット（PostgreSQL）
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "Ptinfo_id_seq" RESTART WITH 1');
    console.log('IDシーケンスを1にリセットしました');
    
    console.log('データベースのリセットが完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPtinfoData();