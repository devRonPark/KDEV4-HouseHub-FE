'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import Modal from '../../components/ui/Modal';
import QuestionList from '../../components/inquiryTemplate/QuestionList';
import QuestionForm from '../../components/inquiryTemplate/QuestionForm';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  getInquiryTemplateById,
  createInquiryTemplate,
  updateInquiryTemplate,
} from '../../api/inquiryTemplate';
import type {
  InquiryTemplate,
  InquiryTemplateRequest,
  Question,
  QuestionType,
} from '../../types/inquiryTemplate';
import { getObjectDiff } from '../../utils/objectUtil';

const InquiryTemplateCreate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>(undefined);
  const [errors, setErrors] = useState<{ name?: string; description?: string; questions?: string }>(
    {}
  );
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // 원본 템플릿 데이터 저장
  const [originalTemplate, setOriginalTemplate] = useState<InquiryTemplate | null>(null);

  // 기본 필수 질문 생성 함수
  const createDefaultQuestions = (): Question[] => {
    return [
      {
        id: uuidv4(),
        label: '이름',
        type: 'TEXT' as QuestionType,
        isRequired: true,
        questionOrder: 1,
      },
      {
        id: uuidv4(),
        label: '이메일',
        type: 'EMAIL' as QuestionType,
        isRequired: true,
        questionOrder: 2,
      },
      {
        id: uuidv4(),
        label: '연락처',
        type: 'PHONE' as QuestionType,
        isRequired: true,
        questionOrder: 3,
      },
    ];
  };

  // 템플릿 로드 또는 새 템플릿 초기화
  useEffect(() => {
    if (id) {
      const loadTemplate = async () => {
        setIsLoading(true);
        setLoadingError(null);
        try {
          const response = await getInquiryTemplateById(id);
          if (response.success && response.data) {
            const template = response.data;
            setName(template.name);
            setDescription(template.description);
            setIsActive(template.isActive);
            setOriginalTemplate(template); // 원본 템플릿 저장

            // 질문이 있는지 확인하고 정렬
            if (template.questions && template.questions.length > 0) {
              // questionOrder 기준으로 정렬
              const sortedQuestions = [...template.questions].sort(
                (a, b) => a.questionOrder - b.questionOrder
              );
              setQuestions(sortedQuestions);
            } else {
              setQuestions([]);
            }
          } else {
            const errorMessage = response.error || '템플릿을 불러오는데 실패했습니다.';
            setLoadingError(errorMessage);
            showToast(errorMessage, 'error');
          }
        } catch (error) {
          const errorMessage = '템플릿을 불러오는 중 오류가 발생했습니다.';
          setLoadingError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setIsLoading(false);
        }
      };

      loadTemplate();
    } else {
      // 새 템플릿 생성 시 기본 질문 추가
      setQuestions(createDefaultQuestions());
      setIsLoading(false);
      setLoadingError(null);
      setOriginalTemplate(null); // 원본 템플릿 초기화
    }
  }, [id, showToast]);

  // 질문 추가 모달 열기
  const handleOpenAddQuestionModal = () => {
    setCurrentQuestion(undefined);
    setIsQuestionModalOpen(true);
  };

  // 질문 편집 모달 열기
  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setIsQuestionModalOpen(true);
  };

  // 질문 저장
  const handleSaveQuestion = (questionData: Omit<Question, 'id' | 'questionOrder'>) => {
    if (currentQuestion) {
      // 기존 질문 수정
      const updatedQuestions = questions.map((q) =>
        q.id === currentQuestion.id ? { ...q, ...questionData } : q
      );
      setQuestions(updatedQuestions);
    } else {
      // 새 질문 추가
      const newQuestion: Question = {
        id: uuidv4(),
        ...questionData,
        questionOrder: questions.length + 1,
      };
      setQuestions([...questions, newQuestion]);
    }

    setIsQuestionModalOpen(false);
  };

  // 질문 삭제
  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);

    // 순서 재정렬
    const reorderedQuestions = updatedQuestions.map((q, index) => ({
      ...q,
      questionOrder: index + 1,
    }));

    setQuestions(reorderedQuestions);
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: { name?: string; description?: string; questions?: string } = {};

    if (!name.trim()) {
      newErrors.name = '템플릿 이름을 입력해주세요.';
    }

    if (!description.trim()) {
      newErrors.description = '템플릿 설명을 입력해주세요.';
    }

    if (questions.length === 0) {
      newErrors.questions = '최소 1개 이상의 질문을 추가해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const templateData: InquiryTemplateRequest = {
        name,
        description,
        isActive,
        questions: questions.map(({ id, ...rest }) => rest), // id 제외
      };

      let response;

      if (id) {
        // 템플릿 수정 - 변경된 필드만 전송
        if (originalTemplate) {
          // 원본 템플릿과 현재 템플릿 비교하여 변경된 필드만 추출
          const originalData = {
            name: originalTemplate.name,
            description: originalTemplate.description,
            isActive: originalTemplate.isActive,
            questions: originalTemplate.questions.map(({ id, ...rest }) => rest),
          };

          // 변경된 필드만 포함하는 객체 생성
          const changedData = getObjectDiff(originalData, templateData);

          // 변경된 필드가 있는 경우에만 API 호출
          if (Object.keys(changedData).length > 0) {
            response = await updateInquiryTemplate(id, changedData);
          } else {
            // 변경된 필드가 없는 경우 성공으로 처리
            showToast('변경된 내용이 없습니다.', 'info');
            setIsSubmitting(false);
            return;
          }
        } else {
          // 원본 템플릿이 없는 경우 전체 데이터 전송
          response = await updateInquiryTemplate(id, templateData);
        }
      } else {
        // 템플릿 생성 - 전체 데이터 전송
        response = await createInquiryTemplate(templateData);
      }

      if (response.success) {
        showToast(
          id ? '템플릿이 성공적으로 수정되었습니다.' : '템플릿이 성공적으로 생성되었습니다.',
          'success'
        );
        navigate('/inquiry-templates');
      } else {
        showToast(response.error || '템플릿 저장에 실패했습니다.', 'error');
      }
    } catch (error) {
      showToast('템플릿 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 중 또는 에러 발생 시 표시할 컨텐츠
  const renderLoadingOrError = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (loadingError) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{loadingError}</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/inquiry-templates')}>
                  목록으로 돌아가기
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <DashboardLayout>
      <div className="pb-5 mb-6 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? '문의 템플릿 수정' : '문의 템플릿 생성'}
        </h1>
      </div>

      {renderLoadingOrError()}

      {!isLoading && !loadingError && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* 템플릿 이름 */}
                <div>
                  <label
                    htmlFor="template-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    템플릿 이름 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="템플릿 이름을 입력하세요"
                    error={errors.name}
                    required
                  />
                </div>

                {/* 템플릿 설명 */}
                <div>
                  <label
                    htmlFor="template-description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    템플릿 설명 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="template-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="템플릿에 대한 설명을 입력하세요"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    rows={4}
                    required
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                {/* 활성화 여부 */}
                <div>
                  <Checkbox
                    id="template-active"
                    label="템플릿 활성화"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    helperText="활성화된 템플릿만 문의 폼에서 선택할 수 있습니다."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 질문 섹션 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">질문 목록</h2>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleOpenAddQuestionModal}
                  className="inline-flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  질문 추가
                </Button>
              </div>

              {errors.questions && (
                <div className="mb-4 text-sm text-red-500">{errors.questions}</div>
              )}

              <QuestionList
                questions={questions}
                onQuestionsChange={setQuestions}
                onEditQuestion={handleEditQuestion}
                onDeleteQuestion={handleDeleteQuestion}
              />

              <div className="mt-4 text-sm text-gray-500">
                <p>드래그하여 질문 순서를 변경할 수 있습니다.</p>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/inquiry-templates')}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {id ? '템플릿 수정' : '템플릿 생성'}
            </Button>
          </div>
        </form>
      )}

      {/* 질문 추가/수정 모달 */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={currentQuestion ? '질문 수정' : '질문 추가'}
        size="md"
        hideFooter
      >
        <QuestionForm
          question={currentQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => setIsQuestionModalOpen(false)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default InquiryTemplateCreate;
