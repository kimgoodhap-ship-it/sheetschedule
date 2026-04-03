# SheetSchedule 데모 영상 제작 가이드

## 목적

SheetSchedule의 핵심 기능을 보여주는 1~2분 데모 영상을 제작한다.
Playwright MCP로 브라우저를 조작하고, 그 과정을 영상으로 녹화한다.
완성된 영상은 유튜브 업로드 및 각 디렉토리 사이트 등록에 사용한다.

## 실행 순서

1. 아래 "도구 설정" 섹션에서 방법 A(Playwright MCP + --save-video)를 설정한다.
2. "영상 시나리오"의 장면 1~9를 순서대로 실행한다. 각 장면 사이에 자연스러운 대기 시간을 넣는다.
3. 구글시트 편집이 불가능하면 "대안" 섹션의 방법을 사용한다.
4. 녹화 완료 후 "영상 포맷 변환" 섹션에 따라 webm→mp4 변환, 텍스트 오버레이 추가, 오프닝/클로징 결합을 수행한다.
5. 최종 파일을 ~/claude-projects/Gumroad_project/upload/files/sheetschedule-demo.mp4 에 저장한다.

---

## 도구 설정

### 방법 A: Playwright MCP + --save-video (추천, 가장 간편)

Playwright MCP 서버에 `--save-video` 플래그를 추가하면 브라우저 조작이 자동으로 영상 파일로 저장된다.

```bash
# Claude Code에서 실행
claude mcp add playwright -s user -- npx @playwright/mcp@latest --save-video=1920x1080
```

이렇게 설정하면 Claude Code가 Playwright MCP로 브라우저를 조작하는 모든 과정이 자동으로 .webm 파일로 녹화된다.
Claude Code에게 "Playwright MCP로 브라우저를 열고 이 시나리오대로 조작해줘"라고 지시하면 된다.

### 방법 B: mcp-screen-capture (영상 녹화 전용 MCP 서버)

스크린샷, 영상 녹화, GIF 생성을 전문으로 하는 MCP 서버.

```bash
# 설치
git clone https://github.com/chacebot/mcp-screen-capture.git
cd mcp-screen-capture
npm install

# Claude Code MCP 설정에 추가
claude mcp add screen-capture -- node /path/to/mcp-screen-capture/src/index.js
```

사용 예시 (Claude Code에서):
```
screen-capture 도구를 사용해서 https://sheetschedule-demo.netlify.app/ 을
8초 동안 녹화하고, 자동 스크롤 포함해서 /tmp/demo.webm 으로 저장해줘
```

### 방법 C: Playwright Python 스크립트 (가장 세밀한 제어)

Playwright의 Python API로 직접 영상 녹화 스크립트를 작성한다.

```bash
pip install playwright
playwright install chromium
```

```python
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir="/tmp/videos/",
        record_video_size={"width": 1920, "height": 1080}
    )
    page = context.new_page()
    
    # 여기서 시나리오 실행...
    page.goto("https://sheetschedule-demo.netlify.app/")
    time.sleep(3)
    # ... 각 장면 조작 ...
    
    context.close()  # 이 시점에 영상 파일이 저장됨
    browser.close()
```

### 방법 D: Claude-Code-Video-Toolkit (풀 파이프라인)

GitHub: https://github.com/wilwaldon/Claude-Code-Video-Toolkit
Playwright 녹화 + Remotion 후처리(브랜딩, 트랜지션, 자막) 통합 도구.

```bash
# Playwright 영상 녹화 설정
claude mcp add playwright -s user -- npx @playwright/mcp@latest --save-video=1920x1080

# Remotion 스킬 설치 (후처리용, 선택사항)
npx skills add remotion
```

### 추천 순서

1순위: 방법 A (Playwright MCP + --save-video) — 가장 간단, 별도 스크립트 불필요
2순위: 방법 C (Python 스크립트) — 타이밍 세밀 제어 필요 시
3순위: 방법 B (mcp-screen-capture) — 단순 페이지 녹화에 적합
4순위: 방법 D (Video Toolkit) — 고급 후처리 필요 시

