import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'schedule.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const convertedData = data.map(item => {
  const startDate = new Date(item['start date']);
  let endDate = new Date(item['end date']);
  const startTime = item['start time'];
  const endTime = item['end time'];

  if (isNaN(startDate.getTime())) {
    console.error(`Invalid start date value for PT_ID: ${item['PT_ID']}`);
    return null;
  }

  // end date が "0000-00-00T00:00:00Z" の場合、start date と同じ日に設定
  if (item['end date'] === '0000-00-00T00:00:00Z') {
    endDate = startDate;
  }

  const examstartdatetime = new Date(startDate.getTime() + startTime).toISOString();
  const examenddatetime = new Date(endDate.getTime() + endTime).toISOString();

  return {
    ptnumber: item['PT_ID'],
    examstartdatetime,
    examenddatetime,
    department: item['依頼科'],
    doctor: item['依頼医'],
    ivrname: item['IVR種目'],
    memo: item['summary'],
    inputter: item['入力者']
  };
}).filter(item => item !== null);

fs.writeFileSync(path.join(__dirname, 'convertedSchedule.json'), JSON.stringify(convertedData, null, 2));
console.log('Data conversion completed');