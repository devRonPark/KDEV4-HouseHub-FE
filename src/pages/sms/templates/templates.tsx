'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, Search } from 'react-feather';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';
import Modal from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/Pagination';
import { useToast } from '../../../context/useToast';
import { getAllTemplates, getTemplateById, deleteTemplate } from '../../../api/smsApi';
import type { TemplateResDto } from '../../../types/sms';
import Input from '../../../components/ui/Input';

const SmsTemplateListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateResDto[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateResDto | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);
  // 페이지네이션 상태 관리
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    size: 10,
  });

  // 검색 필터 상태
  const [filter, setFilter] = useState({
    keyword: '',
    page: 1,
    size: 10,
  });

  // 템플릿 목록 조회
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      // API 호출 시 페이지네이션 및 검색 파라미터 전달
      const response = await getAllTemplates({
        page: filter.page,
        size: filter.size,
        keyword: filter.keyword,
      });

      if (response.success && response.data) {
        setTemplates(response.data.content || []);
        setPagination(response.data.pagination);
      } else {
        showToast(response.message || '템플릿 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('템플릿 목록 조회 오류:', error);
      showToast('템플릿 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 템플릿 상세 조회
  const fetchTemplateDetail = async (id: number) => {
    try {
      const response = await getTemplateById(id);
      if (response.success && response.data) {
        setSelectedTemplate(response.data);
        setIsPreviewModalOpen(true);
      } else {
        showToast(response.message || '템플릿 상세 정보를 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('템플릿 상세 조회 오류:', error);
      showToast('템플릿 상세 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    }
  };

  // 템플릿 삭제
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    setIsDeleting(true);
    try {
      const response = await deleteTemplate(selectedTemplate.id);
      if (response.success) {
        showToast('템플릿이 성공적으로 삭제되었습니다.', 'success');
        setIsDeleteModalOpen(false);
        fetchTemplates();
      } else {
        showToast(response.message || '템플릿 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('템플릿 삭제 오류:', error);
      showToast('템플릿 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchTemplates();
  }, []);

  // 필터 변경 시 데이터 다시 로딩
  useEffect(() => {
    if (searchBtnClicked) {
      fetchTemplates();
      setSearchBtnClicked(false);
    }
  }, [filter, searchBtnClicked]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({
      ...prev,
      page: page,
    }));
    setSearchBtnClicked(true);
  };

  // 검색 실행 함수
  const handleSearch = () => {
    setFilter((prev) => ({
      ...prev,
      page: 1, // 검색 시 1페이지로 리셋
    }));
    setSearchBtnClicked(true);
  };

  // 검색어 입력 시 Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
      return dateString;
    }
  };

  // 내용 요약
  const summarizeContent = (content: string, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 템플릿으로 문자 보내기
  const handleSendWithTemplate = (templateId: number) => {
    navigate(`/sms/send?templateId=${templateId}`);
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'title',
      header: '템플릿 제목',
      render: (template: TemplateResDto) => (
        <div className="font-medium text-gray-900">{template.title}</div>
      ),
    },
    {
      key: 'content',
      header: '내용',
      render: (template: TemplateResDto) => (
        <div className="text-gray-500">{summarizeContent(template.content)}</div>
      ),
    },
    {
      key: 'createdAt',
      header: '생성일',
      render: (template: TemplateResDto) => <div>{formatDate(template.createdAt)}</div>,
    },
    {
      key: 'actions',
      header: '관리',
      render: (template: TemplateResDto) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-900"
            onClick={(e) => {
              e.stopPropagation();
              fetchTemplateDetail(template.id);
            }}
            title="미리보기"
          >
            <Eye size={18} />
          </button>
          <button
            className="text-indigo-600 hover:text-indigo-900"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sms/templates/edit/${template.id}`);
            }}
            title="수정"
          >
            <Edit size={18} />
          </button>
          <button
            className="text-red-600 hover:text-red-900"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTemplate(template);
              setIsDeleteModalOpen(true);
            }}
            title="삭제"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">문자 템플릿 목록</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/sms/templates/create')}
          >
            템플릿 생성
          </Button>
        </div>
      </div>

      {/* 검색 */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-grow">
          <Input
            label="템플릿 검색"
            id="template-search"
            placeholder="제목 또는 내용으로 검색"
            value={filter.keyword}
            onChange={(e) => setFilter((prev) => ({ ...prev, keyword: e.target.value }))}
            onKeyDown={handleKeyPress}
            leftIcon={<Search size={16} />}
          />
        </div>
        <div>
          <Button variant="primary" onClick={handleSearch} leftIcon={<Search size={16} />}>
            검색
          </Button>
        </div>
      </div>

      {/* 템플릿 목록 테이블 */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <Table
          columns={columns}
          data={templates}
          keyExtractor={(item) => item.id.toString()}
          isLoading={isLoading}
          emptyMessage="등록된 템플릿이 없습니다."
          onRowClick={(template) => fetchTemplateDetail(template.id)}
        />
      </div>

      {pagination.totalElements > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              총 <span className="font-medium">{pagination.totalElements}</span>개 중{' '}
              <span className="font-medium">
                {(pagination.currentPage - 1) * pagination.size + 1}
              </span>
              -
              <span className="font-medium">
                {Math.min(pagination.currentPage * pagination.size, pagination.totalElements)}
              </span>
              개 표시
            </p>
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 템플릿 미리보기 모달 */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="템플릿 미리보기"
        size="md"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">템플릿 제목</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{selectedTemplate.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">템플릿 내용</h3>
              <div className="mt-1 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedTemplate.content}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">생성일</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTemplate.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">최종 수정일</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTemplate.updatedAt)}</p>
            </div>
            <div className="pt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/sms/templates/edit/${selectedTemplate.id}`)}
              >
                수정
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleSendWithTemplate(selectedTemplate.id);
                }}
              >
                이 템플릿으로 문자 보내기
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 템플릿 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="템플릿 삭제"
        size="sm"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <p className="text-gray-700">
              정말로 <span className="font-bold">{selectedTemplate.title}</span> 템플릿을
              삭제하시겠습니까?
            </p>
            <p className="text-sm text-gray-500">
              이 작업은 되돌릴 수 없으며, 템플릿이 영구적으로 삭제됩니다.
            </p>
            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                취소
              </Button>
              <Button variant="danger" onClick={handleDeleteTemplate} isLoading={isDeleting}>
                삭제
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default SmsTemplateListPage;
