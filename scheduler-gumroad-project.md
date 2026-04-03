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
| 2026-03-27 | "Open Sheet" 버튼 추가 (웹앱→구글시트 바로 연결) | Claude Code | 완료 |
| 2026-03-27 | 보안 점검: API 에러 메시지 일반화, schedule_id 검증, 패키징 스크립트 | Claude Code | 완료 |
| 2026-03-27 | Gumroad 패키지 보안 검증 (민감 문자열 0건 PASS, 92KB) | Claude Code | 완료 |
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


## 핵심 셀링 포인트 (2026-03-27, 데모 테스트에서 확인)

### Google Sheets = Your Project Database
이 제품의 진짜 장점은 간트 차트 자체가 아니라, Google Sheets를 데이터 소스로 사용한다는 점.
- 구글시트에서 신규 입력/편집하면 웹앱에서 Refresh만 누르면 바로 반영됨
- 별도 앱에서 복잡한 폼을 채울 필요 없음
- 스프레드시트를 이미 잘 쓰는 사람이면 학습 비용 제로
- 데이터가 구글시트에 있으므로 백업, 공유, 협업이 구글 생태계 그대로

### 데모 테스트 결과
- 구글시트 20행에 Logo Redesign 태스크 추가 -> 웹앱 Refresh -> 즉시 간트 차트에 반영 확인
- Design 카테고리 아래 새 태스크가 정확한 날짜(4/10-4/25)와 간트 바로 표시됨

### Gumroad 리스팅에 활용할 마케팅 메시지 후보
- Edit in Google Sheets. See it as a Gantt chart. Instantly.
- Your spreadsheet IS your project database.
- No learning curve - if you can use Google Sheets, you can manage projects.
- No complex forms. No app switching. Just edit your spreadsheet.

### 데모 GIF 아이디어
구글시트에서 새 일정 입력 -> 웹앱 Refresh 클릭 -> 간트 차트에 즉시 반영
이 3단계 흐름을 GIF로 만들어 Gumroad 리스팅 메인에 배치


## Gumroad 리스팅 가이드 (2026-03-29, 실제 화면 확인 결과)

### 리스팅 페이지 구조
Gumroad 제품 편집은 4개 탭으로 구성: Product, Content, Receipt, Share
URL: https://gumroad.com/products/jwxzwf/edit (이미 draft 생성됨)

### Product 탭 — 작성해야 할 필드

**1. Name** (완료)
- SheetSchedule

**2. Description** (작성 필요)
- 리치 텍스트 에디터 (볼드, 이탤릭, 링크, 이미지, 동영상 삽입 가능)
- 핵심 셀링 포인트와 기능 목록을 여기에 작성
- 이미지/GIF 삽입 가능 -> 데모 GIF를 여기 넣으면 효과적

**3. URL** (수정 필요)
- 현재: goodhap.gumroad.com/l/jwxzwf
- 변경 추천: goodhap.gumroad.com/l/sheetschedule

**4. Cover** (제작 필요)
- 메인 배너 이미지: 가로형, 최소 1280x720px, 72 DPI, JPG/PNG/GIF
- 이미지 또는 동영상 업로드 가능

**5. Thumbnail** (제작 필요)
- 정사각형, 최소 600x600px, JPG/PNG/GIF
- Gumroad Library, Discover, Profile 페이지에 표시됨

**6. Product Info 섹션**
- Call to action: 기본값 I want this! (변경 가능)
- Summary: 짧은 한줄 요약 (You will get...)
- Additional details: 추가 정보

**7. Pricing** (결정 필요)
- 현재: USD 19
- Allow customers to pay what they want 옵션 있음 (최소가 USD 19, 더 내고 싶으면 가능)
- 할인 코드 자동 적용 옵션 있음

**8. Settings**
- Publicly show number of sales: 초기에는 OFF 추천 (0건 표시 방지)
- Refund policy: 설정 추천 (디지털 상품이므로 명확히)

### Content 탭 — 파일 업로드
- Upload your files 버튼으로 sheetschedule-v1.0.0.zip (92KB) 업로드
- 텍스트도 추가 가능 (구매 후 안내 메시지)

### Receipt 탭 — 구매 확인 이메일
- 구매자에게 보내는 이메일 커스터마이즈

### Share 탭 — 공유 설정
- Publish 후 활성화되는 것으로 추정

### 작성 우선순위
1. Description 영문 초안 작성 (claude.ai에서)
2. Cover 이미지 제작 (1280x720px)
3. Thumbnail 이미지 제작 (600x600px)
4. URL slug 변경 (sheetschedule)
5. Summary 작성
6. 가격 최종 확정
7. zip 파일 업로드 (Content 탭)
8. Publish

