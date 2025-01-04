import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Papa from 'papaparse';
import xml2js from 'xml2js';
import { useNavigate } from 'react-router-dom';

const ScheduleImport = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile && !jsonFile && !xmlFile) {
      setMessage('ファイルを選択してください。');
      return;
    }

    if (csvFile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = Papa.parse(event.target.result, { header: true }).data;
          await importData(data);
        } catch (error) {
          console.error('Error importing CSV schedules:', error);
          setMessage('CSVインポートに失敗しました。');
        }
      };
      reader.readAsText(csvFile);
    }

    if (jsonFile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          await importData(data);
        } catch (error) {
          console.error('Error importing JSON schedules:', error);
          setMessage('JSONインポートに失敗しました。');
        }
      };
      reader.readAsText(jsonFile);
    }

    if (xmlFile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parser = new xml2js.Parser();
          const result = await parser.parseStringPromise(event.target.result);
          const data = result.schedules.schedule.map(item => ({
            ptnumber: item.ptnumber[0],
            examstartdatetime: item.examstartdatetime[0],
            examenddatetime: item.examenddatetime[0],
            department: item.department[0],
            doctor: item.doctor[0],
            ivrname: item.ivrname[0],
            memo: item.memo[0],
            inputter: item.inputter[0],
          }));
          await importData(data);
        } catch (error) {
          console.error('Error importing XML schedules:', error);
          setMessage('XMLインポートに失敗しました。');
        }
      };
      reader.readAsText(xmlFile);
    }
  };

  const importData = async (data) => {
    try {
      const chunkSize = 100; // 分割するサイズ
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await axiosInstance.post('/api/schedules/import', chunk);
      }
      setMessage('インポートが完了しました。');
    } catch (error) {
      console.error('Error importing schedules:', error);
      setMessage('インポートに失敗しました。');
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">スケジュールインポート</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">CSVファイルを選択してください:</label>
          <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, setCsvFile)} />
        </div>
        <div className="mb-4">
          <label className="block mb-2">JSONファイルを選択してください:</label>
          <input type="file" accept=".json" onChange={(e) => handleFileChange(e, setJsonFile)} />
        </div>
        <div className="mb-4">
          <label className="block mb-2">XMLファイルを選択してください:</label>
          <input type="file" accept=".xml" onChange={(e) => handleFileChange(e, setXmlFile)} />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          インポート
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
      <button onClick={handleBack} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4">
        戻る
      </button>
    </div>
  );
};

export default ScheduleImport;