---

## 필수 사전 설치

```bash
# ffmpeg (영상 변환, 자막 추가에 필요)
brew install ffmpeg

# Node.js 18+ (Playwright MCP에 필요)
node --version  # 18 이상 확인

# Playwright 브라우저 (Python 방식 사용 시)
pip install playwright
playwright install chromium
```

---

## 영상 시나리오

### 전체 구성: 약 70초 (1분 10초)

영상은 무음 + 텍스트 오버레이 방식으로 제작한다.
각 장면에서 화면에 표시할 텍스트를 아래에 정의한다.

---

### 장면 1: 오프닝 타이틀 (5초)

**화면**: 그라데이션 배경 + 제품명
**텍스트 오버레이**:
```
SheetSchedule
Turn Google Sheets into a Gantt Chart
```
**행동**: 정적 화면, 움직임 없음
**구현**: ffmpeg로 타이틀 이미지를 5초 영상으로 변환하거나, 녹화 시작 전 별도 제작

---

### 장면 2: 간트 차트 전체 보기 (8초)

**화면**: 데모 사이트 메인 화면 (간트 차트가 보이는 상태)
**텍스트 오버레이**:
```
Your project timeline, powered by Google Sheets
```
**행동**:
1. https://sheetschedule-demo.netlify.app/ 로 이동
2. 3초 대기 (페이지 로딩)
3. 천천히 아래로 스크롤 (간트 바들이 보이도록)
4. 2초 대기

---

### 장면 3: 프로젝트 필터링 데모 (8초)

**화면**: 프로젝트 필터 드롭다운 클릭
**텍스트 오버레이**:
```
Filter by project — see only what matters
```
**행동**:
1. "All Projects" 드롭다운 클릭
2. 1초 대기
3. 특정 프로젝트 선택 (예: "Mobile App Launch")
4. 2초 대기 (필터링된 결과 보여줌)
5. 다시 "All Projects"로 복원
6. 2초 대기

---

### 장면 4: 타임스케일 전환 (8초)

**화면**: Weekly/Monthly/Daily 전환
**텍스트 오버레이**:
```
Switch between Monthly, Weekly, and Daily views
```
**행동**:
1. "Monthly" 버튼 클릭 → 2초 대기
2. "Weekly" 버튼 클릭 → 2초 대기
3. "Daily" 버튼 클릭 → 2초 대기
4. "Weekly"로 복원

---

### 장면 5: 구글시트 열기 (5초)

**화면**: "Open Sheet" 버튼 클릭 → 구글시트로 이동
**텍스트 오버레이**:
```
Your data lives in Google Sheets
```
**행동**:
1. "Open Sheet" 버튼 클릭
2. 구글시트 탭이 열림 (또는 새 탭으로 이동)
3. 구글시트의 데이터가 보이는 상태에서 3초 대기

**참고**: 데모 구글시트 URL: https://docs.google.com/spreadsheets/d/1Hw96Ma4DLGbPdKJQG9x81WT-XqwTr93EjG8jJpPhW88

---

### 장면 6: 구글시트에서 새 태스크 추가 (15초) — 핵심 장면

**화면**: 구글시트에서 행 추가
**텍스트 오버레이**:
```
Add a new task — just type in a row
```
**행동**:
1. 구글시트에서 빈 행으로 스크롤
2. 새 행에 데이터 입력:
   - ID: SCH-2026-019
   - Project: Mobile App
   - Category: Marketing
   - Task: Launch Campaign
   - Assignee: Mkt Lead
   - Start Date: 2026-06-01
   - End Date: 2026-06-15
3. 입력 후 2초 대기

**참고**: 구글시트 편집은 로그인이 필요할 수 있음. 
읽기 전용이면 이 장면은 스크린샷 오버레이로 대체하거나,
화면에 "Add a row in your Google Sheet" 텍스트만 보여주고 건너뛸 수 있음.

---

### 장면 7: Refresh로 간트 차트 업데이트 (10초) — 핵심 장면

