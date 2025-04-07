'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Send, Search, RefreshCw } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/useToast';
import { getAllSms, getSmsById } from '../../api/smsApi';
import type { SendSmsResDto } from '../../types/sms';

const SmsListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [smsList, setSmsList] = useState<SendSmsResDto[]>([]);
  const [selectedSms, setSelectedSms] = useState<SendSmsResDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSmsList, setFilteredSmsList] = useState<SendSmsResDto[]>([]);

  const itemsPerPage = 10;

  // 문자 목록 조회
  const fetchSmsList = async () => {
    setIsLoading(true);
    try {
      const response = await getAllSms();
      if (response.success && response.data) {
        setSmsList(response.data);
        setFilteredSmsList(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
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

  // 초기 데이터 로딩
  useEffect(() => {
    fetchSmsList();
  }, []);

  // 검색어에 따른 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSmsList(smsList);
    } else {
      const filtered = smsList.filter(
        (sms) => sms.receiver.includes(searchTerm) || sms.msg.includes(searchTerm)
      );
      setFilteredSmsList(filtered);
    }
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredSmsList.length / itemsPerPage));
  }, [searchTerm, smsList]);

  // 페이지네이션된 데이터
  const paginatedData = filteredSmsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    if (!contact || contact.length !== 11) return '-';
    const head = contact.substring(0, 3);
    const body = contact.substring(3, 7);
    const foot = contact.substring(7, 11);
    return `${head}-${body}-${foot}`;
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'receiver',
      header: '수신자 전화번호',
      render: (sms: SendSmsResDto) => <div>{formatContact(sms.receiver)}</div>,
    },
    {
      key: 'rdate',
      header: '예약 일시',
      render: (sms: SendSmsResDto) => {
        const reserveDateTime = sms.rdate + sms.rtime; // 예약 일자와 시간 결합
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
      render: (sms: SendSmsResDto) => (
        <Badge variant={sms.status === 'SUCCESS' ? 'success' : 'danger'} size="sm">
          {sms.status === 'SUCCESS' ? '성공' : '실패'}
        </Badge>
      ),
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
    total: smsList.length,
    success: smsList.filter((sms) => sms.status === 'SUCCESS').length,
    fail: smsList.filter((sms) => sms.status === 'FAIL').length,
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
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="bg-blue-50">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">총 발송</h3>
            <div className="mt-1 text-3xl font-semibold text-blue-600">{stats.total}</div>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">발송 성공</h3>
            <div className="mt-1 text-3xl font-semibold text-green-600">{stats.success}</div>
          </div>
        </Card>
        <Card className="bg-red-50">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">발송 실패</h3>
            <div className="mt-1 text-3xl font-semibold text-red-600">{stats.fail}</div>
          </div>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="수신자 번호 또는 내용 검색"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <Button
          variant="outline"
          leftIcon={<RefreshCw size={16} />}
          onClick={fetchSmsList}
          className="sm:w-auto w-full"
        >
          새로고침
        </Button>
      </div>

      {/* 문자 목록 테이블 */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <Table
          columns={columns}
          data={paginatedData}
          keyExtractor={(item) => item.id.toString()}
          isLoading={isLoading}
          emptyMessage="문자 발송 내역이 없습니다."
          onRowClick={(sms) => fetchSmsDetail(sms.id)}
        />

        {/* 페이지네이션 */}
        {filteredSmsList.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                총 <span className="font-medium">{filteredSmsList.length}</span>건 중{' '}
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredSmsList.length)}
                </span>
                건 표시
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

      {/* 문자 상세 정보 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="문자 상세 정보"
        size="md"
      >
        {selectedSms && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">발신 번호</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedSms.sender}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">수신 번호</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedSms.receiver}</p>
            </div>
            {selectedSms.title && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">제목</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedSms.title}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">메시지 유형</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedSms.msgType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">발송 상태</h3>
              <div className="mt-1">
                <Badge variant={selectedSms.status === 'SUCCESS' ? 'success' : 'danger'} size="sm">
                  {selectedSms.status === 'SUCCESS' ? '성공' : '실패'}
                </Badge>
              </div>
            </div>
            {/* 예약 일시 */}
            {(selectedSms.rdate || selectedSms.rtime) &&
              formatReserveTime(selectedSms.rdate + selectedSms.rtime) !==
                formatRequestTime(selectedSms.createdAt) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">예약 일시</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatReserveTime(selectedSms.rdate + selectedSms.rtime)}
                  </p>
                </div>
              )}

            {/* 요청 일시 */}
            {selectedSms.createdAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">요청 일시</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {formatRequestTime(selectedSms.createdAt)}
                </p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">메시지 내용</h3>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedSms.msg}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default SmsListPage;
