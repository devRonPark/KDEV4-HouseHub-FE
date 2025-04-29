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
import type { CustomerResDto } from '../../types/customer';
import CustomerSelectionModal from '../../components/customers/CustomerSelectionModal';
import { getObjectDiff } from '../../utils/objectUtil';
import type { ContractResDto } from '../../types/contract';

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

// 가격 입력 필드 컴포넌트 (만원 단위 입력 지원)
const PriceInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}> = ({ value, onChange, placeholder, required = false }) => {
  // 입력값을 숫자만 허용하고 변경 이벤트 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // 숫자만 허용 (소수점 없이)
    if (/^[0-9]*$/.test(inputValue) || inputValue === '') {
      onChange(inputValue);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-gray-500">만원</span>
      </div>
    </div>
  );
};

interface ContractFormState {
  propertyId: number | null;
  customerId: number | null;
  contractType: ContractType;
  contractStatus: ContractStatus;
  salePrice: string | null;
  jeonsePrice: string | null;
  monthlyRentDeposit: string | null;
  monthlyRentFee: string | null;
  startedAt: string;
  expiredAt: string;
  memo: string;
  completedAt: string | null;
  // active: boolean;
}

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
  const [selectedLandlord, setSelectedLandlord] = useState<CustomerResDto | null>(null); // 집주인
  const [selectedTenant, setSelectedTenant] = useState<CustomerResDto | null>(null); // 계약자
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
  // const [active, setActive] = useState<boolean>(true);

  // 원본 계약 데이터 저장용 상태
  const [originalContract, setOriginalContract] = useState<ContractResDto | null>(null);

  // 계약 상태에 따른 고객 선택 필요 여부
  const isCustomerRequired = contractStatus !== ContractStatus.AVAILABLE;

  // 가격 문자열에서 '만', '억' 단위를 제거하는 함수
  const removePriceUnits = (price: string | null | undefined): string => {
    if (!price) return '';
    return price.replace(/(억|만)/g, '');
  };

  // 계약 상세 정보 조회
  useEffect(() => {
    const fetchContract = async () => {
      if (!id) return;

      try {
        const response = await getContractById(Number(id));
        if (response.success && response.data) {
          const contract = response.data;
          setOriginalContract(contract);
          setSelectedProperty(contract.property);
          setSelectedLandlord(contract.property.customer || null);
          setSelectedTenant(contract.customer || null);
          setContractType(contract.contractType);
          setContractStatus(contract.status);
          setSalePrice(removePriceUnits(contract.salePrice));
          setJeonsePrice(removePriceUnits(contract.jeonsePrice));
          setMonthlyRentDeposit(removePriceUnits(contract.monthlyRentDeposit));
          setMonthlyRentFee(removePriceUnits(contract.monthlyRentFee));
          setStartDate(contract.startedAt || '');
          setEndDate(contract.expiredAt || '');
          setMemo(contract.memo || '');
          setCompletedDate(contract.completedAt || '');
          // setActive(contract.active ?? true);
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
    (customer: CustomerResDto) => {
      if (selectedLandlord && selectedLandlord.id === customer.id) {
        showToast('집주인은 계약 대상이 될 수 없습니다.');
        return;
      }
      console.log('고객 선택');
      setSelectedTenant(customer);
      setIsCustomerModalOpen(false);
      showToast('고객이 성공적으로 선택되었습니다.', 'success');
    },
    [showToast, selectedLandlord]
  );

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
    if (originalContract) {
      setSalePrice(
        originalContract.contractType === ContractType.SALE
          ? removePriceUnits(originalContract.salePrice)
          : ''
      );
      setJeonsePrice(
        originalContract.contractType === ContractType.JEONSE
          ? removePriceUnits(originalContract.jeonsePrice)
          : ''
      );
      setMonthlyRentDeposit(
        originalContract.contractType === ContractType.MONTHLY_RENT
          ? removePriceUnits(originalContract.monthlyRentDeposit)
          : ''
      );
      setMonthlyRentFee(
        originalContract.contractType === ContractType.MONTHLY_RENT
          ? removePriceUnits(originalContract.monthlyRentFee)
          : ''
      );
    } else {
      setSalePrice('');
      setJeonsePrice('');
      setMonthlyRentDeposit('');
      setMonthlyRentFee('');
    }
  }, [contractType, originalContract]);

  // 만원 단위 가격을 원화 단위로 변환하는 함수
  const convertToWon = (manwonValue: string): string | null => {
    if (!manwonValue || manwonValue.trim() === '') return null;
    return (parseInt(manwonValue, 10) * 10000).toString();
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !originalContract) return;

    // 계약 상태가 완료인데 완료일이 없는 경우
    if (showCompletedDate && !completedDate) {
      showToast('계약 완료 상태일 경우, 거래 완료일은 필수입니다.', 'error');
      return;
    }

    // 계약 기간 검증
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showToast(
        '계약 종료일이 계약 시작일보다 빠를 수 없습니다. 날짜를 다시 확인해주세요.',
        'error'
      );
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
      const currentData: ContractFormState = {
        propertyId: selectedProperty?.id || null,
        customerId: selectedTenant?.id || null,
        contractType,
        contractStatus,
        salePrice: showSalePrice ? convertToWon(salePrice) : null,
        jeonsePrice: showJeonsePrice ? convertToWon(jeonsePrice) : null,
        monthlyRentDeposit: showMonthlyRent ? convertToWon(monthlyRentDeposit) : null,
        monthlyRentFee: showMonthlyRent ? convertToWon(monthlyRentFee) : null,
        startedAt: startDate,
        expiredAt: endDate,
        memo,
        completedAt: showCompletedDate ? completedDate : null,
        // active,
      };

      const originalData: ContractFormState = {
        propertyId: originalContract.property?.id || null,
        customerId: originalContract.customer?.id || null,
        contractType: originalContract.contractType,
        contractStatus: originalContract.status,
        salePrice: originalContract.salePrice || null,
        jeonsePrice: originalContract.jeonsePrice || null,
        monthlyRentDeposit: originalContract.monthlyRentDeposit || null,
        monthlyRentFee: originalContract.monthlyRentFee || null,
        startedAt: originalContract.startedAt || '',
        expiredAt: originalContract.expiredAt || '',
        memo: originalContract.memo || '',
        completedAt: originalContract.completedAt || '',
        // active: originalContract.active ?? true,
      };

      const changedFields = getObjectDiff(originalData, currentData) as Partial<ContractReqDto>;

      // propertyId와 customerId는 객체 비교가 아닌 id 직접 비교
      if (selectedProperty?.id !== originalContract.property?.id) {
        changedFields.propertyId = selectedProperty?.id || 0;
      }
      if (selectedTenant?.id !== originalContract.customer?.id) {
        changedFields.customerId = selectedTenant?.id || null;
      }

      // 변경된 필드가 없는 경우
      if (Object.keys(changedFields).length === 0) {
        showToast('변경 사항이 없습니다.', 'info');
        return;
      }

      const response = await updateContract(Number(id), changedFields as ContractReqDto);

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
                      매물 정보
                    </label>
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
                    {selectedTenant && isCustomerRequired && (
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
                  ) : selectedTenant ? (
                    <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedTenant.name}</p>
                        <p className="text-sm text-gray-500">{selectedTenant.contact}</p>
                        {selectedTenant.email && (
                          <p className="text-sm text-gray-500">{selectedTenant.email}</p>
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
                  <PriceInput
                    value={salePrice}
                    onChange={(value) => setSalePrice(value)}
                    placeholder="매매가 입력 (만원 단위)"
                    required
                  />
                </div>
              )}

              {showJeonsePrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    전세가 <span className="text-red-500">*</span>
                  </label>
                  <PriceInput
                    value={jeonsePrice}
                    onChange={(value) => setJeonsePrice(value)}
                    placeholder="전세가 입력 (만원 단위)"
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
                    <PriceInput
                      value={monthlyRentDeposit}
                      onChange={(value) => setMonthlyRentDeposit(value)}
                      placeholder="보증금 입력 (만원 단위)"
                      required
                    />
                    <PriceInput
                      value={monthlyRentFee}
                      onChange={(value) => setMonthlyRentFee(value)}
                      placeholder="월세 입력 (만원 단위)"
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
                  placeholder={originalContract?.memo || '계약에 대한 추가 정보를 입력하세요.'}
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
          selectedCustomerId={selectedTenant?.id || null}
        />
      )}
    </DashboardLayout>
  );
};

export default ContractEdit;
