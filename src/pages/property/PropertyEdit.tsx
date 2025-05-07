'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Tag } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import Input from '../../components/ui/Input';
import AddressInput from '../../components/ui/AddressInput';
import PropertyTypeSelector from '../../components/property/PropertyTypeSelector';
import PropertyDirectionSelector from '../../components/property/PropertyDirectionSelector';
import { useToast } from '../../context/useToast';
import { getPropertyById, updateProperty } from '../../api/property';
import type {
  PropertyType,
  PropertyDirection,
  FindPropertyDetailResDto,
  PropertyRegistrationDTO,
} from '../../types/property';
import type { Customer } from '../../types/customer';
import { getObjectDiff } from '../../utils/objectUtil';
import { getTags } from '../../api/tag';
import type { TagResDto } from '../../types/tag';
import CustomerSelectionModal from '../../components/customers/CustomerSelectionModal';

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
}

const PropertyEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [property, setProperty] = useState<FindPropertyDetailResDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<TagResDto[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // 원본 데이터 저장용 상태
  const [originalData, setOriginalData] = useState<PropertyRegistrationDTO | null>(null);

  // 폼 데이터 상태
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
  });

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
          setFormData({
            customerId: propertyData.customer?.id || null,
            propertyType: propertyData.propertyType,
            roadAddress: propertyData.roadAddress,
            jibunAddress: propertyData.jibunAddress || '',
            detailAddress: propertyData.detailAddress,
            memo: propertyData.memo || '',
            active: propertyData.active,
            area: propertyData.area?.toString() || '',
            floor: propertyData.floor?.toString() || '',
            allFloors: propertyData.allFloors?.toString() || '',
            direction: propertyData.direction || null,
            bathroomCnt: propertyData.bathroomCnt?.toString() || '',
            roomCnt: propertyData.roomCnt?.toString() || '',
          });

          // 고객 정보 설정
          if (propertyData.customer) {
            setSelectedCustomer({
              id: propertyData.customer.id,
              name: propertyData.customer.name,
              contact: propertyData.customer.contact,
              email: propertyData.customer.email,
              birthDate: propertyData.customer.birthDate,
              gender: propertyData.customer.gender,
              createdAt: propertyData.customer.createdAt,
              updatedAt: propertyData.customer.updatedAt,
            });
          }

          // 원본 데이터 저장
          setOriginalData({
            customerId: propertyData.customer?.id || 0,
            propertyType: propertyData.propertyType,
            roadAddress: propertyData.roadAddress,
            jibunAddress: propertyData.jibunAddress || '',
            detailAddress: propertyData.detailAddress,
            memo: propertyData.memo || '',
            active: propertyData.active,
            area: propertyData.area,
            floor: propertyData.floor,
            allFloors: propertyData.allFloors,
            direction: propertyData.direction,
            bathroomCnt: propertyData.bathroomCnt,
            roomCnt: propertyData.roomCnt,
          });

          // 매물 데이터 로드 시 선택된 태그 설정
          if (propertyData.tags) {
            setSelectedTags(propertyData.tags.map(tag => tag.tagId));
          }
        } else {
          showToast(response.error || '매물 정보를 불러오는데 실패했습니다.', 'error');
        }
      } catch (error) {
        showToast('매물 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [id, showToast]);

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
    if (!formData.propertyType) {
      showToast('매물 유형을 선택해주세요.', 'error');
      return;
    }

    if (!formData.roadAddress || !formData.jibunAddress) {
      showToast('주소를 입력해주세요.', 'error');
      return;
    }

    // 현재 폼 데이터
    const currentData: PropertyRegistrationDTO = {
      customerId: formData.customerId || 0,
      propertyType: formData.propertyType,
      roadAddress: formData.roadAddress,
      jibunAddress: formData.jibunAddress,
      detailAddress: formData.detailAddress,
      memo: formData.memo || '',
      active: formData.active,
      area: formData.area ? Number.parseFloat(formData.area) : undefined,
      floor: formData.floor ? Number.parseInt(formData.floor, 10) : undefined,
      allFloors: formData.allFloors ? Number.parseInt(formData.allFloors, 10) : undefined,
      direction: formData.direction || undefined,
      bathroomCnt: formData.bathroomCnt ? Number.parseInt(formData.bathroomCnt, 10) : undefined,
      roomCnt: formData.roomCnt ? Number.parseInt(formData.roomCnt, 10) : undefined,
      tagIds: selectedTags,
    };

    // 변경된 필드만 추출
    const changedFields = getObjectDiff(originalData || {}, currentData);

    // 변경 사항이 없는 경우
    if (Object.keys(changedFields).length === 0) {
      showToast('변경 사항이 없습니다.', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateProperty(Number(id), changedFields as PropertyRegistrationDTO);

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
              {/* 고객 선택 */}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  주소 정보 <span className="text-red-500">*</span>
                </label>
                <div className="p-4 bg-gray-50 rounded-md mb-4">
                  <p className="font-medium text-gray-900">기존 주소</p>
                  <p className="text-sm text-gray-700">{property?.roadAddress}</p>
                  <p className="text-sm text-gray-500">{property?.detailAddress}</p>
                </div>
                <AddressInput onAddressSelect={handleAddressSelect} />
              </div>

              {/* 매물 활성화 여부 */}
              <div className="flex items-center">
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
              </div>

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

      {/* 고객 선택 모달 */}
      <CustomerSelectionModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={(customer) => {
          setSelectedCustomer(customer);
          setFormData(prev => ({ ...prev, customerId: customer.id }));
          setIsCustomerModalOpen(false);
        }}
        selectedCustomerId={selectedCustomer?.id}
      />
    </DashboardLayout>
  );
};

export default PropertyEdit;
