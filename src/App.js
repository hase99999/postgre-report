import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Report from './components/Report';
import Doctor from './components/Doctor';
import Ptinfo from './components/Ptinfo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<Report />} />
        <Route path="/doctors" element={<Doctor />} />
        <Route path="/ptinfos" element={<Ptinfo />} />
      </Routes>
    </Router>
  );
}

export default App;