'use client';

import type React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash, Edit, ChevronUp, ChevronDown, Menu } from 'react-feather';
import { type Question, QuestionType } from '../../types/inquiryTemplate';

interface SortableItemProps {
  id: string;
  question: Question;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  question,
  index,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 질문 유형에 따른 표시 텍스트
  const getQuestionTypeText = (type: QuestionType): string => {
    switch (type) {
      case QuestionType.TEXT:
        return '텍스트';
      case QuestionType.TEXTAREA:
        return '여러 줄 텍스트';
      case QuestionType.SELECT:
        return '선택 (드롭다운)';
      case QuestionType.RADIO:
        return '라디오 버튼';
      case QuestionType.CHECKBOX:
        return '체크박스';
      case QuestionType.DATE:
        return '날짜';
      case QuestionType.FILE:
        return '파일 업로드';
      case QuestionType.EMAIL:
        return '이메일';
      case QuestionType.PHONE:
        return '전화번호';
      case QuestionType.NUMBER:
        return '숫자';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-4 bg-white border border-gray-200 rounded-lg mb-2 group hover:border-blue-300 transition-colors"
    >
      <div className="flex-shrink-0 mr-3 text-gray-400 cursor-move" {...attributes} {...listeners}>
        <Menu size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <span className="font-medium text-gray-900 truncate">{question.label}</span>
          {question.required && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              필수
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <span className="truncate">{getQuestionTypeText(question.type)}</span>
          {(question.type === QuestionType.SELECT ||
            question.type === QuestionType.RADIO ||
            question.type === QuestionType.CHECKBOX) &&
            question.options &&
            question.options.length > 0 && (
              <span className="ml-2 truncate">옵션: {question.options.length}개</span>
            )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center ml-2 space-x-1">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={isFirst}
          className={`p-1 rounded-full ${
            isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="위로 이동"
        >
          <ChevronUp size={18} />
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={isLast}
          className={`p-1 rounded-full ${
            isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="아래로 이동"
        >
          <ChevronDown size={18} />
        </button>
        <button
          type="button"
          onClick={() => onEdit(question)}
          className="p-1 rounded-full text-blue-600 hover:bg-blue-50"
          title="질문 편집"
        >
          <Edit size={18} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(question.id)}
          className="p-1 rounded-full text-red-600 hover:bg-red-50"
          title="질문 삭제"
        >
          <Trash size={18} />
        </button>
      </div>
    </div>
  );
};