**화면**: 데모 사이트로 돌아와서 Refresh 클릭
**텍스트 오버레이**:
```
Click Refresh — see it instantly on your Gantt chart
```
**행동**:
1. 데모 사이트 탭으로 전환
2. "Refresh" 버튼 클릭
3. 2초 대기 (데이터 로딩)
4. 새로 추가된 태스크가 간트 차트에 나타남
5. 새 태스크 근처로 스크롤
6. 3초 대기 (결과 강조)

---

### 장면 8: 추가 기능 빠르게 보여주기 (8초)

**화면**: 드래그앤드롭, PNG 저장 등
**텍스트 오버레이**:
```
Drag & drop, export to PNG, and more
```
**행동**:
1. 태스크 하나를 드래그앤드롭으로 순서 변경 (3초)
2. PNG 저장 버튼 클릭 시연 (2초)
3. 3초 대기

---

### 장면 9: 클로징 — 구매 유도 (8초)

**화면**: 제품 정보 + 구매 링크
**텍스트 오버레이**:
```
SheetSchedule
$19 one-time · Full source code · Deploy anywhere

sheetschedule-demo.netlify.app
goodhap.gumroad.com/l/sheetschedule
```
**행동**: 정적 화면, 움직임 없음
**구현**: 오프닝과 마찬가지로 별도 이미지를 영상으로 변환

---

## 텍스트 오버레이 추가 (ffmpeg)

녹화 완료 후, ffmpeg로 각 장면에 텍스트를 추가한다.

```bash
# 예시: 영상에 하단 자막 스타일 텍스트 추가
ffmpeg -i demo-raw.mp4 -vf \
"drawtext=text='Your project timeline, powered by Google Sheets':fontsize=36:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h-80:enable='between(t,5,13)',\
drawtext=text='Filter by project — see only what matters':fontsize=36:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h-80:enable='between(t,13,21)'" \
-codec:a copy demo-with-text.mp4
```

### 각 장면의 타임스탬프 (ffmpeg drawtext용)

| 장면 | 시작(초) | 끝(초) | 텍스트 |
|------|---------|--------|--------|
| 1 | 0 | 5 | SheetSchedule — Turn Google Sheets into a Gantt Chart |
| 2 | 5 | 13 | Your project timeline, powered by Google Sheets |
| 3 | 13 | 21 | Filter by project — see only what matters |
| 4 | 21 | 29 | Switch between Monthly, Weekly, and Daily views |
| 5 | 29 | 34 | Your data lives in Google Sheets |
| 6 | 34 | 49 | Add a new task — just type in a row |
| 7 | 49 | 59 | Click Refresh — see it instantly on your Gantt chart |
| 8 | 59 | 67 | Drag & drop, export to PNG, and more |
| 9 | 67 | 75 | $19 one-time · Full source code · Deploy anywhere |

---

## 영상 포맷 변환

```bash
# webm → mp4 변환
ffmpeg -i demo-raw.webm -c:v libx264 -preset slow -crf 22 -c:a aac demo.mp4

# mp4 → gif 변환 (짧은 미리보기용, 10초 클립)
ffmpeg -i demo.mp4 -ss 49 -t 10 -vf "fps=12,scale=640:-1" -loop 0 demo-preview.gif

# 영상 해상도 조정 (1920x1080 강제)
ffmpeg -i demo-raw.webm -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" demo-1080p.mp4
```

---

## 오프닝/클로징 타이틀 이미지 생성

타이틀 장면은 정적 이미지를 영상으로 변환한다.
이미지 생성 옵션:

### 옵션 1: 기존 cover 이미지 활용
```bash
# cover-1280x720.png를 5초 영상으로 변환
ffmpeg -loop 1 -i /Users/woohyunkim/claude-projects/Gumroad_project/upload/files/cover-1280x720.png \
-c:v libx264 -t 5 -pix_fmt yuv420p -vf "scale=1920:1080" \
opening.mp4
```

### 옵션 2: HTML로 타이틀 페이지를 만들고 Playwright로 녹화
Claude Code가 타이틀용 HTML 페이지를 생성하고, Playwright로 5초간 녹화.

