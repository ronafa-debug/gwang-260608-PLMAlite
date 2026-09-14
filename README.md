# PLMA Lite

초등 교사를 위한 웹 앱입니다. AI로 **개별 학습 자료**를 생성·저장·PDF로 보내고, **수업·업무 도구**와 **학교 후불 스토어**(준비물·맞춤 굿즈)를 한곳에서 사용합니다.

**저장소:** [github.com/ronafa-debug/gwang-260608-PLMAlite](https://github.com/ronafa-debug/gwang-260608-PLMAlite)  
**배포:** [plma-lite.vercel.app](https://plma-lite.vercel.app)  
**변경 이력(유지보수용):** [CHANGELOG.md](./CHANGELOG.md)

---

## 기능 구분 요약

| 축 | 내용 | 마이그레이션 | 주요 코드 |
|----|------|--------------|-----------|
| **학습** | 학생, AI 자료 생성, PDF, 내 자료 | `001`–`003`, `008` | `materials/`, `library/`, `diary/`, `storytelling/` |
| **도구** | 수업 도구 · 업무 도구 (로컬/브라우저) | — | `tools/`, `lib/classroomTools.ts`, `lib/workTools.ts` |
| **스토어** | 카탈로그, 주문, 맞춤 굿즈, 청구서, 관리자 | `004`–`007` | `store/`, `admin/`, `lib/storeApi.ts` |
| **관리 · 품질** | 관리자 콘텐츠·품질 대시보드 | `009` | `admin/AdminContentPage.tsx`, `lib/adminContentApi.ts` |
| **공통** | 로그인·Auth, 앱 셸, 데모, 설정 | `003`+ | `AuthContext`, `layout/`, `settings/` |

스토어 이슈와 학습 자료(PDF/AI) 이슈는 도메인·DB가 다릅니다. 상태·회귀 범위는 [CHANGELOG.md](./CHANGELOG.md)를 기준으로 합니다.

---

## 내비 · 정보 구조 (현재)

**데스크톱 사이드바:** 대시보드 · 도구 · 개별 학습 자료 · 스토어 · 설정  
(+ 관리자: 주문 관리 · 콘텐츠 · 품질)

**모바일 하단 탭:** 홈 · 도구 · 학습 · 스토어 · 더보기

| 메뉴 | 내부 구성 |
|------|-----------|
| **도구** | 탭 **수업 도구** \| **업무 도구** |
| **개별 학습 자료** | 탭 **새 자료** \| **내 자료** (라이브러리 통합) |
| **스토어** | 카탈로그 → 장바구니 → 주문하기 → 내 주문(헤더) |
| **설정** | 탭 **교사 정보 관리** \| **학생 정보 관리** |

독립 메뉴로 두지 않음: 학생 관리(설정으로 이동), 자료 라이브러리(학습 자료 탭), 리포트(제거), 내 주문(스토어 헤더)

---

## 주요 기능

### 로그인 · 인증
- 이메일·비밀번호 **회원가입 / 로그인**
- **데모 모드** — 가입 전 UI 미리보기(샘플 학생·스토어). **관리자 메뉴 없음**. AI 자료 생성 클릭 시 회원가입 유도
- Supabase Auth + RLS로 **계정별 데이터 격리**
- **관리자**(`profiles.role = 'admin'`, 데모 제외): 주문 관리 · 콘텐츠·품질

### 대시보드
- 등록 학생·생성 자료·이번 주 생성 통계
- 자료 생성 · 스토어 · (관리자) 주문 관리 바로가기

### 설정
- **교사 정보:** 표시 이름 · 학교·배송지·연락처(스토어 주문 기본값)
- **학생 정보:** 등록·수정·삭제 (이름, 학년, 좋아하는 캐릭터·활동, 메모)
- **학생 사진 (선택):** 상반신 권장 · 목록 썸네일 · Storage `student-photos` (`008`)

### 개별 학습 자료
- **새 자료:** 카탈로그에서 유형 선택 → 생성 (검색·카테고리 칩)
- **사용 가능:** 스토리텔링 · 그림일기 (미리보기·PDF·내 자료 저장)
- **준비 중(목록만):** 따라쓰기 · 받아쓰기 · 수 세기 · 시계 · 돈 계산 · 감정 카드 · 사회성 · 색칠하기
- **내 자료:** 통합 목록, 검색, 미리보기 · PDF · 삭제 · 생성일 **날짜 + 시간**

### 도구
- **수업 도구:** 타이머(BGM) · 스톱워치 · 아날로그 시계(실시간·연습·퀴즈) · 랜덤 뽑기(학생 사진) · 사다리 · 주사위 · 가위바위보 · 계산기 · 화이트보드 · 박수·알림 · 모둠 섞기 · 출석·호명 · 점수판
- **업무 도구 (사용 가능):** 메모장 · 할 일 · 스케줄러 · 알림·리마인더 · 학생 간단 기록 (localStorage)
- **업무 도구 (준비 중):** 출결·지각 메모 · 학급비 장부 · 가정통신 초안 · 상담 일정 · 채점 체크리스트 · 좌석표 · 링크 보관함

### 스토어 (학교 후불 · 카드 PG 없음)
- **카탈로그:** 소모품 · 미술용품 · 맞춤 굿즈
- **장바구니 페이지** → **주문하기(배송 확인)** → **배송 시작** (`submitted`)
- **맞춤 굿즈:** 학생 연동, 사진 업로드, 시안 확인 후 담기
- **내 주문:** 타임라인(주문완료 → 출고준비중 → 배송중 → 배송완료 → 입금확인) · 청구서 · **주문완료일만 취소**
- **관리자:** 주문확인(접수) 후 출고·청구·입금
- 청구서 계좌: `store_billing_settings` / 데모 기본값

### 관리자 · 콘텐츠 품질 (`009`)
- 전체 자료·생성 성공/실패·저장률·과목 분포·평균 생성 시간
- 클라이언트 `generation_events` 로그

상세 주문 상태·취소 규칙 → [CHANGELOG · 스토어](./CHANGELOG.md#스토어-2026-08--학교-후불-스토어-mvp)

---

## 데모: 스토어 스모크

1. **데모 모드로 체험하기**
2. **스토어** → 담기 → **장바구니** → **주문하기** → **배송 시작**
3. 스토어 헤더 **내 주문** — 「주문 완료」, 취소 가능
4. (실계정 관리자) **주문 관리** — **주문확인(접수)**
5. **내 주문** — 「출고준비중」, 취소 잠김
6. 관리자: 출고(배송중) → 청구서(배송완료) → 입금 확인

데모 데이터는 브라우저 localStorage에 저장됩니다(캐시·로그아웃 시 사라질 수 있음). 데모에서는 관리자 메뉴가 보이지 않습니다.

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
├── api/                         # Vercel 서버리스 (AI 생성)
├── server/                      # 로컬 Vite API 미들웨어
├── CHANGELOG.md
├── scripts/smoke.mjs
├── src/
│   ├── components/
│   │   ├── admin/               # 주문 관리 · 콘텐츠·품질
│   │   ├── store/               # 카탈로그 · 장바구니 · 주문 · 청구서
│   │   ├── materials/           # 새 자료 · MaterialsPage
│   │   ├── tools/               # 수업·업무 도구
│   │   ├── library/ diary/ storytelling/
│   │   ├── dashboard/ settings/ students/
│   │   └── layout/              # AppShell · Sidebar · MobileBottomNav
│   ├── lib/
│   │   ├── storeApi.ts cart.ts
│   │   ├── classroomTools.ts workTools.ts
│   │   └── adminContentApi.ts
│   ├── types/                   # store · navigation · adminContent
│   └── contexts/                # Auth (isDemo, isAdmin)
└── supabase/migrations/         # 001–003 학습 · 004–007 스토어 · 008 사진 · 009 품질
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
(파일 경로를 붙여넣지 마세요. **Create a new snippet**에서 실행.)

#### 학습 · 인증 · 학생

| 순서 | 파일 | 설명 |
|------|------|------|
| 1 | `001_initial_schema.sql` | 학생·자료 테이블, Storage |
| 2 | `002_diary_sticker_images.sql` | (선택) 스티커 컬럼 |
| 3 | `003_auth_user_isolation.sql` | 로그인·profiles·RLS·user_id |
| 3b | `008_student_photos.sql` | 학생 사진 · `student-photos` Storage |

#### 스토어

| 순서 | 파일 | 설명 |
|------|------|------|
| 4 | `004_store.sql` | products · orders · order_items, 학교·role, 시드 |
| 5 | `005_store_print_storage.sql` | 맞춤 굿즈 인쇄 이미지 Storage |
| 6 | `006_store_admin_invoice.sql` | 관리자 RLS, 청구/정산 설정 |
| 7 | `007_order_cancel_after_admin_confirm.sql` | 교사 취소는 `submitted`만 |

#### 관리자 품질

| 순서 | 파일 | 설명 |
|------|------|------|
| 8 | `009_admin_content_quality.sql` | 관리자 전체 자료 조회 · generation_events |

관리자 지정:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

`003` 실행 시 destructive 경고가 뜨면 **Run query**로 진행합니다.  
스토어 테이블이 없으면(`Could not find table 'public.products'`) `004`–`007`을 적용하세요.

### 4. 개발 서버

```bash
npm run dev
```

기본 주소: **http://localhost:5151**

### 5. 프로덕션 빌드 · 스모크

```bash
npm run build
npm run smoke    # 필수 파일 존재 + build
npm run preview
```

---

## PDF · 청구서 출력

| 유형 | 방식 |
|------|------|
| 스토리텔링 | 1p 이야기·문제 / 2p 색칠 (`data-pdf-section`, html2canvas) |
| 그림일기 | 1p 원고지 / 2p 일러스트 |
| 스토어 청구서 | 브라우저 인쇄 (`#store-invoice`) |

---

## 프로젝트 주요 내용

### 학습 플랫폼
- 학생 정보 기반 **스토리텔링 학습지** · **그림일기** AI 생성
- **개별 학습 자료** 화면에서 생성·내 자료 통합 관리
- PDF 저장 · 미리보기 · 검색
- 학생 사진(선택) — 랜덤 뽑기 등 수업 도구와 연동 가능
- Supabase Auth + RLS 계정별 격리
- 데모 모드로 가입 없이 UI·스토어 체험 (AI 생성은 가입 유도)

### 수업 · 업무 도구
- 교실에서 바로 쓰는 타이머·시계·뽑기·점수판 등
- 업무용 메모·할 일·스케줄·리마인더·학생 간단 기록 (브라우저 저장)
- 일부 업무 도구는 UI만 배치(준비 중)

### 학교 후불 스토어
- 카드 PG 없음 — 배송 시작 = 주문, 청구서·행정실 계좌이체
- 카탈로그 · **장바구니 페이지** · **주문하기** · **내 주문**(스토어 헤더)
- 맞춤 굿즈: 사진 · 시안 · 학생 연동 (Storage)
- 교사 표시: 주문완료 → 출고준비중 → 배송중 → 배송완료 → 입금확인
- 관리자: 주문확인(접수) → 출고 → 청구 → 입금 (`007` 이후 교사 취소 잠금)

### 관리자
- **주문 관리** — 접수·출고·청구·입금
- **콘텐츠 · 품질** — 생성·저장 지표 (`009`)

---

## 오류 수정 및 개선 사항

### PDF · 학습 자료
- **oklch 색상 오류:** html2canvas 캡처 전 hex/rgb 변환 (`pdfCapture.ts`)
- 스토리텔링 PDF 1p(이야기·문제) / 2p(색칠하기) 분리
- 그림일기 원고지·일러스트 레이아웃 고정
- **그림일기 저장 실패:** 존재하지 않는 `sticker_images` 컬럼 insert 제거
- 라이브러리 생성일 **날짜+시간** 표시
- 브라우저 인쇄 버튼 제거 → PDF 저장으로 통일
- 공용 `StorytellingWorksheet` (생성기·라이브러리·PDF)

### 인증 · UI · 내비
- Supabase Auth 회원가입/로그인, RLS 재실행 안전 (`DROP POLICY IF EXISTS`)
- 데모: 관리자 메뉴 숨김 · AI 생성 시 회원가입 유도 (`exitDemoForSignUp`)
- 사이드바 IA 정리(도구 · 개별 학습 자료 · 스토어 · 설정)
- **모바일 하단 내비** 추가
- 학생 관리·라이브러리를 설정/학습 자료 탭으로 통합, 리포트 메뉴 제거
- Vercel: 환경 변수 변경 후 반드시 **Redeploy** (`OPENAI_API_KEY` 등)

### 설정 · 학생
- 학생 사진 업로드 UI: 네이티브 파일 입력 숨김 · **사진 제거** 버튼
- 데모에서 사진 제거 후 수정 저장 시 `photoUrl` 유지 버그 수정
- 학생 등록/수정 버튼의 불필요한 `+` 아이콘 제거

### 도구
- **아날로그 시계:** 분침 드래그 시 각도 델타로 시 넘김(`applyHandDelta`) — 한 바퀴 이상 회전 시 시 반영

### 스토어
- 장바구니 **슬라이드 오버 제거** → **장바구니·주문하기 페이지**로 분리
- 내 주문을 메인 내비에서 제거하고 스토어 헤더로 이동
- 교사 타임라인 라벨·강조(현재/이전/이후) 정리
- 주문 목록에서 주문 ID·청구서 번호·중복 상태 배지 정리
- 주문 직후 맞춤 굿즈도 **주문완료** → 관리자 접수 후 **출고준비중**
- 관리자 접수 **이후 교사 취소 차단** (UI · API · RLS `007`)
- 상태 전이: `types/store.ts`의 `ADMIN_STATUS_TRANSITIONS`
- `npm run smoke` 회귀 검사

---

## 유지보수 시 빠른 링크

| 하려는 일 | 볼 곳 |
|-----------|--------|
| 주문 상태·취소 규칙 | `CHANGELOG.md` 스토어 절, `src/types/store.ts` |
| 주문 API / 데모 저장 | `src/lib/storeApi.ts` |
| 학습 PDF 깨짐 | `pdfCapture.ts`, 라이브러리 컴포넌트 |
| 도구 카탈로그 | `src/lib/classroomTools.ts`, `src/lib/workTools.ts` |
| 내비 페이지 id | `src/types/navigation.ts` |
| RLS·스키마 | `supabase/migrations/` (`001`–`009`) |

---

## npm 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (포트 5151) |
| `npm run build` | TypeScript 검사 + 프로덕션 빌드 |
| `npm run smoke` | 필수 파일 검사 + 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run vercel:env` | `.env` → Vercel 환경 변수 동기화 |
| `npm run vercel:deploy` | Vercel Production 배포 |

---

## 배포 (Vercel)

1. [GitHub 저장소](https://github.com/ronafa-debug/gwang-260608-PLMAlite) 연결
2. 환경 변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. 환경 변수 변경 후 **Redeploy**
4. Supabase에서 마이그레이션 `001`–`009` 적용 (스토어 `004`–`007`, 학생 사진 `008`, 콘텐츠 품질 `009`)

---

## 라이선스

교육용 MVP — vibecoding experiment
