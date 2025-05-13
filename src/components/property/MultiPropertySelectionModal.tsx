'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RefreshCw, Check } from 'react-feather';
import { getProperties } from '../../api/property';
import {
  type PropertySearchFilter,
  type PropertyListResDto,
  type PropertyType,
  PropertyTypeLabels,
  PropertySummaryResDto,
} from '../../types/property';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../../context/useToast';
import PropertyTypeFilter from '../property/PropertyTypeFilter';

interface MultiPropertySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 단일 선택 인터페이스
  onSelectProperty?: (property: PropertySummaryResDto) => void;
  selectedPropertyId?: number | null;
  // 다중 선택 인터페이스
  onSelectProperties?: (properties: PropertySummaryResDto[]) => void;
  selectedPropertyIds?: number[];
  // 선택 모드 제어
  multiSelect: boolean;
}

const MultiPropertySelectionModal: React.FC<MultiPropertySelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectProperty,
  onSelectProperties,
  selectedPropertyId = null,
  selectedPropertyIds = [],
  multiSelect = false, // 기본값은 단일 선택 모드
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyListResDto | null>(null);

  // 선택된 매물 정보 저장 맵 (ID -> 매물 정보)
  const [propertyMap, setPropertyMap] = useState<Map<number, PropertySummaryResDto>>(new Map());

  // 내부적으로는 항상 배열로 관리
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  // 모달이 열릴 때 선택된 매물 ID 초기화
  useEffect(() => {
    if (isOpen) {
      // 다중 선택 모드인 경우 selectedPropertyIds 사용
      if (multiSelect && selectedPropertyIds && selectedPropertyIds.length > 0) {
        setSelectedIds(selectedPropertyIds);
      }
      // 단일 선택 모드인 경우 selectedPropertyId를 배열로 변환
      else if (selectedPropertyId) {
        setSelectedIds([selectedPropertyId]);
      }
      // 아무것도 선택되지 않은 경우
      else {
        setSelectedIds([]);
      }

      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫힐 때 body 스크롤 복원
      document.body.style.overflow = '';
    }

    // 컴포넌트 언마운트 시 body 스크롤 복원
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 매물 목록 로드
  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await getProperties(filter);
      if (response.success && response.data) {
        setProperties(response.data);

        // 매물 정보를 맵에 저장
        const newPropertyMap = new Map<number, PropertySummaryResDto>();
        response.data.content.forEach((property) => {
          newPropertyMap.set(property.id, property);
        });
        setPropertyMap(newPropertyMap);
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
  const handleToggleProperty = (propertyId: number) => {
    if (multiSelect) {
      // 다중 선택 모드
      setSelectedIds((prev) => {
        // 이미 선택된 매물이면 선택 해제
        if (prev.includes(propertyId)) {
          return prev.filter((id) => id !== propertyId);
        }
        // 선택되지 않은 매물이면 선택 추가
        else {
          return [...prev, propertyId];
        }
      });
    } else {
      // 단일 선택 모드 - 항상 하나의 매물만 선택
      setSelectedIds([propertyId]);
    }
  };

  // 선택 확인 핸들러
  const handleConfirmSelection = async () => {
    if (selectedIds.length === 0) {
      showToast('매물을 선택해주세요.', 'error');
      return;
    }

    try {
      setLoading(true);

      // 다중 선택 모드이고 onSelectProperties 콜백이 제공된 경우
      if (multiSelect && onSelectProperties) {
        const selectedProperties: PropertySummaryResDto[] = [];

        // 선택된 모든 매물의 정보를 맵에서 가져오기
        for (const id of selectedIds) {
          const property = propertyMap.get(id);
          if (property) {
            // 타입 변환 없이 그대로 사용
            selectedProperties.push(property);
          }
        }

        if (selectedProperties.length > 0) {
          onSelectProperties(selectedProperties);
          onClose();
        }
      }
      // 단일 선택 모드이거나 onSelectProperty 콜백만 제공된 경우
      else if (onSelectProperty) {
        // 단일 선택 모드에서는 첫 번째 선택된 매물만 사용
        const propertyId = selectedIds[0];
        const property = propertyMap.get(propertyId);

        if (property) {
          // 타입 변환 없이 그대로 사용
          onSelectProperty(property);
          onClose();
        } else {
          showToast('선택한 매물 정보를 찾을 수 없습니다.', 'error');
        }
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
      showToast('매물 상세 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
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
      className="fixed inset-0 z-[9999] overflow-hidden"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        onClick={onClose} // 모달 외부 클릭 시 닫기
      >
        {/* 배경 오버레이 */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
        ></div>

        {/* 모달 컨테이너 */}
        <div
          className="bg-white w-full h-full max-h-full md:rounded-lg md:shadow-xl md:max-w-4xl md:max-h-[90vh] flex flex-col relative z-[10000] overflow-hidden"
          onClick={handleModalClick} // 모달 내부 클릭 시 이벤트 전파 중단
        >
          {/* 모달 헤더 */}
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold">
              매물 선택 {multiSelect ? '(다중 선택 가능)' : '(단일 선택)'}
            </h2>
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
          <div className="p-4 border-b sticky top-[65px] bg-white z-10">
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

              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  onClick={(e) => e.stopPropagation()} // 이벤트 전파 중단
                  className="w-full sm:w-auto"
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
                    className="flex-1 sm:flex-none"
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
                    className="flex-1 sm:flex-none"
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
                      selectedIds.includes(property.id)
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 전파 중단
                      handleToggleProperty(property.id);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          {/* 선택 모드에 따라 체크박스 또는 라디오 버튼 스타일 표시 */}
                          <div className="flex items-center justify-center w-5 h-5 mr-3">
                            {multiSelect ? (
                              // 다중 선택 모드 - 체크박스 스타일
                              <div
                                className={`w-4 h-4 border rounded flex items-center justify-center
                                  ${
                                    selectedIds.includes(property.id)
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300'
                                  }`}
                              >
                                {selectedIds.includes(property.id) && (
                                  <Check size={12} className="text-white" />
                                )}
                              </div>
                            ) : (
                              // 단일 선택 모드 - 라디오 버튼 스타일
                              <div
                                className={`w-4 h-4 border rounded-full flex items-center justify-center
                                  ${selectedIds.includes(property.id) ? 'border-blue-500' : 'border-gray-300'}`}
                              >
                                {selectedIds.includes(property.id) && (
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="font-medium">{property.roadAddress}</p>
                        </div>
                        <p className="text-sm text-gray-500 ml-8">{property.detailAddress}</p>
                        <div className="mt-1 flex items-center flex-wrap gap-2 ml-8">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            {PropertyTypeLabels[property.propertyType]}
                          </span>
                        </div>
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

          {/* 선택된 매물 수 표시 (다중 선택 모드에서만) */}
          {multiSelect && selectedIds.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{selectedIds.length}</span>개의 매물이 선택되었습니다.
              </p>
            </div>
          )}

          {/* 페이지네이션 */}
          {properties?.pagination && properties.pagination.totalPages > 1 && (
            <div className="p-4 border-t flex justify-center bg-white">
              <div className="flex items-center space-x-2 overflow-x-auto">
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
          <div className="p-4 border-t flex justify-end space-x-2 bg-white sticky bottom-0">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 전파 중단
                onClose();
              }}
              className="w-full sm:w-auto"
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 전파 중단
                handleConfirmSelection();
              }}
              disabled={selectedIds.length === 0}
              className="w-full sm:w-auto"
            >
              {multiSelect
                ? `${selectedIds.length}개 매물 선택 완료`
                : selectedIds.length > 0
                  ? '선택 완료'
                  : '선택 완료'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiPropertySelectionModal;
