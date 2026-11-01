import { AirGrade } from '../types/air';

export interface GradeTheme {
  grade: AirGrade;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  lightBg: string;
  accentBg: string;
  icon: string;
  summary: string;
}

export const GRADE_THEMES: Record<AirGrade, GradeTheme> = {
  좋음: {
    grade: '좋음',
    label: '좋음',
    color: '#2563eb', // Clean Royal Blue
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-400',
    lightBg: 'bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30',
    accentBg: 'bg-blue-600',
    icon: 'smile',
    summary: '공기가 맑고 쾌적하여 야외 활동에 적합합니다.',
  },
  보통: {
    grade: '보통',
    label: '보통',
    color: '#059669', // Emerald
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-400',
    lightBg: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30',
    accentBg: 'bg-emerald-600',
    icon: 'check',
    summary: '일상적인 야외 활동에 큰 지장이 없는 무난한 상태입니다.',
  },
  나쁨: {
    grade: '나쁨',
    label: '나쁨',
    color: '#ea580c', // Orange Amber
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeText: 'text-amber-800',
    borderColor: 'border-amber-400',
    lightBg: 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30',
    accentBg: 'bg-amber-600',
    icon: 'alert-triangle',
    summary: '민감군은 장시간 무리한 실외 활동을 자제하고 마스크를 챙기세요.',
  },
  매우나쁨: {
    grade: '매우나쁨',
    label: '매우나쁨',
    color: '#dc2626', // Red
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    badgeText: 'text-red-700',
    borderColor: 'border-red-400',
    lightBg: 'bg-gradient-to-br from-red-50/80 via-white to-red-50/30',
    accentBg: 'bg-red-600',
    icon: 'alert-octagon',
    summary: '외출을 최대한 자제하고 창문을 닫으며 실내 공기청정기를 가동하세요.',
  },
  정보없음: {
    grade: '정보없음',
    label: '측정중',
    color: '#64748b',
    badgeBg: 'bg-slate-100 text-slate-600 border-slate-200',
    badgeText: 'text-slate-600',
    borderColor: 'border-slate-300',
    lightBg: 'bg-white',
    accentBg: 'bg-slate-500',
    icon: 'help-circle',
    summary: '측정소 점검 또는 데이터 수신 대기 상태입니다.',
  },
};

export const SIDO_LIST = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

export function getPollutantUnit(key: string): string {
  switch (key) {
    case 'pm10':
    case 'pm25':
      return '㎍/㎥';
    case 'o3':
    case 'no2':
    case 'so2':
      return 'ppm';
    case 'co':
      return 'ppm';
    default:
      return '';
  }
}

export function getPollutantKorean(key: string): string {
  switch (key) {
    case 'pm10':
      return '미세먼지 (PM10)';
    case 'pm25':
      return '초미세먼지 (PM2.5)';
    case 'o3':
      return '오존 (O₃)';
    case 'no2':
      return '이산화질소 (NO₂)';
    case 'co':
      return '일산화탄소 (CO)';
    case 'so2':
      return '아황산가스 (SO₂)';
    case 'khai':
      return '통합대기환경지수 (KHAI)';
    default:
      return key;
  }
}
