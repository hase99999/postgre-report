import React, { useState } from 'react';
import axios from 'axios';

const ReportImport = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [jsonFileName, setJsonFileName] = useState('ptinfos.json');
  const [xmlFileName, setXmlFileName] = useState('reports.xml');

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleJsonChange = (e) => {
    setJsonFile(e.target.files[0]);
  };

  const handleXmlChange = (e) => {
    setXmlFile(e.target.files[0]);
  };

  const handleJsonFileNameChange = (e) => {
    setJsonFileName(e.target.value);
  };

  const handleXmlFileNameChange = (e) => {
    setXmlFileName(e.target.value);
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
      await axios.post('/api/import/report/csv', formData, {
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
      await axios.post('/api/import/report/json', formData, {
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
      console.log('Sending XML data to http://localhost:3001/api/import/report/xml');
      await axios.post('/api/import/report/xml', formData, {
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

  const handleJsonExport = async () => {
    try {
      const response = await axios.get(`/api/export/ptinfo?filename=${jsonFileName}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', jsonFileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error exporting JSON data:', error);
      alert('Error exporting JSON data');
    }
  };

  const handleXmlExport = async () => {
    try {
      const response = await axios.get(`/api/export/reports?filename=${xmlFileName}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', xmlFileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error exporting XML data:', error);
      alert('Error exporting XML data');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Import Report Information</h2>
      <form onSubmit={handleJsonSubmit} className="mb-4">
        <input type="file" accept=".json" onChange={handleJsonChange} className="mb-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Import JSON</button>
      </form>
      <form onSubmit={handleCsvSubmit} className="mb-4">
        <input type="file" accept=".csv" onChange={handleCsvChange} className="mb-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Import CSV</button>
      </form>
      <form onSubmit={handleXmlSubmit} className="mb-4">
        <input type="file" accept=".xml" onChange={handleXmlChange} className="mb-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Import XML</button>
      </form>
      <h2 className="text-2xl font-bold mb-4">Export Data</h2>
      <div className="mb-4">
        <input
          type="text"
          value={jsonFileName}
          onChange={handleJsonFileNameChange}
          placeholder="Enter JSON file name"
          className="border p-2 mb-2 w-full"
        />
        <button onClick={handleJsonExport} className="bg-green-500 text-white px-4 py-2 rounded">Export Ptinfo to JSON</button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={xmlFileName}
          onChange={handleXmlFileNameChange}
          placeholder="Enter XML file name"
          className="border p-2 mb-2 w-full"
        />
        <button onClick={handleXmlExport} className="bg-green-500 text-white px-4 py-2 rounded">Export Reports to XML</button>
      </div>
    </div>
  );
};

export default ReportImport;