'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RefreshCw, Search, User } from 'react-feather';
import { getMyCustomers } from '../../api/customer';
import type {
  CustomerSearchFilter,
  CustomerListResDto,
  CustomerResDto,
} from '../../types/customer';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../../context/useToast';

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: CustomerResDto) => void;
  selectedCustomerId?: number | null;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  selectedCustomerId = null,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerListResDto | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(selectedCustomerId);

  // 검색 필터 상태
  const [filter, setFilter] = useState<CustomerSearchFilter>({
    page: 1,
    size: 8,
    keyword: '',
  });

  // 검색 입력값 상태 (즉시 API 호출하지 않기 위해 별도 관리)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);

  // 모달이 열릴 때 selectedId 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedId(selectedCustomerId);
    }
  }, [isOpen, selectedCustomerId]);

  // 고객 목록 로드
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await getMyCustomers(filter);
      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        showToast(response.error || '고객 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch {
      showToast('고객 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 고객 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen, filter.page]);

  useEffect(() => {
    if (searchBtnClicked) {
      loadCustomers();
      setSearchBtnClicked(false);
    }
  }, [searchBtnClicked]);

  // 검색 버튼 클릭 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지

    setFilter({
      ...filter,
      page: 1, // 검색 시 첫 페이지로 리셋
      keyword: searchKeyword,
    });
    setSearchBtnClicked(true);
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setSearchKeyword('');
    setFilter({
      page: 1,
      size: 8,
      keyword: '',
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

  // 고객 선택 핸들러
  const handleSelectCustomer = (customerId: number) => {
    setSelectedId(customerId);
  };

  // 선택 확인 핸들러
  const handleConfirmSelection = () => {
    if (selectedId && customers) {
      const selectedCustomer = customers.content.find((customer) => customer.id === selectedId);
      if (selectedCustomer) {
        onSelectCustomer(selectedCustomer);
        onClose();
      } else {
        showToast('선택한 고객 정보를 찾을 수 없습니다.', 'error');
      }
    } else {
      showToast('고객을 선택해주세요.', 'error');
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
            <h2 className="text-xl font-semibold">고객 선택</h2>
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
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="고객 이름 또는 연락처 검색"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    leftIcon={<Search size={18} />}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  onClick={(e) => e.stopPropagation()} // 이벤트 전파 중단
                >
                  검색
                </Button>
              </div>

              <div className="flex justify-end">
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
          </div>

          {/* 고객 목록 */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : customers && customers.content.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {customers.content.map((customer) => (
                  <div
                    key={customer.id}
                    className={`border rounded-lg p-3 transition-colors cursor-pointer
                    ${selectedId === customer.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50 border-gray-200'}`}
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 전파 중단
                      handleSelectCustomer(customer.id);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User size={20} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.contact}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant={selectedId === customer.id ? 'primary' : 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // 이벤트 전파 중단
                            handleSelectCustomer(customer.id);
                          }}
                          className="transition-colors"
                        >
                          {selectedId === customer.id ? '선택됨' : '선택'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <User size={48} className="text-gray-300 mb-4" />
                <p>검색 결과가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {customers && customers.pagination.totalPages > 1 && (
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
                  {Array.from({ length: customers.pagination.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // 현재 페이지 주변 5개 페이지만 표시
                      const currentPage = filter.page;
                      return (
                        page === 1 ||
                        page === customers.pagination.totalPages ||
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
                    handlePageChange(Math.min(customers.pagination.totalPages, filter.page + 1));
                  }}
                  disabled={filter.page === customers.pagination.totalPages}
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

export default CustomerSelectionModal;
