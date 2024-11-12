import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({ name: '', site: '', inputtime: '' });
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports');
      console.log('API response:', response.data);
      if (Array.isArray(response.data)) {
        setReports(response.data);
      } else {
        console.error('Expected an array but got:', response.data);
        setError('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Error fetching reports');
    }
  };

  useEffect(() => {
    console.log('Fetching reports...');
    fetchReports();
  }, []);

  const handleChange = (e) => {
    setNewReport({ ...newReport, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await axios.post('/api/reports', newReport);
      fetchReports();
      setNewReport({ name: '', site: '', inputtime: '' });
    } catch (error) {
      console.error('Error adding report:', error);
      setError('Error adding report');
    }
  };

  return (
    <div>
      <h1>Reports</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        name="name"
        placeholder="Enter report name"
        value={newReport.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="site"
        placeholder="Enter site"
        value={newReport.site}
        onChange={handleChange}
      />
      <input
        type="text"
        name="inputtime"
        placeholder="Enter input time"
        value={newReport.inputtime}
        onChange={handleChange}
      />
      <button onClick={handleAdd}>Add Report</button>
      <ul>
        {reports.map((report) => (
          <li key={report.id}>
            {report.name} - {report.site} - {report.inputtime}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportList;