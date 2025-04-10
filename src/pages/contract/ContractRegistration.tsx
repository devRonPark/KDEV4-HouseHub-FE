'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, CheckCircle } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import CustomerDropdown from '../../components/property/CustomerDropdown';
import { useToast } from '../../context/useToast';
import { registerContract } from '../../api/contract';
import { getPropertyById } from '../../api/property';
import {
  ContractType,
  ContractTypeLabels,
  ContractStatus,
  ContractStatusLabels,
  type ContractReqDto,
} from '../../types/contract';
import type { FindPropertyDetailResDto } from '../../types/property';

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

const ContractRegistration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // URL 파라미터에서 propertyId 추출
  const queryParams = new URLSearchParams(location.search);
  const propertyIdParam = queryParams.get('propertyId');

  // 폼 상태 관리
  const [selectedProperty, setSelectedProperty] = useState<FindPropertyDetailResDto | null>(null);
  const [contractType, setContractType] = useState<ContractType>(ContractType.SALE);
  const [contractStatus, setContractStatus] = useState<ContractStatus>(ContractStatus.IN_PROGRESS);
  const [salePrice, setSalePrice] = useState<string>('');
  const [jeonsePrice, setJeonsePrice] = useState<string>('');
  const [monthlyRentDeposit, setMonthlyRentDeposit] = useState<string>('');
  const [monthlyRentFee, setMonthlyRentFee] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [completedDate, setCompletedDate] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  // propertyId가 URL 파라미터로 제공된 경우 해당 매물 정보 로드
  useEffect(() => {
    const loadPropertyData = async () => {
      if (!propertyIdParam) return;

      try {
        const response = await getPropertyById(Number(propertyIdParam));
        if (response.success && response.data) {
          setSelectedProperty(response.data);
        } else {
          showToast(response.error || '매물 정보를 불러오는데 실패했습니다.', 'error');
        }
      } catch {
        showToast('매물 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      }
    };

    loadPropertyData();
  }, [propertyIdParam, showToast]);

  // 계약 유형에 따라 필요한 필드 표시 여부 결정
  const showSalePrice = contractType === ContractType.SALE;
  const showJeonsePrice = contractType === ContractType.JEONSE;
  const showMonthlyRent = contractType === ContractType.MONTHLY_RENT;

  // 계약 상태가 완료인 경우 완료일 필드 표시
  const showCompletedDate = contractStatus === ContractStatus.COMPLETED;

  // 계약 유형 변경 시 가격 필드 초기화
  useEffect(() => {
    // 계약 유형이 변경되면 모든 가격 필드 초기화
    setSalePrice('');
    setJeonsePrice('');
    setMonthlyRentDeposit('');
    setMonthlyRentFee('');
  }, [contractType]);

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!selectedProperty) {
      showToast('매물을 선택해주세요.', 'error');
      return;
    }

    if (!selectedCustomerId) {
      showToast('고객을 선택해주세요.', 'error');
      return;
    }

    // 계약 상태가 완료인데 완료일이 없는 경우
    if (showCompletedDate && !completedDate) {
      showToast('계약 완료 상태일 경우, 거래 완료일은 필수입니다.', 'error');
      return;
    }

    // 계약 기간 검증
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showToast('계약 기간이 올바르지 않습니다.', 'error');
      return;
    }

    // 계약 유형에 따른 가격 필드 검증
    if (showSalePrice && !salePrice) {
      showToast('매매 계약의 경우 매매가는 필수입니다.', 'error');
      return;
    }

    if (showJeonsePrice && !jeonsePrice) {
      showToast('전세 계약의 경우 전세가는 필수입니다.', 'error');
      return;
    }

    if (showMonthlyRent && (!monthlyRentDeposit || !monthlyRentFee)) {
      showToast('월세 계약의 경우 보증금과 월세는 필수입니다.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const contractData: ContractReqDto = {
        propertyId: selectedProperty.id,
        customerId: selectedCustomerId,
        contractType,
        contractStatus,
        memo: memo || undefined,
        startedAt: startDate || undefined,
        expiredAt: endDate || undefined,
        completedAt: completedDate || undefined,
      };

      // 계약 유형에 따라 가격 정보 추가
      if (showSalePrice) {
        contractData.salePrice = Number(salePrice);
      } else if (showJeonsePrice) {
        contractData.jeonsePrice = Number(jeonsePrice);
      } else if (showMonthlyRent) {
        contractData.monthlyRentDeposit = Number(monthlyRentDeposit);
        contractData.monthlyRentFee = Number(monthlyRentFee);
      }

      // 계약 상태가 완료인 경우 완료일 추가
      if (showCompletedDate) {
        contractData.completedAt = completedDate;
      }

      const response = await registerContract(contractData);

      if (response.success) {
        showToast('계약이 성공적으로 등록되었습니다.', 'success');
        // navigate('/contracts');
        setTimeout(() => {
          navigate('/contracts');
        }, 500); // 1.5초 후 이동
      } else {
        showToast(response.error || '계약 등록에 실패했습니다.', 'error');
      }
    } catch (error) {
      showToast('계약 등록 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 text-left">계약 등록</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Button
            variant="outline"
            onClick={() => navigate('/contracts')}
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
              {/* 매물 정보와 고객 정보를 같은 행에 배치 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 매물 정보 */}
                <div className="h-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    매물 정보 <span className="text-red-500">*</span>
                  </label>
                  {selectedProperty ? (
                    <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex flex-col justify-center">
                      <p className="font-medium text-gray-900">{selectedProperty.roadAddress}</p>
                      <p className="text-sm text-gray-500">{selectedProperty.detailAddress}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex flex-col justify-center">
                      <p className="text-gray-500">매물을 먼저 선택해주세요.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-fit"
                        onClick={() => navigate('/properties')}
                      >
                        매물 선택하기
                      </Button>
                    </div>
                  )}
                </div>

                {/* 고객 정보 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    고객 선택 <span className="text-red-500">*</span>
                  </label>
                  <CustomerDropdown
                    onCustomerSelect={setSelectedCustomerId}
                    selectedCustomerId={selectedCustomerId}
                  />
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

              {/* 계약 기간 */}
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

              {/* 계약 완료일 (계약 상태가 완료일 때만 표시) */}
              {showCompletedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    거래 완료일 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                    required
                    leftIcon={<CheckCircle size={18} />}
                    className="border-green-500 focus:ring-green-500"
                  />
                  <p className="mt-1 text-sm text-gray-500 text-left">
                    계약 완료 상태일 경우, 거래 완료일은 필수입니다.
                  </p>
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
              onClick={() => navigate('/contracts')}
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
              계약 등록
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ContractRegistration;
