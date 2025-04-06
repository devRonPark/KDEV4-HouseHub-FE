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
        (sms) =>
          sms.receivers.some((receiver) => receiver.includes(searchTerm)) ||
          sms.message.includes(searchTerm)
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

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'receivers',
      header: '수신자 전화번호',
      render: (sms: SendSmsResDto) => (
        <div>
          {sms.receivers.length > 1 ? (
            <div>
              <div>{sms.receivers[0]}</div>
              <div className="text-xs text-gray-500">외 {sms.receivers.length - 1}명</div>
            </div>
          ) : (
            sms.receivers[0]
          )}
        </div>
      ),
    },
    {
      key: 'sentAt',
      header: '발송 시간',
      render: (sms: SendSmsResDto) => <div>{formatDate(sms.sentAt)}</div>,
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
              <div className="mt-1 space-y-1">
                {selectedSms.receivers.map((receiver, index) => (
                  <p key={index} className="text-sm text-gray-900">
                    {receiver}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">메시지 유형</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedSms.messageType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">발송 상태</h3>
              <div className="mt-1">
                <Badge variant={selectedSms.status === 'SUCCESS' ? 'success' : 'danger'} size="sm">
                  {selectedSms.status === 'SUCCESS' ? '성공' : '실패'}
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">발송 시간</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(selectedSms.sentAt)}</p>
            </div>
            {selectedSms.reservationTime && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">예약 시간</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(selectedSms.reservationTime)}
                </p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">메시지 내용</h3>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedSms.message}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default SmsListPage;
