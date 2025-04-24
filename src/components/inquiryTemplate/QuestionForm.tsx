'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { X, Plus } from 'react-feather';
import { type Question, QuestionType } from '../../types/inquiryTemplate';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import RegionSelector from '../region/RegionSelector';

interface QuestionFormProps {
  question?: Question;
  onSave: (question: Omit<Question, 'id' | 'questionOrder'>) => void;
  onCancel: () => void;
  previewMode?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, onSave, onCancel }) => {
  const [label, setLabel] = useState(question?.label || '');
  const [type, setType] = useState<QuestionType>(question?.type || QuestionType.TEXT);
  const [isRequired, setIsRequired] = useState(question?.isRequired || false);
  const [options, setOptions] = useState<string[]>(question?.options || ['']);
  const [errors, setErrors] = useState<{ label?: string; options?: string; region?: string }>({});

  // 옵션 추가
  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  // 옵션 변경
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // 옵션 삭제
  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: { label?: string; options?: string; region?: string } = {};

    if (!label.trim()) {
      newErrors.label = '질문 레이블을 입력해주세요.';
    }

    if (
      (type === QuestionType.SELECT ||
        type === QuestionType.RADIO ||
        type === QuestionType.CHECKBOX) &&
      (!options.length || options.some((option) => !option.trim()))
    ) {
      newErrors.options = '모든 옵션을 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 옵션이 필요 없는 질문 유형인 경우 옵션 배열 비우기
    const finalOptions =
      type === QuestionType.SELECT ||
      type === QuestionType.RADIO ||
      type === QuestionType.CHECKBOX ||
      type === QuestionType.REGION
        ? options.filter((option) => option.trim())
        : undefined;

    // 질문 데이터 구성
    const questionData: Omit<Question, 'id' | 'questionOrder'> = {
      label,
      type,
      isRequired,
      options: finalOptions,
    };
    console.log('질문 데이터:', questionData);

    onSave(questionData);
  };

  // 질문 유형 변경 시 옵션 초기화
  useEffect(() => {
    if (
      type !== QuestionType.SELECT &&
      type !== QuestionType.RADIO &&
      type !== QuestionType.CHECKBOX
    ) {
      setOptions([]);
    } else if (options.length === 0) {
      setOptions(['']);
    }
  }, [type]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 질문 레이블 */}
      <div>
        <label htmlFor="question-label" className="block text-sm font-medium text-gray-700">
          질문 레이블 <span className="text-red-500">*</span>
        </label>
        <Input
          id="question-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="질문을 입력하세요"
          error={errors.label}
          required
        />
      </div>

      {/* 질문 유형 */}
      <div>
        <label htmlFor="question-type" className="block text-sm font-medium text-gray-700">
          질문 유형 <span className="text-red-500">*</span>
        </label>
        <select
          id="question-type"
          value={type}
          onChange={(e) => setType(e.target.value as QuestionType)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value={QuestionType.TEXT}>텍스트</option>
          <option value={QuestionType.TEXTAREA}>여러 줄 텍스트</option>
          <option value={QuestionType.SELECT}>선택 (드롭다운)</option>
          <option value={QuestionType.RADIO}>라디오 버튼</option>
          <option value={QuestionType.CHECKBOX}>체크박스</option>
          <option value={QuestionType.DATE}>날짜</option>
          <option value={QuestionType.FILE}>파일 업로드</option>
          <option value={QuestionType.EMAIL}>이메일</option>
          <option value={QuestionType.PHONE}>전화번호</option>
          <option value={QuestionType.NUMBER}>숫자</option>
          <option value={QuestionType.REGION}>지역 선택</option>
        </select>
      </div>

      {/* 필수 여부 */}
      <div>
        <Checkbox
          id="question-required"
          label="필수 질문"
          checked={isRequired}
          onChange={(e) => setIsRequired(e.target.checked)}
          helperText="응답자가 이 질문에 반드시 답변해야 합니다."
        />
      </div>

      {/* 관심 지역 선택기 (질문 유형이 '관심 지역'인 경우에만 표시) */}
      {type === 'REGION' && (
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <RegionSelector error={errors.region} />
        </div>
      )}

      {/* 옵션 목록 (선택, 라디오, 체크박스 유형인 경우) */}
      {(type === QuestionType.SELECT ||
        type === QuestionType.RADIO ||
        type === QuestionType.CHECKBOX) && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              옵션 <span className="text-red-500">*</span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="inline-flex items-center"
            >
              <Plus size={16} className="mr-1" /> 옵션 추가
            </Button>
          </div>

          {errors.options && <p className="mt-1 text-sm text-red-500">{errors.options}</p>}

          <div className="space-y-2 mt-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`옵션 ${index + 1}`}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                  disabled={options.length <= 1}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" variant="primary">
          {question ? '질문 수정' : '질문 추가'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
