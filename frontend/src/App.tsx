import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TestSession from './pages/TestSession';
import ApiKeyModal from './components/ApiKeyModal';
import type React from 'react';

// Hàm bảo vệ Route: Nếu chưa đăng nhập thì đá về /auth
const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem('user_id');
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export default function App() {
  const isAuthenticated = !!localStorage.getItem('user_id');

  return (
    <BrowserRouter>
      {/* Modal nhập Key Gemini luôn luôn chạy ngầm để check */}
      <ApiKeyModal /> 
      
      <Routes>
        {/* Route Đăng nhập/Đăng ký */}
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
        />

        {/* Route Dashboard (Trang chủ) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Route Phòng Thi */}
        <Route 
          path="/test" 
          element={
            <ProtectedRoute>
              <TestSession />
            </ProtectedRoute>
          } 
        />
        
        {/* Bắt mọi route sai (404) đá về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}