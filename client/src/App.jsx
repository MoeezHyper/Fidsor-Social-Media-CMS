import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SocialPublisher from './pages/SocialPublisher';
import SocialAnalytics from './pages/SocialAnalytics';
import UserManagement from './pages/UserManagement';

function MainLayout() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fidsor-theme') || 'dark';
  });
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fidsor-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <ProtectedRoute>
      <div className="app-container">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="main-content">
          <Header
            theme={theme}
            toggleTheme={toggleTheme}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
          />
          <main>
            {(activeTab === 'analytics' || activeTab === 'dashboard') && <SocialAnalytics />}
            {activeTab === 'publisher' && <SocialPublisher />}
            {activeTab === 'users' && (
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
