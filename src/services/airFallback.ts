import { AirForecastData, AirStationData, SidoAirSummary } from '../types/air';

export const SIDO_LIST = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

export const STATIONS_BY_SIDO: Record<string, string[]> = {
  서울: ['종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구', '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구'],
  부산: ['광복동', '초량동', '태종대', '전포동', '온천동', '명지동', '덕천동', '기장읍', '해운대'],
  대구: ['수창동', '이현동', '대명동', '노원동', '만촌동', '신암동', '지산동', '태전동'],
  인천: ['신흥', '송림', '구월', '부평', '연희', '송도', '영종', '청라', '강화'],
  광주: ['서석동', '농성동', '두암동', '건국동', '송정동', '평동', '오선동'],
  대전: ['읍내동', '문평동', '봉산동', '구성동', '노은동', '정림동', '둔산동'],
  울산: ['신정동', '야음동', '무거동', '전하동', '남목동', '화봉동', '상북면'],
  세종: ['신흥동', '보람동', '아름동', '부강면'],
  경기: ['수원', '성남', '고양', '용인', '부천', '안산', '남양주', '안양', '평택', '화성', '의정부', '파주', '시흥', '김포', '광명', '하남'],
  강원: ['춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '평창'],
  충북: ['청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양'],
  충남: ['천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안'],
  전북: ['전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안'],
  전남: ['목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'],
  경북: ['포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉'],
  경남: ['창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천'],
  제주: ['이도동', '연동', '대정읍', '동홍동', '성산읍'],
};

export function getClientFormattedNow(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:00`;
}

function calculateGrade(val: number, type: 'pm10' | 'pm25' | 'o3' | 'khai'): '좋음' | '보통' | '나쁨' | '매우나쁨' {
  if (type === 'pm10') {
    if (val <= 30) return '좋음';
    if (val <= 80) return '보통';
    if (val <= 150) return '나쁨';
    return '매우나쁨';
  }
  if (type === 'pm25') {
    if (val <= 15) return '좋음';
    if (val <= 35) return '보통';
    if (val <= 75) return '나쁨';
    return '매우나쁨';
  }
  if (type === 'o3') {
    if (val <= 0.030) return '좋음';
    if (val <= 0.090) return '보통';
    if (val <= 0.150) return '나쁨';
    return '매우나쁨';
  }
  if (val <= 50) return '좋음';
  if (val <= 100) return '보통';
  if (val <= 250) return '나쁨';
  return '매우나쁨';
}

export function getClientSidoSimulation(sido: string): AirStationData[] {
  const stations = STATIONS_BY_SIDO[sido] || ['중앙측정소'];
  const nowStr = getClientFormattedNow();
  const hash = sido.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hour = new Date().getHours();
  const diurnal = Math.sin((hour - 6) / 24 * Math.PI * 2) * 8;

  return stations.map((st, idx) => {
    const sHash = (hash + idx * 17) % 30;
    const pm10 = Math.max(12, Math.round(38 + (sHash - 10) + diurnal));
    const pm25 = Math.max(7, Math.round(pm10 * 0.52 + (idx % 5)));
    const o3 = Number((0.025 + ((sHash % 20) / 1000) + Math.max(0, Math.sin((hour - 12) / 12 * Math.PI) * 0.03)).toFixed(3));
    const no2 = Number((0.015 + ((sHash % 15) / 1000)).toFixed(3));
    const co = Number((0.4 + ((sHash % 5) / 10)).toFixed(1));
    const so2 = Number((0.003 + ((sHash % 3) / 1000)).toFixed(3));
    const khai = Math.round(Math.max(pm10 * 1.1, pm25 * 2.3, o3 * 1000));

    return {
      stationName: st,
      sidoName: sido,
      dataTime: nowStr,
      pm10Value: pm10,
      pm25Value: pm25,
      o3Value: o3,
      no2Value: no2,
      coValue: co,
      so2Value: so2,
      khaiValue: khai,
      khaiGrade: calculateGrade(khai, 'khai'),
      pm10Grade: calculateGrade(pm10, 'pm10'),
      pm25Grade: calculateGrade(pm25, 'pm25'),
      o3Grade: calculateGrade(o3, 'o3'),
    };
  });
}

export function getClientNationwideSimulation(): SidoAirSummary[] {
  return SIDO_LIST.map((sido) => {
    const list = getClientSidoSimulation(sido);
    const avgPm10 = Math.round(list.reduce((a, b) => a + (b.pm10Value || 0), 0) / list.length);
    const avgPm25 = Math.round(list.reduce((a, b) => a + (b.pm25Value || 0), 0) / list.length);
    const avgO3 = Number((list.reduce((a, b) => a + (b.o3Value || 0), 0) / list.length).toFixed(3));
    const avgNo2 = Number((list.reduce((a, b) => a + (b.no2Value || 0), 0) / list.length).toFixed(3));
    const avgKhai = Math.round(list.reduce((a, b) => a + (b.khaiValue || 0), 0) / list.length);

    return {
      sidoName: sido,
      sidoEnName: sido,
      stationCount: list.length,
      pm10: avgPm10,
      pm25: avgPm25,
      o3: avgO3,
      no2: avgNo2,
      khai: avgKhai,
      grade: calculateGrade(avgKhai, 'khai'),
      pm10Grade: calculateGrade(avgPm10, 'pm10'),
      pm25Grade: calculateGrade(avgPm25, 'pm25'),
      o3Grade: calculateGrade(avgO3, 'o3'),
      dataTime: getClientFormattedNow(),
    };
  });
}

export function getClientForecastSimulation(): AirForecastData {
  const today = new Date();
  const formatDate = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return {
      date: `${d.getFullYear()}.${mm}.${dd}`,
      dayLabel: (offset === 0 ? '오늘' : offset === 1 ? '내일' : '모레') + ` (${dayNames[d.getDay()]})`,
    };
  };

  const regionalDefault: Record<string, '좋음' | '보통' | '나쁨' | '매우나쁨'> = {
    서울: '보통',
    인천: '보통',
    경기북부: '보통',
    경기남부: '나쁨',
    강원영서: '보통',
    강원영동: '좋음',
    대전: '보통',
    세종: '보통',
    충남: '나쁨',
    충북: '보통',
    광주: '보통',
    전북: '나쁨',
    전남: '보통',
    부산: '좋음',
    대구: '보통',
    울산: '좋음',
    경북: '보통',
    경남: '좋음',
    제주: '좋음',
  };

  const day0 = formatDate(0);
  const day1 = formatDate(1);
  const day2 = formatDate(2);

  return {
    dataTime: getClientFormattedNow(),
    items: [
      {
        date: day0.date,
        dayLabel: day0.dayLabel,
        pm10Grade: '보통',
        pm25Grade: '보통',
        o3Grade: '보통',
        cause: '대기 정체로 전일 잔류 미세먼지가 축적되고 서풍 기류를 타고 유입되는 국외 미세먼지의 영향으로 서쪽 지역을 중심으로 농도가 다소 높을 것으로 예상됩니다.',
        overall: '전 권역이 [보통] 수준으로 예상되나, 수도권·충남·전북은 오전에 일시적으로 [나쁨] 수준을 보이겠습니다.',
        regionalGrades: { ...regionalDefault },
      },
      {
        date: day1.date,
        dayLabel: day1.dayLabel,
        pm10Grade: '좋음',
        pm25Grade: '보통',
        o3Grade: '좋음',
        cause: '원활한 대기 확산과 북서풍 유입으로 대기 상태가 대체로 청정할 것으로 전망됩니다. 오후부터 남부지방을 중심으로 대기질이 크게 개선되겠습니다.',
        overall: '전국 대부분 지역이 [좋음] ~ [보통] 수준을 나타낼 것으로 전망됩니다.',
        regionalGrades: { ...regionalDefault, 서울: '좋음', 인천: '좋음', 충남: '보통' },
      },
      {
        date: day2.date,
        dayLabel: day2.dayLabel,
        pm10Grade: '보통',
        pm25Grade: '보통',
        o3Grade: '보통',
        cause: '고기압 영향권에서 대기 흐름이 완만해지며 중서부 지역을 중심으로 국내 발생 미세먼지가 정체되어 다소 축적되겠습니다.',
        overall: '대부분 권역이 [보통] 수준을 유지할 것으로 예상됩니다.',
        regionalGrades: { ...regionalDefault },
      },
    ],
    actionKnack: {
      general: [
        '외출 후 손, 발, 얼굴을 깨끗이 씻고 물을 충분히 섭취하세요.',
        '미세먼지 농도가 높을 때는 무리한 실외 운동을 피하세요.',
        '외출 시 KF80 이상의 보건용 마스크 착용을 권장합니다.',
      ],
      vulnerable: [
        '어린이, 어르신, 호흡기·심혈관 질환자는 실외 활동을 제한하세요.',
        '외출이 불가피할 경우 의사와 상담 후 활동 강도를 조절하세요.',
        '호흡기 증상(기침, 목 통증 등) 발생 시 즉시 실내로 이동하세요.',
      ],
      ventilation: [
        '대기질이 [좋음]~[보통]일 때 하루 3번, 30분 이상 맞통풍 환기를 실시하세요.',
        '대기질 [나쁨] 시에는 장시간 자연 환기를 자제하고 공기청정기 가동을 권장합니다.',
        '조리(생선·고기 굽기) 후에는 미세먼지 수치와 관계없이 주방 후드와 함께 즉시 10분 이상 환기하세요.',
      ],
      outdoorActivity: [
        '대기오염물질 배출이 많은 교통 체증 구역, 공사장 인근 활동을 최소화하세요.',
        '자전거 등 격렬한 유산소 운동은 실내 체육 시설 이용을 권장합니다.',
      ],
    },
  };
}
