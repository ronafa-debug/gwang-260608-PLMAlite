import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_USER } from '@/lib/demoData'
import { getStorageItem, removeStorageItem, setStorageItem } from '@/lib/storage'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { AuthUser } from '@/types/auth'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  enterDemo: () => void
  updateDisplayName: (name: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapSessionUser(metaName?: string, email?: string | null, id?: string): AuthUser {
  return {
    id: id ?? '',
    name: metaName?.trim() || '선생님',
    email: email ?? '',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    getStorageItem<AuthUser | null>('user', null),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(() => getStorageItem('isDemo', false))

  const persistUser = useCallback((next: AuthUser | null, demo: boolean) => {
    if (next) {
      setStorageItem('user', next)
    } else {
      removeStorageItem('user')
    }
    setStorageItem('isDemo', demo)
    setUser(next)
    setIsDemo(demo)
  }, [])

  useEffect(() => {
    const client = supabase
    if (!isSupabaseConfigured || !client) {
      setIsLoading(false)
      return
    }

    let mounted = true

    const init = async () => {
      const storedDemo = getStorageItem('isDemo', false)
      if (storedDemo && getStorageItem<AuthUser | null>('user', null)?.id === DEMO_USER.id) {
        if (mounted) {
          setUser(DEMO_USER)
          setIsDemo(true)
          setIsLoading(false)
        }
        return
      }

      const {
        data: { session },
      } = await client.auth.getSession()

      if (!mounted) return

      if (session?.user) {
        const next = mapSessionUser(
          session.user.user_metadata?.name as string | undefined,
          session.user.email,
          session.user.id,
        )
        persistUser(next, false)
      } else {
        persistUser(null, false)
      }
      setIsLoading(false)
    }

    void init()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (getStorageItem('isDemo', false)) return

      if (session?.user) {
        const next = mapSessionUser(
          session.user.user_metadata?.name as string | undefined,
          session.user.email,
          session.user.id,
        )
        persistUser(next, false)
      } else {
        persistUser(null, false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [persistUser])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: 'Supabase가 설정되지 않았습니다. 데모 모드를 이용해 주세요.' }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { error: error.message } : {}
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!supabase) {
      return { error: 'Supabase가 설정되지 않았습니다. 데모 모드를 이용해 주세요.' }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return error ? { error: error.message } : {}
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    removeStorageItem('user')
    removeStorageItem('isDemo')
    setUser(null)
    setIsDemo(false)
  }, [])

  const enterDemo = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    persistUser(DEMO_USER, true)
    setIsLoading(false)
  }, [persistUser])

  const updateDisplayName = useCallback(
    (name: string) => {
      if (!user) return
      const next = { ...user, name: name.trim() || '선생님' }
      setStorageItem('user', next)
      setUser(next)
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isDemo,
      signIn,
      signUp,
      signOut,
      enterDemo,
      updateDisplayName,
    }),
    [user, isLoading, isDemo, signIn, signUp, signOut, enterDemo, updateDisplayName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
