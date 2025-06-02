// 患者データの分布統計を確認するスクリプト
// filepath: /Users/dj/Documents/JAVAscript/postgre-sql/backend/scripts/analyzePtinfo.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzePtinfo() {
  try {
    // 総レコード数
    const total = await prisma.ptinfo.count();
    console.log(`総患者数: ${total}件`);
    
    // 最小・最大の患者番号
    const [min] = await prisma.$queryRaw`SELECT MIN(ptnumber) FROM "Ptinfo"`;
    const [max] = await prisma.$queryRaw`SELECT MAX(ptnumber) FROM "Ptinfo"`;
    console.log(`患者番号の範囲: ${min.min} ～ ${max.max}`);
    
    // 各桁数の患者番号の分布
    const digits = await prisma.$queryRaw`
      SELECT 
        CHAR_LENGTH(ptnumber::text) as digits,
        COUNT(*) as count
      FROM "Ptinfo"
      GROUP BY digits
      ORDER BY digits
    `;
    
    console.log("\n患者番号の桁数分布:");
    digits.forEach(d => {
      console.log(`${d.digits}桁: ${d.count}件`);
    });
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzePtinfo();