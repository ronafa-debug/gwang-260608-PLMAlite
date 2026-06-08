# PLMA Lite

초등학생 맞춤형 학습 자료를 AI로 생성·저장·PDF로보내는 웹 앱입니다.  
학생 정보를 기반으로 **스토리텔링 학습지**와 **그림일기 워크시트**를 만들고, Supabase에 보관한 뒤 언제든 다시 열람·다운로드할 수 있습니다.

**저장소:** [github.com/ronafa-debug/gwang-260608-PLMAlite](https://github.com/ronafa-debug/gwang-260608-PLMAlite)

---

## 주요 기능

### 학생관리
- 학생 등록·수정·삭제 (이름, 학년, 좋아하는 캐릭터·활동, 메모)
- 스토리텔링·그림일기 생성 시 학생 선택에 활용

### 스토리텔링 생성
- 과목(국어·수학·사회·과학·기타), 학습 목표, 이야기 상황 입력
- OpenAI로 **이야기 본문**, **학습 문제 5문항**(객관식·단답형·서술형), **색칠하기 이미지** 생성
- 미리보기, **PDF 저장**, 자료 라이브러리 **저장**

### 그림일기 생성
- 학생의 일기 초안을 문장 단위로 정리
- **원고지 스타일** 따라쓰기 격자(12열, 첫 줄 들여쓰기, 문장 연속 배치)
- 컬러·흑백 일러스트가 한 장에 포함된 그림 페이지 생성
- A4(210×297mm) 레이아웃, **PDF 저장**, 자료 라이브러리 **저장**

### 자료 라이브러리
- 저장된 스토리텔링·그림일기 통합 목록 (학생명·제목·학습목표 검색)
- 생성일 **날짜 + 시간** 표시
- **미리보기** · **PDF 저장** · **삭제**

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| UI | Radix UI, Lucide Icons |
| 백엔드·DB | Supabase (PostgreSQL, Storage) |
| AI | OpenAI API (GPT, DALL·E) |
| PDF | html2canvas, jsPDF |
| 배포 | Vercel (`api/` 서버리스 함수) |

---

## 프로젝트 구조

```
├── api/                    # Vercel 서버리스 API
│   ├── generate-storytelling.ts
│   └── generate-diary.ts
├── server/                 # 로컬 개발용 Vite API 미들웨어
│   ├── handlers/
│   └── vite-api-plugin.ts
├── src/
│   ├── components/
│   │   ├── diary/          # 그림일기 생성·워크시트
│   │   ├── library/        # 자료 라이브러리·PDF 레이어
│   │   ├── storytelling/   # 스토리텔링 생성·워크시트
│   │   └── students/       # 학생 관리
│   └── lib/                # API, PDF, Supabase 유틸
├── supabase/
│   ├── migrations/         # DB 스키마
│   └── functions/          # Edge Functions (선택)
└── scripts/                # Supabase 설정 자동화 (PowerShell)
```

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

`.env.example`을 복사해 `.env`를 만듭니다.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 서버 전용 (VITE_ 접두사 사용 금지)
OPENAI_API_KEY=sk-your-openai-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Supabase 설정

**방법 A — 스크립트 (Windows PowerShell)**

```powershell
npx supabase login
npm run supabase:setup -- -DbPassword "YourSecurePassword123!"
```

**방법 B — 수동**

1. Supabase 프로젝트 생성
2. `supabase/migrations/001_initial_schema.sql` 실행
3. (선택) `002_diary_sticker_images.sql` 실행

### 4. 개발 서버 실행

```bash
npm run dev
```

기본 주소: **http://localhost:5151**

### 5. 프로덕션 빌드

```bash
npm run build
npm run preview
```

---

## PDF 동작 방식

| 자료 유형 | PDF 페이지 구성 |
|-----------|----------------|
| 스토리텔링 | 1페이지: 이야기 + 학습 문제 / 2페이지: 색칠하기 |
| 그림일기 | 1페이지: 원고지 워크시트 / 2페이지: 일러스트 (있을 때) |

- 미리보기와 PDF는 동일한 DOM(`data-pdf-section`)을 사용해 레이아웃 불일치를 줄였습니다.
- 그림일기 PDF는 여백 0mm, 일러스트 페이지만 단일 페이지에 맞춤 스케일링합니다.

---

## 오류 수정 및 개선 사항

개발 과정에서 해결한 주요 이슈입니다.

### PDF 생성
- **oklch 색상 오류:** Tailwind v4의 `oklch()` 색상이 html2canvas에서 파싱되지 않아, 캡처 전 CSS를 hex/rgb로 변환하도록 처리 (`pdfCapture.ts`)
- **스토리텔링 PDF 페이지 분리:** 1페이지(이야기·문제)와 2페이지(색칠하기)를 섹션 단위로 분리
- **그림일기 원고지 레이아웃:** 12열 전체 너비, A4 고정 크기, 문장 연속 배치·첫 줄 들여쓰기 규칙 적용
- **그림일기 일러스트:** 스티커 방식 대신 컬러(상)·흑백(하) 단일 일러스트로 통일

### 자료 저장
- **그림일기 저장 실패:** DB에 없는 `sticker_images` 컬럼을 insert하던 문제 수정 — 스키마에 맞는 필드만 저장
- **자료 라이브러리 PDF:** 저장된 자료에서도 생성 화면과 동일한 **미리보기 · PDF 저장 · 삭제** 지원
- **생성일 표시:** 날짜만 보이던 항목에 **시간** 추가 (`formatDateTime`)

### UI 정리
- 스토리텔링·그림일기 생성 화면의 **인쇄** 버튼 제거 (PDF 저장으로 통일)
- `StorytellingWorksheet` 공용 컴포넌트로 생성기·라이브러리·PDF 로직 일원화

---

## npm 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (포트 5151) |
| `npm run build` | TypeScript 검사 + 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run supabase:setup` | Supabase 프로젝트 생성·마이그레이션·`.env` 작성 |
| `npm run supabase:secrets` | Edge Function 시크릿 설정 |
| `npm run supabase:verify` | 환경 변수 검증 |

---

## 배포 (Vercel)

1. GitHub 저장소 연결
2. 환경 변수에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 설정
3. `api/` 경로의 서버리스 함수가 AI 생성 API로 동작

---

## 라이선스

Private 프로젝트 — 교육용 MVP
