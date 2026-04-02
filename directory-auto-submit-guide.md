# SheetSchedule 디렉토리 자동 등록 프로젝트

## 프로젝트 목적

SheetSchedule이라는 디지털 제품을 다양한 인디 제품 디렉토리 사이트와 커뮤니티에 등록하는 작업을 자동화한다.
현재 수동으로 각 사이트에 접속해서 폼을 채우고 있는데, 사이트마다 폼 구조가 달라서 시간이 많이 걸린다.
Playwright를 사용해서 각 사이트의 제출 페이지를 열고, DOM을 분석해서 적절한 필드에 제품 정보를 자동으로 입력하는 스크립트를 만든다.

## 핵심 아이디어

각 사이트의 폼 구조는 고정 셀렉터가 아니라, Playwright로 페이지 DOM/텍스트를 읽은 뒤
Claude Code가 직접 분석하고 판단해서 어떤 필드에 어떤 값을 넣을지 결정한다.
즉, Claude API를 별도로 호출할 필요 없이, Claude Code 자체가 DOM을 읽고 판단한다.
이렇게 하면 사이트 구조가 바뀌어도 대응 가능하다.

## 작업 흐름

1. Playwright로 대상 사이트의 제출 페이지를 연다
2. 페이지의 DOM 구조 (폼 필드, 라벨, 버튼 등)를 추출한다
3. Claude Code가 DOM을 분석해서 각 필드에 맞는 제품 정보를 매핑한다
4. Playwright로 폼을 채운다 (텍스트 입력, 드롭다운 선택, 체크박스 등)
5. 이미지 업로드가 필요하면 지정된 파일을 업로드한다
6. 최종 제출 버튼을 클릭한다 (또는 사람이 확인 후 클릭하도록 대기)
7. 결과를 로그에 기록한다

## 주의사항

- 일부 사이트는 로그인이 필요하다. Google OAuth 등을 사용하는 경우 수동 로그인 후 세션을 유지해야 할 수 있다.
- 최종 Submit 버튼은 사람이 확인할 수 있도록 클릭 전 대기하는 옵션을 두는 것이 좋다.
- CAPTCHA가 있는 사이트는 자동화 불가 - 건너뛰고 수동 처리 대상으로 기록한다.
- 사이트에서 rate limit이나 봇 차단을 할 수 있으므로, 요청 간 적절한 대기 시간을 둔다.

---

## 제품 정보 (SheetSchedule)

### 기본 정보
- 제품명: SheetSchedule
- 전체 이름: SheetSchedule - Gantt Chart Scheduler
- 태그라인: Turn Google Sheets into a Gantt Chart
- 한 줄 피치: Turn Google Sheets into a Gantt chart — edit your spreadsheet, see it instantly.
- 가격: $19 USD (one-time purchase, source code package)
- 판매 플랫폼: Gumroad

### URL 목록
- 데모 사이트: https://sheetschedule-demo.netlify.app/
- Gumroad 구매 페이지: https://goodhap.gumroad.com/l/sheetschedule
- GitHub: https://github.com/kimgoodhap-ship-it/sheetschedule
- Affiliate 신청: https://goodhap.gumroad.com/affiliates (50% commission)
- Indie Hackers: https://www.indiehackers.com/product/sheetschedule

### 제품 설명 (짧은 버전, 100자 이내)
SheetSchedule turns your Google Sheets spreadsheet into an interactive Gantt chart. No database needed.

### 제품 설명 (중간 버전, 300자 이내)
SheetSchedule is a lightweight Gantt chart web app that uses Google Sheets as its database. Your spreadsheet IS your project database. Add a row in Google Sheets, click Refresh in the browser, and watch it appear as a Gantt bar instantly. No forms, no app switching, no learning curve. Available as a self-hosted source code package on Gumroad for $19.

### 제품 설명 (긴 버전)
SheetSchedule is a lightweight Gantt chart web app that uses Google Sheets as its database. No complex project management tools needed.

Your spreadsheet IS your project database. Add a row in Google Sheets, click Refresh in the browser, and watch it appear as a Gantt bar instantly. No forms, no app switching, no learning curve.

Features:
- Google Sheets as your database — no separate DB needed
- Real-time sync between spreadsheet and Gantt chart
- Drag and drop reordering
- 3 time scales (Monthly, Weekly, Daily)
- Project filtering and hierarchy (Project > Category > Task)
- PNG and JSON export
- Color coding and status tracking
- Responsive web interface

Tech Stack: React 18 + TypeScript + Vite (frontend), Python + FastAPI + gspread (backend), Google Sheets API (data)

What you get:
- Full source code (frontend + backend)
- Sample data CSV (18 schedules, 3 projects)
- Deployment guides for Netlify, Railway, Render, and Google Cloud Run
- Google Service Account setup walkthrough
- Environment variable templates

Demo: https://sheetschedule-demo.netlify.app/
Get it: https://goodhap.gumroad.com/l/sheetschedule

### 기술 스택
- Frontend: React 18, TypeScript, Vite
- Backend: Python, FastAPI, gspread
- Data: Google Sheets API (no database needed)
- Deployment: Netlify (frontend) + any Python host (backend)

### 카테고리/태그 (사이트에 따라 적절히 선택)
- Primary: Project Management, Productivity
- Secondary: Developer Tools, Data Visualization, Spreadsheet Tools
- Additional: Gantt Chart, Google Sheets, Scheduling, Task Management
- Business type: B2B, Small and Medium Businesses, Freelancers, Indie Hackers

