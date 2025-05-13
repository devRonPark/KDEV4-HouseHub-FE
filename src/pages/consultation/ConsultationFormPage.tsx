'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  ArrowLeft,
  FileText,
  User,
  Edit,
  Phone,
  Plus,
  Search,
  Home,
  Trash2,
} from 'react-feather';
import {
  ConsultationStatus,
  consultationTypeLabels,
  consultationStatusLabels,
} from '../../types/consultation';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Card from '../../components/ui/Card';
import CustomerSelectionModal from '../../components/customers/CustomerSelectionModal';
import Alert from '../../components/ui/Alert';
import CustomerHistory from '../../components/consultation/CustomerHistory';
import useConsultationForm from '../../hooks/useConsultationForm';
import { useNavigate } from 'react-router-dom';
import type { PropertySummaryResDto } from '../../types/property';
import MultiPropertySelectionModal from '../../components/property/MultiPropertySelectionModal';

const ConsultationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    loading,
    isSubmitting,
    errors,
    originalStatus,
    isEditMode,
    handleChange,
    handleNewCustomerChange,
    handleSubmit,
    isDateFieldDisabled,
    isStatusChangeRestricted,
    isConsultationImmutable,
    isCompletedConsultation, // 완료된 상담 여부 추가
    selectedCustomer,
    isNewCustomer,
    newCustomerData,
    shownProperties,
    isCustomerModalOpen,
    handleOpenCustomerModal,
    handleCloseCustomerModal,
    handleToggleNewCustomer,
    handleSelectCustomer,
    setIsNewCustomer,
  } = useConsultationForm();

  // 보여 준 매물 관련 상태 추가
  const [selectedProperties, setSelectedProperties] = useState<PropertySummaryResDto[]>([]);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

  useEffect(() => {
    if (isEditMode && shownProperties && shownProperties.length > 0) {
      setSelectedProperties(shownProperties);
    }
  }, [isEditMode, shownProperties]);

  // 매물 모달 열기
  const handleOpenPropertyModal = () => {
    setIsPropertyModalOpen(true);
  };

  // 매물 모달 닫기
  const handleClosePropertyModal = () => {
    setIsPropertyModalOpen(false);
  };

  // 매물 선택 처리 (다중 선택)
  const handleSelectProperties = (properties: PropertySummaryResDto[]) => {
    // 새로 선택된 매물들만 필터링하여 추가
    const newProperties = properties.filter(
      (newProp) => !selectedProperties.some((existingProp) => existingProp.id === newProp.id)
    );

    if (newProperties.length > 0) {
      setSelectedProperties((prev) => [...prev, ...newProperties]);
    }
  };

  // 매물 삭제 처리
  const handleRemoveProperty = (propertyId: number) => {
    setSelectedProperties((prev) => prev.filter((p) => p.id !== propertyId));
  };

  // 폼 제출 시 선택된 매물 ID 포함
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 선택된 매물 ID 배열 생성
    const selectedPropertyIds = selectedProperties.map((p) => p.id);

    // 기존 handleSubmit 함수에 selectedPropertyIds 전달
    handleSubmit(e, selectedPropertyIds);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 text-left">
          {isEditMode ? '상담 정보 수정' : '상담 등록'}
        </h1>
        <div className="mt-3 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate('/consultations')}
            leftIcon={<ArrowLeft size={16} />}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>

      {isEditMode && isStatusChangeRestricted && (
        <Alert
          variant="warning"
          className="mt-4"
          title="상태 변경 제한"
          description="예약 상태가 아닌 상담은 상태 변경이 제한됩니다."
        />
      )}

      {isEditMode && isDateFieldDisabled && (
        <Alert
          variant="warning"
          className="mt-4"
          title="상담일 수정 제한"
          description="예약 상태가 아닌 상담은 상담일 수정이 제한됩니다."
        />
      )}

      {isEditMode && isCompletedConsultation && (
        <Alert
          variant="info"
          className="mt-4"
          title="완료된 상담 수정"
          description="완료된 상담은 상담 수단, 상담 내용, 보여준 매물만 수정 가능합니다."
        />
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 상담 등록 폼 */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleFormSubmit}>
              <Card className="mb-6">
                <div className="space-y-6">
                  {/* 고객 정보 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700 text-left">
                        고객 정보 <span className="text-red-500">*</span>
                      </label>
                      {!isEditMode && (
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant={isNewCustomer ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => {
                              handleOpenCustomerModal();
                              setIsNewCustomer(false);
                            }}
                            disabled={isEditMode} // 수정 모드에서는 고객 변경 불가
                          >
                            <Search size={14} className="mr-1" />
                            고객 검색
                          </Button>
                          <Button
                            type="button"
                            variant={isNewCustomer ? 'primary' : 'outline'}
                            size="sm"
                            onClick={handleToggleNewCustomer}
                            disabled={isEditMode} // 수정 모드에서는 고객 변경 불가
                          >
                            <Plus size={14} className="mr-1" />
                            신규 고객
                          </Button>
                        </div>
                      )}
                    </div>

                    {isEditMode ? (
                      // 수정 모드: 고객 정보 표시 (수정 불가)
                      <div className="p-3 bg-gray-50 rounded-md text-left flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <User size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedCustomer?.name}</p>
                          <p className="text-sm text-gray-500">{selectedCustomer?.contact}</p>
                          {selectedCustomer?.email && (
                            <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                          )}
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs text-gray-500 italic">
                            상담 등록 후에는 고객 정보를 변경할 수 없습니다.
                          </span>
                        </div>
                      </div>
                    ) : isNewCustomer ? (
                      // 신규 고객 입력 폼
                      <div className="p-4 bg-white rounded-md border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                              고객명
                            </label>
                            <Input
                              name="name"
                              value={newCustomerData.name}
                              onChange={handleNewCustomerChange}
                              placeholder="고객 이름 입력"
                              leftIcon={<User size={18} />}
                              error={errors['newCustomer.name']}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                              연락처 <span className="text-red-500">*</span>
                            </label>
                            <Input
                              name="contact"
                              value={newCustomerData.contact}
                              onChange={handleNewCustomerChange}
                              placeholder="010-0000-0000"
                              leftIcon={<Phone size={18} />}
                              error={errors['newCustomer.contact']}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                              이메일
                            </label>
                            <Input
                              name="email"
                              value={newCustomerData.email}
                              onChange={handleNewCustomerChange}
                              placeholder="example@example.com"
                              type="email"
                            />
                          </div>
                        </div>
                      </div>
                    ) : selectedCustomer ? (
                      // 선택된 고객 정보 표시
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
                        <div className="ml-auto">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleOpenCustomerModal}
                            leftIcon={<Edit size={14} />}
                          >
                            고객 변경
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 고객 선택 안내
                      <div className="p-3 bg-gray-50 rounded-md text-left flex flex-col justify-center items-start">
                        <div className="flex flex-col items-start justify-start">
                          <User className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500">
                            고객을 선택하거나 신규 고객을 등록해주세요.
                          </p>
                        </div>
                      </div>
                    )}
                    {errors.customerId && (
                      <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                    )}
                  </div>

                  {/* 상담 유형과 상담 상태를 같은 행에 배치 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 상담 유형 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                        상담 유형 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="consultationType"
                        name="consultationType"
                        value={formData.consultationType}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isConsultationImmutable} // 취소된 상담만 비활성화
                      >
                        {Object.entries(consultationTypeLabels).map(([type, label]) => (
                          <option key={type} value={type}>
                            {label}
                          </option>
                        ))}
                      </select>
                      {isConsultationImmutable && (
                        <p className="mt-1 text-sm text-gray-400">
                          취소된 상담은 수정할 수 없습니다.
                        </p>
                      )}
                    </div>

                    {/* 상담 상태 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                        상담 상태 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isStatusChangeRestricted && formData.status !== originalStatus}
                      >
                        <option value={ConsultationStatus.RESERVED}>
                          {consultationStatusLabels[ConsultationStatus.RESERVED]}
                        </option>
                        <option
                          value={ConsultationStatus.COMPLETED}
                          disabled={
                            isStatusChangeRestricted &&
                            (originalStatus as ConsultationStatus) !==
                              ConsultationStatus.RESERVED &&
                            formData.status !== ConsultationStatus.COMPLETED
                          }
                        >
                          {consultationStatusLabels[ConsultationStatus.COMPLETED]}
                        </option>
                        {isEditMode && (
                          <option
                            value={ConsultationStatus.CANCELED}
                            disabled={
                              isStatusChangeRestricted &&
                              (originalStatus as ConsultationStatus) !==
                                ConsultationStatus.RESERVED &&
                              formData.status !== ConsultationStatus.CANCELED
                            }
                          >
                            {consultationStatusLabels[ConsultationStatus.CANCELED]}
                          </option>
                        )}
                      </select>
                      {isStatusChangeRestricted && (
                        <p className="mt-1 text-xs text-gray-500">
                          예약 상태에서만 상태를 변경할 수 있습니다.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 상담 일자 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      상담 일자 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      name="consultationDate"
                      value={
                        formData.consultationDate
                          ? new Date(formData.consultationDate)
                              .toLocaleString('sv-SE', {
                                timeZone: 'Asia/Seoul',
                              })
                              .replace(' ', 'T') // 'YYYY-MM-DDTHH:mm' 포맷 유지
                              .slice(0, 16) // 초 이하 잘라냄: YYYY-MM-DDTHH:mm
                          : ''
                      }
                      onChange={handleChange}
                      error={errors.consultationDate}
                      leftIcon={<Calendar size={18} />}
                      required
                      disabled={isDateFieldDisabled}
                      className={isDateFieldDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                    {isCompletedConsultation && (
                      <p className="mt-1 text-sm text-gray-500">
                        완료된 상담은 상담일 수정이 불가능합니다.
                      </p>
                    )}
                    {!isCompletedConsultation && isDateFieldDisabled && (
                      <p className="mt-1 text-xs text-gray-500">
                        예약 상태의 상담만 일자를 수정할 수 있습니다.
                      </p>
                    )}
                    {isConsultationImmutable && (
                      <p className="mt-1 text-sm text-gray-400">
                        취소된 상담은 수정할 수 없습니다.
                      </p>
                    )}
                  </div>

                  {/* 보여 준 매물 영역 (신규 추가) */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700 text-left">
                        보여 준 매물
                      </label>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleOpenPropertyModal}
                        leftIcon={<Home size={14} />}
                        disabled={isConsultationImmutable} // 취소된 상담만 비활성화
                      >
                        매물 추가
                      </Button>
                    </div>

                    {selectedProperties.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProperties.map((property) => (
                          <div
                            key={property.id}
                            className="flex items-center p-3 border border-gray-200 rounded-md bg-white"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                              <Home size={20} className="text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {property.roadAddress}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {property.detailAddress}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProperty(property.id)}
                              className="text-gray-500 hover:text-red-500"
                              disabled={isConsultationImmutable} // 취소된 상담만 비활성화
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-md text-center">
                        <p className="text-gray-500">선택된 매물이 없습니다.</p>
                      </div>
                    )}
                  </div>

                  {/* 상담 내용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      상담 내용
                    </label>
                    <Textarea
                      name="content"
                      value={formData.content || ''}
                      onChange={handleChange}
                      placeholder="상담 내용을 입력하세요 (선택)"
                      className="min-h-[100px]"
                      error={errors.content}
                      readOnly={isConsultationImmutable} // 취소된 상담만 비활성화
                    />
                    {isConsultationImmutable && (
                      <p className="mt-1 text-sm text-gray-400">
                        취소된 상담은 수정할 수 없습니다.
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/consultations')}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<FileText size={16} />}
                  disabled={isConsultationImmutable} // 취소된 상담만 비활성화
                >
                  {isEditMode ? '수정하기' : '등록하기'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* 오른쪽: 고객 히스토리 */}
        <div className="lg:col-span-1">
          <CustomerHistory
            customer={selectedCustomer}
            className="bg-white shadow rounded-lg h-full"
          />
        </div>
      </div>

      {/* 고객 선택 모달 */}
      <CustomerSelectionModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onSelectCustomer={handleSelectCustomer}
        selectedCustomerId={selectedCustomer?.id || null}
      />

      {/* 매물 선택 모달 */}
      <MultiPropertySelectionModal
        isOpen={isPropertyModalOpen}
        onClose={handleClosePropertyModal}
        onSelectProperties={handleSelectProperties}
        selectedPropertyIds={selectedProperties.map((property) => property.id)}
        multiSelect={true}
      />
    </DashboardLayout>
  );
};

export default ConsultationFormPage;
