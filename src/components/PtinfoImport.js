import React, { useState } from 'react';
import axios from 'axios';

const PtinfoImport = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  const handleJsonChange = (e) => {
    setJsonFile(e.target.files[0]);
  };

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    if (!jsonFile) {
      alert('Please select a JSON file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonData = JSON.parse(event.target.result);
      try {
        await axios.post('/api/import/json', jsonData, {
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
      await axios.post('/api/import/csv', formData, {
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

  return (
    <div>
      <h2>Import Patient Information</h2>
      <form onSubmit={handleJsonSubmit}>
        <input type="file" accept=".json" onChange={handleJsonChange} />
        <button type="submit">Import JSON</button>
      </form>
      <form onSubmit={handleCsvSubmit}>
        <input type="file" accept=".csv" onChange={handleCsvChange} />
        <button type="submit">Import CSV</button>
      </form>
    </div>
  );
};

export default PtinfoImport;