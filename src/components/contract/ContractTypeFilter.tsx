'use client';

import type React from 'react';
import { ContractType, ContractTypeLabels, ContractTypeColors } from '../../types/contract';

interface ContractTypeFilterProps {
  selectedType: ContractType | null;
  onChange: (type: ContractType | null) => void;
}

const ContractTypeFilter: React.FC<ContractTypeFilterProps> = ({ selectedType, onChange }) => {
  const contractTypes = Object.values(ContractType);

  const handleTypeClick = (type: ContractType) => {
    if (selectedType === type) {
      onChange(null); // 이미 선택된 유형을 다시 클릭하면 필터 해제
    } else {
      onChange(type);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          selectedType === null
            ? 'bg-gray-800 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={() => onChange(null)}
      >
        전체
      </button>

      {contractTypes.map((type) => (
        <button
          key={type}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedType === type
              ? `${ContractTypeColors[type].bg} ${ContractTypeColors[type].text}`
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => handleTypeClick(type)}
        >
          {ContractTypeLabels[type]}
        </button>
      ))}
    </div>
  );
};

export default ContractTypeFilter;
