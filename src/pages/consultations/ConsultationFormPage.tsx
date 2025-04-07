'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { CreateConsultationReqDto } from '../../types/consultation';
import {
  getConsultationById,
  createConsultation,
  updateConsultation,
} from '../../api/consultation';
import { useToast } from '../../context/useToast';
import { useAuth } from '../../context/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';

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
              customerId: consultation.customerId,
              consultationType: consultation.consultationType,
              content: consultation.content || '',
              consultationDate: consultation.consultationDate || new Date().toISOString(),
              status: consultation.status,
            });
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = '고객 ID를 입력해주세요.';
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

      // 전송할 데이터에서 selectedCustomer 필드는 API에서 자동으로 제거됨
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
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? '상담 정보 수정' : '상담 등록'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode ? '상담 정보를 수정해주세요.' : '새로운 상담 내용을 등록해주세요.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                고객 ID
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="customerId"
                  name="customerId"
                  value={formData.customerId || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      customerId: value ? Number.parseInt(value) : 0,
                    }));

                    // 입력 필드 변경 시 해당 필드의 오류 메시지 제거
                    if (errors.customerId) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.customerId;
                        return newErrors;
                      });
                    }
                  }}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.customerId ? 'border-red-500' : ''
                  }`}
                  placeholder="고객 ID를 입력하세요"
                  disabled={isEditMode}
                />
                {errors.customerId && (
                  <p className="mt-2 text-sm text-red-600">{errors.customerId}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="consultationType" className="block text-sm font-medium text-gray-700">
                상담 유형
              </label>
              <div className="mt-1">
                <select
                  id="consultationType"
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="PHONE">전화상담</option>
                  <option value="VISIT">방문상담</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="consultationDate" className="block text-sm font-medium text-gray-700">
                상담 일자
              </label>
              <div className="mt-1 relative">
                <input
                  type="datetime-local"
                  id="consultationDate"
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
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.consultationDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.consultationDate && (
                  <p className="mt-2 text-sm text-red-600">{errors.consultationDate}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                상담 상태
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="RESERVED">예약됨</option>
                  <option value="COMPLETED">완료</option>
                  <option value="CANCELLED">취소됨</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                상담 내용
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  name="content"
                  rows={5}
                  value={formData.content || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="상담 내용을 입력하세요"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <Link
            to="/consultations"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          >
            취소
          </Link>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditMode ? '수정하기' : '등록하기'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default ConsultationFormPage;
