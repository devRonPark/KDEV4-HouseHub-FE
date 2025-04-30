'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Share2 } from 'react-feather';
import { getInquiryTemplateById } from '../../api/inquiryTemplate';
import { QuestionType, type InquiryTemplate, type Question } from '../../types/inquiryTemplate';
import { useToast } from '../../context/useToast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Calendar, Paperclip, Mail, Phone, Hash } from 'react-feather';
import InquiryTemplatePreviewInfo from './InquiryTemplatePreviewInfo';
import ShareTemplateDialog from './ShareTemplateDialog';

interface InquiryTemplatePreviewProps {
  inquiryTemplate: InquiryTemplate;
  onClose: () => void;
}

const InquiryTemplatePreview: React.FC<InquiryTemplatePreviewProps> = ({
  inquiryTemplate: initialTemplate,
  onClose,
}) => {
  const [template, setTemplate] = useState<InquiryTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchTemplateDetails = async () => {
      setIsLoading(true);
      try {
        const response = await getInquiryTemplateById(initialTemplate.id);
        if (response.success && response.data) {
          setTemplate(response.data);
        } else {
          showToast(response.error || '템플릿 상세 정보를 불러오는데 실패했습니다.', 'error');
        }
      } catch {
        showToast('템플릿 상세 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplateDetails();
  }, [initialTemplate.id, showToast]);

  // 공유 다이얼로그 열기
  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
  };

  // 질문 유형에 따른 입력 필드 렌더링
  const renderQuestionField = (question: Question) => {
    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <Input
            label={question.label}
            placeholder={`${question.label} 입력`}
            required={question.isRequired}
            disabled
          />
        );
      case QuestionType.TEXTAREA:
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={4}
              placeholder={`${question.label} 입력`}
              disabled
            />
          </div>
        );
      case QuestionType.SELECT:
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled
            >
              <option value="">선택하세요</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case QuestionType.RADIO:
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`${question.id}-${index}`}
                    name={question.id}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                    disabled
                  />
                  <label
                    htmlFor={`${question.id}-${index}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case QuestionType.CHECKBOX:
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${question.id}-${index}`}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    disabled
                  />
                  <label
                    htmlFor={`${question.id}-${index}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case QuestionType.DATE:
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled
              />
            </div>
          </div>
        );
      case QuestionType.FILE:
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center">
              <Button type="button" variant="outline" className="inline-flex items-center" disabled>
                <Paperclip size={16} className="mr-2" />
                파일 선택
              </Button>
              <span className="ml-3 text-sm text-gray-500">선택된 파일 없음</span>
            </div>
          </div>
        );
      case QuestionType.EMAIL:
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                type="email"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="example@example.com"
                disabled
              />
            </div>
          </div>
        );
      case QuestionType.PHONE:
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={16} className="text-gray-400" />
              </div>
              <input
                type="tel"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="010-0000-0000"
                disabled
              />
            </div>
          </div>
        );
      case QuestionType.NUMBER:
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash size={16} className="text-gray-400" />
              </div>
              <input
                type="number"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="숫자 입력"
                disabled
              />
            </div>
          </div>
        );
      case QuestionType.REGION:
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.label} {question.isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled
              >
                <option value="">도/특별시/광역시 선택</option>
              </select>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled
              >
                <option value="">시/군/구 선택</option>
              </select>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled
              >
                <option value="">읍/면/동 선택</option>
              </select>
            </div>
          </div>
        );
      default:
        return (
          <Input
            label={question.label}
            placeholder={`${question.label} 입력`}
            required={question.isRequired}
            disabled
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
          <h3 className="text-lg font-medium">문의 템플릿 미리보기: {initialTemplate.name}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
          <h3 className="text-lg font-medium">문의 템플릿 미리보기</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-center text-gray-500">템플릿 정보를 불러올 수 없습니다.</p>
        </div>
        <div className="px-6 py-3 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  // 질문을 순서대로 정렬
  const sortedQuestions =
    template.questions && template.questions.length > 0
      ? [...template.questions].sort((a, b) => a.questionOrder - b.questionOrder)
      : [];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
        <h3 className="text-lg font-medium">문의 템플릿 미리보기: {template.name}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenShareDialog}
            className="text-white hover:text-gray-200 focus:outline-none flex items-center"
            title="템플릿 공유"
          >
            <Share2 size={20} />
          </button>
          <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-6">
        {/* 템플릿 정보/폼 토글 */}
        {!showForm && (
          <InquiryTemplatePreviewInfo
            template={template}
            onToggleView={() => setShowForm(!showForm)}
            onShare={handleOpenShareDialog}
          />
        )}

        {/* 템플릿 설명 */}
        <div className="mb-6">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: template.description }}
          />
        </div>

        {/* 폼 미리보기 */}
        {showForm ? (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">문의 폼</h4>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                템플릿 정보 보기
              </button>
            </div>

            <div className="space-y-6">
              {sortedQuestions.length > 0 ? (
                sortedQuestions.map((question) => (
                  <div key={question.id} className="bg-white p-4 rounded-md border border-gray-200">
                    {renderQuestionField(question)}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">등록된 질문이 없습니다.</p>
              )}

              {/* 제출 버튼 (비활성화) */}
              <div className="pt-4">
                <Button type="button" variant="primary" fullWidth disabled>
                  문의하기
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  * 이 폼은 미리보기용으로, 실제로 제출되지 않습니다.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="px-6 py-3 bg-gray-50 text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          닫기
        </button>
      </div>

      {/* 공유 다이얼로그 */}
      <ShareTemplateDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        templateId={template.id}
        templateName={template.name}
        shareToken={template.shareToken || template.id}
      />
    </div>
  );
};

export default InquiryTemplatePreview;
