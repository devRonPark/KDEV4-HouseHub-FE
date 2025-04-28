'use client';

import type React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Edit, Eye, Share2, Trash } from 'react-feather';
import type { InquiryTemplate } from '../../types/inquiryTemplate';
import { useState } from 'react';
import ShareTemplateDialog from './ShareTemplateDialog';
import { Chip } from '@mui/material';

// 💡 배지 스타일 매핑 유틸
const typeBadgeStyles: Record<string, string> = {
  아파트_매수: 'bg-blue-100 text-blue-800',
  아파트_매도: 'bg-red-100 text-red-800',
  아파트_임대: 'bg-green-100 text-green-800',
  아파트_임차: 'bg-yellow-100 text-yellow-800',
  오피스텔_매수: 'bg-blue-100 text-blue-800',
  오피스텔_매도: 'bg-red-100 text-red-800',
  오피스텔_임대: 'bg-green-100 text-green-800',
  오피스텔_임차: 'bg-yellow-100 text-yellow-800',
  상가_매수: 'bg-indigo-100 text-indigo-800',
  상가_매도: 'bg-pink-100 text-pink-800',
  상가_임대: 'bg-teal-100 text-teal-800',
  상가_임차: 'bg-amber-100 text-amber-800',
  사무실_매수: 'bg-cyan-100 text-cyan-800',
  사무실_매도: 'bg-rose-100 text-rose-800',
  사무실_임대: 'bg-lime-100 text-lime-800',
  사무실_임차: 'bg-orange-100 text-orange-800',
  원룸_매수: 'bg-fuchsia-100 text-fuchsia-800',
  원룸_매도: 'bg-rose-100 text-rose-800',
  원룸_임대: 'bg-emerald-100 text-emerald-800',
  원룸_임차: 'bg-violet-100 text-violet-800',
};

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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InquiryTemplate | null>(null);

  // 공유 다이얼로그 열기
  const handleOpenShareDialog = (template: InquiryTemplate, e?: React.MouseEvent) => {
    // 이벤트가 있으면 전파 방지
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setSelectedTemplate(template);
    setShareDialogOpen(true);
  };

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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
    } catch {
      return '날짜 정보 없음';
    }
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
              제목
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              유형
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
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${typeBadgeStyles[inquiryTemplate.type] || 'bg-gray-100 text-gray-800'}`}
                >
                  {formatTemplateType(inquiryTemplate.type.toString())}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {inquiryTemplate.isActive ? (
                  <Chip label="활성화" size="small" className="bg-green-100 text-green-800" />
                ) : (
                  <Chip label="비활성화" size="small" className="bg-gray-100 text-gray-800" />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(inquiryTemplate.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative flex justify-end items-center space-x-2">
                  <button
                    onClick={() => onPreview(inquiryTemplate)}
                    className="text-blue-600 hover:text-blue-900 cursor-pointer"
                    title="미리보기"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={(e) => handleOpenShareDialog(inquiryTemplate, e)}
                    className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                    title="공유"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(inquiryTemplate)}
                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                    title="편집"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(inquiryTemplate)}
                    className="text-red-600 hover:text-red-900 cursor-pointer"
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

      {/* 공유 다이얼로그 */}
      {selectedTemplate && (
        <ShareTemplateDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
          shareToken={selectedTemplate.shareToken || selectedTemplate.id}
        />
      )}
    </div>
  );
};

export default InquiryTemplateList;
