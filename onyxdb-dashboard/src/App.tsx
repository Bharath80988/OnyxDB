import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DocsPage from './pages/DocsPage';
import DashboardPage from './pages/DashboardPage';
import StatusPage from './pages/StatusPage';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 0.6,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-onyx-900 text-gray-900 dark:text-onyx-100 flex flex-col font-sans relative transition-colors duration-300">
        <Navbar />
        <div className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/status" element={<StatusPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
