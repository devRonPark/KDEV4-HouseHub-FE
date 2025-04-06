'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, Search } from 'react-feather';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../context/useToast';
import { getAllTemplates, getTemplateById, deleteTemplate } from '../../../api/smsApi';
import type { TemplateResDto } from '../../../types/sms';

const SmsTemplateListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateResDto[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateResDto | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateResDto[]>([]);

  // 템플릿 목록 조회
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getAllTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
        setFilteredTemplates(response.data);
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

  // 검색어에 따른 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter(
        (template) => template.title.includes(searchTerm) || template.content.includes(searchTerm)
      );
      setFilteredTemplates(filtered);
    }
  }, [searchTerm, templates]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch (error) {
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
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="템플릿 제목 또는 내용 검색"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
      </div>

      {/* 템플릿 목록 테이블 */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <Table
          columns={columns}
          data={filteredTemplates}
          keyExtractor={(item) => item.id.toString()}
          isLoading={isLoading}
          emptyMessage="등록된 템플릿이 없습니다."
          onRowClick={(template) => fetchTemplateDetail(template.id)}
        />
      </div>

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
