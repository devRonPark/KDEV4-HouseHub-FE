'use client';

import type React from 'react';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/dashboard/Dashboard';
import PropertyRegistration from './pages/property/PropertyRegistration';
import PropertyList from './pages/property/PropertyList';
import PropertyDetail from './pages/property/PropertyDetail';
import PropertyEdit from './pages/property/PropertyEdit';
import ContractList from './pages/contract/ContractList';
import ContractRegistration from './pages/contract/ContractRegistration';
import ContractDetail from './pages/contract/ContractDetail';
import ContractEdit from './pages/contract/ContractEdit';
import LoadingScreen from './components/ui/LoadingScreen';
import CustomersPage from './pages/customers/customer';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';
import InquiryTemplateManagement from './pages/inquiryTemplate/InquiryTemplateManagement';
import InquiryTemplateCreate from './pages/inquiryTemplate/InquiryTemplateCreate';
import InquiryFormPage from './pages/inquiryForm/InquiryFormPage';
import InquiryCompletePage from './pages/inquiryForm/InquiryCompletePage';
import SmsListPage from './pages/sms/sms';
import SmsSendPage from './pages/sms/send';
import SmsTemplateListPage from './pages/sms/templates/templates';
import SmsTemplateCreatePage from './pages/sms/templates/create';
import SmsTemplateEditPage from './pages/sms/templates/[id]';
import InquiryManagement from './pages/inquiryManagement/InquiryManagement';
import ConsultationDetailPage from './pages/consultation/ConsultationDetailPage';
import ConsultationFormPage from './pages/consultation/ConsultationFormPage';
import ConsultationListPage from './pages/consultation/ConsultationListPage';
import InquiryDetailPage from './pages/inquiryManagement/InquiryDetail';
import NotificationsPage from './pages/notification/NotificationPage';
import { CrawlingPropertyPage } from './pages/crawling-property/CrawlingPropertyPage';

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
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <CustomerDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sms"
        element={
          <ProtectedRoute>
            <SmsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sms/send"
        element={
          <ProtectedRoute>
            <SmsSendPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sms/templates"
        element={
          <ProtectedRoute>
            <SmsTemplateListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sms/templates/create"
        element={
          <ProtectedRoute>
            <SmsTemplateCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sms/templates/edit/:id"
        element={
          <ProtectedRoute>
            <SmsTemplateEditPage />
          </ProtectedRoute>
        }
      />

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
      <Route
        path="/contracts/:id"
        element={
          <ProtectedRoute>
            <ContractDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts/edit/:id"
        element={
          <ProtectedRoute>
            <ContractEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inquiries"
        element={
          <ProtectedRoute>
            <InquiryManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inquiries/:inquiryId/answers"
        element={
          <ProtectedRoute>
            <InquiryDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/consultations" element={<ConsultationListPage />} />
      <Route path="/consultations/:id" element={<ConsultationDetailPage />} />
      <Route path="/consultations/new" element={<ConsultationFormPage />} />
      <Route path="/consultations/:id/edit" element={<ConsultationFormPage />} />

      {/* 공개 문의 페이지 (인증 불필요) */}
      <Route path="/inquiry/share/:shareToken" element={<InquiryFormPage />} />
      <Route path="/inquiry/complete" element={<InquiryCompletePage />} />

      {/* 라우트 추가 */}
      <Route
        path="/crawling-properties"
        element={
          <ProtectedRoute>
            <CrawlingPropertyPage />
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
