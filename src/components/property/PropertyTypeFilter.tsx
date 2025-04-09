'use client';

import type React from 'react';
import { PropertyType, PropertyTypeLabels, PropertyTypeColors } from '../../types/property';

interface PropertyTypeFilterProps {
  selectedType: PropertyType | null;
  onChange: (type: PropertyType | null) => void;
}

const PropertyTypeFilter: React.FC<PropertyTypeFilterProps> = ({ selectedType, onChange }) => {
  const propertyTypes = Object.values(PropertyType);

  const handleTypeClick = (type: PropertyType) => {
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

      {propertyTypes.map((type) => (
        <button
          key={type}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedType === type
              ? `${PropertyTypeColors[type].bg} ${PropertyTypeColors[type].text}`
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => handleTypeClick(type)}
        >
          {PropertyTypeLabels[type]}
        </button>
      ))}
    </div>
  );
};

export default PropertyTypeFilter;
