import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard'; // Đây sẽ là trang Sổ tay lỗi sai sau này
import TestSession from './pages/TestSession';
import ApiKeyModal from './components/ApiKeyModal';
import TestHub from './pages/TestHub';
import ResultPage from './pages/ResultPage';

const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export default function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <BrowserRouter>
      <ApiKeyModal /> 
      
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
        />

        {/* 🚀 BIẾN TEST HUB THÀNH TRANG CHỦ (DASHBOARD CHÍNH) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <TestHub />
            </ProtectedRoute>
          } 
        />

        {/* Tạm thời dời cái Sổ tay lỗi sai (Dashboard cũ) sang link này để mai làm tiếp */}
        <Route 
          path="/mistakes" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/test/:testId" 
          element={
            <ProtectedRoute>
              <TestSession />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/result/:historyId" element={<ResultPage />} />

        {/* Bắt các đường dẫn lỗi trả về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}