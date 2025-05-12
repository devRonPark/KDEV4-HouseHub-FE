import { ExpiringContract } from '../../types/contract';
import { PaginationDto } from '../../types/pagination';
import ContractItem from './ContractItem';
import { Pagination } from '@mui/material';

interface Props {
  contracts: ExpiringContract[];
  pagination: PaginationDto;
  loading: boolean;
  selectedMonth: string;
  onPageChange: (page: number) => void;
}

export default function ContractList({
  contracts,
  pagination,
  loading,
  selectedMonth,
  onPageChange,
}: Props) {
  return (
    <div className="border rounded-2xl overflow-hidden bg-gray-50">
      <div className="px-5 py-3 bg-blue-100 text-blue-700 font-semibold text-lg">
        {selectedMonth?.replace('-', '년 ')}월 계약 목록
        <span className="ml-2 text-sm text-gray-600">({contracts.length}건)</span>
      </div>

      <div className="bg-white divide-y">
        {loading ? (
          <div className="p-4 text-center text-gray-500">로딩 중...</div>
        ) : contracts.length > 0 ? (
          <>
            {contracts.map((item) => (
              <ContractItem key={item.id} item={item} />
            ))}
            <div className="px-5 py-3 flex justify-end bg-gray-50">
              <Pagination
                count={pagination.totalPages || 1}
                page={pagination.currentPage || 1}
                onChange={(_, page) => onPageChange(page)}
                size="small"
              />
            </div>
          </>
        ) : (
          <div className="p-5 text-center text-gray-400">해당 월에는 계약이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
