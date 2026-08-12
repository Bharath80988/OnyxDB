import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlatformPage from './pages/PlatformPage';
import FeaturesPage from './pages/FeaturesPage';
import ArchitecturePage from './pages/ArchitecturePage';
import DocsPage from './pages/DocsPage';
import StudioPage from './pages/StudioPage';
import CliPage from './pages/CliPage';
import ExamplesPage from './pages/ExamplesPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/platform" element={<PlatformPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/cli" element={<CliPage />} />
        <Route path="/examples" element={<ExamplesPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
