import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import ScheduleForm from './components/ScheduleForm';
import Logout from './components/Logout';
import FetchAndSaveData from './components/FetchAndSaveData';
import TeachingImport from './components/TeachingImport';

function App() {
  return (
    <AuthProvider>
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
            path="/report/:id" 
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
            path="/ptinfos/:ptnumber" 
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
            path="/doctor/:docid" 
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
          /> <Route path="/import-teaching-file" element={
            <PrivateRoute>
              <TeachingImport />
            </PrivateRoute>
          } />
          
          <Route path="/import" element={<Navigate to="/ptinfo-import" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;