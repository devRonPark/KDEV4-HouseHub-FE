'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, FileText, Edit, Trash2, Clock, Plus } from 'react-feather';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/useToast';
import { getPropertyById, deleteProperty } from '../../api/property';
import { PropertyTypeLabels, type FindPropertyDetailResDto } from '../../types/property';
import Modal from '../../components/ui/Modal';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [property, setProperty] = useState<FindPropertyDetailResDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      // if (!id) return;
      if (!id || isDeleting) return; // isDeleting이 true면 API 호출 방지
      setIsLoading(true);
      try {
        const response = await getPropertyById(Number(id));
        if (response.success && response.data) {
          setProperty(response.data);
        } else {
          showToast(response.error || '매물 정보를 불러오는데 실패했습니다.', 'error');
        }
      } catch (error) {
        showToast('매물 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [id, isDeleting, showToast]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);

    try {
      const response = await deleteProperty(Number(id));
      if (response.success) {
        setIsDeleteModalOpen(false); // 모달 먼저 닫기
        showToast('매물이 성공적으로 삭제되었습니다.', 'success');
        // 즉시 리다이렉트하여 추가 API 호출 방지
        navigate('/properties', { replace: true }); // replace: true 옵션 추가
      } else {
        showToast(response.error || '매물 삭제에 실패했습니다.', 'error');
        setIsDeleting(false);
      }
    } catch (error) {
      showToast('매물 삭제 중 오류가 발생했습니다.', 'error');
      setIsDeleting(false);
    }
    // } finally {
    //   setIsDeleteModalOpen(false);
    // }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="text-left py-12">
          <FileText className="h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">매물을 찾을 수 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            요청하신 매물 정보가 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => navigate('/properties')}>
              매물 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">매물 상세 정보</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/properties')}
            leftIcon={<ArrowLeft size={16} />}
          >
            목록으로 돌아가기
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/contracts/register?propertyId=${id}`)}
            leftIcon={<FileText size={16} />}
          >
            계약 등록
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/properties/edit/${id}`)}
            leftIcon={<Edit size={16} />}
          >
            수정
          </Button>
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
            leftIcon={<Trash2 size={16} />}
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        {/* 매물 기본 정보 */}
        <Card title="매물 기본 정보">
          <div className="space-y-6">
            <div className="flex items-center">
              <Badge
                variant={
                  property.propertyType === 'APARTMENT'
                    ? 'primary'
                    : property.propertyType === 'VILLA'
                      ? 'success'
                      : property.propertyType === 'OFFICETEL'
                        ? 'info'
                        : property.propertyType === 'COMMERCIAL'
                          ? 'warning'
                          : 'secondary'
                }
                size="lg"
              >
                {PropertyTypeLabels[property.propertyType]}
              </Badge>
              <div className="ml-4 text-sm text-gray-500 flex items-center">
                <Clock size={16} className="mr-1" />
                등록일: {formatDate(property.createdAt)}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">주소 정보</h3>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-gray-900">{property.roadAddress}</p>
                  <p className="text-sm text-gray-500">{property.detailAddress}</p>
                  {/* <p className="text-sm text-gray-500">
                    {property.province} {property.city} {property.dong}
                  </p> */}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">의뢰인 정보</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{property.customer.name}</h3>
                  <p className="text-sm text-gray-500">{property.customer.contact}</p>
                  {property.customer.email && (
                    <p className="text-sm text-gray-500">{property.customer.email}</p>
                  )}
                </div>
              </div>
            </div>

            {property.memo && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">메모</h3>
                <p className="text-gray-700 whitespace-pre-line">{property.memo}</p>
              </div>
            )}

            {property.latitude && property.longitude && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">위치</h3>
                <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">
                    지도 표시 영역 (위도: {property.latitude}, 경도: {property.longitude})
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 계약 정보 */}
        {property.contractList && property.contractList.length > 0 && (
          <Card title="계약 정보">
            <div className="space-y-6">
              {property.contractList.map((contract) => (
                <div
                  key={contract.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <Badge
                      variant={
                        contract.status === 'COMPLETED'
                          ? 'success'
                          : contract.status === 'IN_PROGRESS'
                            ? 'primary'
                            : 'secondary'
                      }
                    >
                      {contract.status === 'COMPLETED'
                        ? '완료'
                        : contract.status === 'IN_PROGRESS'
                          ? '진행중'
                          : '거래 가능'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {contract.startedAt ? formatDate(contract.startedAt) : ''}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-left">
                    {contract.contractType === 'SALE'
                      ? '매매'
                      : contract.contractType === 'JEONSE'
                        ? '전세'
                        : contract.contractType === 'MONTHLY_RENT'
                          ? '월세'
                          : contract.contractType}
                  </p>
                  {contract.contractType === 'SALE' && contract.salePrice && (
                    <p className="text-gray-700 text-left">
                      매매가: {formatCurrency(contract.salePrice)}
                    </p>
                  )}
                  {contract.contractType === 'JEONSE' && contract.jeonsePrice && (
                    <p className="text-gray-700 text-left">
                      전세가: {formatCurrency(contract.jeonsePrice)}
                    </p>
                  )}
                  {contract.contractType === 'MONTHLY_RENT' && (
                    <>
                      <p className="text-gray-700 text-left">
                        보증금: {formatCurrency(contract.monthlyRentDeposit)}
                      </p>
                      <p className="text-gray-700 text-left">
                        월세: {formatCurrency(contract.monthlyRentFee)}
                      </p>
                    </>
                  )}
                  {contract.startedAt && contract.expiredAt && (
                    <p className="text-sm text-gray-500 mt-1 text-left">
                      계약기간: {formatDate(contract.startedAt)} ~ {formatDate(contract.expiredAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/contracts/register?propertyId=${id}`)}
                leftIcon={<Plus size={14} />}
                className="w-full"
              >
                새 계약 등록하기
              </Button>
            </div>
          </Card>
        )}

        {(!property.contractList || property.contractList.length === 0) && (
          <Card title="계약 정보">
            <div className="text-center py-6">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">등록된 계약이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">이 매물에 대한 계약을 등록해보세요.</p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/contracts/register?propertyId=${id}`)}
                  leftIcon={<Plus size={16} />}
                >
                  계약 등록하기
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="매물 삭제 확인"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              삭제
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          정말로 이 매물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </DashboardLayout>
  );
};

export default PropertyDetail;
