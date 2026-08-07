# PLMA Lite

초등학생 맞춤형 학습 자료를 AI로 생성·저장·PDF로보내고, **학교 후불 스토어**로 준비물·맞춤 굿즈를 주문하는 웹 앱입니다.

**저장소:** [github.com/ronafa-debug/gwang-260608-PLMAlite](https://github.com/ronafa-debug/gwang-260608-PLMAlite)  
**배포:** [plma-lite.vercel.app](https://plma-lite.vercel.app)  
**변경 이력(유지보수용):** [CHANGELOG.md](./CHANGELOG.md) — 학습 플랫폼(기존) vs 스토어(신규) 구분

---

## 기능 구분 요약

| 축 | 내용 | 마이그레이션 | 주요 코드 |
|----|------|--------------|-----------|
| **기존 · 학습** | 학생, AI 자료 생성, PDF, 라이브러리, 리포트 | `001`–`003` | `materials/`, `library/`, `diary/`, `storytelling/` |
| **신규 · 스토어** | 카탈로그, 주문, 맞춤 굿즈, 청구서, 관리자 | `004`–`007` | `store/`, `admin/`, `lib/storeApi.ts`, `types/store.ts` |
| **공통** | 로그인·Auth, 앱 셸, 데모 모드 | `003` (역할은 `004`+) | `AuthContext`, `layout/` |

스토어 이슈와 학습 자료(PDF/AI) 이슈는 도메인·DB·상태가 다릅니다. 순서·회귀 범위는 [CHANGELOG.md](./CHANGELOG.md)를 기준으로 합니다.

---

## 주요 기능

### 로그인 · 인증
- 이메일·비밀번호 **회원가입 / 로그인**
- **데모 모드** — 샘플 학생, 스토어 주문·관리자 보드까지 브라우저 localStorage (학습 자료는 DB 영구 저장 없음)
- Supabase Auth + RLS로 **계정별 데이터 격리**
- 설정: 표시 이름 · **학교명·배송지·연락처**(스토어 주문 기본값)

### 대시보드
- 등록 학생·생성 자료·이번 주 생성 통계
- 자료 생성 · **스토어 / 내 주문 / (관리자) 주문 관리** 바로가기

### 학생관리
- 학생 등록·수정·삭제 (이름, 학년, 좋아하는 캐릭터·활동, 메모)

### 학습 자료 생성
- **스토리텔링:** 이야기 + 문제 5문항 + 색칠하기 이미지
- **그림일기:** 원고지 따라쓰기 + 컬러·흑백 일러스트
- 미리보기, **PDF 저장**, 자료 라이브러리 **저장**

### 자료 라이브러리
- 스토리텔링·그림일기 통합 목록, 검색, 미리보기 · PDF · 삭제
- 생성일 **날짜 + 시간** 표시

### 스토어 (학교 후불 · 카드 PG 없음)
- **카탈로그:** 소모품 · 미술용품 · 맞춤 굿즈
- **장바구니** (localStorage) → **배송 시작**(주문, 상태 `submitted`)
- **맞춤 굿즈:** 학생 연동, 사진 업로드, 시안 확인 후 담기
- **내 주문:** 타임라인 · 청구서 · **확인 대기일 때만 취소**
- **관리자:** **주문확인(접수)** 후 교사 화면은 제작중/출고 준비중, 이후 출고·청구·입금
- 청구서 계좌 안내: `store_billing_settings` / 데모 기본값

상세 상태·취소 규칙 → [CHANGELOG · 스토어](./CHANGELOG.md#스토어-2026-08--학교-후불-스토어-mvp)

### 리포트
- 학생·자료·유형·과목별 통계

---

## 데모: 스토어 스모크

1. **데모 모드로 체험하기**
2. **스토어** → 담기 → **배송 시작**
3. **내 주문** — 「주문 완료」, 취소 가능
4. **주문 관리** — **주문확인(접수)**
5. **내 주문** — 「제작중」또는 「출고 준비중」, 취소 잠김
6. 관리자: 출고 → 청구서 발송 → 입금 확인

데모 데이터: 브라우저 localStorage (캐시·로그아웃 시 사라질 수 있음).

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
├── CHANGELOG.md                 # 기존 vs 스토어 개발 기록
├── scripts/smoke.mjs            # 필수 파일 + 프로덕션 빌드
├── src/
│   ├── components/
│   │   ├── admin/               # [스토어] 주문 관리
│   │   ├── store/               # [스토어] 카탈로그·주문·청구서
│   │   ├── dashboard/ library/ materials/ …
│   │   └── layout/ settings/
│   ├── lib/storeApi.ts cart.ts  # [스토어]
│   ├── types/store.ts           # [스토어] 상태 머신
│   └── contexts/                # Auth (isDemo, isAdmin)
└── supabase/migrations/         # 001–003 학습·인증 / 004–007 스토어
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

#### 기존 (학습 · 인증)

| 순서 | 파일 | 설명 |
|------|------|------|
| 1 | `001_initial_schema.sql` | 학생·자료 테이블, Storage |
| 2 | `002_diary_sticker_images.sql` | (선택) 스티커 컬럼 |
| 3 | `003_auth_user_isolation.sql` | 로그인·profiles·RLS·user_id |

#### 스토어 (신규)

| 순서 | 파일 | 설명 |
|------|------|------|
| 4 | `004_store.sql` | products · orders · order_items, 학교·role, 시드 |
| 5 | `005_store_print_storage.sql` | 맞춤 굿즈 인쇄 이미지 Storage |
| 6 | `006_store_admin_invoice.sql` | 관리자 RLS, 청구/정산 설정 |
| 7 | `007_order_cancel_after_admin_confirm.sql` | 교사 취소는 관리자 접수 전(`submitted`)만 |

관리자 지정:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

`003` 실행 시 destructive 경고가 뜨면 **Run query**로 진행합니다.

### 4. 개발 서버

```bash
npm run dev
```

기본 주소: **http://localhost:5151**

### 5. 프로덕션 빌드 · 스모크

```bash
npm run build
npm run smoke    # 스토어·마이그레이션 파일 존재 + build
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

### 학습 플랫폼 (기존)
- 학생 정보를 바탕으로 **스토리텔링 학습지** · **그림일기** AI 생성
- 자료 라이브러리 저장·검색·미리보기·**PDF 저장**
- Supabase Auth + RLS **계정별 데이터 격리**
- 데모 모드로 로그인 없이 UI·AI 체험
- 대시보드 셸(사이드바·통계·세이지 그린 테마)

### 학교 후불 스토어 (신규 · 2026-08)
- **카드 PG 없음** — 배송 시작=주문, 청구서·행정실 계좌이체 정산
- 카탈로그(소모품·미술용품·맞춤 굿즈) · 장바구니 · **내 주문**
- 맞춤 굿즈: 사진 업로드 · 시안 확인 · 학생 연동 (Storage)
- 청구서 보기·인쇄 · **관리자 주문 관리**(접수·출고·청구·입금)
- 주문 상태: 주문 완료(`submitted`, 취소 가능) → 관리자 **주문확인(접수)** → 제작중/출고 준비중(취소 잠금) → 출고 → 청구 → 입금
- DB: 마이그레이션 `004`–`007` · 코드 기준 문서 [CHANGELOG.md](./CHANGELOG.md)

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

### 인증 · UI
- Supabase Auth 회원가입/로그인, RLS 정책 재실행 안전 (`DROP POLICY IF EXISTS`)
- 대시보드·사이드바·데모 모드 배너
- Vercel: 환경 변수 등록 후 반드시 **Redeploy** (`OPENAI_API_KEY` 등)

### 스토어
- 주문 직후 맞춤 굿즈도 바로 제작중이 아니라 **확인 대기** → 관리자 접수 후 제작중/출고 준비중
- 관리자 접수 **이후 교사 취소 차단** (UI · API · RLS `007`)
- 교사 취소는 `submitted`에서만, 관리자 상태 전이는 `types/store.ts`의 `ADMIN_STATUS_TRANSITIONS`
- 데모 안내·`npm run smoke` 회귀 검사

---

## 유지보수 시 빠른 링크

| 하려는 일 | 볼 곳 |
|-----------|--------|
| 주문 상태·취소 규칙 | `CHANGELOG.md` 스토어 절, `src/types/store.ts` |
| 주문 API / 데모 저장 | `src/lib/storeApi.ts` |
| 학습 PDF 깨짐 | `pdfCapture.ts`, 라이브러리 컴포넌트 (스토어와 무관) |
| RLS·스키마 | `supabase/migrations/` (`001`–`003` vs `004`–`007`) |

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
4. Supabase에서 마이그레이션 `001`–`007` 적용 (스토어 사용 시 `004`–`007` 필수)

---

## 라이선스

교육용 MVP — vibecoding experiment
