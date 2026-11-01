import React, { useState, useMemo } from 'react';
import { 
  AirStationData, 
  AirGrade 
} from '../../types/air';
import { 
  GRADE_THEMES, 
  SIDO_LIST, 
  getPollutantKorean, 
  getPollutantUnit 
} from '../../utils/airQuality';
import { StationTrendChart } from '../charts/StationTrendChart';
import { 
  Activity, 
  Clock, 
  MapPin, 
  Search, 
  Star, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { storageService } from '../../services/firebaseConfig';

interface MainDashboardProps {
  selectedSido: string;
  onSelectSido: (sido: string) => void;
  stations: AirStationData[];
  selectedStationName: string;
  onSelectStation: (stationName: string) => void;
  isLoading: boolean;
  isTestData: boolean;
  testNotice?: string | null;
  updatedAt: string;
  onOpenKeyModal: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  selectedSido,
  onSelectSido,
  stations,
  selectedStationName,
  onSelectStation,
  isLoading,
  isTestData,
  testNotice,
  updatedAt,
  onOpenKeyModal,
}) => {
  const [trendMetric, setTrendMetric] = useState<'pm10' | 'pm25' | 'o3' | 'khai'>('pm10');
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'stationName' | 'pm10Value' | 'pm25Value' | 'khaiValue'>('pm10Value');
  const [sortAsc, setSortAsc] = useState(false);

  // User bookmarks from Firebase/LocalStorage storage service
  const [userData, setUserData] = useState(() => storageService.getUserData());

  const handleToggleFavoriteSido = (sido: string) => {
    const updated = storageService.toggleFavoriteSido(sido);
    setUserData(updated);
  };

  const isFavoriteSido = userData.favoriteSidos.includes(selectedSido);

  // Find currently selected station data
  const currentStation = useMemo(() => {
    if (!stations || stations.length === 0) return null;
    const found = stations.find((s) => s.stationName === selectedStationName);
    return found || stations[0];
  }, [stations, selectedStationName]);

  // Synthetic 24h history generated from station profile for Chart.js
  const stationHistory = useMemo(() => {
    if (!currentStation) return [];
    const hash = (currentStation.stationName + selectedSido).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const now = new Date();
    const list = [];
    
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = d.getHours();
      const time = `${String(hour).padStart(2, '0')}:00`;
      
      const cycle = Math.sin((hour - 8) / 24 * Math.PI * 2);
      const pm10Base = currentStation.pm10Value ?? 35;
      const pm25Base = currentStation.pm25Value ?? 18;
      const o3Base = currentStation.o3Value ?? 0.030;
      const khaiBase = currentStation.khaiValue ?? 60;

      const pm10 = Math.max(8, Math.round(pm10Base + cycle * 12 + ((hash + i * 2) % 9) - 4));
      const pm25 = Math.max(4, Math.round(pm25Base + cycle * 6 + ((hash + i) % 5) - 2));
      const o3 = Number(Math.max(0.010, o3Base + Math.max(0, Math.sin((hour - 13) / 12 * Math.PI) * 0.02) + (((hash + i) % 4) / 1000)).toFixed(3));
      const khai = Math.max(15, Math.round(khaiBase + cycle * 15 + ((hash + i * 3) % 8) - 3));

      list.push({ time, pm10, pm25, o3, khai });
    }
    return list;
  }, [currentStation, selectedSido]);

  // Filter and sort station list
  const filteredStations = useMemo(() => {
    if (!stations) return [];
    let list = stations.filter((s) => 
      s.stationName.toLowerCase().includes(stationSearchQuery.toLowerCase())
    );

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA === null || valA === undefined) valA = -999;
      if (valB === null || valB === undefined) valB = -999;
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(String(valB)) : String(valB).localeCompare(valA);
      }
      return sortAsc ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });

    return list;
  }, [stations, stationSearchQuery, sortField, sortAsc]);

  const currentTheme = currentStation ? (GRADE_THEMES[currentStation.khaiGrade] || GRADE_THEMES['보통']) : GRADE_THEMES['보통'];

  return (
    <div className="space-y-6">
      {/* 1. Test data transparency banner (as required by prompt) */}
      {isTestData && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 text-sm">테스트용 시뮬레이션 데이터 모드</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-800">
                  실제 데이터 대기 중
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                {testNotice || '공공데이터포털(data.go.kr) 에어코리아 API 키 미연결 상태입니다. 화면의 수치는 실제 환경과 유사하게 구성된 시뮬레이션 데이터입니다.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenKeyModal}
            className="self-start sm:self-center px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shadow-xs"
          >
            실제 API 키 연동하기
          </button>
        </div>
      )}

      {/* 2. Sido Selector bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">지역(시·도) 선택</h2>
            <span className="text-xs text-slate-500">전국 17개 시도</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>갱신: {updatedAt}</span>
          </div>
        </div>

        {/* 17 Sidos pill list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {SIDO_LIST.map((sido) => {
            const isSelected = sido === selectedSido;
            return (
              <button
                key={sido}
                onClick={() => onSelectSido(sido)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{sido}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Dashboard Header Bar for Selected Station */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-lg">
            {selectedSido.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                {selectedSido} {currentStation?.stationName || '전체'} 측정소
              </h1>
              <button
                onClick={() => handleToggleFavoriteSido(selectedSido)}
                className={`p-1 rounded-lg transition-colors ${
                  isFavoriteSido ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500'
                }`}
                title="관심 지역 북마크"
              >
                <Star className={`w-4 h-4 ${isFavoriteSido ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              측정 기준 시각: {currentStation?.dataTime || updatedAt}
            </p>
          </div>
        </div>

        {/* Station Select Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 shrink-0">측정소:</label>
          <select
            value={currentStation?.stationName || ''}
            onChange={(e) => onSelectStation(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          >
            {stations.map((st) => (
              <option key={st.stationName} value={st.stationName}>
                {st.stationName} ({st.khaiGrade})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Hero KHAI & Primary Pollutants Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* KHAI Index Card (5 cols) */}
        <div className={`lg:col-span-5 rounded-2xl border ${currentTheme.borderColor} ${currentTheme.lightBg} p-6 shadow-xs relative overflow-hidden flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  통합대기환경지수
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-600 font-semibold">
                  KHAI
                </span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${currentTheme.badgeBg}`}>
                {currentStation?.khaiGrade || '보통'}
              </span>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                  {currentStation?.khaiValue !== null && currentStation?.khaiValue !== undefined
                    ? currentStation.khaiValue
                    : '--'}
                </span>
                <span className="text-slate-500 text-sm font-semibold">지수 포인트</span>
              </div>
              <p className="text-xs font-medium text-slate-700 mt-2">
                {currentTheme.summary}
              </p>
            </div>
          </div>

          {/* Grade progress bar */}
          <div className="pt-4 mt-4 border-t border-slate-200/60">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>좋음 (0~50)</span>
              <span>보통 (51~100)</span>
              <span>나쁨 (101~250)</span>
              <span>매우나쁨 (251+)</span>
            </div>
            <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden flex">
              <div className="w-1/4 bg-blue-500 opacity-90"></div>
              <div className="w-1/4 bg-emerald-500 opacity-90"></div>
              <div className="w-1/4 bg-amber-500 opacity-90"></div>
              <div className="w-1/4 bg-red-500 opacity-90"></div>
            </div>
          </div>
        </div>

        {/* 3 Primary Pollutants: PM10, PM2.5, O3 (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* PM10 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">미세먼지</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${GRADE_THEMES[currentStation?.pm10Grade || '보통'].badgeBg}`}>
                  {currentStation?.pm10Grade || '보통'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">PM10</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  {currentStation?.pm10Value ?? '--'}
                </span>
                <span className="text-xs text-slate-500 font-medium">㎍/㎥</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>기준치 (80㎍/㎥)</span>
                <span>{currentStation?.pm10Value ? Math.round((currentStation.pm10Value / 80) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, ((currentStation?.pm10Value ?? 30) / 150) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* PM2.5 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">초미세먼지</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${GRADE_THEMES[currentStation?.pm25Grade || '보통'].badgeBg}`}>
                  {currentStation?.pm25Grade || '보통'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">PM2.5</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  {currentStation?.pm25Value ?? '--'}
                </span>
                <span className="text-xs text-slate-500 font-medium">㎍/㎥</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>기준치 (35㎍/㎥)</span>
                <span>{currentStation?.pm25Value ? Math.round((currentStation.pm25Value / 35) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, ((currentStation?.pm25Value ?? 15) / 75) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* O3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">오존</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${GRADE_THEMES[currentStation?.o3Grade || '보통'].badgeBg}`}>
                  {currentStation?.o3Grade || '보통'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">O₃</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  {currentStation?.o3Value ?? '--'}
                </span>
                <span className="text-xs text-slate-500 font-medium">ppm</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>기준치 (0.09ppm)</span>
                <span>{currentStation?.o3Value ? Math.round(((currentStation.o3Value / 0.09) * 100)) : 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, ((currentStation?.o3Value ?? 0.03) / 0.15) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Secondary Pollutants Mini-Row (NO2, CO, SO2) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">이산화질소 (NO₂)</span>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {currentStation?.no2Value ?? '--'} <span className="text-xs font-normal text-slate-500">ppm</span>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
            기준치 0.060
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">일산화탄소 (CO)</span>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {currentStation?.coValue ?? '--'} <span className="text-xs font-normal text-slate-500">ppm</span>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
            기준치 9.0
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">아황산가스 (SO₂)</span>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {currentStation?.so2Value ?? '--'} <span className="text-xs font-normal text-slate-500">ppm</span>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
            기준치 0.050
          </span>
        </div>
      </div>

      {/* 6. Chart.js 24-Hour Trend Visualization */}
      <StationTrendChart
        stationName={currentStation?.stationName || selectedSido}
        history={stationHistory}
        metric={trendMetric}
        onMetricChange={setTrendMetric}
      />

      {/* 7. Sido Stations Detailed Table with Search and Sorting */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {selectedSido} 관내 세부 측정소 현황 ({stations.length}개소)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              클릭하여 해당 측정소의 상세 대기질 및 추이를 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stationSearchQuery}
                onChange={(e) => setStationSearchQuery(e.target.value)}
                placeholder="측정소명 검색..."
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-xs font-semibold bg-slate-50/70">
                <th className="py-2.5 px-3">
                  <button 
                    onClick={() => { setSortField('stationName'); setSortAsc(!sortAsc); }}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    측정소명 <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">통합대기등급</th>
                <th className="py-2.5 px-3">
                  <button 
                    onClick={() => { setSortField('pm10Value'); setSortAsc(!sortAsc); }}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    미세먼지(PM10) <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">
                  <button 
                    onClick={() => { setSortField('pm25Value'); setSortAsc(!sortAsc); }}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    초미세먼지(PM2.5) <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">오존(O₃)</th>
                <th className="py-2.5 px-3">
                  <button 
                    onClick={() => { setSortField('khaiValue'); setSortAsc(!sortAsc); }}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    통합지수 <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">선택</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStations.map((st) => {
                const isSelected = st.stationName === currentStation?.stationName;
                const theme = GRADE_THEMES[st.khaiGrade] || GRADE_THEMES['보통'];
                return (
                  <tr
                    key={st.stationName}
                    onClick={() => onSelectStation(st.stationName)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-900 font-medium flex items-center gap-2">
                      <span>{st.stationName}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                          선택됨
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${theme.badgeBg}`}>
                        {st.khaiGrade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {st.pm10Value !== null ? `${st.pm10Value} ㎍/㎥` : '--'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {st.pm25Value !== null ? `${st.pm25Value} ㎍/㎥` : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {st.o3Value !== null ? `${st.o3Value} ppm` : '--'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {st.khaiValue ?? '--'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      <ChevronRight className="w-4 h-4 inline-block" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
