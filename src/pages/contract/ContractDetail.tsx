'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, FileText, User, Home } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/useToast';
import { getContractById, deleteContract } from '../../api/contract';
import {
  ContractTypeLabels,
  ContractStatusLabels,
  ContractTypeColors,
  ContractStatusColors,
  type ContractResDto,
} from '../../types/contract';

const ContractDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [contract, setContract] = useState<ContractResDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 계약 상세 정보 조회
  useEffect(() => {
    const fetchContract = async () => {
      if (!id) return;

      try {
        const response = await getContractById(Number(id));
        if (response.success && response.data) {
          setContract(response.data);
        } else {
          showToast(response.error || '계약 정보를 불러오는데 실패했습니다.', 'error');
          navigate('/contracts');
        }
      } catch {
        showToast('계약 정보를 불러오는데 실패했습니다.', 'error');
        navigate('/contracts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  // 계약 삭제 핸들러
  const handleDelete = async () => {
    if (!id) return;

    if (!window.confirm('정말로 이 계약을 삭제하시겠습니까?')) return;

    setIsSubmitting(true);
    try {
      const response = await deleteContract(Number(id));
      if (response.success) {
        showToast('계약이 성공적으로 삭제되었습니다.', 'success');
        navigate('/contracts');
      } else {
        showToast(response.error || '계약 삭제에 실패했습니다.', 'error');
      }
    } catch {
      showToast('계약 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">계약 정보를 찾을 수 없습니다.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">계약 상세 정보</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/contracts')}
            leftIcon={<ArrowLeft size={16} />}
          >
            목록으로
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!id) {
                showToast('계약 ID가 없습니다.', 'error');
                return;
              }
              try {
                navigate(`/contracts/edit/${id}`);
              } catch (error) {
                console.error('Navigation error:', error);
                showToast('페이지 이동 중 오류가 발생했습니다.', 'error');
              }
            }}
            leftIcon={<Edit2 size={16} />}
            disabled={isSubmitting || !id}
          >
            수정
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            leftIcon={<Trash2 size={16} />}
            disabled={isSubmitting}
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <div className="space-y-6">
            {/* 계약 정보 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">계약 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 계약 유형과 가격 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">계약 유형:</span>
                    <span
                      className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ContractTypeColors[contract.contractType].bg
                      } ${ContractTypeColors[contract.contractType].text}`}
                    >
                      {ContractTypeLabels[contract.contractType]}
                    </span>
                  </div>
                  {contract.salePrice && (
                    <div className="flex items-center">
                      <span className="text-gray-700">매매가:</span>
                      <span className="ml-2 font-medium">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(contract.salePrice)}
                      </span>
                    </div>
                  )}
                  {contract.jeonsePrice && (
                    <div className="flex items-center">
                      <span className="text-gray-700">전세가:</span>
                      <span className="ml-2 font-medium">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(contract.jeonsePrice)}
                      </span>
                    </div>
                  )}
                  {(contract.monthlyRentDeposit || contract.monthlyRentFee) && (
                    <div className="flex items-center">
                      <span className="text-gray-700">월세:</span>
                      <span className="ml-2 font-medium">
                        {contract.monthlyRentDeposit &&
                          new Intl.NumberFormat('ko-KR', {
                            style: 'currency',
                            currency: 'KRW',
                          }).format(contract.monthlyRentDeposit)}
                        {contract.monthlyRentFee &&
                          ` / ${new Intl.NumberFormat('ko-KR', {
                            style: 'currency',
                            currency: 'KRW',
                          }).format(contract.monthlyRentFee)}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* 계약 상태와 날짜 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">계약 상태:</span>
                    <span
                      className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ContractStatusColors[contract.status].bg
                      } ${ContractStatusColors[contract.status].text}`}
                    >
                      {ContractStatusLabels[contract.status]}
                    </span>
                  </div>
                  {contract.startedAt && contract.expiredAt && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {new Date(contract.startedAt).toLocaleDateString()} ~{' '}
                        {new Date(contract.expiredAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* 매물 정보와 고객 정보를 두 컬럼으로 배치 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 매물 정보 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">매물 정보</h2>
                <div
                  // className="p-4 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                  className="p-4 rounded-md hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => navigate(`/properties/${contract.property.id}`)}
                >
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">{contract.property.roadAddress}</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">{contract.property.detailAddress}</span>
                  </div>
                </div>
              </div>

              {/* 고객 정보 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">계약자 정보</h2>
                {contract.customer ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">이름: {contract.customer.name}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">연락처: {contract.customer.contact}</span>
                    </div>
                    {contract.customer.email && (
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-700">이메일: {contract.customer.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">고객 정보가 없습니다.</p>
                )}
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* 메모 */}
            {contract.memo && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">메모</h2>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-700 whitespace-pre-wrap">{contract.memo}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ContractDetail;