---

## 영상 결합

각 장면을 따로 녹화한 경우, ffmpeg로 결합한다.

```bash
# 파일 리스트 생성
echo "file 'opening.mp4'" > filelist.txt
echo "file 'demo-scenes.mp4'" >> filelist.txt
echo "file 'closing.mp4'" >> filelist.txt

# 결합
ffmpeg -f concat -safe 0 -i filelist.txt -c copy final-demo.mp4
```

---

## 대안: 구글시트 편집이 불가능한 경우

데모 구글시트가 읽기 전용이라 새 행을 추가할 수 없는 경우:

### 대안 A: 장면 6-7을 기존 syncflow 이미지로 대체
syncflow-1280x720.png 이미지를 10초 영상으로 변환해서 구글시트 편집 장면 대신 사용.

```bash
ffmpeg -loop 1 -i /Users/woohyunkim/claude-projects/Gumroad_project/upload/files/syncflow-1280x720.png \
-c:v libx264 -t 10 -pix_fmt yuv420p -vf "scale=1920:1080" \
syncflow-scene.mp4
```

### 대안 B: 편집 가능한 별도 구글시트 생성
데모용으로 편집 가능한 구글시트를 하나 더 만들고, 그 시트를 사용해서 녹화.

---

## 출력 파일 목록

| 파일 | 경로 | 용도 |
|------|------|------|
| 최종 데모 영상 | ~/claude-projects/Gumroad_project/upload/files/sheetschedule-demo.mp4 | 유튜브, 사이트 등록 |
| 미리보기 GIF | ~/claude-projects/Gumroad_project/upload/files/demo-preview.gif | 디렉토리 사이트 갤러리 |
| 원본 녹화 | ~/claude-projects/Gumroad_project/upload/files/demo-raw.webm | 백업 |

---

## 이미지 파일 위치 (기존 에셋)

/Users/woohyunkim/claude-projects/Gumroad_project/upload/files/
- thumbnail-600x600.png — 로고/썸네일
- cover-1280x720.png — 커버 이미지 (오프닝 타이틀에 사용)
- syncflow-1280x720.png — 동기화 흐름 설명 (대안 장면에 사용)

---

## 관련 MCP 도구 요약

| 도구 | 설치 | 용도 |
|------|------|------|
| Playwright MCP (--save-video) | `claude mcp add playwright -s user -- npx @playwright/mcp@latest --save-video=1920x1080` | 브라우저 조작 + 영상 녹화 (추천) |
| mcp-screen-capture | `git clone https://github.com/chacebot/mcp-screen-capture.git` | 스크린샷, 영상 녹화, GIF 전용 |
| Claude-Code-Video-Toolkit | `https://github.com/wilwaldon/Claude-Code-Video-Toolkit` | Remotion 후처리 + Playwright 녹화 통합 |
| Remotion Skill | `npx skills add remotion` | 프로그래밍 방식 영상 생성 (React 컴포넌트 → MP4) |
| ffmpeg | `brew install ffmpeg` | 영상 변환, 자막 추가, 결합 |

---

## 유튜브 업로드 정보

영상 완성 후 유튜브에 업로드할 때 사용할 정보:

- 제목: SheetSchedule — Turn Google Sheets into a Gantt Chart (Demo)
- 설명:
```
SheetSchedule turns your Google Sheets spreadsheet into an interactive Gantt chart.
Edit a row in Google Sheets, click Refresh, and see it instantly on your timeline.

No database needed. No complex tools. Just your spreadsheet.

$19 one-time purchase — full source code included.

Demo: https://sheetschedule-demo.netlify.app/
Get it: https://goodhap.gumroad.com/l/sheetschedule
GitHub: https://github.com/kimgoodhap-ship-it/sheetschedule

#ProjectManagement #GanttChart #GoogleSheets #IndieHacker #SideProject
```
- 태그: SheetSchedule, Gantt Chart, Google Sheets, Project Management, Productivity, Indie Hacker, Side Project
- 카테고리: Science & Technology
- 썸네일: cover-1280x720.png 사용
