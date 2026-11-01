import React, { useState } from 'react';
import { AirForecastData, ForecastDayItem } from '../../types/air';
import { GRADE_THEMES } from '../../utils/airQuality';
import { 
  Calendar, 
  Wind, 
  CloudSun, 
  AlertCircle, 
  HeartHandshake, 
  DoorOpen, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface ForecastPageProps {
  forecastData: AirForecastData | null;
  updatedAt: string;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  forecastData,
  updatedAt,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const items = forecastData?.items || [];
  const currentItem: ForecastDayItem | undefined = items[selectedDayIndex] || items[0];
  const actionKnack = forecastData?.actionKnack;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">대기질 예보 및 국민행동요령</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold border border-cyan-200">
              환경부·국립환경과학원
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            미세먼지, 초미세먼지, 오존의 3일간 대기질 전망 및 원인 분석 정보를 제공합니다.
          </p>
        </div>

        {/* Forecast Day Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {items.map((item, idx) => (
            <button
              key={item.date}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                selectedDayIndex === idx
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.dayLabel}
            </button>
          ))}
        </div>
      </div>

      {currentItem && (
        <>
          {/* Main Forecast Overview for Selected Day */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PM10 Forecast */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">미세먼지 예보</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${GRADE_THEMES[currentItem.pm10Grade]?.badgeBg}`}>
                    {currentItem.pm10Grade}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">PM10 대기질 전망</span>
                <p className="text-sm font-semibold text-slate-800 mt-3">
                  {GRADE_THEMES[currentItem.pm10Grade]?.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>예보 기준일: {currentItem.date}</span>
              </div>
            </div>

            {/* PM2.5 Forecast */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">초미세먼지 예보</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${GRADE_THEMES[currentItem.pm25Grade]?.badgeBg}`}>
                    {currentItem.pm25Grade}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">PM2.5 대기질 전망</span>
                <p className="text-sm font-semibold text-slate-800 mt-3">
                  {GRADE_THEMES[currentItem.pm25Grade]?.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span>예보 기준일: {currentItem.date}</span>
              </div>
            </div>

            {/* O3 Forecast */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">오존 예보</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${GRADE_THEMES[currentItem.o3Grade]?.badgeBg}`}>
                    {currentItem.o3Grade}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">O₃ 대기질 전망</span>
                <p className="text-sm font-semibold text-slate-800 mt-3">
                  오후 일사량과 기온에 따라 일시적 농도 변화가 있을 수 있습니다.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>예보 기준일: {currentItem.date}</span>
              </div>
            </div>
          </div>

          {/* Forecast Analysis & Meteorological Causes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Meteorological Cause Analysis (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Wind className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">발생 원인 및 기상 분석 통보문</h3>
              </div>

              <div className="space-y-3 mt-4 text-xs leading-relaxed">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <strong className="block text-slate-900 font-semibold mb-1">
                    [종합 예보 개황]
                  </strong>
                  <p className="text-slate-700">{currentItem.overall}</p>
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80">
                  <strong className="block text-blue-950 font-semibold mb-1">
                    [기상 및 대기오염 발생 원인 분석]
                  </strong>
                  <p className="text-blue-900">{currentItem.cause}</p>
                </div>
              </div>
            </div>

            {/* Regional Breakdown Grid (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <CloudSun className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">권역별 예보 등급</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 max-h-56 overflow-y-auto pr-1">
                {Object.entries(currentItem.regionalGrades || {}).map(([region, grade]) => {
                  const theme = GRADE_THEMES[grade] || GRADE_THEMES['보통'];
                  return (
                    <div
                      key={region}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-800">{region}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${theme.badgeBg}`}>
                        {grade}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Guide: 대기질에 따른 국민행동요령 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">대기질에 따른 상황별 맞춤 행동요령</h2>
            <p className="text-xs text-slate-500">환경부·국립환경과학원 표준 건강보호 수칙</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Public */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              일반인 행동요령
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              {actionKnack?.general.map((text, idx) => (
                <li key={idx}>{text}</li>
              ))}
            </ul>
          </div>

          {/* Vulnerable Groups */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              어린이·어르신·호흡기 질환자 (민감군)
            </h3>
            <ul className="text-xs text-amber-900/90 space-y-1.5 list-disc pl-4">
              {actionKnack?.vulnerable.map((text, idx) => (
                <li key={idx}>{text}</li>
              ))}
            </ul>
          </div>

          {/* Ventilation & Indoor Clean Air */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
              <DoorOpen className="w-3.5 h-3.5 text-emerald-700" />
              실내 환기 및 공기 정화 수칙
            </h3>
            <ul className="text-xs text-emerald-900/90 space-y-1.5 list-disc pl-4">
              {actionKnack?.ventilation.map((text, idx) => (
                <li key={idx}>{text}</li>
              ))}
            </ul>
          </div>

          {/* Outdoor activity */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              야외 활동 및 마스크 착용 가이드
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              {actionKnack?.outdoorActivity.map((text, idx) => (
                <li key={idx}>{text}</li>
              ))}
              <li>식약처 인증 KF80, KF94, KF99 보건용 마스크를 코와 턱에 밀착하여 착용하세요.</li>
            </ul>
          </div>
        </div>

        {/* Warning Criteria Table */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 mb-2">
            미세먼지 경보 발령 기준 안내 (환경부 고시)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="py-2 px-3 border-b border-slate-200">구분</th>
                  <th className="py-2 px-3 border-b border-slate-200">주의보 발령 기준</th>
                  <th className="py-2 px-3 border-b border-slate-200">경보 발령 기준</th>
                  <th className="py-2 px-3 border-b border-slate-200">해제 기준</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">미세먼지 (PM10)</td>
                  <td className="py-2 px-3">시간당 평균 농도 150 ㎍/㎥ 이상 2시간 지속</td>
                  <td className="py-2 px-3">시간당 평균 농도 300 ㎍/㎥ 이상 2시간 지속</td>
                  <td className="py-2 px-3">주의보: 100 ㎍/㎥ 미만 / 경보: 150 ㎍/㎥ 미만</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">초미세먼지 (PM2.5)</td>
                  <td className="py-2 px-3">시간당 평균 농도 75 ㎍/㎥ 이상 2시간 지속</td>
                  <td className="py-2 px-3">시간당 평균 농도 150 ㎍/㎥ 이상 2시간 지속</td>
                  <td className="py-2 px-3">주의보: 35 ㎍/㎥ 미만 / 경보: 75 ㎍/㎥ 미만</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">오존 (O₃)</td>
                  <td className="py-2 px-3">시간당 농도 0.120 ppm 이상</td>
                  <td className="py-2 px-3">시간당 농도 0.300 ppm 이상</td>
                  <td className="py-2 px-3">주의보: 0.120 ppm 미만 시 해제</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
