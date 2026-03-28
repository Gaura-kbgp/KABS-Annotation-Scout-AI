import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Pages/Dashboard';
import { ProjectList } from './components/Pages/ProjectList';
import { EditorPage } from './components/Editor/EditorPage';
import { DrawingSuggestionAI } from './components/DrawingAI/DrawingSuggestionAI';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { Layout } from './components/Layout/Layout';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Root Redirects to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <Layout><Dashboard /></Layout>
          } />

          <Route path="/projects" element={
            <Layout><ProjectList /></Layout>
          } />

          <Route path="/editor/:id" element={
            <Layout><EditorPage /></Layout>
          } />

          <Route path="/scout" element={
            <Layout><DrawingSuggestionAI /></Layout>
          } />

          {/* Admin Routes (Kept as separate for management) */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Fallback for old login links */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
