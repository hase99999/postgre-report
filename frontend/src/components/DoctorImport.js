import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Papa from 'papaparse';
import xml2js from 'xml2js';
import { useNavigate } from 'react-router-dom';

const DoctorImport = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    if (!jsonFile) {
      alert('Please select a JSON file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', jsonFile);
    try {
      await axiosInstance.post('doctors/import/json', formData, {
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

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert('Please select a CSV file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      await axiosInstance.post('doctors/import/csv', formData, {
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

  const handleXmlSubmit = async (e) => {
    e.preventDefault();
    if (!xmlFile) {
      alert('Please select an XML file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(event.target.result);
        const data = result.doctors.doctor.map(item => ({
          docid: item.docid[0],
          docname: item.docname[0],
          department: item.department[0],
          password: item.password[0],
          hospital: item.hospital[0],
          level: item.level[0],
          employeeNumber: item.employeeNumber[0],
        }));
        await importData(data);
      } catch (error) {
        console.error('Error importing XML data:', error);
        alert('Error importing XML data');
      }
    };
    reader.readAsText(xmlFile);
  };

  const importData = async (data) => {
    try {
      const chunkSize = 100; // 分割するサイズ
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await axiosInstance.post('doctors/import', chunk);
      }
      alert('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data');
    }
  };

  const handleJsonExport = async () => {
    try {
      const response = await axiosInstance.get('doctors/export/json');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'doctors.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON data:', error);
      alert('Error exporting JSON data');
    }
  };

  const handleXmlExport = async () => {
    try {
      const response = await axiosInstance.get('doctors/export/xml');
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(response.data);
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'doctors.xml';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting XML data:', error);
      alert('Error exporting XML data');
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">ドクターインポート</h1>
      <form onSubmit={handleJsonSubmit}>
        <div className="mb-4">
          <label className="block mb-2">JSONファイルを選択してください:</label>
          <input type="file" accept=".json" onChange={(e) => handleFileChange(e, setJsonFile)} />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          JSONインポート
        </button>
      </form>
      <form onSubmit={handleCsvSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">CSVファイルを選択してください:</label>
          <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, setCsvFile)} />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          CSVインポート
        </button>
      </form>
      <form onSubmit={handleXmlSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">XMLファイルを選択してください:</label>
          <input type="file" accept=".xml" onChange={(e) => handleFileChange(e, setXmlFile)} />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          XMLインポート
        </button>
      </form>
      <div className="mt-4">
        <button onClick={handleJsonExport} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
          JSONエクスポート
        </button>
        <button onClick={handleXmlExport} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          XMLエクスポート
        </button>
      </div>
      {message && <p className="mt-4">{message}</p>}
      <button onClick={handleBack} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4">
        戻る
      </button>
    </div>
  );
};

export default DoctorImport;