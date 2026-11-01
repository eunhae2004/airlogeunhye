import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SidoAirSummary } from '../../types/air';
import { GRADE_THEMES } from '../../utils/airQuality';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RegionalBarChartProps {
  items: SidoAirSummary[];
  metric: 'pm10' | 'pm25' | 'khai';
  onSelectSido?: (sido: string) => void;
}

export const RegionalBarChart: React.FC<RegionalBarChartProps> = ({
  items,
  metric,
  onSelectSido,
}) => {
  const metricLabels = {
    pm10: '미세먼지 PM10 (㎍/㎥)',
    pm25: '초미세먼지 PM2.5 (㎍/㎥)',
    khai: '통합대기환경지수 (KHAI)',
  };

  const labels = items.map((i) => i.sidoName);
  const values = items.map((i) => i[metric]);

  // Color each bar based on its grade
  const backgroundColors = items.map((i) => {
    const grade = metric === 'pm10' ? i.pm10Grade : (metric === 'pm25' ? i.pm25Grade : i.grade);
    return GRADE_THEMES[grade]?.color || '#3b82f6';
  });

  const data = {
    labels,
    datasets: [
      {
        label: metricLabels[metric],
        data: values,
        backgroundColor: backgroundColors,
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 20,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_, elements) => {
      if (elements.length > 0 && onSelectSido) {
        const index = elements[0].index;
        const sido = labels[index];
        onSelectSido(sido);
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Pretendard', size: 12 },
        bodyFont: { family: 'Pretendard', size: 13 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          afterLabel: (ctx) => {
            const item = items[ctx.dataIndex];
            const grade = metric === 'pm10' ? item.pm10Grade : (metric === 'pm25' ? item.pm25Grade : item.grade);
            return `등급: [${grade}] · 측정소: ${item.stationCount}개`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Pretendard', size: 12, weight: 'bold' },
          color: '#334155',
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">
            전국 17개 시·도별 {metricLabels[metric]} 비교
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            막대를 클릭하면 해당 지역의 실시간 세부 대시보드로 이동합니다.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> 좋음
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> 보통
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span> 나쁨
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> 매우나쁨
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
