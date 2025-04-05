'use client';

import type React from 'react';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/dashboard/Dashboard';
import PropertyRegistration from './pages/property/PropertyRegistration';
import PropertyList from './pages/property/PropertyList';
import PropertyDetail from './pages/property/PropertyDetail';
import PropertyEdit from './pages/property/PropertyEdit';
import ContractList from './pages/contract/ContractList';
import ContractRegistration from './pages/contract/ContractRegistration';
import LoadingScreen from './components/ui/LoadingScreen';

import CustomersPage from './pages/customers/customer';

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return <LoadingScreen />;
  }

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
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/register"
        element={
          <ProtectedRoute>
            <PropertyRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute>
            <PropertyList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:id"
        element={
          <ProtectedRoute>
            <PropertyDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/edit/:id"
        element={
          <ProtectedRoute>
            <PropertyEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts"
        element={
          <ProtectedRoute>
            <ContractList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts/register"
        element={
          <ProtectedRoute>
            <ContractRegistration />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<div>홈</div>} />

      {/* 보호된 라우트 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
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
    </Routes>
  );
}

export default App;
