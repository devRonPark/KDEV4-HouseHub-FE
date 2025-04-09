'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // ✅ 플러그인 import
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

      // ✅ Chart.js에 플러그인 등록
      Chart.register(ChartDataLabels);

      const isCartesianChart = type === 'bar' || type === 'line';
      console.log(isCartesianChart);
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type,
          data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              datalabels: {
                display: true,
                color: '#666',
                font: {
                  weight: 'bold' as const,
                },
                formatter: (value: number) => {
                  return value == 0 ? '0' : value;
                },
              },
            },
            ...(isCartesianChart && {
              scales: {
                y: {
                  beginAtZero: true,
                  max: 50, // Y축 최대값 고정
                  ticks: {
                    stepSize: 5, // 10 간격으로 눈금 설정
                    maxTicksLimit: 11, // 0부터 100까지 총 11개 눈금
                  },
                },
              },
            }),
            ...options,
          },
          plugins: [ChartDataLabels], // ✅ 플러그인 사용 등록
        });
      }
    }

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
