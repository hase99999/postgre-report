import React, { useState } from 'react';
import axios from 'axios';

const ReportImport = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);

  const handleJsonChange = (e) => {
    setJsonFile(e.target.files[0]);
  };

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleXmlChange = (e) => {
    setXmlFile(e.target.files[0]);
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    if (!jsonFile) {
      alert('Please select a JSON file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        await axios.post('/api/import/report/json', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        alert('JSON data imported successfully');
      } catch (error) {
        console.error('Error importing JSON data:', error);
        alert('Error importing JSON data');
      }
    };
    reader.readAsText(jsonFile);
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

  const handleXmlSubmit = async (e) => {
    e.preventDefault();
    if (!xmlFile) {
      alert('Please select an XML file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', xmlFile);
    try {
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

  return (
    <div>
      <h2>Import Report Information</h2>
      <form onSubmit={handleJsonSubmit}>
        <input type="file" accept=".json" onChange={handleJsonChange} />
        <button type="submit">Import JSON</button>
      </form>
      <form onSubmit={handleCsvSubmit}>
        <input type="file" accept=".csv" onChange={handleCsvChange} />
        <button type="submit">Import CSV</button>
      </form>
      <form onSubmit={handleXmlSubmit}>
        <input type="file" accept=".xml" onChange={handleXmlChange} />
        <button type="submit">Import XML</button>
      </form>
    </div>
  );
};

export default ReportImport;