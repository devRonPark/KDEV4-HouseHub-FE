import type React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  width = 40,
  height = 40,
  color = '#3B82F6', // 기본 파란색
  secondaryColor = '#10B981', // 기본 녹색
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 집 모양 */}
      <path
        d="M20 5L4 18H8V32H32V18H36L20 5Z"
        fill={color}
        stroke="#1F2937"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 창문 */}
      <rect
        x="14"
        y="20"
        width="12"
        height="12"
        rx="1"
        fill="white"
        stroke="#1F2937"
        strokeWidth="1.5"
      />

      {/* 그래프 라인 (CRM 데이터 시각화 표현) */}
      <path
        d="M16 26L18 23L22 25L24 22"
        stroke={secondaryColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 문 */}
      <rect
        x="17"
        y="26"
        width="6"
        height="6"
        rx="1"
        fill="white"
        stroke="#1F2937"
        strokeWidth="1.5"
      />

      {/* 원형 요소 (사람/관계 표현) */}
      <circle cx="30" cy="10" r="4" fill={secondaryColor} stroke="#1F2937" strokeWidth="1.5" />
    </svg>
  );
};

export default Logo;
