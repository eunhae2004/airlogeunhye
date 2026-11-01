import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { ApiKeyModal } from './components/common/ApiKeyModal';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { RegionalComparison } from './components/comparison/RegionalComparison';
import { ForecastPage } from './components/forecast/ForecastPage';
import { 
  airService, 
  ApiStatusResponse, 
  SidoRealtimeResponse, 
  NationwideResponse, 
  ForecastResponse 
} from './services/airService';
import { AirStationData, SidoAirSummary, AirForecastData } from './types/air';
import { storageService } from './services/firebaseConfig';
import { Wind, ShieldAlert, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'comparison' | 'forecast'>('dashboard');
  const [apiStatus, setApiStatus] = useState<ApiStatusResponse | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [selectedSido, setSelectedSido] = useState<string>('서울');
  const [selectedStationName, setSelectedStationName] = useState<string>('');
  const [stations, setStations] = useState<AirStationData[]>([]);
  const [nationwideItems, setNationwideItems] = useState<SidoAirSummary[]>([]);
  const [forecastData, setForecastData] = useState<AirForecastData | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState('');
  const [isTestData, setIsTestData] = useState(true);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  // Fetch API status
  const fetchStatus = useCallback(async () => {
    try {
      const status = await airService.getStatus();
      setApiStatus(status);
      setIsTestData(status.isTestData);
      if (status.notice) {
        setTestNotice(status.notice);
      }
    } catch {
      setIsTestData(true);
    }
  }, []);

  // Fetch Sido Realtime data
  const fetchSidoData = useCallback(async (sido: string) => {
    try {
      const res = await airService.getSidoRealtime(sido);
      if (res.success && res.items) {
        setStations(res.items);
        setUpdatedAt(res.updatedAt);
        setIsTestData(res.isTestData);
        if (res.testNotice) {
          setTestNotice(res.testNotice);
        }
        // Keep selected station if exists in new list, else pick first
        setSelectedStationName((prev) => {
          const match = res.items.find((st) => st.stationName === prev);
          return match ? prev : (res.items[0]?.stationName || '');
        });
      }
    } catch (err) {
      console.error('Failed to load sido data:', err);
    }
  }, []);

  // Fetch Nationwide data
  const fetchNationwideData = useCallback(async () => {
    try {
      const res = await airService.getNationwide();
      if (res.success && res.items) {
        setNationwideItems(res.items);
        if (res.updatedAt) setUpdatedAt(res.updatedAt);
      }
    } catch (err) {
      console.error('Failed to load nationwide data:', err);
    }
  }, []);

  // Fetch Forecast data
  const fetchForecastData = useCallback(async () => {
    try {
      const res = await airService.getForecast();
      if (res.success) {
        setForecastData({
          dataTime: res.updatedAt,
          items: res.items,
          actionKnack: res.actionKnack,
        });
      }
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchStatus();
      await Promise.all([
        fetchSidoData(selectedSido),
        fetchNationwideData(),
        fetchForecastData(),
      ]);
      setIsLoading(false);
    };

    init();
  }, [fetchStatus, fetchSidoData, fetchNationwideData, fetchForecastData, selectedSido]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchStatus(),
      fetchSidoData(selectedSido),
      fetchNationwideData(),
      fetchForecastData(),
    ]);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleSelectSido = (sido: string) => {
    setSelectedSido(sido);
    fetchSidoData(sido);
    // If user clicked from comparison page, navigate to dashboard
    if (activeTab === 'comparison') {
      setActiveTab('dashboard');
    }
  };

  const userPrefs = storageService.getUserData();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        apiStatus={apiStatus}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        updatedAt={updatedAt || '실시간'}
        bookmarkCount={userPrefs.favoriteSidos.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center animate-pulse">
              <Wind className="w-6 h-6 animate-spin" />
            </div>
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-800">에어코리아 대기질 데이터 수신 중</h2>
              <p className="text-xs text-slate-500 mt-1">
                실시간 측정망 및 시도별 대기오염 분석 정보를 구성하고 있습니다...
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <MainDashboard
                selectedSido={selectedSido}
                onSelectSido={handleSelectSido}
                stations={stations}
                selectedStationName={selectedStationName}
                onSelectStation={setSelectedStationName}
                isLoading={isLoading}
                isTestData={isTestData}
                testNotice={testNotice}
                updatedAt={updatedAt}
                onOpenKeyModal={() => setIsKeyModalOpen(true)}
              />
            )}

            {activeTab === 'comparison' && (
              <RegionalComparison
                items={nationwideItems}
                onSelectSido={handleSelectSido}
                updatedAt={updatedAt}
              />
            )}

            {activeTab === 'forecast' && (
              <ForecastPage
                forecastData={forecastData}
                updatedAt={updatedAt}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">AIRLOG (에어로그)</span>
              <span>·</span>
              <span>데이터 출처: 환경부 한국환경공단(에어코리아) 공공데이터포털</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              공공데이터포털 대기오염정보 OpenAPI를 기반으로 제작된 실시간 대기환경 분석 플랫폼입니다.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="text-blue-600 hover:underline font-semibold"
            >
              API 인증키 연동 관리
            </button>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-400">
              반응형 웹 디자인 & Chart.js 시각화
            </span>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiStatus={apiStatus}
        onStatusUpdated={handleRefresh}
      />
    </div>
  );
}
