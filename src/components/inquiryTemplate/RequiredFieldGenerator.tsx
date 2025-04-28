'use client';

import type React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Tooltip } from '@mui/material';
import { Info } from 'react-feather';
import type { Question, QuestionType } from '../../types/inquiryTemplate';

interface RequiredFieldsGeneratorProps {
  onAddRequiredFields: (questions: Question[]) => void;
}

const RequiredFieldsGenerator: React.FC<RequiredFieldsGeneratorProps> = ({
  onAddRequiredFields,
}) => {
  const generateRequiredFields = () => {
    const requiredQuestions: Question[] = [
      {
        id: uuidv4(),
        label: '연락처',
        type: 'PHONE' as QuestionType,
        isRequired: true,
        questionOrder: 1,
      },
      {
        id: uuidv4(),
        label: '마케팅 수신 동의 여부',
        type: 'CHECKBOX' as QuestionType,
        isRequired: true,
        questionOrder: 2,
        options: ['동의합니다'],
      },
      {
        id: uuidv4(),
        label: '연락 가능 시간',
        type: 'SELECT' as QuestionType,
        isRequired: true,
        questionOrder: 3,
        options: ['오전 9시-12시', '오후 12시-3시', '오후 3시-6시', '저녁 6시-9시'],
      },
    ];

    onAddRequiredFields(requiredQuestions);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Button
        variant="outlined"
        color="primary"
        onClick={generateRequiredFields}
        className="text-sm"
        size="small"
      >
        필수 항목 자동 추가
      </Button>
      <Tooltip title="연락처, 마케팅 수신 동의 여부, 연락 가능 시간을 자동으로 추가합니다." arrow>
        <div className="cursor-help">
          <Info size={16} className="text-gray-500" />
        </div>
      </Tooltip>
    </div>
  );
};

export default RequiredFieldsGenerator;
