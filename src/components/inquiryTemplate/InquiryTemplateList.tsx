'use client';

import type React from 'react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Edit, Eye, Trash } from 'react-feather';
import type { InquiryTemplate } from '../../types/inquiryTemplate';

interface InquiryTemplateListProps {
  inquiryTemplates: InquiryTemplate[];
  onEdit: (inquiryTemplate: InquiryTemplate) => void;
  onPreview: (inquiryTemplate: InquiryTemplate) => void;
  onDelete: (inquiryTemplate: InquiryTemplate) => void;
  isLoading: boolean;
}

const InquiryTemplateList: React.FC<InquiryTemplateListProps> = ({
  inquiryTemplates,
  onEdit,
  onPreview,
  onDelete,
  isLoading,
}) => {
  const [expandedActions, setExpandedActions] = useState<string | null>(null);

  const toggleActions = (id: string) => {
    setExpandedActions(expandedActions === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
    } catch (error) {
      return '날짜 정보 없음';
    }
  };

  // 설명 텍스트 줄임 함수
  const truncateDescription = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-gray-100 p-4 mb-4 rounded-lg">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (inquiryTemplates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">등록된 문의 템플릿이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              이름
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              설명
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              상태
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              생성일
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              작업
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inquiryTemplates.map((inquiryTemplate) => (
            <tr key={inquiryTemplate.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{inquiryTemplate.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  {truncateDescription(inquiryTemplate.description)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    inquiryTemplate.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {inquiryTemplate.isActive ? '활성화' : '비활성화'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(inquiryTemplate.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative flex justify-end items-center space-x-2">
                  <button
                    onClick={() => onPreview(inquiryTemplate)}
                    className="text-blue-600 hover:text-blue-900"
                    title="미리보기"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(inquiryTemplate)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="수정"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(inquiryTemplate)}
                    className="text-red-600 hover:text-red-900"
                    title="삭제"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InquiryTemplateList;
