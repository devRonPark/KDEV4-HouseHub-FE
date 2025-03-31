import type React from 'react';
import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, className = '', ...props }, ref) => {
    const textareaWrapperClasses = `relative ${fullWidth ? 'w-full' : ''}`;

    const textareaClasses = `
      block w-full px-4 py-2 rounded-md border 
      ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} 
      focus:outline-none focus:ring-2 focus:ring-opacity-50
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `;

    return (
      <div className={textareaWrapperClasses}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea ref={ref} className={textareaClasses} {...props} />

        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
