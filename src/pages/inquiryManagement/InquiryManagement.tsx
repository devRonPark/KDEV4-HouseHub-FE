'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, ChevronDown, ChevronUp, Calendar, User } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/useToast';
import { getInquiries } from '../../api/inquiry';
import type { InquiryListItem, InquiryFilter } from '../../types/inquiry';
import { CustomerType } from '../../types/inquiry';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const InquiryManagement: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filter, setFilter] = useState<InquiryFilter>({
    keyword: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    page: 1,
    size: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
    size: 10,
  });

  // 문의 목록 조회
  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getInquiries(filter);
      if (response.success && response.data) {
        setInquiries(response.data.content);
        setPagination(response.data.pagination);
      } else {
        showToast(response.error || '문의 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('문의 목록을 불러오는 중 오류가 발생했습니다:', error);
      showToast('문의 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filter, showToast]);

  // 컴포넌트 마운트 시 문의 목록 조회
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // 검색 핸들러
  const handleSearch = () => {
    setFilter((prev) => ({
      ...prev,
      keyword: searchKeyword,
      page: 1,
    }));
  };

  // 정렬 변경 핸들러
  const handleSortChange = () => {
    setFilter((prev) => ({
      ...prev,
      sortDirection: prev.sortDirection === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  };

  // 문의 상세 페이지로 이동
  const handleViewDetail = (inquiryId: number) => {
    navigate(`/inquiries/${inquiryId}/answers`);
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch {
      return dateString;
    }
  };

  // 고객 유형 표시 함수
  const getCustomerTypeText = (type: CustomerType) => {
    return type === CustomerType.CUSTOMER ? '고객' : '고객 후보';
  };

  // 고객 유형에 따른 배지 색상
  const getCustomerTypeBadgeColor = (type: CustomerType) => {
    return type === CustomerType.CUSTOMER
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800';
  };

  return (
    <DashboardLayout>
      <div className="pb-5 mb-6 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">문의 관리</h1>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              label="검색"
              placeholder="고객 이름 또는 이메일로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              leftIcon={<Search size={18} />}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex items-end space-x-2">
            <Button variant="outline" onClick={handleSearch} className="h-10">
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
            <Button
              variant="outline"
              onClick={handleSortChange}
              className="h-10 flex items-center"
              title={filter.sortDirection === 'desc' ? '오래된 순으로 보기' : '최신 순으로 보기'}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {filter.sortDirection === 'desc' ? (
                <>
                  최신 순 <ChevronDown className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  오래된 순 <ChevronUp className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchKeyword('');
                setFilter({
                  keyword: '',
                  sortBy: 'createdAt',
                  sortDirection: 'desc',
                  page: 1,
                  size: 10,
                });
              }}
              className="h-10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              초기화
            </Button>
          </div>
        </div>
      </div>

      {/* 문의 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">문의 내역이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter.keyword
                ? '검색 조건에 맞는 문의 내역이 없습니다.'
                : '아직 접수된 문의가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    고객 정보
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    연락처
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    문의일시
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    고객 유형
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    상세
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.inquiryId}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetail(inquiry.inquiryId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                          <div className="text-sm text-gray-500">{inquiry.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inquiry.contact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(inquiry.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCustomerTypeBadgeColor(
                          inquiry.customerType
                        )}`}
                      >
                        {getCustomerTypeText(inquiry.customerType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(inquiry.inquiryId);
                        }}
                      >
                        상세보기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoading && inquiries.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  전체 <span className="font-medium">{pagination.totalElements}</span> 개 중{' '}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.size + 1}
                  </span>{' '}
                  -{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.size, pagination.totalElements)}
                  </span>{' '}
                  표시
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">이전</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {pagination.totalPages > 0 &&
                    Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === pagination.totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">다음</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InquiryManagement;
