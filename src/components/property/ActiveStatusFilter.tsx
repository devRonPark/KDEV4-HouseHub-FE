'use client';

import React from 'react';

interface ActiveStatusFilterProps {
  selected: boolean | undefined;
  onChange: (status: boolean | undefined) => void;
}

const ActiveStatusFilter: React.FC<ActiveStatusFilterProps> = ({ selected, onChange }) => {
  const options: { label: string; value: boolean | undefined }[] = [
    { label: '전체', value: undefined },
    { label: '계약 가능', value: true },
    { label: '계약 불가능', value: false },
  ];

  const getButtonStyle = (value: boolean | undefined) => {
    const isSelected = selected === value;

    if (value === true) {
      return isSelected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }

    if (value === false) {
      return isSelected ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }

    // 전체
    return isSelected ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={String(option.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${getButtonStyle(option.value)}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ActiveStatusFilter;
