'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Filter,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/useToast';
import { getConsultationList, deleteConsultation } from '../../api/consultation';
import {
  type ConsultationListResDto,
  type ConsultationResDto,
  ConsultationType,
  ConsultationStatus,
} from '../../types/consultation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ConsultationFilter {
  keyword: string;
  startDate: string;
  endDate: string;
  type?: ConsultationType;
  status?: ConsultationStatus;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  size: number;
}

const ConsultationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [consultationData, setConsultationData] = useState<ConsultationListResDto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<ConsultationResDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 상담 유형 표시 레이블 매핑
  const consultationTypeLabels: Record<ConsultationType, string> = {
    [ConsultationType.PHONE]: '전화상담',
    [ConsultationType.VISIT]: '방문상담',
    [ConsultationType.EMAIL]: '이메일상담',
    [ConsultationType.OTHER]: '기타',
  };

  // 상담 상태 표시 레이블 매핑
  const consultationStatusLabels: Record<ConsultationStatus, string> = {
    [ConsultationStatus.RESERVED]: '예약됨',
    [ConsultationStatus.COMPLETED]: '완료',
    [ConsultationStatus.CANCELED]: '취소됨',
  };

  // 필터 상태
  const [filters, setFilters] = useState<ConsultationFilter>({
    keyword: '',
    startDate: '',
    endDate: '',
    type: undefined,
    status: undefined,
    sortBy: 'consultationDate',
    sortDirection: 'desc',
    page: 1,
    size: 10,
  });

  // 상담 목록 조회
  const fetchConsultations = useCallback(async () => {
    setIsLoading(true);

    try {
      // 빈 문자열인 필터는 제외하고 API 호출
      const params = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value !== '' && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string | number>
      );

      const response = await getConsultationList(params);

      if (response.success && response.data) {
        setConsultationData(response.data);
      } else {
        showToast(response.error || '상담 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('상담 목록을 불러오는 중 오류가 발생했습니다:', error);
      showToast('상담 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, showToast]);

  // filters 상태가 변경될 때마다 API 호출
  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      keyword: searchKeyword,
      page: 1,
    }));
  };

  // 정렬 변경 핸들러
  const handleSortChange = () => {
    setFilters((prev) => ({
      ...prev,
      sortDirection: prev.sortDirection === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearchKeyword('');
    setFilters({
      keyword: '',
      startDate: '',
      endDate: '',
      type: undefined,
      status: undefined,
      sortBy: 'consultationDate',
      sortDirection: 'desc',
      page: 1,
      size: 10,
    });
    setShowFilters(false);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (consultationData && page > 0 && page <= consultationData.pagination.totalPages) {
      setFilters((prev) => ({
        ...prev,
        page,
      }));
    }
  };

  // 상담 삭제 처리
  const handleDeleteConsultation = async () => {
    if (!consultationToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteConsultation(consultationToDelete.id);
      if (response.success) {
        showToast('상담이 성공적으로 삭제되었습니다.', 'success');
        setIsDeleteModalOpen(false);
        fetchConsultations(); // 목록 새로고침
      } else {
        showToast(response.error || '상담 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('상담 삭제 중 오류가 발생했습니다:', error);
      showToast('상담 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch {
      return dateString;
    }
  };

  // 상담 상태에 따른 스타일 클래스 반환
  const getStatusClass = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ConsultationStatus.RESERVED:
        return 'bg-yellow-100 text-yellow-800';
      case ConsultationStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">상담 관리</h1>
        <div className="mt-3 sm:mt-0">
          <Button
            variant="primary"
            onClick={() => navigate('/consultations/new')}
            leftIcon={<Plus size={16} />}
          >
            상담 등록
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mt-6 mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              label="검색"
              placeholder="고객 이름 또는 내용으로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              leftIcon={<Search size={18} />}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            />
          </div>
          <div className="flex items-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter size={16} />}
            >
              필터
            </Button>
            <Button
              variant="outline"
              onClick={handleSortChange}
              className="h-10 flex items-center"
              title={filters.sortDirection === 'desc' ? '오래된 순으로 보기' : '최신 순으로 보기'}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {filters.sortDirection === 'desc' ? (
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
              type="button"
              variant="outline"
              onClick={resetFilters}
              leftIcon={<RefreshCw size={14} />}
            >
              초기화
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상담 일자</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="w-full sm:w-auto">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                    leftIcon={<Calendar size={16} />}
                  />
                </div>
                <span className="hidden sm:inline">~</span>
                <div className="w-full sm:w-auto">
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                    leftIcon={<Calendar size={16} />}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상담 유형</label>
                <select
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      type: e.target.value as ConsultationType | undefined,
                    }))
                  }
                >
                  <option value="">전체</option>
                  <option value={ConsultationType.PHONE}>전화상담</option>
                  <option value={ConsultationType.VISIT}>방문상담</option>
                  <option value={ConsultationType.EMAIL}>이메일상담</option>
                  <option value={ConsultationType.OTHER}>기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상담 상태</label>
                <select
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.value as ConsultationStatus | undefined,
                    }))
                  }
                >
                  <option value="">전체</option>
                  <option value={ConsultationStatus.RESERVED}>예약됨</option>
                  <option value={ConsultationStatus.COMPLETED}>완료</option>
                  <option value={ConsultationStatus.CANCELED}>취소됨</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 상담 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !consultationData || consultationData.content.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">상담 내역이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.keyword ||
              filters.startDate ||
              filters.endDate ||
              filters.type ||
              filters.status
                ? '검색 조건에 맞는 상담 내역이 없습니다.'
                : '등록된 상담 내역이 없습니다.'}
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => navigate('/consultations/new')}
                leftIcon={<Plus size={16} />}
              >
                상담 등록
              </Button>
            </div>
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
                    상담 일자
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    상담 유형
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    상담 상태
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultationData.content.map((consultation) => (
                  <tr
                    key={consultation.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/consultations/${consultation.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {consultation.customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {consultation.customer.email || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(consultation.consultationDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {consultationTypeLabels[
                          consultation.consultationType as ConsultationType
                        ] || consultation.consultationType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          consultation.status as ConsultationStatus
                        )}`}
                      >
                        {consultationStatusLabels[consultation.status as ConsultationStatus] ||
                          consultation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {consultation.status === ConsultationStatus.RESERVED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/consultations/${consultation.id}/edit`);
                            }}
                          >
                            수정
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConsultationToDelete(consultation);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoading && consultationData && consultationData.pagination.totalPages > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  전체{' '}
                  <span className="font-medium">{consultationData.pagination.totalElements}</span>{' '}
                  개 중 <span className="font-medium">{(filters.page - 1) * filters.size + 1}</span>{' '}
                  -{' '}
                  <span className="font-medium">
                    {Math.min(
                      filters.page * filters.size,
                      consultationData.pagination.totalElements
                    )}
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
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      filters.page === 1
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
                  {consultationData.pagination.totalPages > 0 &&
                    Array.from(
                      { length: Math.min(5, consultationData.pagination.totalPages) },
                      (_, i) => {
                        // 현재 페이지를 중심으로 표시할 페이지 번호 계산
                        let pageNum;
                        const totalPages = consultationData.pagination.totalPages;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (filters.page <= 3) {
                          pageNum = i + 1;
                        } else if (filters.page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = filters.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === filters.page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === consultationData.pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      filters.page === consultationData.pagination.totalPages
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

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="상담 삭제 확인"
        size="sm"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            정말로 이 상담을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConsultation}
              isLoading={isDeleting}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ConsultationListPage;
