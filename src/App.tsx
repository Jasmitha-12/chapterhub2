import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { DomainsPage } from './pages/DomainsPage';
import { CalendarPage } from './pages/CalendarPage';
import { MembersPage } from './pages/MembersPage';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <DataProvider>
            <HashRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="domains" element={<DomainsPage />} />
                  <Route path="domains/:domainSlug" element={<DomainsPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="members" element={<MembersPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </HashRouter>
          </DataProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
