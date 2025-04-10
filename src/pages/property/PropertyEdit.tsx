'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import AddressInput from '../../components/ui/AddressInput';
import CustomerDropdown from '../../components/property/CustomerDropdown';
import PropertyTypeSelector from '../../components/property/PropertyTypeSelector';
import { useToast } from '../../context/useToast';
import { getPropertyById, updateProperty } from '../../api/property';
import type { PropertyType, FindPropertyDetailResDto } from '../../types/property';
import type { Customer } from '../../types/customer';

const PropertyEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [property, setProperty] = useState<FindPropertyDetailResDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 상태 관리
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [roadAddress, setRoadAddress] = useState('');
  const [jibunAddress, setJibunAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [isCustomerSearchActive, setIsCustomerSearchActive] = useState(false);
  // 상태 추가
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      if (!id || isRedirecting) return;

      setIsLoading(true);
      try {
        const response = await getPropertyById(Number(id));
        if (response.success && response.data) {
          const propertyData = response.data;
          setProperty(propertyData);

          // 폼 초기값 설정
          setPropertyType(propertyData.propertyType);
          setRoadAddress(propertyData.roadAddress);
          setJibunAddress(propertyData.jibunAddress || '');
          setDetailAddress(propertyData.detailAddress);
          setMemo(propertyData.memo || '');

          // 고객 정보 설정
          if (propertyData.customer) {
            setSelectedCustomer({
              id: propertyData.customer.id,
              name: propertyData.customer.name,
              contact: propertyData.customer.contact,
              email: propertyData.customer.email,
              ageGroup: propertyData.customer.ageGroup,
              gender: propertyData.customer.gender,
              createdAt: propertyData.customer.createdAt,
              updatedAt: propertyData.customer.updatedAt,
            });
            setSelectedCustomerId(propertyData.customer.id);
          }
        } else {
          showToast(response.error || '매물 정보를 불러오는데 실패했습니다.', 'error');
        }
      } catch (error) {
        console.log(error);
        showToast('매물 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [id, isRedirecting, showToast]);

  // 고객 선택 핸들러
  const handleCustomerSelect = (customerId: number | null, customer?: Customer | null) => {
    setSelectedCustomerId(customerId);
    // 고객 객체가 전달되면 상태 업데이트
    if (customer) {
      setSelectedCustomer(customer);
    } else {
      setSelectedCustomer(null);
    }
    // 고객 선택 후 드롭다운 닫기
    setIsCustomerSearchActive(false);
  };

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
      const response = await updateProperty(Number(id), {
        customerId: selectedCustomerId || 0,
        propertyType,
        roadAddress,
        jibunAddress,
        detailAddress,
        memo: memo || undefined,
      });

      if (response.success) {
        setIsRedirecting(true);
        showToast('매물 정보가 성공적으로 수정되었습니다.', 'success');
        navigate(`/properties/${id}`, { replace: true });
      } else {
        showToast(response.error || '매물 수정에 실패했습니다.', 'error');
      }
    } catch {
      showToast('매물 수정 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="text-left py-12">
          <h3 className="mt-2 text-lg font-medium text-gray-900">매물을 찾을 수 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            요청하신 매물 정보가 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => navigate('/properties')}>
              매물 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">매물 정보 수정</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/properties/${id}`)}
            leftIcon={<ArrowLeft size={16} />}
          >
            상세 정보로 돌아가기
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <div className="space-y-6">
              {/* 고객 정보 */}
              {!isCustomerSearchActive ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    의뢰인 <span className="text-red-500">*</span>
                  </label>
                  <div className="p-4 bg-gray-50 rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedCustomer?.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer?.contact}</p>
                      {selectedCustomer?.email && (
                        <p className="text-sm text-gray-500">{selectedCustomer?.email}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCustomerSearchActive(true)}
                    >
                      변경
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 text-left">
                      의뢰인 선택 <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCustomerSearchActive(false)}
                    >
                      취소
                    </Button>
                  </div>
                  <CustomerDropdown
                    onCustomerSelect={handleCustomerSelect}
                    selectedCustomerId={selectedCustomer?.id}
                  />
                </div>
              )}

              {/* 매물 유형 선택 */}
              <PropertyTypeSelector selectedType={propertyType} onChange={setPropertyType} />

              {/* 주소 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  주소 정보 <span className="text-red-500">*</span>
                </label>
                <div className="p-4 bg-gray-50 rounded-md mb-4">
                  <p className="font-medium text-gray-900">기존 주소</p>
                  <p className="text-sm text-gray-700">{property.roadAddress}</p>
                  <p className="text-sm text-gray-500">{property.detailAddress}</p>
                </div>
                <AddressInput onAddressSelect={handleAddressSelect} />
              </div>

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
              onClick={() => navigate(`/properties/${id}`)}
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
              수정 완료
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PropertyEdit;