### 대안 제품 (AlternativeTo 등에서 사용)
- Monday.com (SheetSchedule은 더 가볍고 저렴한 대안)
- Microsoft Project (SheetSchedule은 무료 호스팅 가능, 웹 기반)
- Asana (SheetSchedule은 구글시트 기반이라 학습 곡선 없음)
- Notion (SheetSchedule은 간트 차트에 특화)
- TeamGantt (SheetSchedule은 소스코드 소유 가능)

### 타겟 고객
- 소규모 팀 (1-5명)에서 제품 런칭 일정을 관리하는 PM/마케터
- Notion/Monday.com이 과하다고 느끼는 사람들
- Google Sheets를 이미 사용하는 팀
- 개발자/인디해커 (셀프 배포 가능)
- 프리랜서 (여러 클라이언트 프로젝트 관리)

### 창업자 정보
- 이름: Eddy Kim
- 역할: Solo Founder
- 배경: 비개발자, Claude AI를 활용해서 제품 개발
- Gumroad: goodhap.gumroad.com

### 시작일: 2026년 3월 (March 2026)
### 비즈니스 모델: One-time purchase ($19), Self-hosted source code, No subscription
### 펀딩: Bootstrapped

---

## 이미지 파일 위치

모든 이미지는 아래 디렉토리에 있다:
/Users/woohyunkim/claude-projects/Gumroad_project/upload/files/

### 사용 가능한 이미지
- thumbnail-600x600.png — 정사각형 로고/썸네일 (600x600px, 로고 업로드용)
- cover-1280x720.png — 제품 커버 이미지 (1280x720px, 와이드 배너용)
- syncflow-1280x720.png — Google Sheets to Gantt Chart 동기화 흐름 설명 이미지

### 이미지 선택 기준
- 로고/아이콘 필드: thumbnail-600x600.png
- 커버/배너/스크린샷 필드: cover-1280x720.png
- 추가 갤러리 이미지: syncflow-1280x720.png

---

## 등록 대상 사이트

### 방법 1: 등록형 (제품/스토리를 올려두면 검색/브라우징으로 유입)

#### 이미 완료
1. Gumroad - goodhap.gumroad.com/l/sheetschedule
2. DEV.to - 블로그 포스트 게시 완료
3. Indie Hackers - indiehackers.com/product/sheetschedule

#### 등록 예정 (우선순위 순)
4. SideProjectors (sideprojectors.com) - submit URL: sideprojectors.com/submit/type - Showcase
5. AlternativeTo (alternativeto.net) - submit: alternativeto.net/manage/new/ - Monday.com/MS Project 대안
6. Uneed (uneed.best) - 인디 메이커 디렉토리
7. MicroLaunch (microlaunch.net) - 마이크로 SaaS 런치
8. OpenHunts (openhunts.com) - PH 대안
9. Smol Launch (smollaunch.com) - 소규모 제품 런치
10. DevHunt (devhunt.org) - 개발자 도구 런치
11. SaaSHub (saashub.com) - SaaS 비교 디렉토리
12. BetaList (betalist.com) - 베타 테스터 모집
13. Launching Next (launchingnext.com) - 스타트업 디렉토리
14. Product Hunt (producthunt.com) - 나중에

### 방법 2: 참여형 (관련 대화를 찾아가서 자연스럽게 제품 언급)

#### 검색 키워드
- google sheets gantt chart
- lightweight project management
- simple scheduling tool
- gantt chart alternative
- project schedule spreadsheet

#### 참여 채널
- Discord: project-management, indie-hackers, google-sheets, productivity 서버
- Reddit: r/SideProject, r/webdev, r/googlesheets, r/projectmanagement
- Quora: 관련 질문에 답변
- Twitter/X: #buildinpublic #indiehackers
- Hacker News: 관련 글에 댓글

---

## Claude Code를 위한 추천 도구/MCP

### 필수
1. Playwright
   - pip install playwright && playwright install
   - 브라우저 자동화의 핵심
   - headless: false로 설정해서 브라우저 화면을 보면서 작업

### 권장 MCP 서버
2. Playwright MCP Server
   - npm install -g @anthropic/mcp-playwright 또는 npx @anthropic/mcp-playwright
   - Claude Code에서 Playwright를 MCP 도구로 직접 사용
   - claude mcp add playwright --command "npx @anthropic/mcp-playwright"

3. Puppeteer MCP Server
   - npm install -g @anthropic/mcp-puppeteer
   - Playwright 대신 사용 가능한 대안

### 참고 도구
4. Browser Use (browser-use 패키지)
   - pip install browser-use
   - LLM 기반 브라우저 자동화 라이브러리
   - Playwright 위에서 동작, AI가 DOM을 분석하고 행동 결정

5. Submify Chrome Extension
   - 참고용: AI 기반 폼 자동 채우기 기존 제품

---

## 스크립트 구조 제안

directory-submitter/
  config.json          - 제품 정보
  sites.json           - 등록 대상 사이트 목록과 상태
  submitter.py         - 메인 스크립트
  utils/
    dom_analyzer.py    - DOM 분석 유틸리티
    form_filler.py     - 폼 채우기 유틸리티
    image_uploader.py  - 이미지 업로드 유틸리티
  logs/
    submission_log.json - 등록 결과 로그

---

## 파일 위치 요약

- 이 문서: ~/claude-projects/Gumroad_project/directory-auto-submit-guide.md
- 제품 데이터: ~/claude-projects/Gumroad_project/directory-submission-data.json
- 마케팅 전략: ~/claude-projects/Gumroad_project/marketing-strategy.md
- 기획서: ~/claude-projects/Gumroad_project/scheduler-gumroad-project.md
- CLAUDE.md: ~/claude-projects/Gumroad_project/CLAUDE.md
- 이미지 파일: ~/claude-projects/Gumroad_project/upload/files/
- 제품 코드: ~/claude-projects/Gumroad_project/app/
