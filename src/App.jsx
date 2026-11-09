import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import InputFlow from './pages/InputFlow';
import Dashboard from './pages/Dashboard';
import CropCarePage from './features/crop-care/CropCarePage';
import ClimateRiskDashboard from './features/climate-risk/components/ClimateRiskDashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<InputFlow />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/climate-risk" element={<ClimateRiskDashboard />} />
          <Route path="/crop-care" element={<CropCarePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
