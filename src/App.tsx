import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './routes/ProtectedRoute.tsx';
import { DashboardLayout } from './layouts/DashboardLayout.tsx';

// Pages
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ProjectsListPage } from './pages/ProjectsListPage.tsx';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage.tsx';
import { TasksPage } from './pages/TasksPage.tsx';
import { TeamPage } from './pages/TeamPage.tsx';
import { CalendarPage } from './pages/CalendarPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { UnauthorizedPage } from './pages/UnauthorizedPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected Authenticated Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* 404 Wildcard */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
