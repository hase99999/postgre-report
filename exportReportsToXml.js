const fs = require('fs');
const xml2js = require('xml2js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exportReportsToXml = async () => {
  try {
    // データベースからReportレコードを取得
    const reports = await prisma.report.findMany();

    // JavaScriptオブジェクトをXMLに変換
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({ Reports: reports });

    // XMLをファイルに書き込み
    fs.writeFile('reports.xml', xml, (err) => {
      if (err) {
        console.error('Error writing XML file:', err);
        return;
      }
      console.log('Reports exported to XML successfully');
    });
  } catch (err) {
    console.error('Error exporting reports to XML:', err);
  } finally {
    await prisma.$disconnect();
  }
};

exportReportsToXml();