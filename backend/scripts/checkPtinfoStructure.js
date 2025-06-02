import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPtinfoStructure() {
  try {
    // テーブル内の総レコード数を確認
    const totalCount = await prisma.ptinfo.count();
    console.log(`患者テーブル総レコード数: ${totalCount}`);

    // サンプルデータを取得
    const sampleData = await prisma.ptinfo.findMany({ take: 3 });
    console.log('サンプルデータ:', JSON.stringify(sampleData, null, 2));

    // ptnumberの型を確認するため、特定の患者番号で検索
    if (sampleData.length > 0) {
      const firstPtNumber = sampleData[0].ptnumber;
      console.log(`最初の患者番号: ${firstPtNumber} (型: ${typeof firstPtNumber})`);
      
      // 文字列として検索
      const ptByString = await prisma.ptinfo.findUnique({
        where: { ptnumber: String(firstPtNumber) }
      });
      
      // 数値として検索
      const ptByNumber = await prisma.ptinfo.findUnique({
        where: { ptnumber: Number(firstPtNumber) }
      });
      
      console.log(`文字列検索結果: ${ptByString ? '成功' : '失敗'}`);
      console.log(`数値検索結果: ${ptByNumber ? '成功' : '失敗'}`);
    }
  } catch (error) {
    console.error('エラー発生:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPtinfoStructure();