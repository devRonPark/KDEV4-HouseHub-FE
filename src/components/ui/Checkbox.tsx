import type React from 'react';
import { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-2 text-sm">
            <label htmlFor={checkboxId} className="font-medium text-gray-700">
              {label}
            </label>
            {helperText && <p className="text-gray-500">{helperText}</p>}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
