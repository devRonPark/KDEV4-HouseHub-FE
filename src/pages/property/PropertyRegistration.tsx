'use client';

import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import AddressInput from '../../components/ui/AddressInput';
import PropertyTypeSelector from '../../components/property/PropertyTypeSelector';
import CustomerDropdown from '../../components/property/CustomerDropdown';
import { useToast } from '../../context/useToast';
import { registerProperty } from '../../api/property';
import type { PropertyType } from '../../types/property';

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
    console.log('roadAddress', roadAddress);
    console.log('jibunAddress', jibunAddress);
    if (!roadAddress || !jibunAddress) {
      showToast('주소를 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const propertyData = {
        customerId: selectedCustomerId,
        propertyType,
        roadAddress,
        jibunAddress,
        detailAddress,
        memo: memo || undefined,
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

              {/* 메모 */}
              <Textarea
                label="메모 (선택사항)"
                placeholder="매물에 대한 추가 정보를 입력하세요."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="min-h-[100px]"
              />
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
