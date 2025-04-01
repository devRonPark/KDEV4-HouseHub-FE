import type React from 'react';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  isValid?: boolean; // 유효성 검사 통과 여부
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      isValid,
      ...props
    },
    ref
  ) => {
    const inputWrapperClasses = `relative ${fullWidth ? 'w-full' : ''}`;

    // 유효성 검사 상태에 따른 테두리 색상 설정
    const getBorderColor = () => {
      if (error) return 'border-red-500 focus:ring-red-500 focus:border-red-500';
      if (isValid) return 'border-green-500 focus:ring-green-500 focus:border-green-500';
      return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    };

    const inputClasses = `
      block px-4 py-2 w-full rounded-md border 
      ${getBorderColor()}
      ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} 
      focus:outline-none focus:ring-2 focus:ring-opacity-50
      disabled:opacity-50 disabled:cursor-not-allowed
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
      ${className}
    `;

    return (
      <div className={inputWrapperClasses}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}

          <input ref={ref} className={inputClasses} {...props} />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
