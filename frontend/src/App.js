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
import Logout from './components/Logout'; // 追加

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PrivateRoute element={Home} />} />
        <Route path="/reports" element={<PrivateRoute element={ReportList} />} />
        <Route path="/report/:id" element={<PrivateRoute element={ReportDetail} />} />
        <Route path="/doctors" element={<PrivateRoute element={DoctorList} />} />
        <Route path="/doctor/:docid" element={<PrivateRoute element={DoctorDetail} />} />
        <Route path="/ptinfos" element={<PrivateRoute element={PtinfoList} />} />
        <Route path="/ptinfo/:ptnumber" element={<PrivateRoute element={PtinfoDetail} />} />
        <Route path="/import" element={<PrivateRoute element={PtinfoImport} />} />
        <Route path="/import/report" element={<PrivateRoute element={ReportImport} />} />
        <Route path="/import/doctor" element={<PrivateRoute element={DoctorImport} />} />
        <Route path="/import/schedule" element={<PrivateRoute element={ScheduleImport} />} />
        <Route path="/schedules" element={<PrivateRoute element={ScheduleList} />} />
        <Route path="/schedule/:id" element={<PrivateRoute element={ScheduleDetail} />} />
        <Route path="/logout" element={<Logout />} /> {/* 追加 */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;