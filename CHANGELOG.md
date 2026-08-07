# Changelog

PLMA Lite 변경 이력을 **학습 플랫폼(기존)** 과 **스토어(신규)** 로 구분해 둡니다.  
자세한 사용법은 [README.md](./README.md)를 보세요.

---

## [스토어] 2026-08 — 학교 후불 스토어 MVP

학습 자료(학생·AI 생성·PDF·라이브러리)와 **별도 도메인**으로 추가된 기능입니다.  
카드 PG 없음. 주문 → 출고 → **청구서** → 행정실 **계좌이체(후불)**.

### 범위 한 줄
- **교사:** 카탈로그 · 장바구니 · 주문(배송 시작) · 내 주문 · 청구서 · 학교/배송 설정  
- **관리자** (`profiles.role = 'admin'`): 주문확인(접수) · 출고 · 청구 · 입금 확인  
- **데모:** 주문·배송 정보는 브라우저 localStorage (DB 영구 저장 없음)

### 주문 상태 머신 (유지보수 핵심)

코드 기준: `src/types/store.ts` (`ADMIN_STATUS_TRANSITIONS`, `getCustomerStatusLabel`)

| DB status | 고객 표시 | 관리자 액션 예 | 교사 취소 |
|-----------|-----------|----------------|-----------|
| `submitted` | 주문 완료 (확인 대기) | **주문확인(접수)** → `in_production` | ✅ 가능 |
| `in_production` | 맞춤 굿즈 있으면 **제작중**, 소모품만이면 **출고 준비중** | 출고 처리 | ❌ 불가 |
| `shipped` | 출고됨 | 청구서 발송 | ❌ |
| `invoiced` | 청구서 발송 | 입금 확인 | ❌ |
| `paid` | 입금확인 | — | ❌ |
| `cancelled` | 취소됨 | — | — |

흐름:

```
교사 주문 → submitted (취소 가능)
    → 관리자 「주문확인(접수)」 → in_production (취소 잠금)
    → 출고 → shipped → 청구 → invoiced → 입금 → paid
```

- 신규 주문은 항상 `submitted` (맞춤 굿즈도 즉시 제작중으로 두지 않음).  
- 관리자는 `submitted`에서 바로 출고하지 않음 (`in_production` 경유).

### 마이그레이션 (스토어만)

| 파일 | 내용 |
|------|------|
| `004_store.sql` | products, orders, order_items, profiles 학교·role, 시드, RLS |
| `005_store_print_storage.sql` | 맞춤 인쇄 이미지 Storage 버킷·정책 |
| `006_store_admin_invoice.sql` | 관리자 주문 RLS, `store_billing_settings` |
| `007_order_cancel_after_admin_confirm.sql` | 교사 취소는 `submitted`에서만 (`in_production` 이후 차단) |

관리자 지정:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

### 주요 경로

| 영역 | 경로 |
|------|------|
| 타입·상태 전이 | `src/types/store.ts` |
| API·데모 주문 | `src/lib/storeApi.ts`, `src/lib/cart.ts` |
| 교사 UI | `src/components/store/*` |
| 관리자 UI | `src/components/admin/AdminOrdersPage.tsx` |
| 내비 | `store` / `orders` / `admin_orders` (`App.tsx`, `Sidebar.tsx`) |

### 단계별 출시 (내부 Phase)

1. 카탈로그 · 장바구니 · 배송 시작 · 내 주문 · 설정(학교·배송)  
2. 맞춤 굿즈(사진 · 시안 · 학생 연동 · Storage)  
3. 청구서 · 관리자 보드 · 입금  
4. 데모 안내 · README · `npm run smoke`  
5. 주문확인(접수) 후 고객 표시·취소 잠금 (`007`)

### 스모크 체크리스트

1. 데모 로그인 → 스토어 담기 → 배송 시작  
2. 내 주문: **주문 완료**, 취소 버튼 있음  
3. 주문 관리: **주문확인(접수)**  
4. 내 주문: **제작중** 또는 **출고 준비중**, 취소 없음  
5. 출고 → 청구서 → 입금 확인  

자동화: `npm run smoke` (필수 파일 + `build`)

---

## [기존] 학습 플랫폼 · 인증 · UI (스토어 이전)

스토어와 독립적으로 이미 있던 축입니다. 스토어 버그 조사 시 아래와 섞지 마세요.

### 인증 · 데이터 격리
- Supabase Auth, 데모 모드  
- `003_auth_user_isolation.sql` — profiles, `user_id`, RLS  

### 학생 · AI 학습 자료
- 학생 CRUD  
- 스토리텔링 / 그림일기 생성 (`/api/generate-*`, OpenAI)  
- 라이브러리 저장 · 미리보기 · 삭제  
- PDF (`html2canvas` / `jsPDF`, oklch 캡처 보정)  

### UI 셸
- 사이드바 · TopBar · 대시보드 · 리포트 · 설정(표시 이름)  
- 세이지 그린 대시보드 테마  

### 마이그레이션 (기존)

| 파일 | 내용 |
|------|------|
| `001_initial_schema.sql` | students, materials, storage |
| `002_diary_sticker_images.sql` | (선택) |
| `003_auth_user_isolation.sql` | Auth · RLS · user_id |

### 알려진 개선 (기존)
- 그림일기 저장 시 미존재 `sticker_images` 컬럼 제거  
- 라이브러리 생성일 시간 표시  
- Vercel 환경 변수 변경 후 Redeploy 필요 (`OPENAI_API_KEY` 등)

---

## 공통 (양쪽이 공유)

- React 19 · Vite · Tailwind · Supabase · Vercel  
- 로그인 후 AppShell 네비 (스토어 메뉴는 이후에 추가)  
- 설정의 **학교·배송** 필드는 스토어 주문 기본값용 (스토어와 함께 확장됨)
