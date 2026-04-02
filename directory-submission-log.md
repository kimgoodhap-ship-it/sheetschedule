# Directory Submission Log

각 디렉토리 사이트의 폼 구조와 실제 입력 내용을 기록한다.
다음 프로젝트 등록 시 재사용 가능한 레퍼런스.

---

## 1. SideProjectors

- **URL**: https://www.sideprojectors.com/submit/type
- **등록일**: 2026-04-02
- **상태**: Submitted (리뷰 대기 2-3 영업일)
- **Project ID**: 76965
- **로그인 방식**: GitHub, GitLab, ProductHunt, LinkedIn, X, 또는 이메일

### 제출 흐름 (6단계)

#### Step 1: Project Information (필수)
| 필드 | 타입 | 필수 | 입력값 |
|------|------|------|--------|
| What type of project | 드롭다운 | Yes | Website / Web Application |
| Project name | 텍스트 (50자 제한) | Yes | SheetSchedule |
| Logo | 이미지 업로드 (256x256 이상) | No | thumbnail-600x600.png |
| Pitch (한 줄 소개) | 텍스트 (80자 제한) | Yes | Turn Google Sheets into an interactive Gantt chart instantly. |
| Project homepage | URL | No | https://sheetschedule-demo.netlify.app/ |
| Project description | 리치 텍스트 (Quill 에디터) | Yes | (긴 설명 - features, tech stack, links 포함) |
| Markets (최대 5개) | 멀티셀렉트 (태그 방식) | Yes | Project Management |
| Social Media Links | 텍스트 x10 | No | (비워둠) |

**타입 옵션**: SaaS Business, E-Commerce Store, Blog, Website/Web Application, Mobile App, Desktop App, Browser extension/Plugin, Domain Name, Other

**로고 업로드 방식**: 모달 팝업 → "Via URL" 또는 "Or upload (1MB max)" → file input → Submit 버튼

**Description 에디터**: Quill 리치 텍스트 에디터 (Bold, Italic, Underline, Strike, Size, Color, Blockquote, Code, Lists, Link)

**Markets 입력 방식**: Vue multiselect 컴포넌트 → 텍스트 입력 → 드롭다운에서 선택 → Enter로 확정

#### Step 2: Media
| 필드 | 타입 | 필수 | 입력값 |
|------|------|------|--------|
| Screenshots | 이미지 업로드 (ADD 버튼 → 모달) | No | cover-1280x720.png |
| Videos | YouTube/Vimeo URL (ADD 버튼 → 모달) | No | (비워둠) |

**이미지 업로드 방식**: "ADD" 클릭 → 모달("Via URL" 또는 "Or upload 1MB max") → file input → Submit

#### Step 3: How is this project built? (최소 1개 필수)
| 필드 | 타입 | 필수 | 입력값 |
|------|------|------|--------|
| Languages | 멀티셀렉트 | 1개 이상 | TypeScript |
| Frameworks | 멀티셀렉트 | No | React |
| Libraries & Packages | 멀티셀렉트 | No | (비워둠) |
| Databases | 멀티셀렉트 | No | (비워둠) |
| Hosting & Infrastructure | 멀티셀렉트 | No | Netlify |
| Third-Party SaaS & APIs | 멀티셀렉트 | No | (비워둠) |
| Other | 리치 텍스트 | No | (비워둠) |
| Any other info | 리치 텍스트 | No | (비워둠) |

**입력 방식**: 모두 Vue multiselect → 텍스트 입력 → 드롭다운 자동완성 → Enter

#### Step 4: Metrics (선택)
| 필드 | 타입 | 필수 | 입력값 |
|------|------|------|--------|
| Monthly revenue | 텍스트 | No | (스킵) |
| Monthly traffic | 텍스트 | No | (스킵) |
| Users/Customers | 텍스트 | No | (스킵) |

#### Step 5: Potential sale discussion (선택)
- Showcase 모드에서는 대부분 스킵 가능
- 판매 관련 질문 (가격, 판매 이유 등)

#### Step 6: Confirm & submit
| 필드 | 타입 | 필수 | 입력값 |
|------|------|------|--------|
| 약관 동의 체크박스 | 체크박스 | Yes | 체크 |

### 자동화 팁
- **Shortcut 옵션**: "Fetch from homepage" (URL 입력 → 자동 정보 수집), "Import from GitHub", "Start from scratch" 중 선택 가능
- **multiselect 컴포넌트**: `.multiselect__input` CSS 셀렉터로 접근, `value` 설정 후 `input` 이벤트 디스패치, Enter로 확정
- **이미지 업로드**: `input[type="file"]`를 찾아 `display:block` 후 click → file chooser → `setFiles()`
- **리치 텍스트**: Quill 에디터의 paragraph 요소에 `fill()` 사용
- **리뷰 기간**: 제출 후 2-3 영업일 소요

### 결과
- 제출 성공 페이지: `https://www.sideprojectors.com/submit/done/{project_id}`
- 이메일로 승인 알림

