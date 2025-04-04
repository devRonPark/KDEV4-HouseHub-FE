'use client';

import type React from 'react';
import { PropertyType, PropertyTypeLabels } from '../../types/property';

interface PropertyTypeSelectorProps {
  selectedType: PropertyType | null;
  onChange: (type: PropertyType) => void;
}

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({ selectedType, onChange }) => {
  const propertyTypes = Object.values(PropertyType);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
        매물 유형 <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {propertyTypes.map((type) => (
          <div
            key={type}
            className={`
              relative rounded-lg border p-4 flex cursor-pointer focus:outline-none
              ${
                selectedType === type
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
            onClick={() => onChange(type)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{PropertyTypeLabels[type]}</p>
                </div>
              </div>
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                  selectedType === type ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}
              >
                {selectedType === type && (
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

export default PropertyTypeSelector;
