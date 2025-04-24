'use client';

import type React from 'react';
import { Share2 } from 'react-feather';
import type { InquiryTemplate } from '../../types/inquiryTemplate';
import Button from '../ui/Button';

interface InquiryTemplatePreviewInfoProps {
  template: InquiryTemplate;
  onToggleView: () => void;
  showForm: boolean;
  onShare?: () => void;
}

const InquiryTemplatePreviewInfo: React.FC<InquiryTemplatePreviewInfoProps> = ({
  template,
  onToggleView,
  showForm,
  onShare,
}) => {
  // 템플릿 유형 표시 포맷팅
  const formatTemplateType = (type: string) => {
    if (!type) return '-';

    // 유형_목적 형태로 되어 있는 경우 분리
    const parts = type.split('_');
    if (parts.length === 2) {
      return `${parts[0]} (${parts[1]})`;
    }

    return type;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">템플릿 정보</h4>
        <div className="flex space-x-2">
          {onShare && (
            <Button
              type="button"
              variant="outline"
              onClick={onShare}
              className="inline-flex items-center text-sm"
            >
              <Share2 className="mr-1 h-4 w-4" />
              공유
            </Button>
          )}
          <button
            onClick={onToggleView}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            폼 미리보기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium text-gray-500 mb-1">템플릿 이름</h5>
          <p className="text-base text-gray-900">{template.name}</p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500 mb-1">유형</h5>
          <p className="text-base text-gray-900">
            {formatTemplateType(template.type.toString() || '')}
          </p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500 mb-1">상태</h5>
          <p className="text-base text-gray-900">
            {template.isActive ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                활성화
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                비활성화
              </span>
            )}
          </p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500 mb-1">질문 수</h5>
          <p className="text-base text-gray-900">{template.questions?.length || 0}개</p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500 mb-1">생성일</h5>
          <p className="text-base text-gray-900">
            {new Date(template.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500 mb-1">마지막 수정일</h5>
          <p className="text-base text-gray-900">
            {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InquiryTemplatePreviewInfo;
