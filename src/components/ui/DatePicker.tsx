import React from 'react';

interface DatePickerProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  leftIcon?: React.ReactNode;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  placeholder = 'YYYY-MM-DD',
  value,
  onChange,
  onBlur,
  error,
  leftIcon,
}) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type="date"
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-[42px] ${
            leftIcon ? 'pl-10' : ''
          } ${error ? 'border-red-300' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DatePicker;
