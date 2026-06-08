# Supabase 토큰 · .env 설정 가이드

## 채팅에 토큰을 붙여넣어도 되나요?

**권장하지 않습니다.** Access Token, DB 비밀번호, OpenAI API Key는 채팅이 아닌 **로컬 터미널**에만 입력하세요.

## .env 파일을 직접 만들어야 하나요?

**아니요.** `scripts/setup-supabase.ps1` 또는 `scripts/setup-all.ps1`이 자동으로 `.env`를 생성합니다.

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 값이 저장되는 위치

| 값 | 저장 위치 | 용도 |
|----|-----------|------|
| Access Token | 터미널 / CLI 세션만 | 프로젝트 생성·연결 (1회) |
| `VITE_SUPABASE_URL` | `.env` | React 앱 |
| `VITE_SUPABASE_ANON_KEY` | `.env` | React 앱 |
| `OPENAI_API_KEY` | `supabase secrets set` | Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase secrets set` | Edge Functions Storage |

`OPENAI_API_KEY`를 `.env`에 `VITE_` 접두사로 넣으면 브라우저에 노출되므로 넣지 마세요.

## 권장 진행 순서

### 한 번에 설정 (권장)

PowerShell에서 프로젝트 루트로 이동 후:

```powershell
.\scripts\setup-all.ps1
```

1. 브라우저 Supabase 로그인
2. DB 비밀번호 입력
3. 프로젝트 생성 + `.env` 자동 작성
4. (선택) Edge Functions 배포

### 단계별 설정

```powershell
# 1) 인증
npx supabase login

# 2) 프로젝트 + .env
.\scripts\setup-supabase.ps1 -DbPassword "YourSecurePassword123!"

# 3) 앱 실행
npm run dev

# 4) Edge Functions
.\scripts\setup-edge-secrets.ps1
```

### AI 기능 (Edge Functions) 배포

학생 등록은 되지만 스토리텔링/그림일기 생성 시 오류가 나면 Edge Function이 배포되지 않은 것입니다.

```powershell
npm run supabase:deploy
```

1. Supabase 브라우저 로그인
2. OpenAI API Key (`sk-...`) 입력
3. 자동 배포 완료 후 앱에서 다시 시도

### Access Token 방식 (터미널에서만)

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_여기에_토큰"
.\scripts\setup-supabase.ps1 -DbPassword "YourSecurePassword123!"
```

## 대시보드에서 수동 생성한 경우

```powershell
copy .env.example .env
```

Supabase 대시보드 **Project Settings → API**에서 URL과 `anon` key를 복사해 `.env`에 입력합니다.
