# 프로젝트: EddyBot 스케줄러 → Gumroad 판매용 제품화

## 프로젝트 목적

업무용으로 만들어 사용 중인 웹 기반 간트 차트 스케줄러(EddyBot Scheduler)를 범용 제품으로 재패키징하여 Gumroad에서 판매한다. 이 프로젝트는 스마트 그리드봇 서비스(본 프로젝트)를 준비하는 동안, 마켓플레이스 판매 경험을 먼저 쌓기 위한 "연습 프로젝트"이기도 하다.

## 현재 상태

- **원본 앱**: https://eddybot-scheduler.netlify.app/
- **기술 스택**: Claude Code로 개발, Netlify 배포, 웹 기반 SPA
- **현재 데이터**: 회사 업무용 데이터가 포함되어 있음 (제품명, 담당자명, 프로젝트명 등)
- **현재 기능**:
  - 간트 차트 기반 프로젝트 일정 관리
  - 프로젝트별 필터링
  - 타임스케일 축소/확대
  - 드래그앤드롭 순서 변경
  - PNG 저장 (스냅샷)
  - 월별 네비게이션
  - 새 일정 추가/편집
  - 계층 구조 (프로젝트 > 카테고리 > 태스크)
  - 163개 일정, 프로젝트 8개 운영 중

## 제품화를 위해 해야 할 일

### 1단계: 코드 범용화 (Claude Code에서 작업)
- 회사 데이터 전부 제거 (제품명, 담당자명, 프로젝트명 등)
- 영어 UI로 전환 (글로벌 판매 대상)
- 샘플 데이터 삽입 (범용적인 Product Launch 시나리오)
- 제품명 변경: "EddyBot Scheduler" → 새 이름 (TBD)
- 커스터마이징 가이드용 설정 파일 분리 (사용자가 쉽게 프로젝트/카테고리를 수정할 수 있도록)

### 2단계: 패키징 (Claude Code + 이 프로젝트에서 작업)
- README.md 작성 (설치 가이드, 커스터마이징 방법, 스크린샷)
- 데모 사이트 배포 (Netlify 또는 Vercel)
- 스크린샷/GIF 캡처 (Gumroad 리스팅용)

### 3단계: Gumroad 리스팅 (이 프로젝트에서 작업)
- 제품명 확정
- 제품 설명 작성 (영문)
- 가격 설정
- 태그/카테고리 설정
- 커버 이미지 제작

### 4단계: 마케팅 (이 프로젝트에서 작업)
- Reddit 게시글 초안 (r/SideProject, r/webdev 등)
- Product Hunt 런칭 준비 (선택)
- 블로그 포스트 초안 ("I built a lightweight Gantt chart scheduler and put it on Gumroad")

## 타겟 고객

- 소규모 팀에서 제품 런칭 일정을 관리하는 PM/마케터
- Notion/Monday.com이 과하다고 느끼는 1~5인 팀
- 간트 차트가 필요하지만 MS Project는 싫은 사람
- D2C 브랜드, 화장품, 식품 스타트업의 제품 출시 담당자
- 글로벌 대상 (영어 우선)

## 가격 전략 (초안)

- **목적이 수익 극대화가 아니라 마켓플레이스 경험**이므로 낮게 시작
- 소스코드 패키지: $19~$29 (일회성)
- 비교 기준: 아티클 저자의 인보이스 리마인더 워크플로우가 $39에 월 14카피 판매

## 포지셔닝 (초안)

- **"Lightweight Gantt Chart for Product Launches"**
- Notion/Monday.com 대비: 설치 불필요, 무료 호스팅 가능, 소스코드 소유, 빠르고 가벼움
- MS Project 대비: 무료, 웹 기반, 5분 안에 시작 가능
- 핵심 메시지: "제품 런칭에 필요한 것만 담은 간트 차트. 복잡한 도구에 질린 소규모 팀을 위해."

## 참고 사항

