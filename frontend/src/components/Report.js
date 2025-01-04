import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Report = () => {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ name: '', site: '', inputtime: '' });
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      const response = await axiosInstance.get('/api/reports');
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/reports', form);
      fetchReports();
      setForm({ name: '', site: '', inputtime: '' });
    } catch (error) {
      console.error('Error adding report:', error);
      setError('Error adding report');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/reports/${id}`);
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Error deleting report');
    }
  };

  return (
    <div>
      <h2>Reports</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
        <input name="site" value={form.site} onChange={handleChange} placeholder="Site" />
        <input name="inputtime" value={form.inputtime} onChange={handleChange} placeholder="Input Time" />
        <button type="submit">Add Report</button>
      </form>
      <ul>
        {reports.map((report) => (
          <li key={report.id}>
            {report.name} - {report.site} - {report.inputtime}
            <button onClick={() => handleDelete(report.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Report;