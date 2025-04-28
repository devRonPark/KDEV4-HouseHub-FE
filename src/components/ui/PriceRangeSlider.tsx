'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  // markers: { value: number; label: string }[];
  label?: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  formatValue = (value) => value.toString(),
  // markers,
  label,
}) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 외부 값이 변경되면 내부 상태 업데이트
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 슬라이더 위치를 값으로 변환
  const getValueFromPosition = (position: number): number => {
    if (!sliderRef.current) return min;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = sliderRect.width;
    const offset = position - sliderRect.left;

    // 위치를 0~1 사이 비율로 변환
    const ratio = Math.max(0, Math.min(1, offset / sliderWidth));

    // 비율을 값으로 변환
    let newValue = min + ratio * (max - min);

    // step에 맞게 조정
    newValue = Math.round(newValue / step) * step;

    return Math.max(min, Math.min(max, newValue));
  };

  // 마우스/터치 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent, type: 'min' | 'max') => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const newValue = getValueFromPosition(e.clientX);
    // console.log(newValue);

    if (isDragging === 'min') {
      // 최소값은 최대값보다 작아야 함
      const updatedValue: [number, number] = [
        Math.min(newValue, localValue[1] - step),
        localValue[1],
      ];
      setLocalValue(updatedValue);
      onChange(updatedValue);
    } else {
      // 최대값은 최소값보다 커야 함
      const updatedValue: [number, number] = [
        localValue[0],
        Math.max(newValue, localValue[0] + step),
      ];
      setLocalValue(updatedValue);
      onChange(updatedValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // 마우스 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, localValue]);

  // 값을 위치(%)로 변환
  const getPositionFromValue = (value: number): number => {
    return ((value - min) / (max - min)) * 100;
  };

  // 현재 선택된 값 표시 텍스트
  const getDisplayText = (): string => {
    if (localValue[0] === min && localValue[1] === max) {
      return '전체';
    }
    if (localValue[0] === min) {
      return `${formatValue(localValue[1])}까지`;
    }
    if (localValue[1] === max) {
      return `${formatValue(localValue[0])}부터`;
    }
    return `${formatValue(localValue[0])} ~ ${formatValue(localValue[1])}`;
  };

  const minPos = getPositionFromValue(localValue[0]);
  const maxPos = getPositionFromValue(localValue[1]);

  // 말풍선 위치 계산 함수 - 화면 경계에 닿지 않도록 조정
  const calculateTooltipPosition = () => {
    // 기본 위치는 두 핸들의 중간
    let position = (minPos + maxPos) / 2;

    // 말풍선이 너무 왼쪽에 있을 경우 조정
    if (position < 10) {
      position = 10;
    }
    // 말풍선이 너무 오른쪽에 있을 경우 조정
    else if (position > 90) {
      position = 90;
    }

    return `${position}%`;
  };

  return (
    <div className="mb-8">
      {label && <h3 className="text-base font-medium mb-6">{label}</h3>}

      {/* 현재 선택된 값 표시 (말풍선) */}
      <div className="relative mb-12">
        <div
          ref={tooltipRef}
          className="absolute transform -translate-x-1/2 bg-white border border-gray-300 rounded-md px-3 py-1 text-sm whitespace-nowrap z-10"
          style={{
            left: calculateTooltipPosition(),
            top: '-20px',
          }}
        >
          {getDisplayText()}
          <div className="absolute left-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-white border-b border-r border-gray-300 -bottom-1"></div>
        </div>
      </div>

      {/* 슬라이더 트랙 */}
      <div className="relative h-1 bg-gray-200 rounded-full mb-4" ref={sliderRef}>
        {/* 선택된 범위 */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${minPos}%`,
            width: `${maxPos - minPos}%`,
          }}
        />

        {/* 최소값 핸들 */}
        <div
          className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mt-2.5 transform -translate-x-1/2 cursor-pointer"
          style={{ left: `${minPos}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'min')}
        />

        {/* 최대값 핸들 */}
        <div
          className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mt-2.5 transform -translate-x-1/2 cursor-pointer"
          style={{ left: `${maxPos}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'max')}
        />
      </div>

      {/* 마커 */}
      {/* <div className="flex justify-between mt-1">
        {markers.map((marker, index) => (
          <div key={index} className="text-center">
            <div className="text-sm text-gray-500">{marker.label}</div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default PriceRangeSlider;
