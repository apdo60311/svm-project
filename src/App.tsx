import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import DataPage from './pages/DataPage';
import ModelPage from './pages/ModelPage';
import ResultsPage from './pages/ResultsPage';
import PredictionPage from './pages/PredictionPage';

// Components
import Layout from './components/layout/Layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="data" element={<DataPage />} />
        <Route path="model" element={<ModelPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="predict" element={<PredictionPage />} />
      </Route>
    </Routes>
  );
}

export default App;