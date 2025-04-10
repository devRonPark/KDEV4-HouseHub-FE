'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RefreshCw } from 'react-feather';
import { getProperties } from '../../api/property';
import {
  type PropertySearchFilter,
  type PropertyListResDto,
  type PropertyType,
  PropertyTypeLabels,
  FindPropertyResDto,
} from '../../types/property';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../../context/useToast';
import PropertyTypeFilter from '../property/PropertyTypeFilter';

interface PropertySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty: (property: FindPropertyResDto) => void;
  selectedPropertyId?: number | null;
}

const PropertySelectionModal: React.FC<PropertySelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectProperty,
  selectedPropertyId = null,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyListResDto | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 검색 필터 상태
  const [filter, setFilter] = useState<PropertySearchFilter>({
    page: 1,
    size: 8,
    propertyType: null,
    province: '',
    city: '',
    dong: '',
  });

  // 검색 입력값 상태 (즉시 API 호출하지 않기 위해 별도 관리)
  const [provinceInput, setProvinceInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [dongInput, setDongInput] = useState('');
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);

  // 모달이 열릴 때 selectedPropertyId 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedId(selectedPropertyId);
    }
  }, [isOpen, selectedPropertyId]);

  // 매물 목록 로드
  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await getProperties(filter);
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        showToast(response.error || '매물 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch {
      showToast('매물 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 매물 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadProperties();
    }
  }, [isOpen, filter.page]);

  useEffect(() => {
    if (searchBtnClicked) {
      loadProperties();
      setSearchBtnClicked(false);
    }
  }, [searchBtnClicked]);

  // 검색 버튼 클릭 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지

    setFilter({
      ...filter,
      page: 1, // 검색 시 첫 페이지로 리셋
      province: provinceInput,
      city: cityInput,
      dong: dongInput,
    });
    setSearchBtnClicked(true);
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setProvinceInput('');
    setCityInput('');
    setDongInput('');
    setFilter({
      page: 1,
      size: 8,
      propertyType: null,
      province: '',
      city: '',
      dong: '',
    });
    setSearchBtnClicked(true);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setFilter({
      ...filter,
      page: newPage,
    });
  };

  // 매물 유형 변경 핸들러
  const handlePropertyTypeChange = (type: PropertyType | null) => {
    setFilter((prev) => ({ ...prev, propertyType: type, page: 1 }));
    setSearchBtnClicked(true);
  };

  // 매물 선택 핸들러
  const handleSelectProperty = (propertyId: number) => {
    setSelectedId(propertyId);
  };

  // 선택 확인 핸들러
  const handleConfirmSelection = () => {
    if (selectedId && properties) {
      const selectedProperty = properties.content.find((property) => property.id === selectedId);
      if (selectedProperty) {
        onSelectProperty(selectedProperty);
        onClose();
      } else {
        showToast('선택한 매물 정보를 찾을 수 없습니다.', 'error');
      }
    } else {
      showToast('매물을 선택해주세요.', 'error');
    }
  };

  // 모달 외부 클릭 방지
  const handleModalClick = (e: React.MouseEvent) => {
    // 모달 내부 클릭 시 이벤트 전파 중단
    e.stopPropagation();
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50"
        onClick={onClose} // 모달 외부 클릭 시 닫기
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={handleModalClick} // 모달 내부 클릭 시 이벤트 전파 중단
        >
          {/* 모달 헤더 */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">매물 선택</h2>
            <button
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 전파 중단
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
              aria-label="닫기"
            >
              <X size={24} />
            </button>
          </div>

          {/* 검색 필터 */}
          <div className="p-4 border-b">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="도/특별시/광역시"
                  value={provinceInput}
                  onChange={(e) => setProvinceInput(e.target.value)}
                />
                <Input
                  placeholder="시/군/구"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                />
                <Input
                  placeholder="읍/면/동"
                  value={dongInput}
                  onChange={(e) => setDongInput(e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  type="submit"
                  variant="primary"
                  onClick={(e) => e.stopPropagation()} // 이벤트 전파 중단
                >
                  검색
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 전파 중단
                      resetFilters();
                    }}
                  >
                    필터 초기화
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 전파 중단
                      setSearchBtnClicked(true);
                    }}
                    leftIcon={<RefreshCw size={14} />}
                  >
                    새로고침
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-4">
              <PropertyTypeFilter
                selectedType={filter.propertyType}
                onChange={handlePropertyTypeChange}
              />
            </div>
          </div>

          {/* 매물 목록 */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : properties && properties.content.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {properties.content.map((property) => (
                  <div
                    key={property.id}
                    className={`border rounded-lg p-3 transition-colors cursor-pointer
                    ${
                      selectedId === property.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 전파 중단
                      handleSelectProperty(property.id);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{property.roadAddress}</p>
                        <p className="text-sm text-gray-500">{property.detailAddress}</p>
                        <div className="mt-1 flex items-center flex-wrap gap-2">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            {PropertyTypeLabels[property.propertyType]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant={selectedId === property.id ? 'primary' : 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // 이벤트 전파 중단
                            handleSelectProperty(property.id);
                          }}
                          className="transition-colors"
                        >
                          {selectedId === property.id ? '선택됨' : '선택'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>검색 결과가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {properties?.pagination && properties.pagination.totalPages > 1 && (
            <div className="p-4 border-t flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 전파 중단
                    handlePageChange(Math.max(1, filter.page - 1));
                  }}
                  disabled={filter.page === 1}
                >
                  <ChevronLeft size={16} />
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: properties.pagination.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // 현재 페이지 주변 5개 페이지만 표시
                      const currentPage = filter.page;
                      return (
                        page === 1 ||
                        page === properties.pagination.totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      );
                    })
                    .map((page, index, array) => {
                      // 생략 부분 표시
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-2">...</span>
                            <Button
                              key={page}
                              variant={filter.page === page ? 'primary' : 'outline'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation(); // 이벤트 전파 중단
                                handlePageChange(page);
                              }}
                              className="min-w-[32px]"
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <Button
                          key={page}
                          variant={filter.page === page ? 'primary' : 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // 이벤트 전파 중단
                            handlePageChange(page);
                          }}
                          className="min-w-[32px]"
                        >
                          {page}
                        </Button>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 전파 중단
                    handlePageChange(Math.min(properties.pagination.totalPages, filter.page + 1));
                  }}
                  disabled={filter.page === properties.pagination.totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="p-4 border-t flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 전파 중단
                onClose();
              }}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 전파 중단
                handleConfirmSelection();
              }}
              disabled={!selectedId}
            >
              선택 완료
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySelectionModal;
