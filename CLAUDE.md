# Gumroad Scheduler Project — Claude Code 지침

## 프로젝트 개요
EddyBot 스케줄러(업무용 간트 차트 앱)를 범용 제품으로 재패키징하여 Gumroad에서 판매하는 프로젝트.
기획 문서: `scheduler-gumroad-project.md` (이 폴더 내, 반드시 먼저 읽을 것)

## 폴더 구조
```
~/claude-projects/Gumroad_project/
├── scheduler-gumroad-project.md   ← 공유 기획서 (claude.ai와 공유, Single Source of Truth)
├── CLAUDE.md                      ← 이 파일 (Claude Code 전용 지침)
└── app/                           ← 제품화 코드 (원본에서 복사 후 작업)
```

## 원본 코드 경로 (절대 수정 금지!)
`~/claude-projects/ai_agent_eddybot/web/scheduler/`
→ 기존 업무용 앱. 현재 운영 중이므로 절대 건드리지 말 것.
→ 제품화 작업은 반드시 `./app/` 폴더에서만 진행.

## 기술 스택
- Vite + TypeScript + React
- Netlify 배포
- SPA (Single Page Application)

## 작업 규칙

### 코드 수정 원칙
1. 모든 코드 변경은 `./app/` 폴더 안에서만 진행
2. 커밋 메시지는 영어로, 접두사 사용: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
3. 회사 관련 데이터(제품명, 담당자명, 프로젝트명)가 코드에 남아있지 않은지 항상 확인

### 범용화 체크리스트
- [ ] 한국어 UI → 영어 UI 전환
- [ ] 회사 데이터 제거 (하드코딩된 프로젝트명, 담당자명, 제품명 등)
- [ ] 샘플 데이터 삽입 (Product Launch 시나리오)
- [ ] 제품명 변경: "EddyBot Scheduler" → TBD
- [ ] 설정 파일 분리 (사용자 커스터마이징 용이하도록)
- [ ] README.md 작성

### 진행 상황 업데이트
작업 완료 시 `scheduler-gumroad-project.md`의 "진행 로그" 섹션에 날짜와 함께 기록할 것.
이 파일은 claude.ai 프로젝트와 공유되므로, 상태 동기화의 핵심.

## 맥락 동기화 워크플로우
이 프로젝트는 **claude.ai 대화**와 **Claude Code** 두 곳에서 병행 작업됨.
- claude.ai: 기획, 전략, 문서, 리스팅 문구, 마케팅, 브라우저 확인
- Claude Code: 코드 수정, 빌드, 배포
- `scheduler-gumroad-project.md`가 양쪽의 Single Source of Truth
- 작업 시작 전 반드시 `scheduler-gumroad-project.md` 최신 내용 확인
- 작업 완료 후 진행 로그에 기록
