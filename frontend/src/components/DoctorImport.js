import React, { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const DoctorImport = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleJsonChange = (e) => {
    setJsonFile(e.target.files[0]);
  };

  const handleXmlChange = (e) => {
    setXmlFile(e.target.files[0]);
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert('CSVファイルを選択してください');
      return;
    }
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      await axios.post('/api/import/doctor/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('CSV data imported successfully');
    } catch (error) {
      console.error('Error importing CSV data:', error);
      alert('Error importing CSV data');
    }
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    if (!jsonFile) {
      alert('JSONファイルを選択してください');
      return;
    }
    const formData = new FormData();
    formData.append('file', jsonFile);
    try {
      await axios.post('/api/import/doctor/json', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('JSON data imported successfully');
    } catch (error) {
      console.error('Error importing JSON data:', error);
      alert('Error importing JSON data');
    }
  };

  const handleXmlSubmit = async (e) => {
    e.preventDefault();
    if (!xmlFile) {
      alert('XMLファイルを選択してください');
      return;
    }
    const formData = new FormData();
    formData.append('file', xmlFile);
    try {
      await axios.post('/api/import/doctor/xml', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('XML data imported successfully');
    } catch (error) {
      console.error('Error importing XML data:', error);
      alert('Error importing XML data');
    }
  };

  const formatDateToJST = (date) => {
    const timeZone = 'Asia/Tokyo';
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, 'yyyy/MM/dd HH:mm:ss', { timeZone });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">ドクターインポート</h1>
      <form onSubmit={handleCsvSubmit} className="mb-4">
        <label className="block mb-2 font-semibold">CSVファイルを選択:</label>
        <input type="file" accept=".csv" onChange={handleCsvChange} className="mb-2 p-2 border rounded" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">インポート</button>
      </form>
      <form onSubmit={handleJsonSubmit} className="mb-4">
        <label className="block mb-2 font-semibold">JSONファイルを選択:</label>
        <input type="file" accept=".json" onChange={handleJsonChange} className="mb-2 p-2 border rounded" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">インポート</button>
      </form>
      <form onSubmit={handleXmlSubmit} className="mb-4">
        <label className="block mb-2 font-semibold">XMLファイルを選択:</label>
        <input type="file" accept=".xml" onChange={handleXmlChange} className="mb-2 p-2 border rounded" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">インポート</button>
      </form>
    </div>
  );
};

export default DoctorImport;