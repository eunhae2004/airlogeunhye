export type AirGrade = '좋음' | '보통' | '나쁨' | '매우나쁨' | '정보없음';

export interface AirStationData {
  stationName: string;
  sidoName: string;
  dataTime: string;
  pm10Value: number | null;
  pm25Value: number | null;
  o3Value: number | null;
  no2Value: number | null;
  coValue: number | null;
  so2Value: number | null;
  khaiValue: number | null;
  khaiGrade: AirGrade;
  pm10Grade: AirGrade;
  pm25Grade: AirGrade;
  o3Grade: AirGrade;
  no2Grade?: AirGrade;
  coGrade?: AirGrade;
  so2Grade?: AirGrade;
}

export interface SidoAirSummary {
  sidoName: string;
  sidoEnName: string;
  stationCount: number;
  pm10: number;
  pm25: number;
  o3: number;
  no2: number;
  khai: number;
  grade: AirGrade;
  pm10Grade: AirGrade;
  pm25Grade: AirGrade;
  o3Grade: AirGrade;
  dataTime: string;
}

export interface ForecastDayItem {
  date: string;
  dayLabel: string;
  pm10Grade: AirGrade;
  pm25Grade: AirGrade;
  o3Grade: AirGrade;
  cause: string;
  overall: string;
  regionalGrades: Record<string, AirGrade>;
}

export interface AirForecastData {
  dataTime: string;
  items: ForecastDayItem[];
  actionKnack: {
    general: string[];
    vulnerable: string[];
    ventilation: string[];
    outdoorActivity: string[];
  };
}

export interface AirApiResponse<T> {
  success: boolean;
  isTestData: boolean;
  message?: string;
  testNotice?: string;
  updatedAt: string;
  data: T;
}

export interface StationHistoryPoint {
  time: string;
  pm10: number;
  pm25: number;
  o3: number;
  khai: number;
}

export interface UserPreferences {
  favoriteSidos: string[];
  favoriteStations: string[];
  alertThreshold: '보통' | '나쁨' | '매우나쁨';
  tempUnit: 'C';
}
