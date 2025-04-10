'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, RefreshCw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  ConsultationResDto,
  ConsultationFilter,
  ConsultationType,
  ConsultationStatus,
} from '../../types/consultation';
import { getConsultationList } from '../../api/consultation';
import { useToast } from '../../context/useToast';
//import { useAuth } from '../../context/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ConsultationListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  // 권한 체크 등에 사용할 수 있도록 useAuth 유지
  //const { user: _user } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationResDto[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<ConsultationResDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ConsultationFilter>({});
  const [isLoading, setIsLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false); // 토스트 메시지 표시 여부 추적

  const itemsPerPage = 10;

  // 상담 목록 조회
  const fetchConsultations = async () => {
    setIsLoading(true);
    setNoData(false);

    try {
      const response = await getConsultationList();

      // 응답이 성공이면 (API에서 항상 success: true를 반환하도록 수정함)
      if (response.success) {
        // 데이터가 있는 경우
        if (response.data && response.data.length > 0) {
          setConsultations(response.data);
          setFilteredConsultations(response.data);
          setNoData(false);
        }
        // 데이터가 없는 경우 (빈 배열)
        else {
          setConsultations([]);
          setFilteredConsultations([]);
          setNoData(true);
        }
      } else {
        // API 호출은 성공했지만 백엔드에서 오류 응답을 준 경우 (이 경우는 발생하지 않아야 함)
        setConsultations([]);
        setFilteredConsultations([]);
        setNoData(true);
      }
    } catch {
      // 이 부분은 실행되지 않아야 함 (API에서 항상 success: true를 반환하도록 수정함)
      setConsultations([]);
      setFilteredConsultations([]);
      setNoData(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();

    // location.state에서 메시지 확인 (다른 페이지에서 넘어온 경우)
    if (location.state && location.state.message && !hasShownToast) {
      showToast(location.state.message, location.state.type || 'success');
      setHasShownToast(true); // 토스트 메시지를 표시했음을 기록
      // 메시지를 표시한 후 state 초기화
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname]);

  // 검색어나 필터가 변경될 때만 필터링 적용
  useEffect(() => {
    if (consultations.length > 0) {
      applyFilters();
    }
  }, [searchTerm, filters, consultations]);

  // 검색 기능 단순화 - 고객 이름과 내용으로만 검색
  const applyFilters = () => {
    let filtered = [...consultations];

    // 검색어 필터링 (고객 이름으로 검색)
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.customer.name.toString().includes(searchTerm) ||
          (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 날짜 필터링
    if (filters.dateFrom && filters.dateFrom.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.consultationDate && new Date(item.consultationDate) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo && filters.dateTo.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.consultationDate && new Date(item.consultationDate) <= new Date(filters.dateTo!)
      );
    }

    // 상담 유형 필터링
    if (filters.type) {
      filtered = filtered.filter((item) => item.consultationType === filters.type);
    }

    // 상담 상태 필터링
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    setFilteredConsultations(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({});
    setFilteredConsultations(consultations);
  };

  const handleFilterChange = (key: keyof ConsultationFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConsultations.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 상담 상태에 따른 스타일 클래스 반환
  const getStatusClass = (status: ConsultationStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 상담 상태 텍스트 변환
  const getStatusText = (status: ConsultationStatus) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'reserved':
        return '예약됨';
      case 'canceled':
        return '취소됨';
      default:
        return status;
    }
  };

  // 상담 유형 텍스트 변환
  const getTypeText = (type: ConsultationType) => {
    switch (type) {
      case 'phone':
        return '전화상담';
      case 'visit':
        return '방문상담';
      default:
        return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">상담 관리</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link
            to="/consultations/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            상담 등록
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="p-4 border-b">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="고객 이름 또는 내용으로 검색"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <Search size={20} />
              </button>
            </div>
            <button
              type="button"
              className="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center justify-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} className="mr-1" />
              <span>필터</span>
            </button>
            <button
              type="button"
              className="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center justify-center"
              onClick={resetFilters}
            >
              <RefreshCw size={20} className="mr-1" />
              <span>초기화</span>
            </button>
          </form>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상담 일자</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    className="px-3 py-2 border rounded-md w-full"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                  <span>~</span>
                  <input
                    type="date"
                    className="px-3 py-2 border rounded-md w-full"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상담 유형</label>
                <select
                  className="px-3 py-2 border rounded-md w-full"
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value as ConsultationType)}
                >
                  <option value="">전체</option>
                  <option value="phone">전화상담</option>
                  <option value="visit">방문상담</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상담 상태</label>
                <select
                  className="px-3 py-2 border rounded-md w-full"
                  value={filters.status || ''}
                  onChange={(e) =>
                    handleFilterChange('status', e.target.value as ConsultationStatus)
                  }
                >
                  <option value="">전체</option>
                  <option value="reserved">예약됨</option>
                  <option value="completed">완료</option>
                  <option value="canceled">취소됨</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상담일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객 이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객 전화번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객 이메일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상담유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상담상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : noData ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    등록된 상담 내역이 없습니다.
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((consultation) => (
                  <tr
                    key={consultation.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      const id = consultation.id;
                      if (typeof id === 'number' && !isNaN(id)) {
                        navigate(`/consultations/${consultation.id}`);
                      } else {
                        showToast('유효하지 않은 상담 ID입니다.', 'error');
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(consultation.consultationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{consultation.customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{consultation.customer.contact}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {consultation.customer.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeText(consultation.consultationType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          consultation.status
                        )}`}
                      >
                        {getStatusText(consultation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(consultation.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {filteredConsultations.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              총 {filteredConsultations.length}건 중 {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredConsultations.length)}건
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={16} />
                <span className="sr-only">이전</span>
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // 현재 페이지를 중심으로 표시할 페이지 번호 계산
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={16} />
                <span className="sr-only">다음</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ConsultationListPage;
