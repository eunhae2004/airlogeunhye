import { AirForecastData, AirStationData, SidoAirSummary, StationHistoryPoint } from '../types/air';

export interface ApiStatusResponse {
  success: boolean;
  hasApiKey: boolean;
  keySource: 'env' | 'runtime' | 'none';
  isTestData: boolean;
  message: string;
  notice: string | null;
}

export interface SidoRealtimeResponse {
  success: boolean;
  isTestData: boolean;
  testNotice?: string;
  apiError?: string;
  updatedAt: string;
  sidoName: string;
  items: AirStationData[];
}

export interface NationwideResponse {
  success: boolean;
  isTestData: boolean;
  testNotice?: string | null;
  updatedAt: string;
  items: SidoAirSummary[];
}

export interface ForecastResponse {
  success: boolean;
  isTestData: boolean;
  testNotice?: string | null;
  updatedAt: string;
  items: AirForecastData['items'];
  actionKnack: AirForecastData['actionKnack'];
}

export interface StationHistoryResponse {
  success: boolean;
  stationName: string;
  sidoName: string;
  history: StationHistoryPoint[];
}

import {
  getClientFormattedNow,
  getClientForecastSimulation,
  getClientNationwideSimulation,
  getClientSidoSimulation,
} from './airFallback';

class AirService {
  public async getStatus(): Promise<ApiStatusResponse> {
    try {
      const res = await fetch('/api/air/status');
      if (!res.ok) throw new Error('API route not available');
      return await res.json();
    } catch {
      return {
        success: true,
        hasApiKey: false,
        keySource: 'none',
        isTestData: true,
        message: '정적 호스팅 모드 (테스트 시뮬레이션 데이터 동작 중)',
        notice: 'GitHub Pages 정적 호스팅 환경입니다. 테스트용 시뮬레이션 데이터가 표시되며, 백엔드 서버(Render/Vercel)와 연동 시 실시간 공공 API가 지원됩니다.',
      };
    }
  }

  public async setApiKey(apiKey: string): Promise<{ success: boolean; message: string; hasApiKey: boolean }> {
    try {
      const res = await fetch('/api/air/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      if (!res.ok) throw new Error('Failed to set key on server');
      return await res.json();
    } catch {
      return {
        success: true,
        hasApiKey: Boolean(apiKey),
        message: apiKey
          ? '클라이언트 세션에 키가 임시 저장되었습니다.'
          : '테스트 모드로 전환되었습니다.',
      };
    }
  }

  public async getSidoRealtime(sidoName: string): Promise<SidoRealtimeResponse> {
    try {
      const res = await fetch(`/api/air/sido-realtime?sidoName=${encodeURIComponent(sidoName)}`);
      if (!res.ok) throw new Error('Realtime endpoint error');
      return await res.json();
    } catch {
      return {
        success: true,
        isTestData: true,
        testNotice: '정적 호스팅(GitHub Pages) 환경 - 시뮬레이션 대기질 데이터입니다.',
        updatedAt: getClientFormattedNow(),
        sidoName,
        items: getClientSidoSimulation(sidoName),
      };
    }
  }

  public async getNationwide(): Promise<NationwideResponse> {
    try {
      const res = await fetch('/api/air/nationwide');
      if (!res.ok) throw new Error('Nationwide endpoint error');
      return await res.json();
    } catch {
      return {
        success: true,
        isTestData: true,
        testNotice: '정적 호스팅(GitHub Pages) 환경 - 시뮬레이션 전국 데이터입니다.',
        updatedAt: getClientFormattedNow(),
        items: getClientNationwideSimulation(),
      };
    }
  }

  public async getForecast(): Promise<ForecastResponse> {
    try {
      const res = await fetch('/api/air/forecast');
      if (!res.ok) throw new Error('Forecast endpoint error');
      return await res.json();
    } catch {
      const sim = getClientForecastSimulation();
      return {
        success: true,
        isTestData: true,
        testNotice: '정적 호스팅(GitHub Pages) 환경 - 시뮬레이션 예보 데이터입니다.',
        updatedAt: sim.dataTime,
        items: sim.items,
        actionKnack: sim.actionKnack,
      };
    }
  }

  public async getStationHistory(stationName: string, sidoName: string): Promise<StationHistoryResponse> {
    try {
      const res = await fetch(`/api/air/station-history?stationName=${encodeURIComponent(stationName)}&sidoName=${encodeURIComponent(sidoName)}`);
      if (!res.ok) throw new Error('History endpoint error');
      return await res.json();
    } catch {
      // Handled directly inside component or return empty
      return {
        success: true,
        stationName,
        sidoName,
        history: [],
      };
    }
  }
}

export const airService = new AirService();
