# PLMA Lite

초등학생 맞춤형 학습 자료를 AI로 생성·저장·PDF로보내는 웹 앱입니다.  
학생 정보를 기반으로 **스토리텔링 학습지**와 **그림일기 워크시트**를 만들고, Supabase에 보관한 뒤 언제든 다시 열람·다운로드할 수 있습니다.

**저장소:** [github.com/ronafa-debug/gwang-260608-PLMAlite](https://github.com/ronafa-debug/gwang-260608-PLMAlite)  
**배포:** [plma-lite.vercel.app](https://plma-lite.vercel.app)

---

## 주요 기능

### 로그인 · 인증
- 이메일·비밀번호 **회원가입 / 로그인**
- **데모 모드** — 샘플 학생 데이터로 UI·AI 생성 체험 (자료 DB 저장 제외)
- Supabase Auth + RLS로 **계정별 데이터 격리**
- 로그아웃, 설정에서 표시 이름 변경

### 대시보드
- 등록 학생·생성 자료·이번 주 생성·이미지 포함 자료 통계
- 최근 생성 자료 목록, 새 자료 생성 바로가기
- 사이드바 네비게이션 (대시보드 · 학생 관리 · 학습 자료 생성 · 자료 라이브러리 · 리포트 · 설정)

### 학생관리
- 학생 등록·수정·삭제 (이름, 학년, 좋아하는 캐릭터·활동, 메모)
- 로그인한 계정에 속한 학생만 조회·관리

### 학습 자료 생성
- **스토리텔링:** 과목, 학습 목표, 이야기 상황 → 이야기 + 문제 5문항 + 색칠하기 이미지
- **그림일기:** 일기 초안 → 원고지 따라쓰기 + 컬러·흑백 일러스트
- 미리보기, **PDF 저장**, 자료 라이브러리 **저장**

### 자료 라이브러리
- 저장된 스토리텔링·그림일기 통합 목록 (학생명·제목·학습목표 검색)
- 생성일 **날짜 + 시간** 표시
- **미리보기** · **PDF 저장** · **삭제**

### 리포트
- 등록 학생·전체 자료·유형별(스토리텔링/그림일기)·과목별 통계

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| UI | Radix UI, Lucide Icons |
| 인증 | Supabase Auth, Row Level Security (RLS) |
| 백엔드·DB | Supabase (PostgreSQL, Storage) |
| AI | OpenAI API (GPT, DALL·E) |
| PDF | html2canvas, jsPDF |
| 배포 | Vercel (`api/` 서버리스 함수) |

---

## 프로젝트 구조

```
├── api/                    # Vercel 서버리스 API
├── server/                 # 로컬 개발용 Vite API 미들웨어
├── src/
│   ├── components/
│   │   ├── dashboard/      # 대시보드
│   │   ├── diary/          # 그림일기
│   │   ├── layout/         # 사이드바·헤더·앱 셸
│   │   ├── library/        # 자료 라이브러리·PDF
│   │   ├── materials/      # 학습 자료 생성 (탭)
│   │   ├── storytelling/   # 스토리텔링
│   │   └── students/       # 학생 관리
│   ├── contexts/           # AuthContext
│   ├── pages/              # LoginPage
│   └── lib/                # API, PDF, Supabase 유틸
├── supabase/migrations/    # DB 스키마 (001~003)
└── scripts/                # Supabase·Vercel 설정 스크립트
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

OPENAI_API_KEY=sk-your-openai-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Supabase DB 마이그레이션

Supabase Dashboard → **SQL Editor**에서 아래 파일 **내용 전체**를 순서대로 실행합니다.  
(파일 경로를 붙여넣지 마세요.)

| 순서 | 파일 | 설명 |
|------|------|------|
| 1 | `001_initial_schema.sql` | 학생·자료 테이블, Storage |
| 2 | `002_diary_sticker_images.sql` | (선택) 스티커 컬럼 |
| 3 | `003_auth_user_isolation.sql` | 로그인·profiles·RLS·user_id |

`003` 실행 시 destructive 경고가 뜨면 **Run query**를 눌러 진행합니다.  
이미 일부 적용된 경우에도 `003`은 `DROP POLICY IF EXISTS`로 재실행 가능합니다.

### 4. 개발 서버

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

- 미리보기와 PDF는 동일한 DOM(`data-pdf-section`)을 사용합니다.
- 그림일기 PDF는 여백 0mm, 일러스트 페이지만 단일 페이지에 맞춤 스케일링합니다.

---

## 오류 수정 및 개선 사항

### PDF 생성
- **oklch 색상 오류:** html2canvas 호환을 위해 캡처 전 CSS를 hex/rgb로 변환 (`pdfCapture.ts`)
- **스토리텔링 PDF:** 1페이지(이야기·문제) / 2페이지(색칠하기) 섹션 분리
- **그림일기 원고지:** 12열, A4 고정, 문장 연속 배치·첫 줄 들여쓰기
- **그림일기 일러스트:** 컬러(상)·흑백(하) 단일 일러스트

### 자료 저장 · 라이브러리
- **그림일기 저장 실패:** 존재하지 않는 `sticker_images` 컬럼 insert 제거
- **라이브러리 PDF:** 미리보기 · PDF 저장 · 삭제 (생성 화면과 동일 레이아웃)
- **생성일:** 날짜 + 시간 표시 (`formatDateTime`, `formatRelativeDate`)

### Vercel 배포
- **OPENAI_API_KEY 미설정 오류:** Environment Variables 등록 후 **재배포** 필요
- `npm run vercel:env` — `.env` → Vercel 동기화
- `npm run vercel:deploy` — Production 배포

### UI · 인증 (최신)
- **대시보드 UI:** 사이드바·통계 카드·최근 자료·세이지 그린 테마
- **로그인/회원가입:** Supabase Auth, 계정별 RLS 데이터 격리
- **데모 모드:** 로그인 없이 샘플 데이터 체험
- **인쇄 버튼 제거:** PDF 저장으로 통일
- **`StorytellingWorksheet`:** 생성기·라이브러리·PDF 공용 컴포넌트

### Supabase 마이그레이션
- **정책 중복 오류 (42710):** `003`에 `DROP POLICY IF EXISTS` 추가로 재실행 안전

---

## npm 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (포트 5151) |
| `npm run build` | TypeScript 검사 + 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run supabase:setup` | Supabase 프로젝트 생성·마이그레이션 |
| `npm run vercel:env` | `.env` → Vercel 환경 변수 동기화 |
| `npm run vercel:deploy` | Vercel Production 배포 |

---

## 배포 (Vercel)

1. [GitHub 저장소](https://github.com/ronafa-debug/gwang-260608-PLMAlite) 연결
2. 환경 변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. 환경 변수 변경 후 반드시 **Redeploy**
4. Supabase SQL Editor에서 `003_auth_user_isolation.sql` 적용 (로그인 기능)

---

## 라이선스

교육용 MVP — vibecoding experiment
