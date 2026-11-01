import React from 'react';
import { 
  Wind, 
  RefreshCw, 
  KeyRound, 
  BarChart2, 
  LayoutDashboard, 
  CalendarDays,
  ShieldAlert,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { ApiStatusResponse } from '../../services/airService';

interface HeaderProps {
  activeTab: 'dashboard' | 'comparison' | 'forecast';
  onTabChange: (tab: 'dashboard' | 'comparison' | 'forecast') => void;
  apiStatus: ApiStatusResponse | null;
  onOpenKeyModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  updatedAt: string;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  apiStatus,
  onOpenKeyModal,
  onRefresh,
  isRefreshing,
  updatedAt,
  bookmarkCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">AIRLOG</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  에어코리아 OpenAPI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                한국환경공단 실시간 대기오염 및 지역별 대기질 분석 포털
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              메인 대시보드
            </button>
            <button
              onClick={() => onTabChange('comparison')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'comparison'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              지역별 비교
            </button>
            <button
              onClick={() => onTabChange('forecast')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'forecast'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              대기질 예보·행동요령
            </button>
          </nav>

          {/* Right utility actions */}
          <div className="flex items-center gap-2">
            {/* Status Indicator */}
            {apiStatus?.hasApiKey ? (
              <button
                onClick={onOpenKeyModal}
                className="hidden sm:flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium hover:bg-emerald-100 transition-colors"
                title="공공데이터포털 에어코리아 API 연동 완료"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>공공 API 연동됨</span>
              </button>
            ) : (
              <button
                onClick={onOpenKeyModal}
                className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-medium hover:bg-amber-100 transition-colors animate-pulse"
                title="현재 테스트용 시뮬레이션 데이터 모드입니다. 클릭하여 API 키를 등록할 수 있습니다."
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold">테스트 데이터 모드</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              title="데이터 새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={onOpenKeyModal}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">API 설정</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
              activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> 대시보드
          </button>
          <button
            onClick={() => onTabChange('comparison')}
            className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
              activeTab === 'comparison' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> 지역비교
          </button>
          <button
            onClick={() => onTabChange('forecast')}
            className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
              activeTab === 'forecast' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" /> 예보·행동요령
          </button>
        </div>
      </div>
    </header>
  );
};
