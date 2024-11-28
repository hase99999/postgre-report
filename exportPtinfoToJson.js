const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exportPtinfoToJson = async () => {
  try {
    // データベースからPtinfoレコードを取得
    const ptinfos = await prisma.ptinfo.findMany();

    // JSON形式に変換
    const json = JSON.stringify(ptinfos, null, 2);

    // JSONをファイルに書き込み
    fs.writeFile('ptinfos.json', json, (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
        return;
      }
      console.log('Ptinfo records exported to JSON successfully');
    });
  } catch (err) {
    console.error('Error exporting Ptinfo records to JSON:', err);
  } finally {
    await prisma.$disconnect();
  }
};

exportPtinfoToJson();