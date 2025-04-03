import type React from 'react';
import Logo from './Logo';

interface LogoWithTextProps {
  width?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
  textColor?: string;
  companyName?: string;
  className?: string;
}

const LogoWithText: React.FC<LogoWithTextProps> = ({
  width = 160,
  height = 40,
  color = '#3B82F6',
  secondaryColor = '#10B981',
  textColor = '#1F2937',
  companyName = '부동산 CRM',
  className = '',
}) => {
  return (
    <div className={`flex items-center ${className}`} style={{ width, height }}>
      <Logo width={height} height={height} color={color} secondaryColor={secondaryColor} />
      <div className="ml-2 flex flex-col">
        <span className="text-lg font-bold" style={{ color: textColor }}>
          {companyName}
        </span>
        <span className="text-xs" style={{ color: textColor }}>
          부동산 관리 솔루션
        </span>
      </div>
    </div>
  );
};

export default LogoWithText;