### Description에 포함할 내용 (영문)
- 한줄 훅: Google Sheets to Gantt Chart, Instantly
- 핵심 차별점: 구글시트에서 편집하면 바로 간트 차트에 반영
- 데모 GIF 또는 스크린샷
- 기능 목록 (Features)
- 기술 스택 (Tech Stack)
- 포함 항목 (What is included)
- 데모 사이트 링크: https://sheetschedule-demo.netlify.app/
- 요구 사항 (Requirements): Google Account, Node.js, Python
- 타겟 사용자 (Who is this for)


## 진행 로그 추가 (2026-03-29)

| 날짜 | 작업 내용 | 작업 환경 | 상태 |
|------|----------|----------|------|
| 2026-03-29 | Gumroad 제품 등록 (Name, Description, Cover, Thumbnail, URL slug) | claude.ai + 브라우저 | 완료 |
| 2026-03-29 | Gumroad Content 탭: zip 파일 업로드 (92KB) | 브라우저 | 완료 |
| 2026-03-29 | Gumroad 결제 수단 설정 (카카오뱅크, SWIFT: KAKOKR22) | 브라우저 | 완료 |
| 2026-03-29 | Gumroad Publish 완료 | 브라우저 | 완료 |
| - | Gumroad Discover 노출 | 자동 | 대기 (첫 판매 + Risk Review 필요) |
| - | 마케팅: Reddit/Twitter/블로그 | claude.ai | 대기 |

## Gumroad 판매 현황 (2026-03-29 기준)

### 제품 페이지
- **URL**: goodhap.gumroad.com/l/sheetschedule
- **가격**: USD 19
- **상태**: Published (판매 가능)

### Gumroad 수수료 구조
- Direct sales (직접 링크): 10% + 50c + 신용카드 수수료 2.9% + 30c
- Discover sales (마켓 검색): 30% flat
- USD 19 직접 판매시 예상 수취액: 약 USD 15.5

### Gumroad Discover 노출 조건
- 최소 1건 판매 실적 필요
- Risk Review 프로세스 통과 필요
- 현재: 미노출 (조건 미충족)

### 마케팅 다음 단계
첫 판매를 만들기 위한 직접 링크 공유 필요:
1. Reddit (r/SideProject, r/webdev) - 계정 카르마 필요, 새 계정은 바로 홍보글 차단될 수 있음
2. Twitter/X - #buildinpublic #indiehackers 태그로 바로 공유 가능
3. Hacker News - Show HN 게시글로 공유 가능
4. DEV.to / 개인 블로그 - 빌드 스토리 글 작성

| 2026-03-29 | DEV.to 블로그 포스트 게시 | 브라우저 | 완료 |
| 2026-03-29 | Hacker News Show HN 게시 (데모 URL) | 브라우저 | 완료 |
| 2026-03-29 | Hacker News Show HN 시도 | 브라우저 | 차단 (새 계정 제한) |
| 2026-03-29 | Reddit 계정 생성 | 브라우저 | 완료 (카르마 쌓기 필요) |

## 마케팅 채널 현황 (2026-03-29)

| 채널 | 상태 | 비고 |
|------|------|------|
| DEV.to | 게시 완료 | 첫 유입 채널, 제한 없음 |
| Hacker News | 차단됨 | 새 계정 Show HN 일시 제한 중, 커뮤니티 활동 후 재시도 |
| Reddit | 계정만 생성 | 카르마 부족, 며칠간 댓글 활동 후 r/SideProject r/webdev 게시 |
| Twitter/X | 미진행 | 계정 있으면 바로 가능 |

### TODO
- [ ] 데모 사이트에 Gumroad 구매 링크 추가 (Claude Code)
- [ ] Reddit 카르마 쌓기 (며칠간 댓글 활동)
- [ ] Hacker News 커뮤니티 활동 후 Show HN 재시도
- [ ] DEV.to 반응 모니터링


## 프로젝트 최종 현황 (2026-03-30 기준)

### 완료된 모든 작업
- 코드 범용화 (한국어->영어, 회사데이터 제거, 설정 분리)
- 패키징 (보안 검증 통과, 92KB zip)
- 데모 사이트 배포 (Frontend: Netlify, Backend: GCP Cloud Run)
- Gumroad Publish 완료 (goodhap.gumroad.com/l/sheetschedule, USD 19)
- Gumroad Affiliate 설정 (50% 커미션, Signup Form 활성화)
- DEV.to 블로그 포스트 게시
- Reddit 계정 생성 (카르마 쌓기 필요)
- Hacker News 계정 생성 (Show HN 일시 제한, 활동 필요)

### 현재 판매 채널
| 채널 | URL | 상태 |
|------|-----|------|
| Gumroad 제품 | goodhap.gumroad.com/l/sheetschedule | Published |
| 데모 사이트 | sheetschedule-demo.netlify.app | 운영중 |
| Affiliate 신청 | goodhap.gumroad.com/affiliates | 활성화 (50% 커미션) |
| DEV.to 블로그 | 게시 완료 | 15+ reads |
| GitHub | github.com/kimgoodhap-ship-it/sheetschedule | Public |

### 다음에 할 일 (우선순위)
1. DEV.to 반응 모니터링 (검색 유입 기다리기)
2. 한국 커뮤니티에 경험기 올리기 (클리앙, 긱뉴스, 브런치) - 가장 자연스러운 채널
3. Reddit/HN 커뮤니티 활동으로 카르마 쌓기
4. 데모 사이트에 Gumroad 구매 링크 추가 (Claude Code)
5. 첫 판매 발생시 Gumroad Discover 자동 노출

### 프로젝트 회고
- 원래 목적인 마켓플레이스 판매 경험 쌓기는 달성
- 코드 작업은 Claude Code, 기획/전략/컨텐츠는 claude.ai 분담이 효과적이었음
- SNS 마케팅은 계정 카르마/평판 요구 때문에 새 계정으로 즉시 효과 내기 어려움
- 한국어 커뮤니티가 비개발자 입장에서 더 자연스러운 마케팅 채널
- Fiverr 등 프리랜서 플랫폼은 USD 19 제품 규모에서는 투자 대비 효과 불확실
| 2026-04-01 | Indie Hackers 제품 페이지 등록 | 브라우저 | 완료 |
| - | Indie Hackers 첫 포스트 작성 | 브라우저 | 대기 |
| 2026-04-01 | Indie Hackers 첫 포스트 작성 | 브라우저 | 완료 |

## 현재 마케팅 채널 최종 현황 (2026-04-01)

| 채널 | URL | 상태 |
|------|-----|------|
| Gumroad | goodhap.gumroad.com/l/sheetschedule | Published, Affiliate 50% |
| 데모 사이트 | sheetschedule-demo.netlify.app | 운영중 |
| DEV.to | 게시됨 | 19 reads |
| Indie Hackers | indiehackers.com/product/sheetschedule | 제품+포스트 등록 완료 |
| Reddit | 계정 생성 | 카르마 필요 |
| Hacker News | 계정 생성 | Show HN 제한 |


## 마케팅 2트랙 전략 (2026-04-01 수립)

### 방법 1: 제품 등록형 (올려두면 발견되는 구조)
완료: Gumroad, DEV.to, Indie Hackers
다음: SideProjectors, AlternativeTo, Uneed, MicroLaunch, OpenHunts, Smol Launch

### 방법 2: 커뮤니티 참여형 (관련 대화를 찾아가는 구조)
Discord 서버 가입, Quora 답변, Reddit 댓글 (카르마 쌓은 후)
검색 키워드: google sheets gantt chart, lightweight project management, simple scheduling tool

상세 전략: marketing-strategy.md 참조


## 진행 로그 (2026-04-02)
| 날짜 | 작업 내용 | 상태 |
|------|----------|------|
| 2026-04-02 | Indie Hackers 제품+포스트 등록 확인 | 완료 |
| 2026-04-02 | SideProjectors 폼 채우기 시작 (type, name, pitch, description, markets) | 진행중 |
| 2026-04-02 | 마케팅 2트랙 전략 수립 (등록형 15개 + 참여형 6개 채널) | 완료 |
| 2026-04-02 | marketing-strategy.md 작성 및 프로젝트 파일 추가 | 완료 |
| 2026-04-02 | directory-submission-data.json 생성 (Claude Code용 자동화 데이터) | 완료 |
| 2026-04-02 | Submify Chrome 확장 검토 | 검토만 |

### 다음 작업 (Claude Code에서)
- directory-submission-data.json을 읽고 Playwright 스크립트 작성
- 10개 디렉토리 사이트 자동 등록
- SideProjectors 등록 완료 (Markets 선택, 나머지 단계 진행)


## 진행 로그 추가 (2026-04-02)
| 날짜 | 작업 내용 | 상태 |
|------|----------|------|
| 2026-04-02 | 마케팅 2트랙 전략 수립 (등록형 15개 + 참여형 6개) | 완료 |
| 2026-04-02 | marketing-strategy.md 프로젝트 파일 추가 | 완료 |
| 2026-04-02 | SideProjectors 폼 채우기 시작 (type, name, pitch, description) | 진행중 (Draft) |
| 2026-04-02 | Submify 등 자동화 도구 리서치 | 완료 |
| 2026-04-02 | Claude Code + Playwright 자동화 방향 결정 | 완료 |
| 2026-04-02 | directory-auto-submit-guide.md 작성 (Claude Code용 종합 가이드) | 완료 |
| 2026-04-02 | directory-submission-data.json 생성 | 완료 |

### 다음 작업 (Claude Code에서)
1. directory-auto-submit-guide.md 읽기
2. Playwright MCP 또는 Browser Use 설정
3. Claude Code가 직접 DOM을 분석하고 폼을 채우는 방식으로 자동화
4. SideProjectors 등록 완료 (Draft 상태)
5. AlternativeTo, Uneed 등 나머지 사이트 순차 등록
