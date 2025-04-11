'use client';

import React from 'react';

interface ActiveStatusSelectorProps {
  selected: boolean | null;
  onChange: (value: boolean) => void;
}

const ActiveStatusSelector: React.FC<ActiveStatusSelectorProps> = ({ selected, onChange }) => {
  const options: { label: string; value: boolean }[] = [
    { label: '계약 가능', value: true },
    { label: '계약 불가능', value: false },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
        계약 상태 <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <div
            key={String(option.value)}
            className={`
              relative rounded-lg border p-4 flex cursor-pointer focus:outline-none
              ${
                selected === option.value
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
            onClick={() => onChange(option.value)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="text-sm font-medium text-gray-900">{option.label}</div>
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center
                  ${selected === option.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                `}
              >
                {selected === option.value && (
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveStatusSelector;
