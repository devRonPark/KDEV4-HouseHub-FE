import type React from 'react';
import Input from '../ui/Input';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

const PriceInput: React.FC<PriceInputProps> = ({ value, onChange, placeholder, required = false }) => {
  // 입력값을 숫자만 허용하고 변경 이벤트 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // 숫자만 허용 (소수점 없이)
    if (/^[0-9]*$/.test(inputValue) || inputValue === '') {
      onChange(inputValue);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-gray-500">만원</span>
      </div>
    </div>
  );
};

export default PriceInput; 