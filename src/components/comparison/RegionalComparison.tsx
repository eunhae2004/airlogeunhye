import React, { useState, useMemo } from 'react';
import { SidoAirSummary } from '../../types/air';
import { GRADE_THEMES } from '../../utils/airQuality';
import { RegionalBarChart } from '../charts/RegionalBarChart';
import { 
  ArrowDownUp, 
  Flame, 
  Sparkles, 
  SlidersHorizontal, 
  MapPin, 
  ExternalLink,
  Info
} from 'lucide-react';

interface RegionalComparisonProps {
  items: SidoAirSummary[];
  onSelectSido: (sido: string) => void;
  updatedAt: string;
}

export const RegionalComparison: React.FC<RegionalComparisonProps> = ({
  items,
  onSelectSido,
  updatedAt,
}) => {
  const [metric, setMetric] = useState<'pm10' | 'pm25' | 'khai'>('pm10');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc'); // desc = highest pollution first

  const metricLabel = {
    pm10: '미세먼지 (PM10)',
    pm25: '초미세먼지 (PM2.5)',
    khai: '통합대기환경지수 (KHAI)',
  }[metric];

  const metricUnit = {
    pm10: '㎍/㎥',
    pm25: '㎍/㎥',
    khai: '지수',
  }[metric];

  // Sorted items
  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      return sortDirection === 'desc'
        ? b[metric] - a[metric]
        : a[metric] - b[metric];
    });
    return list;
  }, [items, metric, sortDirection]);

  // Top 3 highest and cleanest
  const highestRegions = useMemo(() => {
    return [...items].sort((a, b) => b[metric] - a[metric]).slice(0, 3);
  }, [items, metric]);

  const cleanestRegions = useMemo(() => {
    return [...items].sort((a, b) => a[metric] - b[metric]).slice(0, 3);
  }, [items, metric]);

  return (
    <div className="space-y-6">
      {/* Title & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">전국 17개 시·도 대기질 비교 및 순위</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              실시간 분석
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            전국 시도별 대기오염 수준을 비교 분석하고 오염도가 높은 지역 순위를 제공합니다.
          </p>
        </div>

        {/* Filter and Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['pm10', 'pm25', 'khai'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  metric === m
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m === 'pm10' && '미세먼지 PM10'}
                {m === 'pm25' && '초미세먼지 PM2.5'}
                {m === 'khai' && '통합지수 KHAI'}
              </button>
            ))}
          </div>

          {/* Sort Direction Toggle */}
          <button
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortDirection === 'desc' ? '오염도 높은 순' : '공기 맑은 순'}</span>
          </button>
        </div>
      </div>

      {/* Highlights: Highest Pollution vs Cleanest Regions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highest Pollution Ranking */}
        <div className="bg-gradient-to-br from-amber-50/70 via-white to-red-50/30 rounded-2xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">오염도 주의 지역 순위 (상위 3개소)</h2>
              <p className="text-[11px] text-slate-500">현재 {metricLabel} 농도가 가장 높은 지역</p>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {highestRegions.map((reg, idx) => {
              const theme = GRADE_THEMES[metric === 'pm10' ? reg.pm10Grade : (metric === 'pm25' ? reg.pm25Grade : reg.grade)];
              return (
                <div
                  key={reg.sidoName}
                  onClick={() => onSelectSido(reg.sidoName)}
                  className="bg-white/90 p-3 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{reg.sidoName}</span>
                      <span className="text-[11px] text-slate-500 ml-2">측정소 {reg.stationCount}개</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">
                      {reg[metric]} <span className="text-xs font-normal text-slate-500">{metricUnit}</span>
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${theme.badgeBg}`}>
                      {theme.grade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cleanest Regions */}
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-cyan-50/30 rounded-2xl border border-blue-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">청정 쾌적 지역 순위 (상위 3개소)</h2>
              <p className="text-[11px] text-slate-500">현재 {metricLabel} 농도가 가장 낮고 쾌적한 지역</p>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {cleanestRegions.map((reg, idx) => {
              const theme = GRADE_THEMES[metric === 'pm10' ? reg.pm10Grade : (metric === 'pm25' ? reg.pm25Grade : reg.grade)];
              return (
                <div
                  key={reg.sidoName}
                  onClick={() => onSelectSido(reg.sidoName)}
                  className="bg-white/90 p-3 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{reg.sidoName}</span>
                      <span className="text-[11px] text-slate-500 ml-2">측정소 {reg.stationCount}개</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">
                      {reg[metric]} <span className="text-xs font-normal text-slate-500">{metricUnit}</span>
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${theme.badgeBg}`}>
                      {theme.grade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart.js Bar Chart */}
      <RegionalBarChart
        items={sortedItems}
        metric={metric}
        onSelectSido={onSelectSido}
      />

      {/* 17 Sidos Detailed Grid Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              전국 시·도별 종합 대기질 카드 ({sortedItems.length}개 지역)
            </h3>
            <p className="text-xs text-slate-500">
              카드를 클릭하면 해당 지역의 측정소별 상세 대시보드로 이동합니다.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">기준 시각: {updatedAt}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sortedItems.map((item, idx) => {
            const currentTheme = GRADE_THEMES[item.grade] || GRADE_THEMES['보통'];
            return (
              <div
                key={item.sidoName}
                onClick={() => onSelectSido(item.sidoName)}
                className="group relative p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{item.sidoName}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${currentTheme.badgeBg}`}>
                      {item.grade}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">PM10:</span>
                      <span className="font-semibold text-slate-800">{item.pm10} ㎍/㎥</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">PM2.5:</span>
                      <span className="font-semibold text-slate-800">{item.pm25} ㎍/㎥</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">통합(KHAI):</span>
                      <span className="font-bold text-blue-600">{item.khai}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>상세 보기</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
