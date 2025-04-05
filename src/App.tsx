'use client';

import type React from 'react';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/dashboard/Dashboard';
import LoadingScreen from './components/ui/LoadingScreen';
import CustomersPage from './pages/customers/customer';
import InquiryTemplateManagement from './pages/inquiryTemplate/InquiryTemplateManagement';
import InquiryTemplateCreate from './pages/inquiryTemplate/InquiryTemplateCreate';

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 인증되지 않았으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

// 이미 인증된 사용자를 위한 래퍼 컴포넌트 (로그인 페이지 등에서 사용)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // 이미 인증된 경우 대시보드로 리다이렉트
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // 인증되지 않은 경우 바로 자식 컴포넌트 렌더링
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />

      {/* 인증이 필요한 페이지 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inquiry-templates"
        element={
          <ProtectedRoute>
            <InquiryTemplateManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inquiry-templates/create"
        element={
          <ProtectedRoute>
            <InquiryTemplateCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inquiry-templates/edit/:id"
        element={
          <ProtectedRoute>
            <InquiryTemplateCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        }
      />

      {/* 기본 리다이렉트 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
