'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, CheckCircle, Edit, User, AlertCircle } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import PriceInput from '../../components/contract/PriceInput';
import { useToast } from '../../context/useToast';
import { registerContract } from '../../api/contract';
import {
  ContractType,
  ContractTypeLabels,
  ContractStatus,
  ContractStatusLabels,
  type ContractReqDto,
  type ContractFormData,
} from '../../types/contract';
import { PropertyType, PropertyTypeLabels, type FindPropertyResDto } from '../../types/property';
import PropertySelectionModal from '../../components/property/PropertySelectionModal';
import type { CustomerResDto } from '../../types/customer';
import CustomerSelectionModal from '../../components/customers/CustomerSelectionModal';
import { getPropertyById } from '../../api/property';
import { Tooltip } from '@mui/material';

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
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // URL 파라미터에서 propertyId 추출
  const queryParams = new URLSearchParams(location.search);
  const propertyIdParam = queryParams.get('propertyId');

  // 선택된 매물과 고객 정보
  const [selectedProperty, setSelectedProperty] = useState<FindPropertyResDto | null>(null);
  const [selectedLandlord, setSelectedLandlord] = useState<CustomerResDto | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<CustomerResDto | null>(null);

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

  // 매매가 아닐 때만 계약 기간 필드 표시
  const showContractPeriod = formData.contractStatus !== ContractStatus.AVAILABLE && formData.contractType !== ContractType.SALE;

  // 계약 상태가 완료인 경우 완료일 필드 표시
  const showCompletedDate = formData.contractStatus === ContractStatus.COMPLETED;

  // 계약 상태 변경 시 고객 정보 초기화
  useEffect(() => {
    if (formData.contractStatus === ContractStatus.AVAILABLE) {
      setSelectedTenant(null);
      setFormData(prev => ({ ...prev, customerId: null }));
    }
  }, [formData.contractStatus]);

  // propertyId가 URL 파라미터로 제공된 경우 해당 매물 정보 로드
  useEffect(() => {
    const loadPropertyData = async () => {
      if (!propertyIdParam) return;

      try {
        const response = await getPropertyById(Number(propertyIdParam));
        if (response.success && response.data) {
          setSelectedProperty({
            ...response.data,
            propertyType: response.data.propertyType as PropertyType,
          } as unknown as FindPropertyResDto);
          setSelectedLandlord(response.data.customer || null);
          setFormData(prev => ({ ...prev, propertyId: response.data?.id || null }));
        } else {
          showToast(response.error || '매물 정보를 불러오는데 실패했습니다.', 'error');
        }
      } catch {
        showToast('매물 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      }
    };

    loadPropertyData();
  }, [propertyIdParam]);

  const handlePropertySelect = async (property: FindPropertyResDto) => {
    setSelectedProperty(property);
    setSelectedLandlord(property.customer || null);
    setFormData(prev => ({ ...prev, propertyId: property.id }));
    if (selectedTenant) {
      setSelectedTenant(null);
      setFormData(prev => ({ ...prev, customerId: null }));
    }
    showToast('매물이 성공적으로 선택되었습니다.', 'success');
  };

  // 고객 선택 모달에서 고객 선택 시 호출되는 함수
  const handleCustomerSelect = (customer: CustomerResDto) => {
    if (selectedLandlord && selectedLandlord.id === customer.id) {
      showToast('집주인은 계약 대상이 될 수 없습니다.');
      return;
    }
    setSelectedTenant(customer);
    setFormData(prev => ({ ...prev, customerId: customer.id }));
    showToast('고객이 성공적으로 선택되었습니다.', 'success');
  };

  // 매물 변경 버튼 클릭 핸들러
  const handleChangeProperty = () => {
    setIsPropertyModalOpen(true);
  };

  // 고객 변경 버튼 클릭 핸들러
  const handleChangeCustomer = () => {
    if (!selectedProperty) {
      showToast('고객을 선택하려면 먼저 매물을 선택해주세요.', 'error');
      return;
    }
    setIsCustomerModalOpen(true);
  };

  // 계약 유형에 따라 필요한 필드 표시 여부 결정
  const showSalePrice = formData.contractType === ContractType.SALE;
  const showJeonsePrice = formData.contractType === ContractType.JEONSE;
  const showMonthlyRent = formData.contractType === ContractType.MONTHLY_RENT;

  // 계약 유형 변경 시 가격 필드 초기화
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      salePrice: '',
      jeonsePrice: '',
      monthlyRentDeposit: '',
      monthlyRentFee: '',
    }));
  }, [formData.contractType]);

  // 만원 단위 가격을 원화 단위로 변환하는 함수
  const convertToWon = (manwonValue: string): number | null => {
    if (!manwonValue || manwonValue.trim() === '') return null;
    return parseInt(manwonValue, 10) * 10000;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.propertyId) {
      showToast('매물을 선택해주세요.', 'error');
      return;
    }

    // 계약 상태에 따른 고객 필드 검증
    if (isCustomerRequired && !formData.customerId) {
      showToast('계약 중 또는 계약 완료 상태일 경우, 고객 선택은 필수입니다.', 'error');
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

    if (showMonthlyRent) {
      if (!formData.monthlyRentDeposit) {
        showToast('월세 계약의 경우 보증금은 필수입니다.', 'error');
        return;
      }
      if (!formData.monthlyRentFee) {
        showToast('월세 계약의 경우 월세는 필수입니다.', 'error');
        return;
      }
    }

    // 계약 상태에 따른 날짜 필드 검증
    if (showContractPeriod) {
      if (!formData.startedAt) {
        showToast('계약 시작일은 필수입니다.', 'error');
        return;
      }
      if (!formData.expiredAt) {
        showToast('계약 종료일은 필수입니다.', 'error');
        return;
      }

      // 계약 기간 검증 (시작일이 종료일보다 늦으면 안 됨)
      if (new Date(formData.startedAt) > new Date(formData.expiredAt)) {
        showToast(
          '계약 종료일이 계약 시작일보다 빠를 수 없습니다. 날짜를 다시 확인해주세요.',
          'error'
        );
        return;
      }
    }

    // 계약 상태가 완료인데 완료일이 없는 경우
    if (showCompletedDate && !formData.completedAt) {
      showToast('계약 완료 상태일 경우, 거래 완료일은 필수입니다.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const contractData: ContractReqDto = {
        propertyId: formData.propertyId,
        customerId: formData.customerId,
        contractType: formData.contractType,
        contractStatus: formData.contractStatus,
        memo: formData.memo || null,
        startedAt: formData.startedAt || null,
        expiredAt: formData.expiredAt || null,
        salePrice: showSalePrice ? convertToWon(formData.salePrice) : null,
        jeonsePrice: showJeonsePrice ? convertToWon(formData.jeonsePrice) : null,
        monthlyRentDeposit: showMonthlyRent ? convertToWon(formData.monthlyRentDeposit) : null,
        monthlyRentFee: showMonthlyRent ? convertToWon(formData.monthlyRentFee) : null,
        completedAt: showCompletedDate ? formData.completedAt : null,
      };

      const response = await registerContract(contractData);

      if (response.success) {
        showToast('계약이 성공적으로 등록되었습니다.', 'success');
        setTimeout(() => {
          navigate('/contracts');
        }, 500);
      } else {
        showToast(response.error || '계약 등록에 실패했습니다.', 'error');
      }
    } catch {
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
                        <p className="font-medium text-gray-900">
                          {selectedTenant.name ?? '미입력'}
                        </p>
                        <p className="text-sm text-gray-500">{selectedTenant.contact}</p>
                        <p className="text-sm text-gray-500">{selectedTenant.email ?? '미입력'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-left h-[88px] flex items-center justify-start">
                      <div className="flex items-center gap-4">
                        <User className="h-10 w-10 text-gray-400 mt-1" />
                        <div className="flex flex-col">
                          <p className="text-gray-500 mb-2">고객을 선택해주세요.</p>
                          <Tooltip title={!selectedProperty ? '먼저 매물을 선택해주세요.' : ''}>
                            <span>
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                className="mt-2"
                                onClick={handleChangeCustomer}
                                disabled={!selectedProperty}
                              >
                                고객 선택하기
                              </Button>
                            </span>
                          </Tooltip>
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
      {/* 매물 선택 모달 */}
      <PropertySelectionModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSelectProperty={handlePropertySelect}
        selectedPropertyId={selectedProperty?.id || null}
      />
      {/* 고객 선택 모달 - 계약 상태가 진행 중이 아닐 때만 활성화 */}
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

export default ContractRegistration;
