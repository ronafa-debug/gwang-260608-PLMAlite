import { useState } from 'react'
import { Leaf, Lock, Mail, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function LoginPage() {
  const { signIn, signUp, enterDemo } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const result = isSignUp
      ? await signUp(email, password, name)
      : await signIn(email, password)

    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }

    if (isSignUp && supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        window.alert('가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.')
        setIsSignUp(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">PLMA</h1>
            <p className="text-sm text-white/80">맞춤 학습 자료</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            아이들이 좋아하는 것으로
            <br />
            배우는 즐거운 교실
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-white/80">
            스토리텔링 학습지와 그림일기로
            <br />
            학생 맞춤형 학습 자료를 만들어 보세요.
          </p>
          <div className="flex gap-3">
            {['📖 스토리텔링', '📝 그림일기', '🎨 색칠하기'].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/60">모든 아이가 자신이 좋아하는 것으로 배울 수 있도록</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-foreground">PLMA Lite</h1>
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <p className="mt-1 mb-8 text-muted-foreground">
            {isSignUp ? '새 계정을 만들어 시작하세요' : '선생님, 다시 오신 것을 환영해요!'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp ? (
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl pl-10"
                  required
                />
              </div>
            ) : null}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl pl-10"
                required
                minLength={6}
              />
            </div>

            {error ? (
              <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="h-11 w-full rounded-2xl" disabled={loading}>
              {loading ? '처리 중...' : isSignUp ? '가입하기' : '로그인'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp((prev) => !prev)
                setError('')
              }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </div>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-6 h-11 w-full rounded-2xl"
            onClick={enterDemo}
          >
            🌱 데모 모드로 체험하기
          </Button>
        </div>
      </div>
    </div>
  )
}
