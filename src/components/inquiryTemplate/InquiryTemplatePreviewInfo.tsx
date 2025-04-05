'use client';

import type React from 'react';
import type { InquiryTemplate } from '../../types/inquiryTemplate';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface InquiryTemplatePreviewInfoProps {
  template: InquiryTemplate;
  onToggleView: () => void;
  showForm: boolean;
}

const InquiryTemplatePreviewInfo: React.FC<InquiryTemplatePreviewInfoProps> = ({
  template,
  onToggleView,
  showForm,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
    } catch (error) {
      return '날짜 정보 없음';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">템플릿 정보</h4>
        <button
          onClick={onToggleView}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          {showForm ? '템플릿 정보 보기' : '문의 폼 보기'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h5 className="text-sm font-medium text-gray-500">템플릿 이름</h5>
          <p className="text-gray-900">{template.name}</p>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-500">상태</h5>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {template.active ? '활성화' : '비활성화'}
          </span>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-500">생성일</h5>
          <p className="text-gray-900">{formatDate(template.createdAt)}</p>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-500">최종 수정일</h5>
          <p className="text-gray-900">{formatDate(template.updatedAt)}</p>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-500">질문 수</h5>
          <p className="text-gray-900">{template.questions?.length || 0}개</p>
        </div>
      </div>
    </div>
  );
};

export default InquiryTemplatePreviewInfo;
