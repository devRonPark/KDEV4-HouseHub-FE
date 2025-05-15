import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'react-feather';
import Modal from '../ui/Modal';
import { getRecentCustomers } from '../../api/customer';
import { useToast } from '../../context/useToast';
import { CustomerListResDto } from '../../types/customer';
import { formatDate } from '../../utils/format';
import Pagination from '../ui/Pagination';

interface RecentCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecentCustomersModal: React.FC<RecentCustomersModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerListResDto['content']>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    size: 5,
  });

  useEffect(() => {
    const fetchRecentCustomers = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        const response = await getRecentCustomers(pagination.currentPage, pagination.size);
        if (response.success && response.data) {
          setCustomers(response.data.content);
          setPagination({
            currentPage: 1,
            totalPages: response.data.pagination.totalPages,
            totalElements: response.data.pagination.totalElements,
            size: response.data.pagination.size,
          });
        } else {
          showToast(response.error || '신규 고객 목록을 불러오는데 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('Failed to fetch recent customers:', error);
        showToast('신규 고객 목록을 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentCustomers();
  }, [isOpen]);

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await getRecentCustomers(page, pagination.size);
      if (response.success && response.data) {
        setCustomers(response.data.content);
        setPagination({
          currentPage: page,
          totalPages: response.data.pagination.totalPages,
          totalElements: response.data.pagination.totalElements,
          size: response.data.pagination.size,
        });
      } else {
        showToast(response.error || '신규 고객 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch recent customers:', error);
      showToast('신규 고객 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="최근 7일간 신규 고객" size="lg">
      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : customers.length > 0 ? (
          <>
            <div className="space-y-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    navigate(`/customers/${customer.id}`);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-500">{customer.contact}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm text-gray-500">{formatDate(customer.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isLoading && customers.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">신규 고객 없음</h3>
            <p className="mt-1 text-sm text-gray-500">최근 7일간 등록된 신규 고객이 없습니다.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RecentCustomersModal;
