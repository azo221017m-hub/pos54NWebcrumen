import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TablasDashboard } from "./components/TablasDashboard";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TablasDashboard />} />
              </Routes>
    </Router>
  );
};

export default App;
