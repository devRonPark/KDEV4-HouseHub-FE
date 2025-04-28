'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicInquiryTemplate } from '../../api/inquiry';
import type { InquiryTemplate, FormState } from '../../types/inquiry';
import FormRenderer from '../../components/inquiry/FormRenderer';
import ErrorMessage from '../../components/inquiry/ErrorMessage';
import LogoWithText from '../../components/LogoWithText';

const InquiryFormPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [template, setTemplate] = useState<InquiryTemplate | null>(null);
  const [formState, setFormState] = useState<FormState>({
    isLoading: true,
    isSubmitting: false,
    error: null,
  });

  // 템플릿 조회
  const fetchTemplate = async () => {
    if (!shareToken) {
      setFormState({
        isLoading: false,
        isSubmitting: false,
        error: '유효하지 않은 공유 링크입니다.',
      });
      return;
    }

    setFormState({
      ...formState,
      isLoading: true,
      error: null,
    });

    try {
      const data = await getPublicInquiryTemplate(shareToken);
      setTemplate(data);
      setFormState({
        ...formState,
        isLoading: false,
      });
    } catch (error) {
      setFormState({
        isLoading: false,
        isSubmitting: false,
        error: error instanceof Error ? error.message : '템플릿을 불러오는 중 오류가 발생했습니다.',
      });
    }
  };

  // 컴포넌트 마운트 시 템플릿 조회
  useEffect(() => {
    fetchTemplate();
  }, [shareToken]);

  // 제출 시작 핸들러
  const handleSubmitStart = () => {
    setFormState({
      ...formState,
      isSubmitting: true,
      error: null,
    });
  };

  // 제출 성공 핸들러
  const handleSubmitSuccess = () => {
    setFormState({
      ...formState,
      isSubmitting: false,
    });
  };

  // 제출 에러 핸들러
  const handleSubmitError = (error: string) => {
    setFormState({
      ...formState,
      isSubmitting: false,
      error,
    });
  };

  // 로딩 중 UI
  if (formState.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="mb-8">
          <LogoWithText width={240} height={60} />
        </div>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    );
  }

  // 에러 UI
  if (formState.error && !template) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <LogoWithText width={240} height={60} className="mx-auto" />
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              문의 양식을 불러올 수 없습니다
            </h2>
            <ErrorMessage message={formState.error} onRetry={fetchTemplate} />

            <div className="text-center mt-6">
              <p className="text-gray-500">문제가 지속되면 관리자에게 문의해주세요.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 템플릿이 없는 경우
  if (!template) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <LogoWithText width={240} height={60} className="mx-auto" />
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="mt-2 text-lg font-medium text-gray-900">
                문의 양식을 찾을 수 없습니다
              </h2>
              <p className="mt-2 text-gray-500">유효하지 않은 공유 링크입니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 메인 UI
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <LogoWithText width={240} height={60} className="mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">{'문의하기'}</h1>
        <p className="text-md text-gray-600 mb-6">
          {template.description || '궁금한 점이나 요청 사항이 있다면 아래에 작성해 주세요.'}
        </p>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {formState.error && <ErrorMessage message={formState.error} />}

          <FormRenderer
            template={template}
            shareToken={shareToken || ''}
            onSubmitStart={handleSubmitStart}
            onSubmitSuccess={handleSubmitSuccess}
            onSubmitError={handleSubmitError}
          />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} HouseHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default InquiryFormPage;
