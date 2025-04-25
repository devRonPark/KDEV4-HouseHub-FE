'use client';

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, User, CheckCircle, Edit, AlertCircle } from 'react-feather';
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
} from '../../types/contract';
import { PropertyTypeLabels, type FindPropertyResDto } from '../../types/property';
import PropertySelectionModal from '../../components/property/PropertySelectionModal';
import type { CreateCustomerResDto } from '../../types/customer';
import CustomerSelectionModal from '../../components/customers/CustomerSelectionModal';

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
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // 폼 상태 관리
  const [selectedProperty, setSelectedProperty] = useState<FindPropertyResDto | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CreateCustomerResDto | null>(null);
  const [contractType, setContractType] = useState<ContractType>(ContractType.SALE);
  const [contractStatus, setContractStatus] = useState<ContractStatus>(ContractStatus.IN_PROGRESS);
  const [salePrice, setSalePrice] = useState<string>('');
  const [jeonsePrice, setJeonsePrice] = useState<string>('');
  const [monthlyRentDeposit, setMonthlyRentDeposit] = useState<string>('');
  const [monthlyRentFee, setMonthlyRentFee] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [completedDate, setCompletedDate] = useState<string>('');

  // 계약 상태에 따른 고객 선택 필요 여부
  const isCustomerRequired = contractStatus !== ContractStatus.AVAILABLE;

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
          setCompletedDate(contract.completedAt || '');
          setSelectedProperty(contract.property);
          setSelectedCustomer(contract.customer || null);
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

  const handlePropertySelect = async (property: FindPropertyResDto) => {
    setSelectedProperty(property);
    showToast('매물이 성공적으로 선택되었습니다.', 'success');
  };

  const handleCustomerSelect = useCallback(
    (customer: CreateCustomerResDto) => {
      console.log('Selected customer:', customer);
      setSelectedCustomer(customer);
      setIsCustomerModalOpen(false);
      showToast('고객이 성공적으로 선택되었습니다.', 'success');
    },
    [showToast]
  );

  const handleChangeProperty = () => {
    setIsPropertyModalOpen(true);
  };

  const handleChangeCustomer = () => {
    setIsCustomerModalOpen(true);
  };

  // 계약 유형에 따라 필요한 필드 표시 여부 결정
  const showSalePrice = contractType === ContractType.SALE;
  const showJeonsePrice = contractType === ContractType.JEONSE;
  const showMonthlyRent = contractType === ContractType.MONTHLY_RENT;

  // 계약 상태가 완료인 경우 완료일 필드 표시
  const showCompletedDate = contractStatus === ContractStatus.COMPLETED;

  // 계약 상태가 진행 중인 경우에만 계약 기간 필드 표시
  const showContractPeriod = contractStatus !== ContractStatus.AVAILABLE;

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
    if (!id) return;

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
      // 기본 계약 데이터
      const contractData: ContractReqDto = {
        propertyId: selectedProperty?.id || 0,
        customerId: selectedCustomer?.id || null,
        contractType,
        contractStatus: contractStatus,
        memo: memo || undefined,
        startedAt: startDate || undefined,
        expiredAt: endDate || undefined,
        salePrice: showSalePrice ? Number(salePrice) : null,
        jeonsePrice: showJeonsePrice ? Number(jeonsePrice) : null,
        monthlyRentDeposit: showMonthlyRent ? Number(monthlyRentDeposit) : null,
        monthlyRentFee: showMonthlyRent ? Number(monthlyRentFee) : null,
        completedAt: completedDate || undefined,
      };

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

      // 계약 진행 중일 때만 계약 기간 추가
      if (showContractPeriod) {
        contractData.startedAt = startDate;
        contractData.expiredAt = endDate;
      }

      // 계약 상태가 완료인 경우 완료일 추가
      if (showCompletedDate) {
        contractData.completedAt = completedDate;
      }

      const response = await updateContract(Number(id), contractData);

      // console.log('Update response:', response);

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
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <Card className="mb-6">
            <div className="space-y-6">
              {/* 매물 정보와 고객 정보를 같은 행에 배치 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 매물 정보 */}
                <div className="h-full">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      매물 정보 <span className="text-red-500">*</span>
                    </label>
                    {selectedProperty && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleChangeProperty}
                        leftIcon={<Edit size={14} />}
                      >
                        매물 변경
                      </Button>
                    )}
                  </div>

                  {selectedProperty ? (
                    <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex flex-col justify-center">
                      <p className="font-medium text-gray-900">{selectedProperty.roadAddress}</p>
                      <p className="text-sm text-gray-500">{selectedProperty.detailAddress}</p>
                      <div className="mt-1 flex items-center flex-wrap gap-2">
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {PropertyTypeLabels[selectedProperty.propertyType]}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex flex-col justify-center">
                      <p className="text-gray-500">매물을 먼저 선택해주세요.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-fit"
                        onClick={() => setIsPropertyModalOpen(true)}
                      >
                        매물 선택하기
                      </Button>
                    </div>
                  )}
                </div>

                {/* 고객 정보 */}
                <div className="h-full">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 text-left">
                      계약자 정보 {isCustomerRequired && <span className="text-red-500">*</span>}
                    </label>
                    {selectedCustomer && isCustomerRequired && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleChangeCustomer}
                        leftIcon={<Edit size={14} />}
                      >
                        고객 변경
                      </Button>
                    )}
                  </div>

                  {contractStatus === ContractStatus.AVAILABLE ? (
                    <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex items-center">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                        <AlertCircle size={20} className="text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">고객 선택 불가</p>
                        <p className="text-sm text-gray-500">
                          계약 가능 상태에서는 고객을 선택할 수 없습니다.
                        </p>
                      </div>
                    </div>
                  ) : selectedCustomer ? (
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
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex items-center justify-start">
                      <div className="flex items-center gap-4">
                        <User className="h-10 w-10 text-gray-400 mt-1" />
                        <div className="flex flex-col">
                          <p className="text-gray-500 mb-2">고객을 선택해주세요.</p>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleChangeCustomer}
                          >
                            고객 선택하기
                          </Button>
                        </div>
                      </div>
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

              {/* 계약 기간 - 계약 진행 중일 때만 표시 */}
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
                      leftIcon={<Calendar size={18} />}
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      leftIcon={<Calendar size={18} />}
                    />
                  </div>
                </div>
              )}

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

      {/* 매물 선택 모달 */}
      <PropertySelectionModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSelectProperty={handlePropertySelect}
        selectedPropertyId={selectedProperty?.id || null}
      />

      {/* 고객 선택 모달 */}
      {isCustomerRequired && (
        <CustomerSelectionModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSelectCustomer={handleCustomerSelect}
          selectedCustomerId={selectedCustomer?.id || null}
        />
      )}
    </DashboardLayout>
  );
};

export default ContractEdit;
