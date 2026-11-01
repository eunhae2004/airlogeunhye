import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { StationHistoryPoint } from '../../types/air';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StationTrendChartProps {
  stationName: string;
  history: StationHistoryPoint[];
  metric: 'pm10' | 'pm25' | 'o3' | 'khai';
  onMetricChange: (metric: 'pm10' | 'pm25' | 'o3' | 'khai') => void;
}

export const StationTrendChart: React.FC<StationTrendChartProps> = ({
  stationName,
  history,
  metric,
  onMetricChange,
}) => {
  const metricConfigs = {
    pm10: {
      label: '미세먼지 PM10 (㎍/㎥)',
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      unit: '㎍/㎥',
    },
    pm25: {
      label: '초미세먼지 PM2.5 (㎍/㎥)',
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.12)',
      unit: '㎍/㎥',
    },
    o3: {
      label: '오존 O₃ (ppm)',
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.12)',
      unit: 'ppm',
    },
    khai: {
      label: '통합대기환경지수 (KHAI)',
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      unit: '지수',
    },
  };

  const currentCfg = metricConfigs[metric];

  const data = {
    labels: history.map((item) => item.time),
    datasets: [
      {
        label: currentCfg.label,
        data: history.map((item) => item[metric]),
        borderColor: currentCfg.borderColor,
        backgroundColor: currentCfg.backgroundColor,
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 2.5,
        pointHoverRadius: 6,
        pointBackgroundColor: currentCfg.borderColor,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Pretendard', size: 12 },
        bodyFont: { family: 'Pretendard', size: 13, weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.parsed.y} ${currentCfg.unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Pretendard', size: 11 },
          color: '#64748b',
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: { family: 'Pretendard', size: 11 },
          color: '#64748b',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 text-base">
              {stationName} 최근 24시간 추이
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
              Chart.js 시각화
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            1시간 단위 대기오염 농도 변동 그래프
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg">
          {(['pm10', 'pm25', 'o3', 'khai'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onMetricChange(m)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                metric === m
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m === 'pm10' && 'PM10'}
              {m === 'pm25' && 'PM2.5'}
              {m === 'o3' && '오존(O₃)'}
              {m === 'khai' && '통합지수'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
