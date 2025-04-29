import type React from 'react';
import { FileText, User } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ContractResDto,
  ContractTypeLabels,
  ContractStatusLabels,
  ContractTypeColors,
  ContractStatusColors,
} from '../../types/contract';

interface ContractListItemProps {
  contract: ContractResDto;
}

const ContractListItem: React.FC<ContractListItemProps> = ({ contract }) => {
  const navigate = useNavigate();
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  // 계약 유형에 따른 금액 표시
  const getPriceDisplay = () => {
    switch (contract.contractType) {
      case 'SALE':
        return `매매가: ${formatCurrency(contract.salePrice)}`;
      case 'JEONSE':
        return `전세가: ${formatCurrency(contract.jeonsePrice)}`;
      case 'MONTHLY_RENT':
        return `보증금: ${formatCurrency(contract.monthlyRentDeposit)}, 월세: ${formatCurrency(contract.monthlyRentFee)}`;
      default:
        return '';
    }
  };

  return (
    <div
      onClick={() => navigate(`/contracts/${contract.id}`)}
      className="block border rounded-lg hover:shadow-md transition-shadow duration-200 bg-white overflow-hidden mb-4"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <span className="text-lg font-medium text-gray-900 mr-2">
                  {contract.property.roadAddress}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ContractTypeColors[contract.contractType].bg
                  } ${ContractTypeColors[contract.contractType].text} mr-2`}
                >
                  {ContractTypeLabels[contract.contractType]}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ContractStatusColors[contract.status].bg
                  } ${ContractStatusColors[contract.status].text}`}
                >
                  {ContractStatusLabels[contract.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{getPriceDisplay()}</p>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-sm text-gray-500 mr-4">
                  <User className="h-4 w-4 mr-1" />
                  {contract.customer?.name || '계약자를 등록해주세요.'}
                </div>
                {contract.startedAt && contract.expiredAt && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span>
                      {formatDate(contract.startedAt)} ~ {formatDate(contract.expiredAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractListItem;
