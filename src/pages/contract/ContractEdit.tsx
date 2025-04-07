'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Home, User } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { useToast } from '../../context/useToast';
import { getContractById, updateContract } from '../../api/contract';
import {
  ContractType,
  ContractTypeLabels,
  ContractStatus,
  ContractStatusLabels,
  type ContractReqDto,
  type ContractResDto,
} from '../../types/contract';

// 계약 유형 선택 버튼 컴포넌트
const ContractTypeButton: React.FC<{
  type: ContractType;
  selected: boolean;
  onClick: () => void;
}> = ({ type, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      px-4 py-2 rounded-md text-sm font-medium transition-colors
      ${
        selected
          ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
      }
    `}
  >
    {ContractTypeLabels[type]}
  </button>
);

// 계약 상태 선택 버튼 컴포넌트
const ContractStatusButton: React.FC<{
  status: ContractStatus;
  selected: boolean;
  onClick: () => void;
}> = ({ status, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      px-4 py-2 rounded-md text-sm font-medium transition-colors
      ${
        selected
          ? 'bg-green-100 text-green-700 border-2 border-green-500'
          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
      }
    `}
  >
    {ContractStatusLabels[status]}
  </button>
);

const ContractEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contract, setContract] = useState<ContractResDto | null>(null);

  // 폼 상태 관리
  const [contractType, setContractType] = useState<ContractType>(ContractType.SALE);
  const [contractStatus, setContractStatus] = useState<ContractStatus>(ContractStatus.AVAILABLE);
  const [salePrice, setSalePrice] = useState<string>('');
  const [jeonsePrice, setJeonsePrice] = useState<string>('');
  const [monthlyRentDeposit, setMonthlyRentDeposit] = useState<string>('');
  const [monthlyRentFee, setMonthlyRentFee] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [propertyId, setPropertyId] = useState<number>(0);
  const [customerId, setCustomerId] = useState<number>(0);

  // 계약 상세 정보 조회
  useEffect(() => {
    const fetchContract = async () => {
      if (!id) return;

      try {
        const response = await getContractById(Number(id));
        if (response.success && response.data) {
          const contract = response.data;
          setContractType(contract.contractType);
          setContractStatus(contract.status);
          setSalePrice(contract.salePrice?.toString() || '');
          setJeonsePrice(contract.jeonsePrice?.toString() || '');
          setMonthlyRentDeposit(contract.monthlyRentDeposit?.toString() || '');
          setMonthlyRentFee(contract.monthlyRentFee?.toString() || '');
          setStartDate(contract.startedAt || '');
          setEndDate(contract.expiredAt || '');
          setMemo(contract.memo || '');
          setPropertyId(contract.property.id);
          setCustomerId(contract.customer.id);
          setContract(contract);
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
  }, [id, navigate, showToast]);

  // 계약 유형에 따라 필요한 필드 표시 여부 결정
  const showSalePrice = contractType === ContractType.SALE;
  const showJeonsePrice = contractType === ContractType.JEONSE;
  const showMonthlyRent = contractType === ContractType.MONTHLY_RENT;

  // 계약 상태가 AVAILABLE이 아닌 경우에만 계약 기간 표시
  const showContractPeriod = contractStatus !== ContractStatus.AVAILABLE;

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);

    try {
      // 기본 계약 데이터
      const contractData: ContractReqDto = {
        propertyId,
        customerId,
        contractType,
        contractStatus: contractStatus,
        memo: memo || undefined,
      };

      // 계약 상태가 AVAILABLE이 아닌 경우에만 계약 기간 추가
      if (contractStatus !== ContractStatus.AVAILABLE) {
        contractData.startedAt = startDate;
        contractData.expiredAt = endDate;
      }

      // 계약 유형에 따라 가격 정보 추가
      switch (contractType) {
        case ContractType.SALE:
          if (!salePrice) {
            showToast('매매가를 입력해주세요.', 'error');
            return;
          }
          contractData.salePrice = Number(salePrice);
          break;
        case ContractType.JEONSE:
          if (!jeonsePrice) {
            showToast('전세가를 입력해주세요.', 'error');
            return;
          }
          contractData.jeonsePrice = Number(jeonsePrice);
          break;
        case ContractType.MONTHLY_RENT:
          if (!monthlyRentDeposit || !monthlyRentFee) {
            showToast('보증금과 월세를 모두 입력해주세요.', 'error');
            return;
          }
          contractData.monthlyRentDeposit = Number(monthlyRentDeposit);
          contractData.monthlyRentFee = Number(monthlyRentFee);
          break;
      }

      console.log('Sending contract update request:', {
        id: Number(id),
        data: contractData,
      });

      const response = await updateContract(Number(id), contractData);

      console.log('Update response:', response);

      if (response.success) {
        showToast('계약 정보가 성공적으로 수정되었습니다.', 'success');
        setTimeout(() => {
          navigate(`/contracts/${id}`);
        }, 500);
      } else {
        showToast(response.error || '계약 수정에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      showToast('계약 수정 중 오류가 발생했습니다.', 'error');
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

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">계약 수정</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/contracts/${id}`)}
            leftIcon={<ArrowLeft size={16} />}
          >
            돌아가기
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <div className="space-y-6">
              {/* 매물 정보 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">매물 정보</h2>
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">{contract?.property.roadAddress}</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">{contract?.property.detailAddress}</span>
                  </div>
                </div>
              </div>

              {/* 고객 정보 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">고객 정보</h2>
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">이름: {contract?.customer.name}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">연락처: {contract?.customer.contact}</span>
                  </div>
                  {contract?.customer.email && (
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">이메일: {contract?.customer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 계약 유형과 계약 상태를 같은 행에 배치 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 계약 유형 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    계약 유형 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ContractType).map((type) => (
                      <ContractTypeButton
                        key={type}
                        type={type}
                        selected={contractType === type}
                        onClick={() => setContractType(type)}
                      />
                    ))}
                  </div>
                </div>

                {/* 계약 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    계약 상태 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ContractStatus).map((status) => (
                      <ContractStatusButton
                        key={status}
                        status={status}
                        selected={contractStatus === status}
                        onClick={() => setContractStatus(status)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 가격 정보 */}
              {showSalePrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    매매가 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="매매가 입력"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    required
                  />
                </div>
              )}

              {showJeonsePrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    전세가 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="전세가 입력"
                    value={jeonsePrice}
                    onChange={(e) => setJeonsePrice(e.target.value)}
                    required
                  />
                </div>
              )}

              {showMonthlyRent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    보증금/월세 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="보증금 입력"
                      value={monthlyRentDeposit}
                      onChange={(e) => setMonthlyRentDeposit(e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="월세 입력"
                      value={monthlyRentFee}
                      onChange={(e) => setMonthlyRentFee(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {showContractPeriod && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    계약 기간 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      leftIcon={<Calendar size={18} />}
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      leftIcon={<Calendar size={18} />}
                    />
                  </div>
                </div>
              )}

              {/* 메모 필드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  메모 (선택사항)
                </label>
                <Textarea
                  placeholder="계약에 대한 추가 정보를 입력하세요."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/contracts/${id}`)}
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
              수정 완료
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ContractEdit;
