'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Eye, EyeOff } from 'react-feather';
import { Alert, Divider, Paper, Typography, Button as MuiButton } from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import Modal from '../../components/ui/Modal';
import QuestionList from '../../components/inquiryTemplate/QuestionList';
import QuestionForm from '../../components/inquiryTemplate/QuestionForm';
import InquiryTypeSelector from '../../components/inquiryTemplate/InquiryTypeSelector';
import QuestionPreview from '../../components/inquiryTemplate/QuestionPreview';
import { useToast } from '../../context/useToast';
import {
  getInquiryTemplateById,
  createInquiryTemplate,
  updateInquiryTemplate,
} from '../../api/inquiryTemplate';
import type {
  InquiryTemplate,
  InquiryTemplateRequest,
  InquiryTemplateType,
  Question,
} from '../../types/inquiryTemplate';
import { getObjectDiff } from '../../utils/objectUtil';
import { generateTypeBasedQuestions, createTypeField } from '../../utils/questionTemplates';
import { defaultFormDescriptionByType } from '../../utils/defaultInquiryTemplateDescription';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const InquiryTemplateCreate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>(undefined);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    questions?: string;
    propertyType?: string;
  }>({});
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // 문의 유형 및 거래 목적 상태 추가
  const [propertyType, setPropertyType] = useState('');
  const [transactionPurpose, setTransactionPurpose] = useState('');
  const [typeFieldAdded, setTypeFieldAdded] = useState(false);

  // 미리보기 상태 추가
  const [showPreview, setShowPreview] = useState(false);

  // 설명 자동 채우기 확인 다이얼로그 상태
  const [showDescriptionConfirm, setShowDescriptionConfirm] = useState(false);
  const [pendingDescription, setPendingDescription] = useState('');
  const [pendingTypeKey, setPendingTypeKey] = useState('');

  // 원본 템플릿 데이터 저장
  const [originalTemplate, setOriginalTemplate] = useState<InquiryTemplate | null>(null);

  useEffect(() => {
    if (!id) return;

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
          setOriginalTemplate(template);

          if (template.questions && template.questions.length > 0) {
            const sortedQuestions = [...template.questions].sort(
              (a, b) => a.questionOrder - b.questionOrder
            );

            const typeQuestion = sortedQuestions.find((q) => q.label === '유형');
            if (typeQuestion && typeQuestion.options && typeQuestion.options?.length > 0) {
              const typeValue = typeQuestion.options[0];
              const [type, purpose] = typeValue.split('_');
              if (type && purpose) {
                setPropertyType(type);
                setTransactionPurpose(purpose);
                setTypeFieldAdded(true);
              }
            }

            setQuestions(sortedQuestions);
          } else {
            setQuestions([]);
          }
        } else {
          const errorMessage = response.error || '템플릿을 불러오는데 실패했습니다.';
          setLoadingError(errorMessage);
          showToast(errorMessage, 'error');
        }
      } catch {
        const errorMessage = '템플릿을 불러오는 중 오류가 발생했습니다.';
        setLoadingError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id, showToast]);

  // 컴포넌트 최초 마운트 시 초기화
  useEffect(() => {
    if (!id) {
      setQuestions([]);
      setIsLoading(false);
      setLoadingError(null);
      setOriginalTemplate(null);
    }
  }, []); // 빈 배열 → 최초 마운트 때만 실행

  // 유형이 선택되었을 때 기본 질문 세트 생성
  const handleTypeSelected = (type: string, purpose: string) => {
    // 유형 키 생성
    const typeKey = `${type}_${purpose}`;

    // 유형 필드 생성
    const typeField = createTypeField(type, purpose);

    // 유형에 따른 기본 질문 세트 생성
    const typeBasedQuestions = generateTypeBasedQuestions(type, purpose);

    // 모든 질문 합치기 (유형 필드 + 기본 질문 세트 + 기존 필터링된 질문)
    const newQuestions = [typeField, ...typeBasedQuestions];

    // 질문 순서 재정렬
    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      questionOrder: index + 1,
    }));

    setQuestions(reorderedQuestions);
    setTypeFieldAdded(true);

    // 설명 자동 채우기 처리
    const defaultDescription = defaultFormDescriptionByType[typeKey];
    if (defaultDescription) {
      // 설명이 비어있거나 기존 설명이 다른 유형의 기본 설명인 경우
      const isDescriptionEmpty = !description.trim();
      const isDefaultDescription = Object.values(defaultFormDescriptionByType).some(
        (desc) => desc === description && desc !== defaultDescription
      );

      if (isDescriptionEmpty) {
        // 설명이 비어있으면 바로 설정
        setDescription(defaultDescription);
        showToast(`${typeKey} 유형에 맞는 기본 설명이 자동으로 설정되었습니다.`, 'success');
      } else if (isDefaultDescription) {
        // 기존 설명이 다른 유형의 기본 설명인 경우 확인 없이 변경
        setDescription(defaultDescription);
        showToast(`${typeKey} 유형에 맞는 기본 설명으로 변경되었습니다.`, 'info');
      } else {
        // 사용자가 직접 입력한 설명이 있는 경우 확인 다이얼로그 표시
        setPendingDescription(defaultDescription);
        setPendingTypeKey(typeKey);
        setShowDescriptionConfirm(true);
      }
    }

    showToast(`${type}_${purpose} 유형에 맞는 기본 질문이 생성되었습니다.`, 'success');
  };

  // 설명 자동 채우기 확인
  const handleConfirmDescription = () => {
    setDescription(pendingDescription);
    setShowDescriptionConfirm(false);
    showToast(`${pendingTypeKey} 유형에 맞는 기본 설명으로 변경되었습니다.`, 'success');
  };

  // 설명 자동 채우기 취소
  const handleCancelDescription = () => {
    setShowDescriptionConfirm(false);
    showToast('기존 설명이 유지됩니다.', 'info');
  };

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
    const questionToDelete = questions.find((q) => q.id === questionId);

    // 유형 필드를 삭제하는 경우 typeFieldAdded 상태 업데이트
    if (questionToDelete && questionToDelete.label === '유형') {
      setTypeFieldAdded(false);
      setPropertyType('');
      setTransactionPurpose('');
    }

    const updatedQuestions = questions.filter((q) => q.id !== questionId);

    // 순서 재정렬
    const reorderedQuestions = updatedQuestions.map((q, index) => ({
      ...q,
      questionOrder: index + 1,
    }));

    setQuestions(reorderedQuestions);
  };

  // 미리보기 토글
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: {
      name?: string;
      description?: string;
      questions?: string;
      propertyType?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = '템플릿 이름을 입력해주세요.';
    }

    if (!description.trim()) {
      newErrors.description = '템플릿 설명을 입력해주세요.';
    }

    if (questions.length === 0) {
      newErrors.questions = '최소 1개 이상의 질문을 추가해주세요.';
    }

    // 매물 유형과 거래 목적 검증
    if ((!propertyType || !transactionPurpose) && !typeFieldAdded) {
      newErrors.propertyType = '매물 유형과 거래 목적을 모두 선택해주세요.';
    }

    // 필수 항목 검증 (연락처, 마케팅 수신 동의 여부, 연락 가능 시간)
    const requiredLabels = ['연락처', '마케팅 수신 동의 여부', '연락 가능 시간'];
    const missingRequiredFields = requiredLabels.filter(
      (label) => !questions.some((q) => q.label === label)
    );

    if (missingRequiredFields.length > 0) {
      newErrors.questions = `필수 항목(${missingRequiredFields.join(', ')})이 누락되었습니다. '필수 항목 자동 추가' 버튼을 클릭하세요.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const templateData: InquiryTemplateRequest = {
        type: `${propertyType}_${transactionPurpose}` as unknown as InquiryTemplateType,
        name,
        description,
        isActive,
        questions: questions.map(({ id: _id, ...rest }) => rest), // id 제외
      };

      let response;

      if (id) {
        // 템플릿 수정 - 변경된 필드만 전송
        if (originalTemplate) {
          // 원본 템플릿과 현재 템플릿 비교하여 변경된 필드만 추출
          const originalData = {
            type: originalTemplate.type,
            name: originalTemplate.name,
            description: originalTemplate.description,
            isActive: originalTemplate.isActive,
            questions: originalTemplate.questions.map(({ ...rest }) => rest),
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
    } catch {
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
        <Alert severity="error" className="mb-6">
          <div className="flex flex-col">
            <p>{loadingError}</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/inquiry-templates')}>
                목록으로 돌아가기
              </Button>
            </div>
          </div>
        </Alert>
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
        <div className="mt-3 sm:mt-0">
          <MuiButton
            variant="outlined"
            color="primary"
            startIcon={showPreview ? <EyeOff /> : <Eye />}
            onClick={togglePreview}
            className="ml-2"
          >
            {showPreview ? '미리보기 닫기' : '미리보기 보기'}
          </MuiButton>
        </div>
      </div>

      {renderLoadingOrError()}

      {!isLoading && !loadingError && (
        <div className={`${showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            <Paper className="p-6 shadow-sm">
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
            </Paper>

            {/* 매물 유형 및 거래 목적 섹션 */}
            <Paper className="p-6 shadow-sm">
              <Typography variant="h6" className="mb-4 font-medium text-gray-900">
                매물 유형 및 거래 목적
              </Typography>

              <InquiryTypeSelector
                propertyType={propertyType}
                transactionPurpose={transactionPurpose}
                onPropertyTypeChange={setPropertyType}
                onTransactionPurposeChange={setTransactionPurpose}
                onTypeSelected={handleTypeSelected}
                error={errors.propertyType}
              />

              <Divider className="my-4" />

              <Typography variant="body2" className="text-gray-600">
                매물 유형과 거래 목적을 선택하면 자동으로 '유형' 필드와 관련 기본 질문들이 생성되며,
                템플릿 설명도 자동으로 채워집니다.
              </Typography>
            </Paper>

            {/* 질문 섹션 */}
            <Paper className="p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-medium text-gray-900">
                  질문 목록
                </Typography>
                <div className="flex space-x-2">
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
              </div>

              {errors.questions && (
                <Alert severity="error" className="mb-4">
                  {errors.questions}
                </Alert>
              )}

              {questions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">
                    매물 유형과 거래 목적을 선택하여 기본 질문을 생성하거나, 직접 질문을
                    추가해주세요.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <Typography variant="subtitle2" className="font-medium">
                      총 {questions.length}개의 질문
                    </Typography>
                  </div>
                  <QuestionList
                    questions={questions}
                    onQuestionsChange={setQuestions}
                    onEditQuestion={handleEditQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                  />
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500">
                <p>드래그하여 질문 순서를 변경할 수 있습니다.</p>
              </div>
            </Paper>

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

          {/* 미리보기 섹션 */}
          {showPreview && (
            <div className="space-y-4">
              <Paper className="p-4 bg-blue-50 border border-blue-200">
                <Typography variant="subtitle1" className="font-medium text-blue-800 mb-2">
                  미리보기 모드
                </Typography>
                <Typography variant="body2" className="text-blue-700">
                  이 미리보기는 사용자에게 보여질 문의 양식의 모습입니다. 실제 양식과 약간 다를 수
                  있습니다.
                </Typography>
              </Paper>
              <QuestionPreview questions={questions} />
            </div>
          )}
        </div>
      )}

      {/* 질문 추가/수정 모달 */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={currentQuestion ? '질문 수정' : '질문 추가'}
        size="md"
      >
        <QuestionForm
          question={currentQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => setIsQuestionModalOpen(false)}
          previewMode={false}
        />
      </Modal>

      {/* 설명 자동 채우기 확인 다이얼로그 */}
      <ConfirmDialog
        open={showDescriptionConfirm}
        title="템플릿 설명 자동 채우기"
        message={
          <div>
            <p>선택한 유형에 맞는 기본 설명으로 변경하시겠습니까?</p>
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
              {pendingDescription}
            </div>
            <p className="mt-3 text-sm text-gray-500">
              기존에 입력한 설명이 있는 경우 덮어쓰기 됩니다.
            </p>
          </div>
        }
        onConfirm={handleConfirmDescription}
        onCancel={handleCancelDescription}
        confirmText="변경하기"
        cancelText="유지하기"
      />
    </DashboardLayout>
  );
};

export default InquiryTemplateCreate;
