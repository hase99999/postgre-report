import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/api/reports');
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const handleDetailClick = (reportId) => {
    navigate(`/report/${reportId}`);
  };

  const handleDeleteClick = async (reportId) => {
    const confirmDelete = window.confirm('本当にこのレポートを削除しますか？');
    if (confirmDelete) {
      try {
        await axios.delete(`/api/reports/${reportId}`);
        setReports(reports.filter(report => report.id !== reportId));
        alert('レポートが削除されました');
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('レポートの削除中にエラーが発生しました');
      }
    }
  };

  return (
    <div>
      <h1>Report List</h1>
      <ul>
        {reports.map((report) => (
          <li key={report.id}>
            <span>{report.examdate} - {report.ptnumber} - {report.modality} - {report.docor} - {report.department}</span>
            <button onClick={() => handleDetailClick(report.id)}>詳細</button>
            <button onClick={() => handleDeleteClick(report.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportList;