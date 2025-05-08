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
import PriceInput from '../../components/contract/PriceInput';
import { useToast } from '../../context/useToast';
import { getContractById, updateContract } from '../../api/contract';
import {
  ContractType,
  ContractTypeLabels,
  ContractStatus,
  ContractStatusLabels,
  type ContractReqDto,
  type ContractFormData,
  type FindContractResDto,
} from '../../types/contract';
import { FindPropertyResDto, PropertyTypeLabels, type PropertySummaryResDto } from '../../types/property';
import PropertySelectionModal from '../../components/property/PropertySelectionModal';
import type { CustomerSummaryDto } from '../../types/customer';
import CustomerSelectionModal from '../../components/customers/CustomerSelectionModal';
import { getObjectDiff } from '../../utils/objectUtil';

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

  // 선택된 매물과 고객 정보
  const [selectedProperty, setSelectedProperty] = useState<PropertySummaryResDto | null>(null);
  const [selectedLandlord, setSelectedLandlord] = useState<CustomerSummaryDto | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<CustomerSummaryDto | null>(null);

  // 원본 계약 데이터 저장용 상태
  const [originalContract, setOriginalContract] = useState<FindContractResDto | null>(null);

  // 폼 데이터 상태
  const [formData, setFormData] = useState<ContractFormData>({
    propertyId: null,
    customerId: null,
    contractType: ContractType.SALE,
    contractStatus: ContractStatus.IN_PROGRESS,
    salePrice: '',
    jeonsePrice: '',
    monthlyRentDeposit: '',
    monthlyRentFee: '',
    startedAt: '',
    expiredAt: '',
    completedAt: '',
    memo: '',
  });

  // 계약 상태에 따른 고객 선택 필요 여부
  const isCustomerRequired = formData.contractStatus !== ContractStatus.AVAILABLE;

  // 가격 문자열에서 '만', '억', ',' 단위를 제거하는 함수
  const removePriceUnits = (price: string | null | undefined): string => {
    if (typeof price !== 'string') return '';

    const trimmed = price.replace(/\s+/g, '');
    const okMatch = trimmed.match(/(\d+(,\d+)*)(?=억)/);
    const manMatch = trimmed.match(/(\d+(,\d+)*)(?=만)/);

    const ok = okMatch ? parseInt(okMatch[0].replace(/,/g, '')) : 0;
    const man = manMatch ? parseInt(manMatch[0].replace(/,/g, '')) : 0;

    return (ok * 10000 + man).toString();
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
          setSelectedLandlord(contract.provider || null);
          setSelectedTenant(contract.seeker || null);
          
          setFormData({
            propertyId: contract.property?.id || null,
            customerId: contract.seeker?.id || null,
            contractType: contract.contractType,
            contractStatus: contract.status,
            salePrice: removePriceUnits(contract.salePrice),
            jeonsePrice: removePriceUnits(contract.jeonsePrice),
            monthlyRentDeposit: removePriceUnits(contract.monthlyRentDeposit),
            monthlyRentFee: removePriceUnits(contract.monthlyRentFee),
            startedAt: contract.startedAt || '',
            expiredAt: contract.expiredAt || '',
            memo: contract.memo || '',
            completedAt: contract.completedAt || '',
          });
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
    setFormData(prev => ({ ...prev, propertyId: property.id }));
    showToast('매물이 성공적으로 선택되었습니다.', 'success');
  };

  const handleCustomerSelect = useCallback(
    (customer: CustomerSummaryDto) => {
      if (selectedLandlord && selectedLandlord.id === customer.id) {
        showToast('집주인은 계약 대상이 될 수 없습니다.');
        return;
      }
      setSelectedTenant(customer);
      setFormData(prev => ({ ...prev, customerId: customer.id }));
      setIsCustomerModalOpen(false);
      showToast('고객이 성공적으로 선택되었습니다.', 'success');
    },
    [showToast, selectedLandlord]
  );

  const handleChangeCustomer = () => {
    setIsCustomerModalOpen(true);
  };

  // 계약 유형에 따라 필요한 필드 표시 여부 결정
  const showSalePrice = formData.contractType === ContractType.SALE;
  const showJeonsePrice = formData.contractType === ContractType.JEONSE;
  const showMonthlyRent = formData.contractType === ContractType.MONTHLY_RENT;

  // 계약 상태가 완료인 경우 완료일 필드 표시
  const showCompletedDate = formData.contractStatus === ContractStatus.COMPLETED;

  // 계약 상태가 진행 중인 경우에만 계약 기간 필드 표시
  const showContractPeriod = formData.contractStatus !== ContractStatus.AVAILABLE && formData.contractType !== ContractType.SALE;

  // 계약 유형 변경 시 가격 필드 초기화
  useEffect(() => {
    if (originalContract) {
      setFormData(prev => ({
        ...prev,
        salePrice: originalContract.contractType === ContractType.SALE ? removePriceUnits(originalContract.salePrice) : '',
        jeonsePrice: originalContract.contractType === ContractType.JEONSE ? removePriceUnits(originalContract.jeonsePrice) : '',
        monthlyRentDeposit: originalContract.contractType === ContractType.MONTHLY_RENT ? removePriceUnits(originalContract.monthlyRentDeposit) : '',
        monthlyRentFee: originalContract.contractType === ContractType.MONTHLY_RENT ? removePriceUnits(originalContract.monthlyRentFee) : '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        salePrice: '',
        jeonsePrice: '',
        monthlyRentDeposit: '',
        monthlyRentFee: '',
      }));
    }
  }, [formData.contractType, originalContract]);

  // 만원 단위 가격을 원화 단위로 변환하는 함수
  const convertToWon = (manwonValue: string): string => {
    if (!manwonValue || manwonValue.trim() === '') return '';
    return (parseInt(manwonValue, 10) * 10000).toString();
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !originalContract) return;

    // 계약 상태가 완료인데 완료일이 없는 경우
    if (showCompletedDate && !formData.completedAt) {
      showToast('계약 완료 상태일 경우, 거래 완료일은 필수입니다.', 'error');
      return;
    }

    // 계약 기간 검증
    if (formData.startedAt && formData.expiredAt && new Date(formData.startedAt) > new Date(formData.expiredAt)) {
      showToast(
        '계약 종료일이 계약 시작일보다 빠를 수 없습니다. 날짜를 다시 확인해주세요.',
        'error'
      );
      return;
    }

    // 계약 유형에 따른 가격 필드 검증
    if (showSalePrice && !formData.salePrice) {
      showToast('매매 계약의 경우 매매가는 필수입니다.', 'error');
      return;
    }

    if (showJeonsePrice && !formData.jeonsePrice) {
      showToast('전세 계약의 경우 전세가는 필수입니다.', 'error');
      return;
    }

    if (showMonthlyRent && (!formData.monthlyRentDeposit || !formData.monthlyRentFee)) {
      showToast('월세 계약의 경우 보증금과 월세는 필수입니다.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentData: ContractFormData = {
        propertyId: formData.propertyId,
        customerId: formData.customerId,
        contractType: formData.contractType,
        contractStatus: formData.contractStatus,
        salePrice: showSalePrice ? convertToWon(formData.salePrice) : '',
        jeonsePrice: showJeonsePrice ? convertToWon(formData.jeonsePrice) : '',
        monthlyRentDeposit: showMonthlyRent ? convertToWon(formData.monthlyRentDeposit) : '',
        monthlyRentFee: showMonthlyRent ? convertToWon(formData.monthlyRentFee) : '',
        startedAt: formData.startedAt,
        expiredAt: formData.expiredAt,
        memo: formData.memo,
        completedAt: showCompletedDate ? formData.completedAt : '',
      };

      const originalData: ContractFormData = {
        propertyId: originalContract.property?.id || null,
        customerId: originalContract.provider?.id || null,
        contractType: originalContract.contractType,
        contractStatus: originalContract.status,
        salePrice: originalContract.salePrice || '',
        jeonsePrice: originalContract.jeonsePrice || '',
        monthlyRentDeposit: originalContract.monthlyRentDeposit || '',
        monthlyRentFee: originalContract.monthlyRentFee || '',
        startedAt: originalContract.startedAt || '',
        expiredAt: originalContract.expiredAt || '',
        memo: originalContract.memo || '',
        completedAt: originalContract.completedAt || '',
      };

      const changedFields = getObjectDiff(originalData, currentData) as Partial<ContractReqDto>;

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

                  {formData.contractStatus === ContractStatus.AVAILABLE ? (
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
                        {/* {selectedTenant.email && (
                          <p className="text-sm text-gray-500">{selectedTenant.email}</p>
                        )} */}
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
                        selected={formData.contractType === type}
                        onClick={() => setFormData(prev => ({ ...prev, contractType: type }))}
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
                        selected={formData.contractStatus === status}
                        onClick={() => setFormData(prev => ({ ...prev, contractStatus: status }))}
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
                    value={formData.salePrice}
                    onChange={(value) => setFormData(prev => ({ ...prev, salePrice: value }))}
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
                    value={formData.jeonsePrice}
                    onChange={(value) => setFormData(prev => ({ ...prev, jeonsePrice: value }))}
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
                      value={formData.monthlyRentDeposit}
                      onChange={(value) => setFormData(prev => ({ ...prev, monthlyRentDeposit: value }))}
                      placeholder="보증금 입력 (만원 단위)"
                      required
                    />
                    <PriceInput
                      value={formData.monthlyRentFee}
                      onChange={(value) => setFormData(prev => ({ ...prev, monthlyRentFee: value }))}
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
                      value={formData.startedAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, startedAt: e.target.value }))}
                      leftIcon={<Calendar size={18} />}
                    />
                    <Input
                      type="date"
                      value={formData.expiredAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiredAt: e.target.value }))}
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
                    value={formData.completedAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, completedAt: e.target.value }))}
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
                  value={formData.memo}
                  onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
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
