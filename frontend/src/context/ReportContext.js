import React, { createContext, useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const ReportContext = createContext();

export const useReports = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    const response = await axiosInstance.get('/reports');
    setReports(response.data);
  };

  const addReport = async (name) => {
    const response = await axiosInstance.post('/reports', { name });
    setReports([...reports, response.data]);
  };

  const updateReport = async (id, name) => {
    const response = await axiosInstance.put(`/reports/${id}`, { name });
    setReports(reports.map(report => (report.id === id ? response.data : report)));
  };

  const deleteReport = async (id) => {
    await axiosInstance.delete(`/reports/${id}`);
    setReports(reports.filter(report => report.id !== id));
  };

  return (
    <ReportContext.Provider value={{ reports, fetchReports, addReport, updateReport, deleteReport }}>
      {children}
    </ReportContext.Provider>
  );
};