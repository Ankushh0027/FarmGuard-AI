import React, { useState } from 'react';
import { FarmProvider } from './context/FarmContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewPage from './pages/OverviewPage';
import FarmAnalysisPage from './pages/FarmAnalysisPage';
import AIAdvisorPage from './pages/AIAdvisorPage';
import WeatherPage from './pages/WeatherPage';
import ActivityPage from './pages/ActivityPage';
import EvaluationPage from './pages/EvaluationPage';
import SecurityCenterPage from './pages/SecurityCenterPage';
import ArchitecturePage from './pages/ArchitecturePage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage setActivePage={setActivePage} />;
      case 'analysis':
        return <FarmAnalysisPage />;
      case 'advisor':
        return <AIAdvisorPage />;
      case 'weather':
        return <WeatherPage />;
      case 'activity':
        return <ActivityPage />;
      case 'evaluation':
        return <EvaluationPage />;
      case 'security':
        return <SecurityCenterPage />;
      case 'architecture':
        return <ArchitecturePage />;
      case 'about':
        return <AboutPage />;
      default:
        return <OverviewPage setActivePage={setActivePage} />;
    }
  };

  return (
    <FarmProvider>
      <div className="app-layout">
        {/* Persistent SaaS Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Main Application Area */}
        <div className="main-wrapper">
          <Header
            activePage={activePage}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="page-container">
            {renderPage()}
          </main>
        </div>
      </div>
    </FarmProvider>
  );
}
