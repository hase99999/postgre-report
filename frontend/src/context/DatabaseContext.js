import React, { createContext, useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const DatabaseContext = createContext();

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [ptinfos, setPtinfos] = useState([]);

  const fetchReports = async () => {
    const response = await axiosInstance.get('/reports');
    setReports(response.data);
  };

  const addReport = async (data) => {
    const response = await axiosInstance.post('/reports', data);
    setReports([...reports, response.data]);
  };

  const updateReport = async (id, data) => {
    const response = await axiosInstance.put(`/reports/${id}`, data);
    setReports(reports.map(report => (report.id === id ? response.data : report)));
  };

  const deleteReport = async (id) => {
    await axiosInstance.delete(`/reports/${id}`);
    setReports(reports.filter(report => report.id !== id));
  };

  const fetchDoctors = async () => {
    const response = await axiosInstance.get('/doctors');
    setDoctors(response.data);
  };

  const addDoctor = async (data) => {
    const response = await axiosInstance.post('/doctors', data);
    setDoctors([...doctors, response.data]);
  };

  const updateDoctor = async (id, data) => {
    const response = await axiosInstance.put(`/doctors/${id}`, data);
    setDoctors(doctors.map(doctor => (doctor.id === id ? response.data : doctor)));
  };

  const deleteDoctor = async (id) => {
    await axiosInstance.delete(`/doctors/${id}`);
    setDoctors(doctors.filter(doctor => doctor.id !== id));
  };

  const fetchPtinfos = async () => {
    const response = await axiosInstance.get('/ptinfos');
    setPtinfos(response.data);
  };

  return (
    <DatabaseContext.Provider value={{
      reports, fetchReports, addReport, updateReport, deleteReport,
      doctors, fetchDoctors, addDoctor, updateDoctor, deleteDoctor,
      ptinfos, fetchPtinfos
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};