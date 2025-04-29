'use client';

import type React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getMyCustomers,
  createMyCustomer,
  updateMyCustomer,
  deleteMyCustomer,
  downloadExcelTemplate,
  uploadCustomersExcel,
  restoreCustomer,
} from '../../api/customer';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, RefreshCw, Edit, Trash2, Download, Upload } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import CustomerForm from '../../components/customers/CustomerForm';
import { formatPhoneNumber } from '../../utils/format';
import { useToast } from '../../context/useToast';
import type { CreateCustomerReqDto, Customer } from '../../types/customer';

const CustomersPage = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    size: 10,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    keyword: '',
    page: 1,
    size: 10,
    includeDeleted: false,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [includeDeletedTemp, setIncludeDeletedTemp] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<{ field: string; message: string }[]>([]);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // 컴포넌트 마운트 시 includeDeletedTemp 초기화
  useEffect(() => {
    setIncludeDeletedTemp(filter.includeDeleted);
  }, []);

  // 고객 데이터 로드 함수
  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMyCustomers({
        keyword: filter.keyword,
        page: filter.page,
        size: filter.size,
        includeDeleted: filter.includeDeleted,
      });

      if (response.success && response.data) {
        setCustomers(response.data.content);
        setPagination(response.data.pagination);
      } else {
        showToast(response.message || 'API 응답에 데이터가 없습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      showToast('고객 정보를 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, filter]);

  // 데이터 로딩 및 필터 변경 시 리로드
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // 검색 실행 함수
  const handleSearch = () => {
    setFilter((prev) => ({
      ...prev,
      keyword: searchKeyword,
      includeDeleted: includeDeletedTemp,
      page: 1,
    }));
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setFilter((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // 고객 상세 정보 모달 열기
  const handleViewCustomer = (customer: Customer) => {
    if (customer.deletedAt) {
      showToast('삭제된 고객의 상세 정보는 볼 수 없습니다.', 'error');
      return;
    }
    navigate(`/customers/${customer.id}`);
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

  useEffect(() => {
    if (!isDeleteModalOpen) {
      setSelectedCustomer(null); // 선택된 고객 초기화
    }
  }, [isDeleteModalOpen]);

  // 고객 정보 수정
  const handleUpdateCustomer = async (customerData: CreateCustomerReqDto) => {
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

        // 목록 새로고침
        loadCustomers();
      } else {
        if (response.errors && response.errors.length > 0) {
          // 각 에러 메시지를 토스트로 표시
          response.errors.forEach((error) => {
            showToast(error.message, 'error');
          });
        } else {
          showToast(response.message || '고객 정보 수정에 실패했습니다.', 'error');
        }
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
        showToast('고객 정보가 성공적으로 삭제되었습니다.', 'success');
        loadCustomers();
      } else {
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => {
            showToast(error.message, 'error');
          });
        } else {
          showToast(response.message || '고객 정보 삭제에 실패했습니다.', 'error');
        }
      }
    } catch (error) {
      console.error('고객 정보 삭제 중 오류 발생:', error);
      showToast('서버 연결 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  //고객 등록
  const handleAddCustomer = async (customerData: CreateCustomerReqDto) => {
    try {
      const response = await createMyCustomer(customerData);

      if (response.success && response.data) {
        showToast('고객 등록 성공', 'success');
        loadCustomers();
        setIsAddModalOpen(false);
      } else {
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => {
            showToast(error.message, 'error');
          });
        } else {
          showToast(response.message || '등록 실패', 'error');
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      showToast('서버 연결 실패', 'error');
    }
  };

  // 엑셀 템플릿 다운로드
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadExcelTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'excel_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('엑셀 템플릿 다운로드 오류:', error);
      showToast('엑셀 템플릿 다운로드 중 오류가 발생했습니다.', 'error');
    }
  };

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  // 엑셀 파일 업로드
  const handleUploadExcel = async () => {
    if (!uploadFile) {
      showToast('업로드할 파일을 선택해주세요.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadCustomersExcel(uploadFile);
      if (response.success && response.data) {
        showToast(
          `${response.data.length}명의 고객 정보가 성공적으로 업로드되었습니다.`,
          'success'
        );
        setIsUploadModalOpen(false);
        setUploadFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // 고객 목록 새로고침
        loadCustomers();
      } else {
        if (response.errors && response.errors.length > 0) {
          setUploadErrors(response.errors);
          setIsErrorModalOpen(true);
        } else {
          showToast(response.message || '고객 정보 업로드에 실패했습니다.', 'error');
        }
      }
    } catch (error) {
      console.error('고객 정보 업로드 오류:', error);
      showToast('고객 정보 업로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // 고객 복구
  const handleRestoreCustomer = async (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const response = await restoreCustomer(customer.id);
      if (response.success) {
        showToast('고객이 성공적으로 복구되었습니다.', 'success');
        loadCustomers();
      } else {
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => {
            showToast(error.message, 'error');
          });
        } else {
          showToast(response.message || '고객 복구에 실패했습니다.', 'error');
        }
      }
    } catch (error) {
      console.error('고객 복구 중 오류 발생:', error);
      showToast('고객 복구 중 오류가 발생했습니다.', 'error');
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'name',
      header: '이름',
      render: (customer: Customer) => <div>{customer.name || '선택 안 함'}</div>,
    },
    {
      key: 'contact',
      header: '연락처',
      render: (customer: Customer) => (
        <div>
          <div>{formatPhoneNumber(customer.contact)}</div>
          <div className="text-gray-500 text-xs">{customer.email || '선택 안 함'}</div>
        </div>
      ),
    },
    {
      key: 'demographic',
      header: '생년월일',
      render: (customer: Customer) => (
        <div>
          <div>
            {customer.birthDate
              ? `${new Date(customer.birthDate).getFullYear()}년생`
              : '선택 안 함'}
          </div>
          <div className="text-gray-500 text-xs">
            {customer.gender === 'M' ? '남성' : customer.gender === 'F' ? '여성' : '선택 안 함'}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '관리',
      render: (customer: Customer) => (
        <div className="flex justify-end space-x-2">
          {customer.deletedAt ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleRestoreCustomer(customer, e)}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              복구
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
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
                  e.stopPropagation();
                  handleDeleteCustomerClick(customer);
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                삭제
              </Button>
            </>
          )}
        </div>
      ),
      width: '200px',
    },
  ];

  // Calculate the range of customers being displayed
  const startIndex = (pagination.currentPage - 1) * pagination.size + 1;
  const endIndex = Math.min(pagination.currentPage * pagination.size, pagination.totalElements);

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
            variant="outline"
            leftIcon={<Upload size={16} />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            엑셀 업로드
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
        {/* 검색 폼 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="space-y-4">
            {/* 기본 검색 필드 */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-grow">
                <Input
                  label=""
                  id="keyword-search"
                  placeholder="이름, 이메일, 연락처로 검색"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  leftIcon={<Search size={16} />}
                  className="h-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={includeDeletedTemp ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => {
                    setIncludeDeletedTemp(!includeDeletedTemp);
                    setFilter((prev) => ({
                      ...prev,
                      includeDeleted: !includeDeletedTemp,
                      page: 1,
                    }));
                  }}
                >
                  {includeDeletedTemp ? '삭제된 고객만' : '삭제된 고객 제외'}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSearch}
                  leftIcon={<Search size={16} />}
                >
                  검색
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <Table
            columns={columns}
            data={customers}
            keyExtractor={(item) => item.id.toString()}
            isLoading={isLoading}
            emptyMessage="검색 결과가 없습니다."
            onRowClick={handleViewCustomer}
          />

          {customers.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  총 <span className="font-medium">{pagination.totalElements}</span>명의 고객 중{' '}
                  <span className="font-medium">{startIndex}</span>-
                  <span className="font-medium">{endIndex}</span>명 표시
                </p>
              </div>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
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
              name: data.name || undefined,
              email: data.email || undefined,
              contact: data.contact || '',
              birthDate: data.birthDate || undefined,
              gender: data.gender || undefined,
              memo: data.memo || undefined,
            };

            handleAddCustomer(requestData); // 변환된 데이터를 전달
          }}
          onCancel={() => setIsAddModalOpen(false)}
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
                name: data.name === '' ? undefined : data.name || selectedCustomer.name,
                email: data.email === '' ? undefined : data.email || selectedCustomer.email,
                contact: data.contact || selectedCustomer.contact,
                birthDate:
                  data.birthDate === '' ? undefined : data.birthDate || selectedCustomer.birthDate,
                gender:
                  data.gender === undefined ? undefined : data.gender || selectedCustomer.gender,
                memo: data.memo === '' ? undefined : data.memo || selectedCustomer.memo,
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

      {/* 엑셀 업로드 모달 */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="고객 정보 엑셀 업로드"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">엑셀 파일 업로드</h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={16} />}
              onClick={handleDownloadTemplate}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              양식 다운로드
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">파일 형식 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 이름: 50자 이하 (선택)</li>
              <li>• 생년월일: yyyy-MM-dd 형식 (선택, 만 19세 이상만 가능)</li>
              <li>• 연락처: 000-0000-0000 형식 (필수)</li>
              <li>• 이메일: example@example.com 형식 (선택)</li>
              <li>• 메모: 자유 입력 (선택)</li>
              <li>• 성별: M(남성) 또는 F(여성) (선택)</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">파일 선택</label>
            <div className="flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            {uploadFile && (
              <p className="mt-2 text-sm text-gray-600">선택된 파일: {uploadFile.name}</p>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <p>* 엑셀 파일은 .xlsx 또는 .xls 형식만 지원합니다.</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false);
                setUploadFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleUploadExcel}
              isLoading={isUploading}
              disabled={!uploadFile || isUploading}
            >
              업로드
            </Button>
          </div>
        </div>
      </Modal>

      {/* 엑셀 업로드 오류 모달 */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => {
          setIsErrorModalOpen(false);
          setUploadErrors([]);
        }}
        title="엑셀 업로드 오류"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              다음과 같은 오류가 발생했습니다:
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              {uploadErrors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsErrorModalOpen(false);
                setUploadErrors([]);
              }}
            >
              확인
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default CustomersPage;
