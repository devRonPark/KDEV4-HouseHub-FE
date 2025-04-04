'use client';

import type React from 'react';

import {
  getMyCustomers,
  createMyCustomer,
  updateMyCustomer,
  deleteMyCustomer,
} from '../../api/customer';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, RefreshCw, Edit, Trash2 } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import CustomerForm from '../../components/customers/CustomerForm';
import FilterPanel from '../../components/customers/FilterPanel';
import CustomerDetailModal from '../../components/customers/CustomerDetailModal';
import { formatPhoneNumber } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import type { CreateCustomerReqDto, Customer } from '../../types/customer';

const CustomersPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    status?: string;
    propertyTypes?: string[];
    locations?: string[];
    tags?: string[];
  }>({});

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const itemsPerPage = 10;

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMyCustomers();
      if (response.data) {
        const mappedCustomers = response.data.map((dto) => ({
          id: dto.id,
          name: dto.name,
          email: dto.email,
          contact: dto.contact,
          ageGroup: dto.ageGroup,
          gender: dto.gender,
          memo: dto.memo || '',
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt,
          deletedAt: dto.deletedAt,
        }));

        setCustomers(mappedCustomers);
        setFilteredCustomers(mappedCustomers);
        setTotalPages(Math.ceil(mappedCustomers.length / itemsPerPage));
      } else {
        showToast('API 응답에 데이터가 없습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      showToast('고객 정보를 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, itemsPerPage]);

  // 데이터 로딩
  useEffect(() => {
    loadCustomers();
  }, [showToast]);

  // 검색 및 필터링
  useEffect(() => {
    const applySearchAndFilters = () => {
      let result = [...customers];

      // 검색어 적용
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        result = result.filter(
          (customer) =>
            customer.name.toLowerCase().includes(lowerSearchTerm) ||
            customer.email.toLowerCase().includes(lowerSearchTerm) ||
            customer.contact.includes(searchTerm)
        );
      }
      setFilteredCustomers(result);
      setTotalPages(Math.ceil(result.length / itemsPerPage));
      setCurrentPage(1); // 검색 결과가 변경되면 첫 페이지로 이동
    };

    applySearchAndFilters();
  }, [customers, searchTerm, activeFilters]);

  // 페이지네이션된 고객 목록
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 고객 상세 정보 모달 열기
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  // 고객 수정 버튼 클릭
  const handleEditCustomer = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // 행 클릭 이벤트 전파 방지
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  // 고객 삭제 버튼 클릭
  const handleDeleteCustomerClick = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // 행 클릭 이벤트 전파 방지
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  // 고객 정보 수정
  const handleUpdateCustomer = async (customerData: Omit<Customer, 'id'>) => {
    if (!selectedCustomer) return;

    try {
      // API 호출
      const response = await updateMyCustomer(selectedCustomer.id, customerData);

      if (response.success && response.data) {
        // 상태 업데이트
        const updatedCustomer = { ...selectedCustomer, ...response.data };

        // 전체 목록 업데이트
        setCustomers((prev) =>
          prev.map((customer) => (customer.id === selectedCustomer.id ? updatedCustomer : customer))
        );

        setSelectedCustomer(updatedCustomer);

        showToast('고객 정보가 성공적으로 수정되었습니다.', 'success');
      } else {
        // 실패 시 에러 메시지 표시
        showToast(response.error || '고객 정보 수정에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('고객 정보 수정 중 오류 발생:', error);
      showToast('서버 연결 중 오류가 발생했습니다.', 'error');
    } finally {
      // 모달 닫기
      setIsEditModalOpen(false);
    }
  };

  // 고객 삭제
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const response = await deleteMyCustomer(selectedCustomer.id);

      if (response.success && response.data) {
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === selectedCustomer.id
              ? { ...customer, deletedAt: response.data?.deletedAt }
              : customer
          )
        );

        showToast('고객 정보가 성공적으로 삭제되었습니다.', 'success');
      } else {
        showToast(response.error || '고객 정보 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('고객 정보 삭제 중 오류 발생:', error);
      showToast('서버 연결 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddCustomer = async (customerData: CreateCustomerReqDto) => {
    try {
      const response = await createMyCustomer(customerData);

      if (response.success && response.data) {
        // data를 별도 변수로 추출하여 타입 안정성 확보
        const data = response.data;
        setCustomers((prev) => [...prev, data]);
        showToast('고객 등록 성공', 'success');
      } else {
        showToast(response.error || '등록 실패', 'error');
      }
    } catch (error) {
      console.error('API Error:', error);
      showToast('서버 연결 실패', 'error');
    } finally {
      setIsAddModalOpen(false);
    }
  };

  // 필터 적용
  const handleApplyFilters = (filters: {
    status?: string;
    propertyTypes?: string[];
    locations?: string[];
    tags?: string[];
  }) => {
    setActiveFilters(filters);
    setIsFilterPanelOpen(false);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setIsFilterPanelOpen(false);
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'name',
      header: '이름',
      render: (customer: Customer) => (
        <div className="font-medium text-gray-900">{customer.name}</div>
      ),
    },
    {
      key: 'contact',
      header: '연락처',
      render: (customer: Customer) => (
        <div>
          <div>{formatPhoneNumber(customer.contact)}</div>
          <div className="text-gray-500 text-xs">{customer.email}</div>
        </div>
      ),
    },
    {
      key: 'demographic',
      header: '연령대',
      render: (customer: Customer) => (
        <div>
          <div>{customer.ageGroup}대</div>
          <div className="text-gray-500 text-xs">{customer.gender === 'M' ? '남성' : '여성'}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '관리',
      render: (customer: Customer) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit size={14} />}
            onClick={(e) => {
              e.stopPropagation(); // 행 클릭 이벤트 전파 방지
              handleEditCustomer(customer);
            }}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            수정
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={(e) => {
              e.stopPropagation(); // 행 클릭 이벤트 전파 방지
              handleDeleteCustomerClick(customer);
            }}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            삭제
          </Button>
        </div>
      ),
      width: '200px',
    },
  ];

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            leftIcon={<RefreshCw size={16} />}
            onClick={async () => {
              setIsLoading(true);
              try {
                await loadCustomers();
                showToast('데이터가 성공적으로 새로고침되었습니다.', 'success');
              } catch (error) {
                console.error('새로고침 중 오류 발생:', error);
                showToast('새로고침에 실패했습니다.', 'error');
              } finally {
                setIsLoading(false);
              }
            }}
          >
            새로고침
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            신규 고객 등록
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Input
              placeholder="이름, 이메일, 연락처, 주소로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
              className="pr-10"
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          <Button
            variant="outline"
            leftIcon={<Filter size={16} />}
            onClick={() => setIsFilterPanelOpen(true)}
            className="sm:w-auto w-full"
          >
            필터
            {Object.values(activeFilters).flat().length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {Object.values(activeFilters).flat().length}
              </span>
            )}
          </Button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <Table
            columns={columns}
            data={paginatedCustomers}
            keyExtractor={(item) => item.id.toString()}
            isLoading={isLoading}
            emptyMessage="검색 결과가 없습니다."
            onRowClick={handleViewCustomer}
          />

          {filteredCustomers.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  총 <span className="font-medium">{filteredCustomers.length}</span>명의 고객 중{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
                  </span>
                  명 표시
                </p>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* 신규 고객 등록 모달 */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="신규 고객 등록"
        size="lg"
      >
        <CustomerForm
          onSubmit={(data: Partial<Customer>) => {
            // Partial<Customer> → CreateCustomerReqDto로 변환
            const requestData: CreateCustomerReqDto = {
              name: data.name || '',
              email: data.email || '',
              contact: data.contact || '',
              ageGroup: Number(data.ageGroup) || 0,
              gender: data.gender || 'M',
              memo: data.memo || '',
            };

            handleAddCustomer(requestData); // 변환된 데이터를 전달
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* 필터 패널 모달 */}
      <Modal
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        title="고객 필터링"
        size="md"
      >
        <FilterPanel
          initialFilters={activeFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          onCancel={() => setIsFilterPanelOpen(false)}
        />
      </Modal>

      {/* 고객 정보 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="고객 정보 수정"
        size="lg"
      >
        {selectedCustomer && (
          <CustomerForm
            initialData={selectedCustomer}
            onSubmit={(data: Partial<Customer>) => {
              // 타입 변환 및 필수 필드 보장
              const requestData: CreateCustomerReqDto = {
                name: data.name || selectedCustomer.name,
                email: data.email || selectedCustomer.email,
                contact: data.contact || selectedCustomer.contact,
                ageGroup: Number(data.ageGroup || selectedCustomer.ageGroup),
                gender: data.gender === 'M' ? 'M' : 'F', // 타입 변환
                memo: data.memo || '',
              };

              handleUpdateCustomer(requestData);
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      {/* 고객 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="고객 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            정말로 <span className="font-semibold">{selectedCustomer?.name}</span> 고객을
            삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              취소
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteCustomer}>
              삭제
            </Button>
          </div>
        </div>
      </Modal>

      {/* 고객 상세 정보 모달 */}
      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        customer={selectedCustomer}
        onUpdate={handleUpdateCustomer}
        onDelete={handleDeleteCustomerClick}
      />
    </DashboardLayout>
  );
};

export default CustomersPage;