---

## 2. AlternativeTo

- **URL**: https://alternativeto.net/
- **Submit URL**: https://alternativeto.net/api/auth/login (로그인 후 접근)
- **등록일**: 스킵
- **상태**: skipped (Google 로그인 실패 - 수동 처리 필요)
- **로그인 방식**: 이메일/비밀번호, Google, Microsoft, (Facebook, GitHub 등 스크롤 필요)
- **참고**: Auth0 기반 로그인 (auth.alternativeto.net), submit URL은 `/manage/new/`가 404 반환 — 로그인 후 확인 필요
- **수동 처리 시 방법**: 이메일로 회원가입 후 앱 등록, 또는 브라우저에서 직접 Google 로그인 시도

---

## 3. Uneed

- **URL**: https://www.uneed.best/
- **Submit URL**: https://www.uneed.best/submit-a-tool
- **Edit URL**: https://www.uneed.best/edit/waiting-line/28397
- **등록일**: 2026-04-02
- **상태**: partial (Tags, Logo 수동 완료 필요)
- **Product ID**: 28397
- **로그인 방식**: Google, 이메일/비밀번호

### 제출 흐름 (2단계)

#### Step 1: Submit (매우 심플 — 2개 필드)
| 필드 | 타입 | 필수 | 입력값 |
|------|------|------|--------|
| Your product name | 텍스트 | Yes | SheetSchedule |
| Your product address | URL | Yes | https://sheetschedule-demo.netlify.app/ |

Submit 클릭 → 사이트가 자동으로 URL에서 제품 정보를 스크래핑 → 편집 페이지로 이동

#### Step 2: Edit (4개 탭: General, Media, Socials, Sell)

**General 탭:**
| 필드 | 타입 | 필수 | 입력값 |
|------|------|------|--------|
| Name | 텍스트 | Yes | SheetSchedule (자동) |
| Slug | 텍스트 | Yes | sheetschedule (자동) |
| Url | URL | Yes | https://sheetschedule-demo.netlify.app/ (자동) |
| Category | 드롭다운 (Development/Design/Business/Marketing/Personal Life) | Yes | Business |
| Pricing | 드롭다운 (Free/Freemium/Paid) | Yes | Paid |
| Tags | 커스텀 멀티셀렉트 (Nuxt UI) | Yes | (수동 선택 필요) |
| Tagline | textarea (80자 제한) | Yes | Turn Google Sheets into a Gantt chart. Edit your spreadsheet, see it instantly. |
| Rich Description | Tiptap 리치 텍스트 에디터 (contenteditable) | Yes | (features, tech stack, Gumroad link 포함) |

**완료 체크리스트** (왼쪽 사이드바에 표시):
- Name, Slug, Url, Category, Pricing, Tagline, RichDescription, Logo, Tags 모두 OK여야 "Schedule your launch" 가능

### 자동화 팁
- **Submit 폼**: `input[name="name"]`과 `input[name="url"]`에 값 설정 후 "Submit your Product" 버튼 클릭
- **Category/Pricing**: native select → `HTMLSelectElement.prototype.value.set` 사용 필요 (Vue/Nuxt 반응성)
- **Tagline**: `textarea[name="description"]` — 80자 제한 주의
- **Rich Description**: `[contenteditable="true"]` 요소에 innerHTML 직접 설정
- **Tags**: Nuxt UI 커스텀 컴포넌트 — 자동화 어려움, 수동 클릭 추천
- **Logo**: Media 탭에서 업로드
  1. Media 탭 전환: `pointerdown` + `pointerup` + `click` 이벤트 조합 (Nuxt UI Headless Tabs)
  2. file input 찾기: `document.getElementById('single')` (Logo용, 단일 파일)
  3. file input 클릭: `.click()` → file chooser 모달 뜸
  4. `browser_file_upload` 도구로 파일 경로 지정
  5. Save 버튼 클릭

### 이미지 업로드 범용 패턴 (학습 사항)
```
1. input[type="file"] 요소 찾기 (evaluate로 DOM 탐색)
2. .click() 호출 → "Modal state: [File chooser]" 확인
3. browser_file_upload 도구에 절대 경로 전달
4. 저장 버튼 클릭
```
- SideProjectors: 모달 팝업 방식 (파일 선택 → Submit 버튼)
- Uneed: 드래그앤드롭 영역 (input[type="file"] 직접 클릭)

### 결과
- 편집 URL: `https://www.uneed.best/edit/waiting-line/{product_id}`
- 완료 후 "Schedule your launch"로 런치 일정 예약

---

## Template: 새 사이트 등록 시 기록 양식

```markdown
## N. [사이트명]

- **URL**: 
- **Submit URL**: 
- **등록일**: 
- **상태**: 
- **로그인 방식**: 

### 제출 흐름

#### Step 1: [단계명]
| 필드 | 타입 | 필수 | 입력값 |
|------|------|------|--------|
| | | | |

### 자동화 팁
- 

### 결과
- 
```
