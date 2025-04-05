'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, RefreshCw } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InquiryTemplateList from '../../components/inquiryTemplate/InquiryTemplateList';
import InquiryTemplatePreview from '../../components/inquiryTemplate/InquiryTemplatePreview';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/useToast';
import { useAuth } from '../../context/useAuth';
import { getInquiryTemplates, deleteInquiryTemplate } from '../../api/inquiryTemplate';
import type { InquiryTemplate, InquiryTemplateFilter } from '../../types/inquiryTemplate';

const InquiryTemplateManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [inquiryTemplates, setInquiryTemplates] = useState<InquiryTemplate[]>([]);
  const [selectedInquiryTemplate, setSelectedInquiryTemplate] = useState<InquiryTemplate | null>(
    null
  );
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<InquiryTemplateFilter>({
    keyword: '',
    isActive: undefined,
    page: 1,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    size: 10,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean | undefined>(undefined);

  // 중개사 권한 확인
  const isAgent = user?.role === 'AGENT';

  // 문의 템플릿 목록 조회
  const fetchInquiryTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getInquiryTemplates(filter);
      if (response.success && response.data) {
        setInquiryTemplates(response.data.content);
        setPagination(response.data.pagination);
      } else {
        showToast(response.error || '문의 템플릿 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch {
      showToast('문의 템플릿 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filter, showToast]);

  // 컴포넌트 마운트 시 문의 템플릿 목록 조회
  useEffect(() => {
    fetchInquiryTemplates();
  }, [fetchInquiryTemplates]);

  // 권한 체크
  useEffect(() => {
    if (user && !isAgent) {
      showToast('문의 템플릿 관리 권한이 없습니다.', 'error');
      navigate('/dashboard');
    }
  }, [user, isAgent, navigate, showToast]);

  // 검색 핸들러
  const handleSearch = () => {
    console.log('검색어:', searchKeyword);
    setFilter((prev) => ({
      ...prev,
      keyword: searchKeyword,
      page: 1,
    }));
  };

  // 필터 핸들러
  const handleFilterChange = (isActive: boolean | undefined) => {
    setShowActiveOnly(isActive);
    setFilter((prev) => ({
      ...prev,
      isActive,
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

  // 문의 템플릿 미리보기 모달 열기
  const handleOpenPreviewModal = (inquiryTemplate: InquiryTemplate) => {
    setSelectedInquiryTemplate(inquiryTemplate);
    setIsPreviewModalOpen(true);
  };

  // 문의 템플릿 삭제 모달 열기
  const handleOpenDeleteModal = (inquiryTemplate: InquiryTemplate) => {
    setSelectedInquiryTemplate(inquiryTemplate);
    setIsDeleteModalOpen(true);
  };

  // 문의 템플릿 삭제 핸들러
  const handleDeleteInquiryTemplate = async () => {
    if (!selectedInquiryTemplate) return;

    setIsSubmitting(true);
    try {
      const response = await deleteInquiryTemplate(selectedInquiryTemplate.id);
      if (response.success) {
        showToast('문의 템플릿이 성공적으로 삭제되었습니다.', 'success');
        setIsDeleteModalOpen(false);
        fetchInquiryTemplates();
      } else {
        showToast(response.error || '문의 템플릿 삭제에 실패했습니다.', 'error');
      }
    } catch {
      showToast('문의 템플릿 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-5 mb-6 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">문의 템플릿 관리</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Button
            variant="primary"
            onClick={() => navigate('/inquiry-templates/create')}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            문의 템플릿 생성
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              label="문의 템플릿 검색"
              placeholder="문의 템플릿 제목 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              leftIcon={<Search size={18} />}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex items-end space-x-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태 필터</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={showActiveOnly === undefined ? '' : showActiveOnly ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleFilterChange(undefined);
                  } else {
                    handleFilterChange(value === 'active');
                  }
                }}
              >
                <option value="">모든 상태</option>
                <option value="active">활성화</option>
                <option value="inactive">비활성화</option>
              </select>
            </div>
            <Button variant="outline" onClick={handleSearch} className="h-10">
              <Filter className="h-4 w-4 mr-2" />
              필터 적용
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchKeyword('');
                setShowActiveOnly(undefined);
                setFilter({
                  keyword: '',
                  isActive: undefined,
                  page: 1,
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

      {/* 문의 템플릿 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <InquiryTemplateList
          inquiryTemplates={inquiryTemplates}
          onEdit={(template) => navigate(`/inquiry-templates/edit/${template.id}`)}
          onPreview={handleOpenPreviewModal}
          onDelete={handleOpenDeleteModal}
          isLoading={isLoading}
        />

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
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
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
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

      {/* 문의 템플릿 미리보기 모달 */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="문의 템플릿 미리보기"
        size="lg"
      >
        {selectedInquiryTemplate && (
          <InquiryTemplatePreview
            inquiryTemplate={selectedInquiryTemplate}
            onClose={() => setIsPreviewModalOpen(false)}
          />
        )}
      </Modal>

      {/* 문의 템플릿 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="문의 템플릿 삭제"
        size="sm"
      >
        <div className="p-4">
          <p className="text-gray-700">
            정말로 <span className="font-bold">{selectedInquiryTemplate?.name}</span> 문의 템플릿을
            삭제하시겠습니까?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            이 작업은 되돌릴 수 없으며, 문의 템플릿과 관련된 모든 데이터가 영구적으로 삭제됩니다.
          </p>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <Button
            variant="danger"
            onClick={handleDeleteInquiryTemplate}
            isLoading={isSubmitting}
            className="w-full sm:w-auto sm:ml-3"
          >
            삭제
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isSubmitting}
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            취소
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default InquiryTemplateManagement;
