'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, FileText, User, Edit } from 'react-feather';
import type {
  ConsultationCustomerResDto,
  CreateConsultationReqDto,
} from '../../types/consultation';
import type { CreateCustomerResDto } from '../../types/customer';
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

const ConsultationFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CreateConsultationReqDto>({
    agentId: user?.id ? Number(user.id) : 0,
    customerId: 0,
    consultationType: 'phone',
    content: '',
    consultationDate: new Date().toISOString(),
    status: 'reserved',
  });

  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ConsultationCustomerResDto | null>(null);

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
            setFormData({
              agentId: consultation.agentId,
              customerId: consultation.customer.id,
              consultationType: consultation.consultationType,
              content: consultation.content || '',
              consultationDate: consultation.consultationDate || new Date().toISOString(),
              status: consultation.status,
            });

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
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 입력 필드 변경 시 해당 필드의 오류 메시지 제거
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 고객 선택 모달에서 고객 선택 시 호출되는 함수
  const handleCustomerSelect = (customer: CreateCustomerResDto) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({
      ...prev,
      customerId: customer.id,
    }));

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = '고객을 선택해주세요.';
    }

    if (!formData.consultationDate) {
      newErrors.consultationDate = '상담 일자를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      let response;

      if (isEditMode && id) {
        // 수정 로직
        response = await updateConsultation(Number(id), formData);
      } else {
        // 등록 로직
        response = await createConsultation(formData);
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
                  {selectedCustomer && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleChangeCustomer}
                      leftIcon={<Edit size={14} />}
                      disabled={isEditMode} // 수정 모드에서는 고객 변경 불가
                    >
                      고객 변경
                    </Button>
                  )}
                </div>

                {selectedCustomer ? (
                  <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.contact}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md text-left flex flex-col justify-center items-start">
                    <div className="flex flex-col items-start justify-start">
                      <User className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500">고객을 선택해주세요.</p>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="mt-2"
                        onClick={handleChangeCustomer}
                        disabled={isEditMode} // 수정 모드에서는 고객 변경 불가
                      >
                        고객 선택하기
                      </Button>
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
                    <option value="phone">전화상담</option>
                    <option value="visit">방문상담</option>
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
                  >
                    <option value="reserved">예약됨</option>
                    <option value="completed">완료</option>
                    <option value="canceled">취소됨</option>
                  </select>
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
                      ? new Date(formData.consultationDate).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setFormData((prev) => ({
                        ...prev,
                        consultationDate: new Date(value).toISOString(),
                      }));
                    }
                  }}
                  error={errors.consultationDate}
                  leftIcon={<Calendar size={18} />}
                  required
                />
              </div>

              {/* 상담 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  상담 내용
                </label>
                <Textarea
                  name="content"
                  value={formData.content || ''}
                  onChange={handleChange}
                  placeholder="상담 내용을 입력하세요"
                  className="min-h-[100px]"
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
