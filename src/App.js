import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import ReportList from './components/ReportList'; // 修正
import Doctor from './components/Doctor';
import Ptinfo from './components/Ptinfo';
import PtinfoImport from './components/PtinfoImport';
import ReportImport from './components/ReportImport';
import ReportDetail from './components/ReportDetail'; // 追加

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<ReportList />} /> {/* 修正 */}
        <Route path="/doctors" element={<Doctor />} />
        <Route path="/ptinfos" element={<Ptinfo />} />
        <Route path="/import" element={<PtinfoImport />} />
        <Route path="/import/report" element={<ReportImport />} />
        <Route path="/report/:id" element={<ReportDetail />} /> {/* 追加 */}
      </Routes>
    </Router>
  );
}

export default App;