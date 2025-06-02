import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPatient() {
  try {
    // エラーログにあった患者番号をチェック
    const patientIds = [433802, 458125, 211169, 162492, 427278];
    
    console.log("患者番号チェック開始...");
    for (const id of patientIds) {
      const pt = await prisma.ptinfo.findUnique({
        where: { ptnumber: id }
      });
      
      console.log(`患者番号 ${id}: ${pt ? '存在します' : '存在しません'}`);
    }
    
    // 検索方法の問題かを確認するため、範囲検索も試す
    console.log("\n患者番号の範囲検索...");
    const count = await prisma.ptinfo.count({
      where: {
        ptnumber: {
          gte: 400000,  // 40万以上
          lte: 500000   // 50万以下
        }
      }
    });
    console.log(`患者番号が400000〜500000の間のレコード数: ${count}`);
    
    // 存在する患者番号の例を表示
    const samples = await prisma.ptinfo.findMany({
      take: 5,
      orderBy: {
        ptnumber: 'desc'  // 最新の患者番号を取得
      }
    });
    
    console.log("\n最新の患者番号の例:");
    samples.forEach(pt => {
      console.log(`- ${pt.ptnumber}: ${pt.ptname}`);
    });
    
  } catch (error) {
    console.error('エラー発生:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPatient();