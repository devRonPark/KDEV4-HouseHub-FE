'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Home, Trash2 } from 'lucide-react';
import {
  ConsultationType,
  ConsultationStatus,
  type ConsultationResDto,
} from '../../types/consultation';
import { getConsultationById, deleteConsultation } from '../../api/consultation';
import { useToast } from '../../context/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { PropertyTypeLabels } from '../../types/property';

const ConsultationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [consultation, setConsultation] = useState<ConsultationResDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // 상담 상태에 따른 배경색 클래스 매핑
  const statusColorClasses: Record<ConsultationStatus, string> = {
    [ConsultationStatus.RESERVED]: 'bg-yellow-100 text-yellow-800',
    [ConsultationStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [ConsultationStatus.CANCELED]: 'bg-red-100 text-red-800',
  };

  const fetchConsultation = async () => {
    if (!id) {
      showToast('유효하지 않은 상담 ID입니다.', 'error');
      navigate('/consultations', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const consultationId = Number.parseInt(id);
      if (isNaN(consultationId)) {
        showToast('유효하지 않은 상담 ID 형식입니다.', 'error');
        navigate('/consultations', { replace: true });
        return;
      }

      const response = await getConsultationById(consultationId);

      if (response.success && response.data) {
        setConsultation(response.data);
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

  useEffect(() => {
    fetchConsultation();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id) {
      showToast('유효하지 않은 상담 ID입니다.', 'error');
      return;
    }

    const consultationId = Number(id);
    if (isNaN(consultationId)) {
      showToast('유효하지 않은 상담 ID 형식입니다.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deleteConsultation(consultationId);
      if (response.success) {
        // 삭제 성공 시 목록 페이지로 이동하면서 성공 메시지 전달
        navigate('/consultations', {
          replace: true,
          state: {
            message: '상담 정보가 성공적으로 삭제되었습니다.',
            type: 'success',
          },
        });
      } else {
        showToast(response.error || '상담 정보 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('상담 정보를 삭제하는 중 오류가 발생했습니다:', error);
      showToast('상담 정보를 삭제하는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(
      2,
      '0'
    )} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

  if (!consultation) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-center text-gray-500">상담 정보를 찾을 수 없습니다.</p>
          <div className="mt-4 flex justify-center">
            <Link
              to="/consultations"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              목록으로
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/consultations')}
          >
            돌아가기
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">상담 상세정보</h1>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
          {consultation.status === ConsultationStatus.RESERVED && (
            <Link
              to={`/consultations/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit size={16} className="mr-2" />
              수정
            </Link>
          )}
          <Button
            variant="danger"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">상담 정보</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            상담 내용과 기록된 정보를 확인할 수 있습니다.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">고객 이름</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {consultation.customer.name}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">고객 전화번호</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {consultation.customer.contact}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">고객 이메일</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {consultation.customer.email || '-'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">상담 유형</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {consultationTypeLabels[consultation.consultationType as ConsultationType] ||
                  consultation.consultationType}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">상담 일시</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDateTime(consultation.consultationDate)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">상담 상태</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    statusColorClasses[consultation.status as ConsultationStatus] ||
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {consultationStatusLabels[consultation.status as ConsultationStatus] ||
                    consultation.status}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">상담 내용</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                {consultation.content || '-'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">보여준 매물</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {consultation.shownProperties && consultation.shownProperties.length > 0 ? (
                  <div className="space-y-3">
                    {consultation.shownProperties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center p-3 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/properties/${property.id}`)}
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                          <Home size={18} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{property.roadAddress}</p>
                          <p className="text-sm text-gray-500">{property.detailAddress}</p>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {PropertyTypeLabels[property.propertyType] || property.propertyType}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">보여준 매물이 없습니다.</p>
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">등록일</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDateTime(consultation.createdAt)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">최종 수정일</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDateTime(consultation.updatedAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="상담 정보 삭제"
        size="sm"
      >
        <div className="p-4">
          <p className="text-gray-700">
            정말로 이 상담 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="w-full sm:w-auto sm:ml-3"
          >
            삭제
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isDeleting}
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            취소
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ConsultationDetailPage;
