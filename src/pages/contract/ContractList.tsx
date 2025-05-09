'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, Plus, RefreshCw, FileText } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import ContractListItem from '../../components/contract/ContractListItem';
import { useToast } from '../../context/useToast';
import { getContracts } from '../../api/contract';
import {
  ContractType,
  ContractStatus,
  ContractTypeLabels,
  ContractStatusLabels,
  FindContractResDto,
  ContractSearchFilter,
} from '../../types/contract';
import { PaginationDto } from '../../types/pagination';

const ContractList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState<FindContractResDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto>({
    totalPages: 1,
    totalElements: 0,
    size: 10,
    currentPage: 1,
  });

  const [filter, setFilter] = useState<ContractSearchFilter>({
    page: 1,
    size: 10,
    customerName: '',
    contractType: null,
    status: null,
  });
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);

  // location state가 변경될 때마다 필터 적용
  useEffect(() => {
    const status = (location.state as { status?: ContractStatus })?.status;
    if (status) {
      const newFilter = {
        ...filter,
        status,
        page: 1,
      };
      setFilter(newFilter);
      setSearchBtnClicked(true);
    }
  }, [location.state]);

  // 계약 목록 조회
  const fetchContracts = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getContracts(filter);
      if (response.success && response.data) {
        setContracts(response.data.content || []);
        setPagination({
          totalPages: response.data.pagination.totalPages,
          totalElements: response.data.pagination.totalElements,
          size: response.data.pagination.size,
          currentPage: response.data.pagination.currentPage,
        });
      } else {
        console.error('Failed to fetch contracts:', response.error);
        showToast(response.error || '계약 목록을 불러오는데 실패했습니다.', 'error');
        setContracts([]);
        setPagination({
          totalPages: 1,
          totalElements: 0,
          size: 10,
          currentPage: 1,
        });
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      showToast('계약 목록을 불러오는데 실패했습니다.', 'error');
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter, showToast]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
    setSearchBtnClicked(true);
  };

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter((prev) => ({
      ...prev,
      customerName: filter.customerName,
      page: 1,
    }));
    setSearchBtnClicked(true);
  };

  // 계약 유형 선택 핸들러
  const handleContractTypeSelect = (type: ContractType) => {
    setFilter((prev) => ({ ...prev, contractType: type }));
    setSearchBtnClicked(true);
  };

  // 계약 상태 선택 핸들러
  const handleContractStatusSelect = (status: ContractStatus) => {
    setFilter((prev) => ({ ...prev, status: status }));
    setSearchBtnClicked(true);
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setFilter({
      page: 1,
      size: 10,
      customerName: '',
      contractType: null,
      status: null,
    });
    setSearchBtnClicked(false); // 버튼 클릭 false로 초기화
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const status = (location.state as { status?: ContractStatus })?.status;
    if (status) {
      setFilter(prev => ({ ...prev, status }));
      setSearchBtnClicked(true);
    } else {
      fetchContracts();
    }
  }, []);

  // searchBtnClicked가 변경될 때마다 데이터 다시 로딩
  useEffect(() => {
    if (searchBtnClicked) {
      fetchContracts();
      setSearchBtnClicked(false);
    }
  }, [fetchContracts, searchBtnClicked]);

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">계약 관리</h1>
        <div className="mt-3 sm:mt-0">
          <Button
            variant="primary"
            onClick={() => navigate('/contracts/register')}
            leftIcon={<Plus size={16} />}
          >
            계약 등록
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mt-6 bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              placeholder="고객 이름"
              value={filter.customerName}
              onChange={(e) => setFilter({ ...filter, customerName: e.target.value })}
              leftIcon={<Search size={18} />}
            />
          </div>

          <div className="space-y-4">
            {/* 계약 유형과 계약 상태 버튼 그룹 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 계약 유형 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 text-left">계약 유형</p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(ContractType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleContractTypeSelect(type)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        filter.contractType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {ContractTypeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>
              {/* 계약 상태 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 text-left">계약 상태</p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(ContractStatus).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleContractStatusSelect(status)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        filter.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {ContractStatusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex justify-between">
              <Button type="submit" variant="primary">
                검색
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetFilters}>
                  필터 초기화
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchContracts}
                  leftIcon={<RefreshCw size={14} />}
                >
                  새로고침
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 계약 목록 */}
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-start">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : contracts && contracts.length > 0 ? (
          <div className="space-y-6">
            {contracts.map((contract) => (
              <Link key={contract.id} to={`/contracts/${contract.id}`}>
                <ContractListItem contract={contract} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">계약 없음</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter.customerName || filter.contractType || filter.status
                ? '검색 조건에 맞는 계약이 없습니다.'
                : '등록된 계약이 없습니다.'}
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => navigate('/contracts/register')}
                leftIcon={<Plus size={16} />}
              >
                계약 등록
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {!isLoading && contracts && contracts.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default ContractList;
