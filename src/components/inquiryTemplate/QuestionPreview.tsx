'use client';

import type React from 'react';
import { Paper, Typography, Divider } from '@mui/material';
import type { Question } from '../../types/inquiryTemplate';
import RegionSelector from '../region/RegionSelector';

interface QuestionPreviewProps {
  questions: Question[];
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({ questions }) => {
  if (questions.length === 0) {
    return null;
  }

  // 질문 유형에 따른 표시 컴포넌트
  const renderQuestionField = (question: Question) => {
    switch (question.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="텍스트 입력"
            disabled
          />
        );
      case 'TEXTAREA':
        return (
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="여러 줄 텍스트 입력"
            disabled
          />
        );
      case 'EMAIL':
        return (
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="이메일 입력"
            disabled
          />
        );
      case 'PHONE':
        return (
          <input
            type="tel"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="전화번호 입력"
            disabled
          />
        );
      case 'NUMBER':
        return (
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="숫자 입력"
            disabled
          />
        );
      case 'DATE':
        return (
          <input type="date" className="w-full p-2 border border-gray-300 rounded-md" disabled />
        );
      case 'SELECT':
        return (
          <select className="w-full p-2 border border-gray-300 rounded-md" disabled>
            <option value="">선택하세요</option>
            {question.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'RADIO':
        return (
          <div className="flex flex-col space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name={`radio-${question.id}`}
                  disabled
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'CHECKBOX':
        return (
          <div className="flex flex-col space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" disabled />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'FILE':
        return (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">클릭하여 파일 업로드</span>
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, PDF (MAX. 10MB)</p>
              </div>
              <input type="file" className="hidden" disabled />
            </label>
          </div>
        );
      case 'REGION':
        return (
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <RegionSelector />
          </div>
        );
      default:
        return (
          <input type="text" className="w-full p-2 border border-gray-300 rounded-md" disabled />
        );
    }
  };

  return (
    <Paper className="p-6 shadow-sm bg-white">
      <Typography variant="h6" className="mb-4 font-medium text-gray-900">
        질문 미리보기
      </Typography>
      <Divider className="mb-6" />

      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderQuestionField(question)}
          </div>
        ))}
      </div>
    </Paper>
  );
};

export default QuestionPreview;
