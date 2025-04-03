'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { ChartData } from '../../types/dashboard';

interface ChartContainerProps {
  data: ChartData;
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  height?: number;
  options?: any;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  type,
  height = 300,
  options = {},
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // 이전 차트 인스턴스가 있으면 파괴
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // 새 차트 생성
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type,
          data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            ...options,
          },
        });
      }
    }

    // 컴포넌트 언마운트 시 차트 인스턴스 정리
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, options]);

  return (
    <div style={{ height: `${height}px` }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartContainer;
