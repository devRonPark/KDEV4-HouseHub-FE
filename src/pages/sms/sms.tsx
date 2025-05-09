'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Send, Search } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/useToast';
import { getAllSms, getSmsById, getSmsCost } from '../../api/sms';
import { getAllTemplates } from '../../api/sms';
import type { SendSmsResDto } from '../../types/sms';
import type { SmsTemplateListResDto } from '../../types/sms';

import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import SmsDetailModal from '../../components/sms/SmsDetailModal';

const SmsListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [smsList, setSmsList] = useState<SendSmsResDto[]>([]);
  const [selectedSms, setSelectedSms] = useState<SendSmsResDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);
  const [smsCost, setSmsCost] = useState<number>(0);

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
    templateId: null as number | null,
  });

  const [templates, setTemplates] = useState<SmsTemplateListResDto>({
    content: [],
    pagination: {
      totalPages: 0,
      totalElements: 0,
      size: 10,
      currentPage: 1,
    },
  });

  // 문자 목록 조회
  const fetchSmsList = async () => {
    setIsLoading(true);
    try {
      const response = await getAllSms({
        page: filter.page,
        size: filter.size,
        keyword: filter.keyword,
        templateId: filter.templateId,
      });
      if (response.success && response.data) {
        setSmsList(response.data.content || []);
        setPagination(response.data.pagination);
      } else {
        showToast(response.message || '문자 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('문자 목록 조회 오류:', error);
      showToast('문자 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 문자 상세 정보 조회
  const fetchSmsDetail = async (id: number) => {
    try {
      const response = await getSmsById(id);
      if (response.success && response.data) {
        setSelectedSms(response.data);
        setIsDetailModalOpen(true);
      } else {
        showToast(response.message || '문자 상세 정보를 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('문자 상세 정보 조회 오류:', error);
      showToast('문자 상세 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    }
  };

  // 템플릿 목록 조회
  const fetchTemplates = async () => {
    try {
      const response = await getAllTemplates({
        page: 1,
        size: 100,
      });
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('템플릿 목록 조회 오류:', error);
    }
  };

  // 문자 서비스 사용 금액 조회
  const fetchSmsCost = async () => {
    try {
      const response = await getSmsCost();
      if (response.success && response.data) {
        setSmsCost(response.data);
      }
    } catch (error) {
      console.error('문자 서비스 사용 금액 조회 오류:', error);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchSmsList();
    fetchTemplates();
    fetchSmsCost();
  }, []);

  // customer.tsx 방식으로 교체
  useEffect(() => {
    if (searchBtnClicked) {
      fetchSmsList();
      setSearchBtnClicked(false);
    }
  }, [filter, searchBtnClicked]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({
      ...prev,
      page: page,
    }));
    setSearchBtnClicked(true); // 페이지 변경 시 검색 트리거
  };

  // 기존 폼 제출 방식 제거
  const handleSearch = () => {
    setFilter((prev) => ({
      ...prev,
      page: 1, // 검색 시 1페이지로 리셋
    }));
    setSearchBtnClicked(true);
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 요청 시간 포맷팅 함수 추가
  const formatRequestTime = (requestTime: string): string => {
    try {
      // Date 객체로 변환 후 원하는 형식으로 포맷팅
      return format(new Date(requestTime), 'yyyy-MM-dd HH:mm');
    } catch (error) {
      console.error('시간 포맷팅 오류:', error);
      return requestTime; // 오류 발생 시 원본 반환
    }
  };

  const formatReserveTime = (requestTime: string): string => {
    try {
      if (!requestTime || requestTime.length !== 13) return '-';
      // 입력 문자열을 분리하여 날짜와 시간을 추출
      const datePart = requestTime.substring(0, 8); // YYYYMMDD
      const timePart = requestTime.substring(8); // HH:mm

      // 날짜와 시간을 결합하여 원하는 형식으로 반환
      const year = datePart.substring(0, 4);
      const month = datePart.substring(4, 6);
      const day = datePart.substring(6, 8);

      return `${year}-${month}-${day} ${timePart}`;
    } catch (error) {
      console.error('시간 포맷팅 오류:', error);
      return requestTime; // 오류 발생 시 원본 반환
    }
  };

  const formatContact = (contact: string) => {
    if (!contact) return '-';

    // 하이픈이 포함된 경우 그대로 반환
    if (contact.includes('-')) {
      return contact;
    }

    // 11자리 숫자인 경우에만 포맷팅
    if (contact.length === 11) {
      const head = contact.substring(0, 3);
      const body = contact.substring(3, 7);
      const foot = contact.substring(7, 11);
      return `${head}-${body}-${foot}`;
    }

    return contact;
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'receiver',
      header: '수신자 전화번호',
      render: (sms: SendSmsResDto) => <div>{formatContact(sms.receiver)}</div>,
    },
    {
      key: 'template',
      header: '사용 템플릿',
      render: (sms: SendSmsResDto) => <div>{sms.smsTemplate?.title || '템플릿 없음'}</div>,
    },
    {
      key: 'rdate',
      header: '예약 일시',
      render: (sms: SendSmsResDto) => {
        const reserveDateTime = sms.rdate && sms.rtime ? sms.rdate + sms.rtime : ''; // 예약 일자와 시간 결합
        const formattedReserveTime = formatReserveTime(reserveDateTime); // 예약 시간 포맷팅
        const formattedRequestTime = formatRequestTime(sms.createdAt); // 요청 시간 포맷팅
        return (
          <div>{formattedReserveTime === formattedRequestTime ? '-' : formattedReserveTime}</div>
        );
      },
    },
    {
      key: 'createdAt',
      header: '요청 일시',
      render: (sms: SendSmsResDto) => <div>{formatRequestTime(sms.createdAt)}</div>,
    },
    {
      key: 'status',
      header: '발송 상태',
      render: (sms: SendSmsResDto) => {
        let badgeVariant: 'success' | 'danger' | 'warning' = 'danger';
        let statusText = '실패';

        if (sms.status === 'SUCCESS') {
          badgeVariant = 'success';
          statusText = '성공';
        } else if (sms.status === 'PERMANENT_FAIL') {
          badgeVariant = 'warning';
          statusText = '영구 실패';
        }

        return (
          <Badge variant={badgeVariant} size="sm">
            {statusText}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: '관리',
      render: (sms: SendSmsResDto) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            fetchSmsDetail(sms.id);
          }}
        >
          상세보기
        </Button>
      ),
    },
  ];

  // 문자 발송 통계
  const stats = {
    total: pagination.totalElements,
    success: smsList.filter((sms) => sms.status === 'SUCCESS').length,
    fail: smsList.filter((sms) => sms.status === 'FAIL').length,
    cost: smsCost,
  };

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">문자 발송 내역</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Button
            variant="primary"
            leftIcon={<Send size={16} />}
            onClick={() => navigate('/sms/send')}
          >
            문자 보내기
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card className="bg-white-50">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">총 발송 건수</h3>
            <div className="mt-1 text-3xl font-semibold text-blue-600">{stats.total}</div>
          </div>
        </Card>
        <Card className="bg-white-50">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">현재 페이지 발송 성공</h3>
            <div className="mt-1 text-3xl font-semibold text-green-600">{stats.success}</div>
          </div>
        </Card>
        <Card className="bg-white-50">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">현재 페이지 발송 실패</h3>
            <div className="mt-1 text-3xl font-semibold text-red-600">{stats.fail}</div>
          </div>
        </Card>
        <Card className="bg-white-50">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">이번달 문자 발송 금액</h3>
            <div className="mt-1 text-3xl font-semibold text-yellow-600">
              {stats.cost.toLocaleString()}원
            </div>
          </div>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="mt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow">
            <Input
              label="문자 검색"
              id="sms-search"
              placeholder="수신자 번호 또는 내용 검색"
              value={filter.keyword}
              onChange={(e) => setFilter((prev) => ({ ...prev, keyword: e.target.value }))}
              onKeyDown={handleKeyPress}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex-grow">
            <Select
              label="템플릿 필터"
              value={filter.templateId?.toString() || ''}
              onChange={(value) => {
                setFilter((prev) => ({
                  ...prev,
                  templateId: value ? Number(value) : null,
                  page: 1, // 필터 변경 시 첫 페이지로
                }));
              }}
              options={[
                { value: '', label: '전체 템플릿' },
                ...templates.content.map((template) => ({
                  value: template.id.toString(),
                  label: template.title,
                })),
              ]}
            />
          </div>
          <div>
            <Button variant="primary" onClick={handleSearch} leftIcon={<Search size={16} />}>
              검색
            </Button>
          </div>
        </div>
        {/* <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="수신자 번호 또는 내용 검색"
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.keyword}
              onChange={handleSearchChange}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" className="sm:w-auto">
              검색
            </Button>
            <Button
              variant="outline"
              leftIcon={<RefreshCw size={16} />}
              onClick={() => {
                setFilter({
                  keyword: '',
                  page: 1,
                  size: 10,
                });
              }}
              className="sm:w-auto"
            >
              초기화
            </Button>
          </div>
        </form> */}
      </div>

      {/* 문자 목록 테이블 */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <Table
          columns={columns}
          data={smsList}
          keyExtractor={(item) => item.id.toString()}
          isLoading={isLoading}
          emptyMessage="문자 발송 내역이 없습니다."
          onRowClick={(sms) => fetchSmsDetail(sms.id)}
        />

        {/* 페이지네이션 */}
        {pagination.totalElements > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                총 <span className="font-medium">{pagination.totalElements}</span>건 중{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.size + 1}
                </span>
                -
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.size, pagination.totalElements)}
                </span>
                건 표시
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

      {/* 문자 상세 정보 모달 */}
      <SmsDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        sms={selectedSms}
      />
    </DashboardLayout>
  );
};

export default SmsListPage;
