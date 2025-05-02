'use client';

import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import Input from '../../components/ui/Input';
import AddressInput from '../../components/ui/AddressInput';
import PropertyTypeSelector from '../../components/property/PropertyTypeSelector';
import CustomerDropdown from '../../components/property/CustomerDropdown';
import PropertyDirectionSelector from '../../components/property/PropertyDirectionSelector';
import PriceInput from '../../components/contract/PriceInput';
import { useToast } from '../../context/useToast';
import { registerProperty } from '../../api/property';
import type { PropertyType, PropertyDirection } from '../../types/property';
import type { ContractReqDto } from '../../types/contract';
import { ContractStatus, ContractType, ContractTypeLabels } from '../../types/contract';

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

const PropertyRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [roadAddress, setRoadAddress] = useState('');
  const [jibunAddress, setJibunAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [active, setActive] = useState(true);
  const [area, setArea] = useState<string>('');
  const [floor, setFloor] = useState<string>('');
  const [allFloors, setAllFloors] = useState<string>('');
  const [direction, setDirection] = useState<PropertyDirection | null>(null);
  const [bathroomCnt, setBathroomCnt] = useState<string>('');
  const [roomCnt, setRoomCnt] = useState<string>('');
  const [contractType, setContractType] = useState<ContractType | null>(null);
  const [salePrice, setSalePrice] = useState<string>('');
  const [jeonsePrice, setJeonsePrice] = useState<string>('');
  const [monthlyRentDeposit, setMonthlyRentDeposit] = useState<string>('');
  const [monthlyRentFee, setMonthlyRentFee] = useState<string>('');

  // 주소 선택 핸들러
  const handleAddressSelect = (address: {
    jibunAddress: string;
    roadAddress: string;
    detailAddress: string;
    zipCode: string;
  }) => {
    setRoadAddress(address.roadAddress);
    setJibunAddress(address.jibunAddress);
    setDetailAddress(address.detailAddress);
  };

  // 숫자 입력 필드 핸들러 (정수만 허용)
  const handleIntegerInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setter(value);
    }
  };

  // 숫자 입력 필드 핸들러 (소수점 허용)
  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!selectedCustomerId) {
      showToast('고객을 선택해주세요.', 'error');
      return;
    }

    if (!propertyType) {
      showToast('매물 유형을 선택해주세요.', 'error');
      return;
    }
    if (!roadAddress || !jibunAddress) {
      showToast('주소를 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const contractData: ContractReqDto | undefined = contractType ? {
        contractType,
        contractStatus: ContractStatus.AVAILABLE,
        salePrice: salePrice ? Number.parseInt(salePrice, 10) * 10000 : undefined,
        jeonsePrice: jeonsePrice ? Number.parseInt(jeonsePrice, 10) * 10000 : undefined,
        monthlyRentDeposit: monthlyRentDeposit ? Number.parseInt(monthlyRentDeposit, 10) * 10000 : undefined,
        monthlyRentFee: monthlyRentFee ? Number.parseInt(monthlyRentFee, 10) * 10000 : undefined,
      } : undefined;

      const propertyData = {
        customerId: selectedCustomerId,
        propertyType,
        roadAddress,
        jibunAddress,
        detailAddress,
        memo: memo || undefined,
        active,
        area: area ? Number.parseFloat(area) : undefined,
        floor: floor ? Number.parseInt(floor, 10) : undefined,
        allFloors: allFloors ? Number.parseInt(allFloors, 10) : undefined,
        direction: direction || undefined,
        bathroomCnt: bathroomCnt ? Number.parseInt(bathroomCnt, 10) : undefined,
        roomCnt: roomCnt ? Number.parseInt(roomCnt, 10) : undefined,
        contract: contractData,
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
                <CustomerDropdown
                  onCustomerSelect={setSelectedCustomerId}
                  selectedCustomerId={selectedCustomerId}
                />
              </div>

              {/* 매물 유형 선택 */}
              <PropertyTypeSelector selectedType={propertyType} onChange={setPropertyType} />

              {/* 주소 입력 */}
              <AddressInput onAddressSelect={handleAddressSelect} />

              {/* 매물 활성화 여부 */}
              <div className="flex items-center">
                <input
                  id="active"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  매물 활성화 (체크 해제 시 비활성화)
                </label>
              </div>

              {/* 새로 추가된 필드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 면적 */}
                <Input
                  label="면적 (평)"
                  placeholder="예: 24.5"
                  value={area}
                  onChange={(e) => handleNumberInput(e, setArea)}
                />

                {/* 층수 */}
                <Input
                  label="층수"
                  placeholder="예: 3"
                  value={floor}
                  onChange={(e) => handleIntegerInput(e, setFloor)}
                />

                {/* 총 층수 */}
                <Input
                  label="총 층수"
                  placeholder="예: 15"
                  value={allFloors}
                  onChange={(e) => handleIntegerInput(e, setAllFloors)}
                />

                {/* 방 개수 */}
                <Input
                  label="방 개수"
                  placeholder="예: 2"
                  value={roomCnt}
                  onChange={(e) => handleIntegerInput(e, setRoomCnt)}
                />

                {/* 욕실 개수 */}
                <Input
                  label="욕실 개수"
                  placeholder="예: 1"
                  value={bathroomCnt}
                  onChange={(e) => handleIntegerInput(e, setBathroomCnt)}
                />
              </div>

              {/* 방향 선택 */}
              <PropertyDirectionSelector selectedDirection={direction} onChange={setDirection} />

              {/* 메모 */}
              <Textarea
                label="메모 (선택사항)"
                placeholder="매물에 대한 추가 정보를 입력하세요."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="min-h-[100px]"
              />

              {/* 계약 정보 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">계약 정보</h3>
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
                          selected={contractType === type}
                          onClick={() => setContractType(type)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 가격 정보 */}
                  {contractType === 'SALE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                        매매가 <span className="text-red-500">*</span>
                      </label>
                      <PriceInput
                        value={salePrice}
                        onChange={setSalePrice}
                        placeholder="매매가 입력 (만원 단위)"
                        required
                      />
                    </div>
                  )}

                  {contractType === 'JEONSE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                        전세가 <span className="text-red-500">*</span>
                      </label>
                      <PriceInput
                        value={jeonsePrice}
                        onChange={setJeonsePrice}
                        placeholder="전세가 입력 (만원 단위)"
                        required
                      />
                    </div>
                  )}

                  {contractType === 'MONTHLY_RENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                        보증금/월세 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PriceInput
                          value={monthlyRentDeposit}
                          onChange={setMonthlyRentDeposit}
                          placeholder="보증금 입력 (만원 단위)"
                          required
                        />
                        <PriceInput
                          value={monthlyRentFee}
                          onChange={setMonthlyRentFee}
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
    </DashboardLayout>
  );
};

export default PropertyRegistration;
