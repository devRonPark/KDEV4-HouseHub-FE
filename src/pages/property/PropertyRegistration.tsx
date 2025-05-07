'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Tag } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import Input from '../../components/ui/Input';
import AddressInput from '../../components/ui/AddressInput';
import PropertyTypeSelector from '../../components/property/PropertyTypeSelector';
import PropertyDirectionSelector from '../../components/property/PropertyDirectionSelector';
import PriceInput from '../../components/contract/PriceInput';
import { useToast } from '../../context/useToast';
import { registerProperty } from '../../api/property';
import type { PropertyType, PropertyDirection } from '../../types/property';
import type { BasicContractReqDto } from '../../types/contract';
import { ContractType, ContractTypeLabels } from '../../types/contract';
import type { TagResDto } from '../../types/tag';
import { getTags } from '../../api/tag';
import CustomerSelectionModal from '../../components/customers/CustomerSelectionModal';
import type { CustomerResDto } from '../../types/customer';

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

interface PropertyFormData {
  customerId: number | null;
  propertyType: PropertyType | null;
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  memo: string;
  active: boolean;
  area: string;
  floor: string;
  allFloors: string;
  direction: PropertyDirection | null;
  bathroomCnt: string;
  roomCnt: string;
  contractType: ContractType | null;
  salePrice: string;
  jeonsePrice: string;
  monthlyRentDeposit: string;
  monthlyRentFee: string;
}

const PropertyRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResDto | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<TagResDto[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const [formData, setFormData] = useState<PropertyFormData>({
    customerId: null,
    propertyType: null,
    roadAddress: '',
    jibunAddress: '',
    detailAddress: '',
    memo: '',
    active: true,
    area: '',
    floor: '',
    allFloors: '',
    direction: null,
    bathroomCnt: '',
    roomCnt: '',
    contractType: null,
    salePrice: '',
    jeonsePrice: '',
    monthlyRentDeposit: '',
    monthlyRentFee: '',
  });

  // 주소 선택 핸들러
  const handleAddressSelect = (address: {
    jibunAddress: string;
    roadAddress: string;
    detailAddress: string;
    zipCode: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      roadAddress: address.roadAddress,
      jibunAddress: address.jibunAddress,
      detailAddress: address.detailAddress,
    }));
  };

  // 숫자 입력 필드 핸들러 (정수만 허용)
  const handleIntegerInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof PropertyFormData
  ) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // 숫자 입력 필드 핸들러 (소수점 허용)
  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof PropertyFormData
  ) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.customerId) {
      showToast('고객을 선택해주세요.', 'error');
      return;
    }

    if (!formData.propertyType) {
      showToast('매물 유형을 선택해주세요.', 'error');
      return;
    }
    if (!formData.roadAddress || !formData.jibunAddress) {
      showToast('주소를 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const contractData: BasicContractReqDto | undefined = formData.contractType ? {
        contractType: formData.contractType,
        salePrice: formData.salePrice ? Number.parseInt(formData.salePrice, 10) * 10000 : undefined,
        jeonsePrice: formData.jeonsePrice ? Number.parseInt(formData.jeonsePrice, 10) * 10000 : undefined,
        monthlyRentDeposit: formData.monthlyRentDeposit ? Number.parseInt(formData.monthlyRentDeposit, 10) * 10000 : undefined,
        monthlyRentFee: formData.monthlyRentFee ? Number.parseInt(formData.monthlyRentFee, 10) * 10000 : undefined,
      } : undefined;

      const propertyData = {
        customerId: formData.customerId,
        propertyType: formData.propertyType,
        roadAddress: formData.roadAddress,
        jibunAddress: formData.jibunAddress,
        detailAddress: formData.detailAddress,
        memo: formData.memo || undefined,
        active: formData.active,
        area: formData.area ? Number.parseFloat(formData.area) : undefined,
        floor: formData.floor ? Number.parseInt(formData.floor, 10) : undefined,
        allFloors: formData.allFloors ? Number.parseInt(formData.allFloors, 10) : undefined,
        direction: formData.direction || undefined,
        bathroomCnt: formData.bathroomCnt ? Number.parseInt(formData.bathroomCnt, 10) : undefined,
        roomCnt: formData.roomCnt ? Number.parseInt(formData.roomCnt, 10) : undefined,
        contract: contractData,
        tagIds: selectedTags,
      };

      const response = await registerProperty(propertyData);

      if (response.success) {
        showToast('매물이 성공적으로 등록되었습니다.', 'success');
        navigate('/properties');
      } else {
        showToast(response.error || '매물 등록에 실패했습니다.', 'error');
      }
    } catch {
      showToast('매물 등록 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 태그 목록 로드
  useEffect(() => {
    const loadTags = async () => {
      setIsLoadingTags(true);
      try {
        const response = await getTags();
        if (response.success && response.data) {
          setAvailableTags(response.data);
        }
      } catch (error) {
        console.error('태그 로드 중 오류:', error);
        showToast('태그 목록을 불러오는데 실패했습니다.', 'error');
      } finally {
        setIsLoadingTags(false);
      }
    };

    loadTags();
  }, []);

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">매물 등록</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Button
            variant="outline"
            onClick={() => navigate('/properties')}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">고객 선택</label>
                {selectedCustomer ? (
                  <div className="p-4 bg-gray-50 rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.contact}</p>
                      {selectedCustomer.email && (
                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCustomerModalOpen(true)}
                    >
                      변경
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="w-full"
                  >
                    고객 선택하기
                  </Button>
                )}
              </div>

              {/* 매물 유형 선택 */}
              <PropertyTypeSelector 
                selectedType={formData.propertyType} 
                onChange={(type) => setFormData(prev => ({ ...prev, propertyType: type }))} 
              />

              {/* 주소 입력 */}
              <AddressInput onAddressSelect={handleAddressSelect} />

              {/* 매물 활성화 여부 */}
              {/* <div className="flex items-center">
                <input
                  id="active"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  매물 활성화 (체크 해제 시 비활성화) 
                </label>
              </div> */}

              {/* 새로 추가된 필드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 면적 */}
                <Input
                  label="면적 (평)"
                  placeholder="예: 24.5"
                  value={formData.area}
                  onChange={(e) => handleNumberInput(e, 'area')}
                />

                {/* 층수 */}
                <Input
                  label="층수"
                  placeholder="예: 3"
                  value={formData.floor}
                  onChange={(e) => handleIntegerInput(e, 'floor')}
                />

                {/* 총 층수 */}
                <Input
                  label="총 층수"
                  placeholder="예: 15"
                  value={formData.allFloors}
                  onChange={(e) => handleIntegerInput(e, 'allFloors')}
                />

                {/* 방 개수 */}
                <Input
                  label="방 개수"
                  placeholder="예: 2"
                  value={formData.roomCnt}
                  onChange={(e) => handleIntegerInput(e, 'roomCnt')}
                />

                {/* 욕실 개수 */}
                <Input
                  label="욕실 개수"
                  placeholder="예: 1"
                  value={formData.bathroomCnt}
                  onChange={(e) => handleIntegerInput(e, 'bathroomCnt')}
                />
              </div>

              {/* 방향 선택 */}
              <PropertyDirectionSelector 
                selectedDirection={formData.direction} 
                onChange={(direction) => setFormData(prev => ({ ...prev, direction }))} 
              />

              {/* 메모 */}
              <Textarea
                label="메모 (선택사항)"
                placeholder="매물에 대한 추가 정보를 입력하세요."
                value={formData.memo}
                onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                className="min-h-[100px]"
              />

              {/* 태그 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.tagId}
                      type="button"
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag.tagId)
                            ? prev.filter((id) => id !== tag.tagId)
                            : [...prev, tag.tagId]
                        );
                      }}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedTags.includes(tag.tagId)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <Tag size={12} className="mr-1" />
                      {tag.type}: {tag.value}
                    </button>
                  ))}
                </div>
                {isLoadingTags && (
                  <div className="mt-2 text-sm text-gray-500">태그 목록을 불러오는 중...</div>
                )}
              </div>

              {/* 계약 정보 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">계약 정보</h3>
                <p className="mt-1 text-xs text-gray-500">
                  ⚠️ 계약 조건을 함께 등록하지 않으면, 매물은 기본적으로 비활성화 상태로 저장됩니다.
                </p>
                <div className="space-y-6">
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

                  {/* 가격 정보 */}
                  {formData.contractType === 'SALE' && (
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

                  {formData.contractType === 'JEONSE' && (
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

                  {formData.contractType === 'MONTHLY_RENT' && (
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
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/properties')}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Home size={16} />}
            >
              매물 등록
            </Button>
          </div>
        </form>
      </div>

      {/* 고객 선택 모달 */}
      <CustomerSelectionModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={(customer) => {
          setSelectedCustomer(customer);
          setFormData(prev => ({ ...prev, customerId: customer.id }));
          setIsCustomerModalOpen(false);
        }}
      />
    </DashboardLayout>
  );
};

export default PropertyRegistration;
