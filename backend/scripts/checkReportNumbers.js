import fs from 'fs';

function checkReportPatientNumbers(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(content);
    
    let reports = [];
    if (Array.isArray(jsonData)) {
      reports = jsonData;
    } else if (jsonData.reports && Array.isArray(jsonData.reports)) {
      reports = jsonData.reports;
    }
    
    if (reports.length === 0) {
      console.log('レポートデータが見つかりません');
      return;
    }
    
    // 最初の10件の患者番号を出力
    console.log('最初の10件の患者番号:');
    reports.slice(0, 10).forEach((report, i) => {
      console.log(`${i+1}. ${report.ptnumber} (型: ${typeof report.ptnumber})`);
    });
    
    // ユニークな患者番号の数
    const uniquePtNumbers = new Set(reports.map(r => r.ptnumber));
    console.log(`ユニークな患者番号数: ${uniquePtNumbers.size}`);
    
    // 患者番号の例をいくつか表示
    console.log('患者番号サンプル:', [...uniquePtNumbers].slice(0, 5));
  } catch (error) {
    console.error('エラー発生:', error);
  }
}

// コマンドライン引数からファイルパスを取得
const filePath = process.argv[2] || './uploads/lastReport.json';
checkReportPatientNumbers(filePath);