- 이 프로젝트의 모든 코드 수정은 Claude Code에서 진행. 이 프로젝트(클로드 앱)에서는 기획, 문서, 리스팅 문구, 마케팅 전략만 다룬다.
- 원본 스케줄러 코드 경로: Claude Code 프로젝트에서 별도 관리
- 참고 아티클: "I Built 5 n8n Automations That Generate $3,200/Month Passively" — 핵심 교훈: 자기 문제를 먼저 해결한 것을 팔아라, 문서화가 제품의 절반이다, 멀티 채널 배포, 가치 기반 가격 설정
- 판매 플랫폼 후보: Gumroad (1순위, 빠른 시작), LemonSqueezy (소프트웨어 판매 특화, 2순위), CodeCanyon (프리미엄, 추후 검토)

## 작업 환경 및 동기화 워크플로우

### 폴더 구조
```
~/claude-projects/Gumroad_project/
├── scheduler-gumroad-project.md   ← 공유 기획서 (Single Source of Truth)
├── CLAUDE.md                      ← Claude Code 전용 지침
└── app/                           ← 제품화 코드 (원본에서 복사 후 작업)
```

### 원본 코드 (수정 금지)
`~/claude-projects/ai_agent_eddybot/web/scheduler/`

### 작업 흐름
1. **claude.ai에서 기획/전략 논의** → 결정사항을 이 파일(`scheduler-gumroad-project.md`)에 반영
2. **Claude Code에서 코딩 작업** → 이 파일을 읽어서 맥락 파악 후 작업 진행
3. **Claude Code 작업 완료** → 이 파일의 "진행 로그"에 날짜와 내용 기록
4. **claude.ai로 돌아오면** → osascript로 이 파일 최신 버전을 읽어서 현재 상태 파악

### 역할 분담
- **claude.ai 프로젝트**: 기획, 문서, 리스팅 문구, 마케팅 전략, 브라우저로 결과 확인
- **Claude Code**: 실제 코드 수정, 빌드, 배포, 기술적 구현

## 진행 로그

| 날짜 | 작업 내용 | 작업 환경 | 상태 |
|------|----------|----------|------|
| 2025-03-26 | 프로젝트 기획서 작성 | claude.ai | 완료 |
| 2025-03-26 | CLAUDE.md 생성, 워크플로우 설계 | claude.ai | 완료 |
| 2026-03-26 | 코드 복사 (원본 → app/frontend + app/backend) | Claude Code | 완료 |
| 2026-03-26 | 백엔드 스케줄러 코드 추출 (meeting/to-do 제거) | Claude Code | 완료 |
| 2026-03-26 | 전체 한국어 → 영어 전환 (Frontend + Backend) | Claude Code | 완료 |
| 2026-03-26 | 회사 데이터 제거 (EddyBot, Sheet ID, Cloud Run URL) | Claude Code | 완료 |
| 2026-03-26 | 제품명 확정: SheetSchedule | Claude Code | 완료 |
| 2026-03-26 | config.ts, config.py 설정 파일 분리 | Claude Code | 완료 |
| 2026-03-26 | 샘플 데이터 CSV 생성 (18개 일정, 3개 프로젝트) | Claude Code | 완료 |
| 2026-03-26 | README.md + 배포 가이드 + Google 설정 가이드 작성 | Claude Code | 완료 |
| 2026-03-27 | UI 다듬기 (영어 너비 조정, JSON export/import 기능 추가) | Claude Code | 완료 |
| 2026-03-27 | 데모용 Google Sheet 생성 (API로 자동 생성, 18개 샘플 데이터) | Claude Code | 완료 |
| 2026-03-27 | Backend 배포: GCP Cloud Run (sheetschedule-api) | Claude Code | 완료 |
| 2026-03-27 | Frontend 배포: Netlify (sheetschedule-demo) | Claude Code | 완료 |
| 2026-03-27 | 데모 사이트 동작 확인 (18개 스케줄, 간트 차트 정상) | Claude Code | 완료 |
| - | Gumroad 리스팅 문구 | claude.ai | 대기 |
| - | 마케팅 초안 | claude.ai | 대기 |

