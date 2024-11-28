import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const DatabaseContext = createContext();

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [ptinfos, setPtinfos] = useState([]);

  const fetchReports = async () => {
    const response = await axios.get('/reports');
    setReports(response.data);
  };

  const addReport = async (data) => {
    const response = await axios.post('/reports', data);
    setReports([...reports, response.data]);
  };

  const updateReport = async (id, data) => {
    const response = await axios.put(`/reports/${id}`, data);
    setReports(reports.map(report => (report.id === id ? response.data : report)));
  };

  const deleteReport = async (id) => {
    await axios.delete(`/reports/${id}`);
    setReports(reports.filter(report => report.id !== id));
  };

  const fetchDoctors = async () => {
    const response = await axios.get('/doctors');
    setDoctors(response.data);
  };

  const addDoctor = async (data) => {
    const response = await axios.post('/doctors', data);
    setDoctors([...doctors, response.data]);
  };

  const updateDoctor = async (id, data) => {
    const response = await axios.put(`/doctors/${id}`, data);
    setDoctors(doctors.map(doctor => (doctor.id === id ? response.data : doctor)));
  };

  const deleteDoctor = async (id) => {
    await axios.delete(`/doctors/${id}`);
    setDoctors(doctors.filter(doctor => doctor.id !== id));
  };

  const fetchPtinfos = async () => {
    const response = await axios.get('/ptinfos');
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