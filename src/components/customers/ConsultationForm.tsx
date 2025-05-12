'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, FileText, User, Edit, Phone, Plus, Search } from 'react-feather';
import {
  ConsultationType,
  ConsultationStatus,
  type ConsultationReqDto,
  type UpdateConsultationReqDto,
  type NewCustomerDto,
} from '../../types/consultation';
import type { CustomerResDto } from '../../types/customer';
import {
  getConsultationById,
  createConsultation,
  updateConsultation,
} from '../../api/consultation';
import { useToast } from '../../context/useToast';
import { useAuth } from '../../context/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Card from '../../components/ui/Card';
import CustomerSelectionModal from '../../components/customers/CustomerSelectionModal';
import Alert from '../../components/ui/Alert';

// 상담 유형 표시 레이블 매핑
const consultationTypeLabels: Record<ConsultationType, string> = {
  [ConsultationType.PHONE]: '전화상담',
  [ConsultationType.VISIT]: '방문상담',
  [ConsultationType.EMAIL]: '이메일상담',
  [ConsultationType.OTHER]: '기타',
};

// 상담 상태 표시 레이블 매핑
const consultationStatusLabels: Record<ConsultationStatus, string> = {
  [ConsultationStatus.RESERVED]: '예약됨',
  [ConsultationStatus.COMPLETED]: '완료',
  [ConsultationStatus.CANCELED]: '취소됨',
};

const ConsultationFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!id;

  // 폼 데이터 상태
  const [formData, setFormData] = useState<ConsultationReqDto>({
    agentId: user?.id ? Number(user.id) : 0,
    consultationType: ConsultationType.PHONE,
    content: '',
    consultationDate: new Date().toISOString(),
    status: ConsultationStatus.RESERVED,
  });

  // 초기 데이터 상태 (서버에서 받아온 원본 데이터)
  const [initialData, setInitialData] = useState<ConsultationReqDto | null>(null);

  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResDto | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState<NewCustomerDto>({
    name: '',
    contact: '',
    email: '',
  });
  const [originalStatus, setOriginalStatus] = useState<ConsultationStatus>(
    ConsultationStatus.RESERVED
  );

  useEffect(() => {
    // 에이전트 ID 설정
    if (user?.id) {
      setFormData((prev) => ({
        ...prev,
        agentId: Number(user.id),
      }));
    }

    if (isEditMode && id) {
      const fetchConsultation = async () => {
        setLoading(true);
        try {
          const response = await getConsultationById(Number(id));
          if (response.success && response.data) {
            const consultation = response.data;

            // 서버에서 받아온 데이터로 formData 설정
            const consultationData: ConsultationReqDto = {
              agentId: consultation.agentId,
              customerId: consultation.customer.id,
              consultationType: consultation.consultationType,
              content: consultation.content || '',
              consultationDate: consultation.consultationDate,
              status: consultation.status,
            };

            // formData와 initialData 모두 설정
            setFormData(consultationData);
            setInitialData(consultationData); // 초기 데이터 저장

            // 원래 상태 저장 (상태 변경 제한을 위해)
            setOriginalStatus(consultation.status);

            // 고객 정보가 있으면 설정
            if (consultation.customer) {
              setSelectedCustomer(consultation.customer);
            }
          } else {
            showToast(response.error || '상담 정보를 불러오는데 실패했습니다.', 'error');
            navigate('/consultations', { replace: true });
          }
        } catch (error) {
          console.error('상담 정보를 불러오는 중 오류가 발생했습니다:', error);
          showToast('상담 정보를 불러오는 중 오류가 발생했습니다.', 'error');
          navigate('/consultations', { replace: true });
        } finally {
          setLoading(false);
        }
      };

      fetchConsultation();
    }
  }, [id, isEditMode, navigate, showToast, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // 상태 변경 제한 로직
    if (name === 'status' && isEditMode) {
      const newStatus = value as ConsultationStatus;

      // RESERVED 상태에서만 COMPLETED 또는 CANCELED로 변경 가능
      if (originalStatus !== ConsultationStatus.RESERVED && newStatus !== originalStatus) {
        showToast('예약 상태에서만 상태를 변경할 수 있습니다.', 'error');
        return;
      }

      // RESERVED 상태에서는 COMPLETED 또는 CANCELED로만 변경 가능
      if (
        originalStatus === ConsultationStatus.RESERVED &&
        newStatus !== ConsultationStatus.RESERVED &&
        newStatus !== ConsultationStatus.COMPLETED &&
        newStatus !== ConsultationStatus.CANCELED
      ) {
        showToast('예약 상태에서는 완료 또는 취소 상태로만 변경할 수 있습니다.', 'error');
        return;
      }
    }

    // 상담일 수정 제한 로직
    if (
      name === 'consultationDate' &&
      isEditMode &&
      originalStatus !== ConsultationStatus.RESERVED
    ) {
      showToast('예약 상태의 상담만 일자를 수정할 수 있습니다.', 'error');
      return;
    }

    // consultationType과 status는 Enum 타입으로 변환
    if (name === 'consultationType') {
      setFormData((prev) => ({ ...prev, [name]: value as ConsultationType }));
    } else if (name === 'status') {
      setFormData((prev) => ({ ...prev, [name]: value as ConsultationStatus }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 입력 필드 변경 시 해당 필드의 오류 메시지 제거
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 연락처 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 신규 고객 정보 입력 핸들러
  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 연락처 필드인 경우 포맷팅 적용
    if (name === 'contact') {
      const formattedValue = formatPhoneNumber(value);
      setNewCustomerData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setNewCustomerData((prev) => ({ ...prev, [name]: value }));
    }

    // 입력 필드 변경 시 해당 필드의 오류 메시지 제거
    if (errors[`newCustomer.${name}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`newCustomer.${name}`];
        return newErrors;
      });
    }
  };

  // 고객 선택 모달에서 고객 선택 시 호출되는 함수
  const handleCustomerSelect = (customer: CustomerResDto) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({
      ...prev,
      customerId: customer.id,
    }));
    setIsNewCustomer(false);

    // 고객 ID 관련 오류 메시지 제거
    if (errors.customerId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.customerId;
        return newErrors;
      });
    }

    showToast('고객이 성공적으로 선택되었습니다.', 'success');
  };

  // 고객 변경 버튼 클릭 핸들러
  const handleChangeCustomer = () => {
    setIsCustomerModalOpen(true);
  };

  // 신규 고객 모드 전환
  const handleToggleNewCustomer = () => {
    setIsNewCustomer(!isNewCustomer);
    if (isNewCustomer) {
      setSelectedCustomer(null);
    } else {
      setSelectedCustomer(null);
      // 신규 고객 데이터 초기화
      setNewCustomerData({
        name: '',
        contact: '',
        email: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 고객 정보 검증
    if (!isNewCustomer && !formData.customerId) {
      newErrors.customerId = '고객을 선택해주세요.';
    }

    // 신규 고객 정보 검증
    if (isNewCustomer) {
      if (!newCustomerData.contact) {
        newErrors['newCustomer.contact'] = '연락처를 입력해주세요.';
      } else {
        // 전화번호 형식 검증 (백엔드 @Pattern 규칙과 일치)
        const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
        if (!phoneRegex.test(newCustomerData.contact)) {
          newErrors['newCustomer.contact'] = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)';
        }
      }
    }

    if (!formData.consultationDate) {
      newErrors.consultationDate = '상담 일자를 선택해주세요.';
    }

    if (!formData.content) {
      newErrors.content = '상담 내용을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 변경된 필드만 추출하는 함수
  const getChangedFields = (): UpdateConsultationReqDto => {
    // 초기 데이터가 없으면 빈 객체 반환 (이 경우는 발생하지 않아야 함)
    if (!initialData) return { agentId: formData.agentId };

    // 변경된 필드를 담을 객체
    const changedFields: UpdateConsultationReqDto = {
      // agentId는 항상 포함
      agentId: formData.agentId,
    };

    // 각 필드 비교 및 변경된 필드만 추가
    if (formData.consultationType !== initialData.consultationType) {
      changedFields.consultationType = formData.consultationType;
    }

    if (formData.content !== initialData.content) {
      changedFields.content = formData.content;
    }

    if (formData.consultationDate !== initialData.consultationDate) {
      changedFields.consultationDate = formData.consultationDate;
    }

    if (formData.status !== initialData.status) {
      changedFields.status = formData.status;
    }

    return changedFields;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      let response;

      // 수정 모드
      if (isEditMode && id) {
        // 변경된 필드만 추출
        const updateData = getChangedFields();

        // 변경된 필드가 agentId만 있는지 확인 (실질적인 변경이 없는 경우)
        const hasRealChanges = Object.keys(updateData).length > 1; // agentId 외에 다른 필드가 있는지

        if (!hasRealChanges) {
          showToast('변경된 내용이 없습니다.', 'info');
          setIsSubmitting(false);
          return;
        }

        // PATCH 요청 보내기
        response = await updateConsultation(Number(id), updateData);
      } else {
        // 등록 모드
        const consultationData: ConsultationReqDto = {
          ...formData,
        };

        // 신규 고객 정보 추가
        if (isNewCustomer) {
          consultationData.newCustomer = {
            name: newCustomerData.name || undefined,
            contact: newCustomerData.contact, // 연락처는 필수
            email: newCustomerData.email || undefined,
          };
        }

        response = await createConsultation(consultationData);
      }

      if (response.success) {
        showToast(
          isEditMode
            ? '상담 정보가 성공적으로 수정되었습니다.'
            : '상담이 성공적으로 등록되었습니다.',
          'success'
        );
        navigate('/consultations');
      } else {
        showToast(
          response.error ||
            (isEditMode ? '상담 정보 수정에 실패했습니다.' : '상담 등록에 실패했습니다.'),
          'error'
        );
      }
    } catch (error) {
      console.error('상담 정보를 저장하는 중 오류가 발생했습니다:', error);
      showToast('상담 정보를 저장하는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 상담 상태에 따른 필드 비활성화 여부 확인
  const isDateFieldDisabled = isEditMode && originalStatus !== ConsultationStatus.RESERVED;
  const isStatusChangeRestricted = isEditMode && originalStatus !== ConsultationStatus.RESERVED;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 text-left">
          {isEditMode ? '상담 정보 수정' : '상담 등록'}
        </h1>
        <div className="mt-3 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate('/consultations')}
            leftIcon={<ArrowLeft size={16} />}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>

      {isEditMode && isStatusChangeRestricted && (
        <Alert
          variant="warning"
          className="mt-4"
          title="상태 변경 제한"
          description="예약 상태가 아닌 상담은 상태 변경이 제한됩니다."
        />
      )}

      {isEditMode && isDateFieldDisabled && (
        <Alert
          variant="warning"
          className="mt-4"
          title="상담일 수정 제한"
          description="예약 상태가 아닌 상담은 상담일 수정이 제한됩니다."
        />
      )}

      <div className="mt-6">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <div className="space-y-6">
              {/* 고객 정보 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    고객 정보 <span className="text-red-500">*</span>
                  </label>
                  {!isEditMode && (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={isNewCustomer ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => {
                          setIsCustomerModalOpen(true);
                          setIsNewCustomer(false);
                        }}
                        disabled={isEditMode} // 수정 모드에서는 고객 변경 불가
                      >
                        <Search size={14} className="mr-1" />
                        고객 검색
                      </Button>
                      <Button
                        type="button"
                        variant={isNewCustomer ? 'primary' : 'outline'}
                        size="sm"
                        onClick={handleToggleNewCustomer}
                        disabled={isEditMode} // 수정 모드에서는 고객 변경 불가
                      >
                        <Plus size={14} className="mr-1" />
                        신규 고객
                      </Button>
                    </div>
                  )}
                </div>

                {isEditMode ? (
                  // 수정 모드: 고객 정보 표시 (수정 불가)
                  <div className="p-3 bg-gray-50 rounded-md text-left flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedCustomer?.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer?.contact}</p>
                      {selectedCustomer?.email && (
                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                      )}
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs text-gray-500 italic">
                        상담 등록 후에는 고객 정보를 변경할 수 없습니다.
                      </span>
                    </div>
                  </div>
                ) : isNewCustomer ? (
                  // 신규 고객 입력 폼
                  <div className="p-4 bg-white rounded-md border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          고객명
                        </label>
                        <Input
                          name="name"
                          value={newCustomerData.name || ''}
                          onChange={handleNewCustomerChange}
                          placeholder="고객 이름 입력"
                          leftIcon={<User size={18} />}
                          error={errors['newCustomer.name']}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          연락처 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="contact"
                          value={newCustomerData.contact}
                          onChange={handleNewCustomerChange}
                          placeholder="010-0000-0000"
                          leftIcon={<Phone size={18} />}
                          error={errors['newCustomer.contact']}
                          required
                          maxLength={13} // 010-0000-0000 형식의 최대 길이
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          이메일
                        </label>
                        <Input
                          name="email"
                          value={newCustomerData.email || ''}
                          onChange={handleNewCustomerChange}
                          placeholder="example@example.com"
                          type="email"
                        />
                      </div>
                    </div>
                  </div>
                ) : selectedCustomer ? (
                  // 선택된 고객 정보 표시
                  <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.contact}</p>
                      {selectedCustomer.email && (
                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                      )}
                    </div>
                    <div className="ml-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleChangeCustomer}
                        leftIcon={<Edit size={14} />}
                      >
                        고객 변경
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 고객 선택 안내
                  <div className="p-3 bg-gray-50 rounded-md text-left flex flex-col justify-center items-start">
                    <div className="flex flex-col items-start justify-start">
                      <User className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500">고객을 선택하거나 신규 고객을 등록해주세요.</p>
                    </div>
                  </div>
                )}
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                )}
              </div>

              {/* 상담 유형과 상담 상태를 같은 행에 배치 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 상담 유형 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    상담 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="consultationType"
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(consultationTypeLabels).map(([type, label]) => (
                      <option key={type} value={type}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 상담 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    상담 상태 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isStatusChangeRestricted && formData.status !== originalStatus}
                  >
                    <option value={ConsultationStatus.RESERVED}>
                      {consultationStatusLabels[ConsultationStatus.RESERVED]}
                    </option>
                    <option
                      value={ConsultationStatus.COMPLETED}
                      disabled={
                        isStatusChangeRestricted &&
                        (originalStatus as ConsultationStatus) !== ConsultationStatus.RESERVED &&
                        formData.status !== ConsultationStatus.COMPLETED
                      }
                    >
                      {consultationStatusLabels[ConsultationStatus.COMPLETED]}
                    </option>
                    <option
                      value={ConsultationStatus.CANCELED}
                      disabled={
                        isStatusChangeRestricted &&
                        (originalStatus as ConsultationStatus) !== ConsultationStatus.RESERVED &&
                        formData.status !== ConsultationStatus.CANCELED
                      }
                    >
                      {consultationStatusLabels[ConsultationStatus.CANCELED]}
                    </option>
                  </select>
                  {isStatusChangeRestricted && (
                    <p className="mt-1 text-xs text-gray-500">
                      예약 상태에서만 상태를 변경할 수 있습니다.
                    </p>
                  )}
                </div>
              </div>

              {/* 상담 일자 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  상담 일자 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  name="consultationDate"
                  value={
                    formData.consultationDate
                      ? new Date(formData.consultationDate)
                          .toLocaleString('sv-SE', {
                            timeZone: 'Asia/Seoul',
                          })
                          .replace(' ', 'T') // 'YYYY-MM-DDTHH:mm' 포맷 유지
                          .slice(0, 16) // 초 이하 잘라냄: YYYY-MM-DDTHH:mm
                      : ''
                  }
                  onChange={handleChange}
                  error={errors.consultationDate}
                  leftIcon={<Calendar size={18} />}
                  required
                  disabled={isDateFieldDisabled}
                />
                {isDateFieldDisabled && (
                  <p className="mt-1 text-xs text-gray-500">
                    예약 상태의 상담만 일자를 수정할 수 있습니다.
                  </p>
                )}
              </div>

              {/* 상담 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  상담 내용 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  name="content"
                  value={formData.content || ''}
                  onChange={handleChange}
                  placeholder="상담 내용을 입력하세요"
                  className="min-h-[100px]"
                  error={errors.content}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/consultations')}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<FileText size={16} />}
            >
              {isEditMode ? '수정하기' : '등록하기'}
            </Button>
          </div>
        </form>
      </div>

      {/* 고객 선택 모달 */}
      <CustomerSelectionModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={handleCustomerSelect}
        selectedCustomerId={selectedCustomer?.id || null}
      />
    </DashboardLayout>
  );
};

export default ConsultationFormPage;
