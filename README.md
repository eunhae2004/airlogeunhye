# AIRLOG (에어로그) 🌬️
> 한국환경공단 에어코리아(AirKorea) 대기오염정보 OpenAPI 기반 실시간 대기질 분석 포털

AIRLOG는 전국 17개 시·도 및 세부 측정소의 실시간 대기오염 데이터(PM10, PM2.5, O₃, NO₂, CO, SO₂)를 수집·가공하여 직관적인 대시보드와 Chart.js 그래프, 대기질 예보를 제공하는 현대적인 웹 서비스입니다.

---

## 🚀 GitHub 배포 가이드

본 프로젝트는 **GitHub Pages(정적 프론트엔드 무료 호스팅)** 및 **Vercel / Render(풀스택 무료 호스팅)** 두 가지 방식으로 모두 배포할 수 있도록 구성되어 있습니다.

---

### 방법 1. GitHub Pages로 배포하기 (가장 간편한 방법, 완전 무료)

이미 `.github/workflows/deploy.yml` 파일이 세팅되어 있어 GitHub에 코드를 푸시하고 클릭 한 번이면 자동으로 배포됩니다!

#### 1단계: GitHub 새 저장소(Repository) 생성
1. [GitHub](https://github.com)에 로그인 후 **New Repository**를 생성합니다. (예: `airlog`)
2. 터미널에서 프로젝트 코드를 GitHub 저장소에 푸시합니다:
   ```bash
   git init
   git add .
   git commit -m "feat: Initial commit for AIRLOG"
   git branch -M main
   git remote add origin https://github.com/<본인-GitHub-아이디>/<저장소명>.git
   git push -u origin main
   ```

#### 2단계: GitHub Pages 활성화
1. GitHub 저장소 페이지의 상단 메뉴에서 **Settings** 클릭
2. 좌측 메뉴의 **Pages** 클릭
3. **Build and deployment > Source** 옵션을 **`GitHub Actions`** 로 선택
4. 상단 **Actions** 탭으로 이동하면 `Deploy AIRLOG to GitHub Pages` 워크플로우가 자동으로 실행되어 빌드 & 배포됩니다 (약 1~2분 소요).
5. 배포 완료 후 `https://<본인-GitHub-아이디>.github.io/<저장소명>/` 주소로 접속하면 즉시 실행됩니다!

> 💡 **안내**: GitHub Pages 환경에서는 백엔드 노드 서버가 없는 정적 호스팅이므로 기본적으로 시뮬레이션 모드로 매끄럽게 동작하며, 상단 [API 설정] 모달을 통해 공공데이터 API 키를 테스트할 수 있습니다.

---

### 방법 2. 풀스택 클라우드로 배포하기 (백엔드 API 프록시 완전 지원)

API 키를 서버 환경변수(`AIRKOREA_API_KEY`)로 완전히 은닉하고 실제 공공데이터포털 실시간 API를 상시 호출하고 싶다면 GitHub 저장소와 연동되는 무료 호스팅 서비스를 추천합니다.

#### Render.com 배포:
1. [Render](https://render.com) 가입 후 **New > Web Service** 선택
2. 앞서 생성한 GitHub 저장소 연동
3. 설정값 입력:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `AIRKOREA_API_KEY`: 공공데이터포털에서 발급받은 일반 인증키 입력
4. **Deploy Web Service** 클릭 시 배포 완료!

---

## 🛠️ 로컬 개발 환경 실행

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 환경변수 설정 (.env 파일 생성)
cp .env.example .env
# .env 파일에 AIRKOREA_API_KEY="" 입력 (미입력 시 자동으로 시뮬레이션 모드 작동)

# 3. 풀스택 개발 서버 실행 (포트 3000)
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

---

## 🔑 공공데이터포털 API 인증키 발급 방법

1. [공공데이터포털(data.go.kr)](https://www.data.go.kr/) 회원가입 및 로그인
2. **[한국환경공단_에어코리아_대기오염정보]** 검색 후 **활용신청** (자동 승인)
3. **마이페이지 > 개발계정**에서 **일반 인증키 (Encoding 또는 Decoding)** 복사
4. AIRLOG 웹 화면 상단 **[API 설정]** 모달에 붙여넣기 하면 실시간 데이터로 즉시 전환됩니다.

---

## 📱 주요 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion
- **Visualization**: Chart.js, react-chartjs-2
- **Backend / Proxy**: Express, tsx, Node.js
- **Icons**: Lucide React
- **Architecture**: Firebase / LocalStorage Ready Service Layer
