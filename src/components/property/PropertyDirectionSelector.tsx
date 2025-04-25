'use client';

import type React from 'react';
import { PropertyDirection, PropertyDirectionLabels } from '../../types/property';

interface PropertyDirectionSelectorProps {
  selectedDirection: PropertyDirection | null;
  onChange: (direction: PropertyDirection | null) => void;
}

const PropertyDirectionSelector: React.FC<PropertyDirectionSelectorProps> = ({
  selectedDirection,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        방향 <span className="text-gray-400">(선택사항)</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.values(PropertyDirection).map((direction) => (
          <button
            key={direction}
            type="button"
            className={`px-4 py-2 rounded-md border ${
              selectedDirection === direction
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onChange(direction)}
          >
            {PropertyDirectionLabels[direction]}
          </button>
        ))}
      </div>
      {selectedDirection && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => onChange(null)}
          >
            선택 해제
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyDirectionSelector;
