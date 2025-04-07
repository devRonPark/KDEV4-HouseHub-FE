'use client';

import type React from 'react';
import { ContractStatus, ContractStatusLabels, ContractStatusColors } from '../../types/contract';

interface ContractStatusFilterProps {
  selectedStatus: ContractStatus | null;
  onChange: (status: ContractStatus | null) => void;
}

const ContractStatusFilter: React.FC<ContractStatusFilterProps> = ({
  selectedStatus,
  onChange,
}) => {
  const contractStatuses = Object.values(ContractStatus);

  const handleStatusClick = (status: ContractStatus) => {
    if (selectedStatus === status) {
      onChange(null); // 이미 선택된 상태를 다시 클릭하면 필터 해제
    } else {
      onChange(status);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          selectedStatus === null
            ? 'bg-gray-800 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={() => onChange(null)}
      >
        전체
      </button>

      {contractStatuses.map((status) => (
        <button
          key={status}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedStatus === status
              ? `${ContractStatusColors[status].bg} ${ContractStatusColors[status].text}`
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => handleStatusClick(status)}
        >
          {ContractStatusLabels[status]}
        </button>
      ))}
    </div>
  );
};

export default ContractStatusFilter;
