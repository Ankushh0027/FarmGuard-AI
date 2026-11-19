import React, { useState, Suspense, lazy } from 'react';
import { FarmProvider } from './context/FarmContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import OverviewPage from './pages/OverviewPage';

// Lazy-loaded routes for code splitting
const FarmsPage = lazy(() => import('./pages/FarmsPage'));
const CropHealthPage = lazy(() => import('./pages/CropHealthPage'));
const FarmAnalysisPage = lazy(() => import('./pages/FarmAnalysisPage'));
const AIAdvisorPage = lazy(() => import('./pages/AIAdvisorPage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const CropSoilPage = lazy(() => import('./pages/CropSoilPage'));
const SavingsPage = lazy(() => import('./pages/SavingsPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const MarketPage = lazy(() => import('./pages/MarketPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const EvaluationPage = lazy(() => import('./pages/EvaluationPage'));
const SecurityCenterPage = lazy(() => import('./pages/SecurityCenterPage'));
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage setActivePage={setActivePage} />;
      case 'farms':
        return <FarmsPage setActivePage={setActivePage} />;
      case 'crophealth':
        return <CropHealthPage setActivePage={setActivePage} />;
      case 'weather':
        return <WeatherPage setActivePage={setActivePage} />;
      case 'irrigation':
      case 'analysis':
        return <FarmAnalysisPage setActivePage={setActivePage} />;
      case 'advisor':
        return <AIAdvisorPage setActivePage={setActivePage} />;
      case 'market':
        return <MarketPage setActivePage={setActivePage} />;
      case 'alerts':
        return <AlertsPage setActivePage={setActivePage} />;
      case 'cropsoil':
        return <CropSoilPage setActivePage={setActivePage} />;
      case 'savings':
        return <SavingsPage setActivePage={setActivePage} />;
      case 'activity':
        return <ActivityPage setActivePage={setActivePage} />;
      case 'settings':
        return <SettingsPage setActivePage={setActivePage} />;
      case 'community':
        return <CommunityPage setActivePage={setActivePage} />;
      case 'evaluation':
        return <EvaluationPage setActivePage={setActivePage} />;
      case 'security':
        return <SecurityCenterPage setActivePage={setActivePage} />;
      case 'architecture':
        return <ArchitecturePage setActivePage={setActivePage} />;
      case 'about':
        return <AboutPage setActivePage={setActivePage} />;
      default:
        return <OverviewPage setActivePage={setActivePage} />;
    }
  };

  return (
    <FarmProvider>
      <div className="app-layout">
        {/* Persistent Farmer Navigation Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Mobile Sidebar Backdrop Overlay */}
        <div
          className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Main Application Area */}
        <div className="main-wrapper">
          <Header
            activePage={activePage}
            setActivePage={setActivePage}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="main-content">
            <ErrorBoundary onReset={() => setActivePage('overview')}>
              <Suspense fallback={
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '360px',
                  gap: '12px',
                  color: 'var(--color-brand)'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid var(--border-default)',
                    borderTopColor: 'var(--color-brand)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Loading precision view...
                  </span>
                </div>
              }>
                {renderPage()}
              </Suspense>
            </ErrorBoundary>
          </main>

          {/* Mobile Bottom Navigation Bar (< 768px) */}
          <BottomNav
            activePage={activePage}
            setActivePage={setActivePage}
          />
        </div>
      </div>
    </FarmProvider>
  );
}