## 현재 기술 현황 (2026-03-27 기준)

### 제품명: SheetSchedule
- **제품 컨셉**: Google Sheets → Gantt Chart, Instantly
- **아키텍처**: Frontend (React+Vite) + Backend (FastAPI+gspread) + Google Sheets

### 완료된 코드 작업
1. 원본 코드를 `app/frontend/` + `app/backend/`로 복사 (백엔드는 스케줄러 전용 코드만 추출)
2. 전체 한국어 → 영어 전환 (UI, API 응답, 에러 메시지, 주석 모두)
3. 회사 데이터 완전 제거 (EddyBot, Google Cloud Run URL, 원본 Sheet ID)
4. 설정 파일 분리 (`config.ts`, `config.py`) — 구매자가 쉽게 커스터마이징
5. 샘플 데이터 CSV 생성 (3개 프로젝트, 18개 일정)
6. JSON Export/Import 기능 추가 (데이터 백업/복원)
7. README.md, Google Service Account 설정 가이드, 배포 가이드 작성
8. 데모용 Google Sheet 생성 완료

### 데모 Google Sheet
- **Sheet ID**: `1Hw96Ma4DLGbPdKJQG9x81WT-XqwTr93EjG8jJpPhW88`
- **URL**: https://docs.google.com/spreadsheets/d/1Hw96Ma4DLGbPdKJQG9x81WT-XqwTr93EjG8jJpPhW88/edit
- **Service Account**: 기존 EddyBot의 service-account.json 재사용
- 영어 헤더 + 18개 샘플 일정 + 링크로 누구나 읽기 가능

### 데모 사이트 (배포 완료, 2026-03-27)
- **Frontend**: https://sheetschedule-demo.netlify.app/
- **Backend**: https://sheetschedule-api-920976615761.asia-northeast3.run.app (GCP Cloud Run)
- **GitHub**: https://github.com/kimgoodhap-ship-it/sheetschedule

### 남은 작업
- **Gumroad**: 리스팅 문구, 커버 이미지, 가격 설정
- **마케팅**: Reddit 게시글, 블로그 포스트 초안


## 전략 결정 사항 (2026-03-27, claude.ai에서 논의)

### 판매 방식: 2단계 접근
**1단계 (지금)**: 소스코드 패키지로 Gumroad 출시
- 타겟: 개발자, 인디해커 (셀프 배포 가능한 사람)
- 가격: USD 19-29 (일회성)
- 구매자가 직접 배포하는 셀프 호스팅 방식
- README + 배포 가이드로 충분히 안내

**2단계 (추후, 반응 보고 결정)**: SaaS 호스팅 버전 추가
- 타겟: 비개발자 PM/마케터까지 확장
- 가격: 월 구독 USD 5-10
- 가입하면 바로 사용 가능한 호스팅 서비스
- 멀티테넌트 인증, 서버 인프라 필요

### 결정 배경
- 이 프로젝트의 1차 목적은 수익 극대화가 아니라 마켓플레이스 판매 경험
- SaaS는 회원가입/대시보드/결제 연동 등 추가 개발이 필요해서 출시가 늦어짐
- 소스코드 판매는 지금 바로 가능하고, 개발자 타겟이면 셀프 배포가 진입 장벽이 아님
- Gumroad에서 소스코드 파는 제품 대부분이 이 방식

### Claude Code 작업 지침
- 현재 진행 중인 데모 사이트 배포는 그대로 완료할 것 (Gumroad 리스팅용 데모)
- Gumroad 리스팅에서 개발자 친화적, 소스코드 패키지, self-hosted를 명확히 표기
- README에 배포 난이도와 필요 기술 수준을 솔직하게 명시
- SaaS 버전은 당장 개발하지 않음 (추후 별도 결정)
