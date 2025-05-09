import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'react-feather';
import Modal from '../ui/Modal';
import { getCompletedContractsThisMonth } from '../../api/contract';
import { useToast } from '../../context/useToast';
import { ContractListResDto } from '../../types/contract';
import { formatDate } from '../../utils/format';
import Pagination from '../ui/Pagination';

interface CompletedContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CompletedContractsModal: React.FC<CompletedContractsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState<ContractListResDto['content']>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    size: 5,
  });

  useEffect(() => {
    const fetchCompletedContracts = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        const response = await getCompletedContractsThisMonth();
        if (response.success && response.data) {
          setContracts(response.data.content);
          setPagination({
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            totalElements: response.data.pagination.totalElements,
            size: response.data.pagination.size,
          });
        } else {
          showToast(response.error || '완료된 계약 목록을 불러오는데 실패했습니다.', 'error');
        }
      } catch (error) {
        showToast('완료된 계약 목록을 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedContracts();
  }, [isOpen]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="이번 달 완료된 계약"
      size="lg"
    >
      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : contracts.length > 0 ? (
          <>
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    navigate(`/contracts/${contract.id}`);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {contract.property.roadAddress}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {contract.contractType === 'SALE'
                            ? '매매'
                            : contract.contractType === 'JEONSE'
                              ? '전세'
                              : '월세'}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(contract.completedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isLoading && contracts.length > 0 && (
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
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">완료된 계약 없음</h3>
            <p className="mt-1 text-sm text-gray-500">
              이번 달에 완료된 계약이 없습니다.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CompletedContractsModal; 