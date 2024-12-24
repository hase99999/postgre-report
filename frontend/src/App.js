// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import PtinfoList from './components/PtinfoList';
import PtinfoDetail from './components/PtinfoDetail';
import DoctorList from './components/DoctorList';
import DoctorDetail from './components/DoctorDetail';
import ReportList from './components/ReportList';
import ReportDetail from './components/ReportDetail';
import Login from './components/Login';
import Home from './components/Home';
import PtinfoImport from './components/PtinfoImport';
import ReportImport from './components/ReportImport';
import DoctorImport from './components/DoctorImport';
import ScheduleImport from './components/ScheduleImport';
import ScheduleList from './components/ScheduleList';
import ScheduleDetail from './components/ScheduleDetail';
import ScheduleForm from './components/ScheduleForm'; // スケジュール入力画面をインポート
import Logout from './components/Logout';
import FetchAndSaveData from './components/FetchAndSaveData';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/home" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <PrivateRoute>
              <ReportList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/reports/:id" 
          element={
            <PrivateRoute>
              <ReportDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/ptinfos" 
          element={
            <PrivateRoute>
              <PtinfoList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/ptinfos/:id" 
          element={
            <PrivateRoute>
              <PtinfoDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/doctors" 
          element={
            <PrivateRoute>
              <DoctorList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/doctors/:id" 
          element={
            <PrivateRoute>
              <DoctorDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/ptinfo-import" 
          element={
            <PrivateRoute>
              <PtinfoImport />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/report-import" 
          element={
            <PrivateRoute>
              <ReportImport />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/doctor-import" 
          element={
            <PrivateRoute>
              <DoctorImport />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/schedule-import" 
          element={
            <PrivateRoute>
              <ScheduleImport />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/schedules" 
          element={
            <PrivateRoute>
              <ScheduleList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/schedules/:id" 
          element={
            <PrivateRoute>
              <ScheduleDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/schedule/new" 
          element={
            <PrivateRoute>
              <ScheduleForm />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/fetch-and-save" 
          element={
            <PrivateRoute>
              <FetchAndSaveData />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/logout" 
          element={
            <PrivateRoute>
              <Logout />
            </PrivateRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;