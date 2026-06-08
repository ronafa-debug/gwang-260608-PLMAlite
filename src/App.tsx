import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { MaterialLibrary } from '@/components/library/MaterialLibrary'
import { MaterialGenerator } from '@/components/materials/MaterialGenerator'
import { ReportsPage } from '@/components/reports/ReportsPage'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { StudentManagement } from '@/components/students/StudentManagement'
import { LoadingState } from '@/components/shared/LoadingState'
import { useAuth } from '@/contexts/AuthContext'
import { useLibraryItems } from '@/hooks/useLibraryItems'
import { useStudents } from '@/hooks/useStudents'
import { LoginPage } from '@/pages/LoginPage'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { AppPage, GenerateTab } from '@/types/navigation'

function SetupNotice() {
  return (
    <div className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">환경 설정이 필요합니다</p>
      <p className="mt-1">
        프로젝트 루트에 <code>.env</code> 파일을 만들고 Supabase URL/키를 설정한 뒤,{' '}
        <code>supabase/migrations</code>을 실행해 주세요.
      </p>
    </div>
  )
}

function AppContent() {
  const { user, isDemo, signOut } = useAuth()
  const { students, loading, error, addStudent, editStudent, removeStudent } = useStudents()
  const { items, loading: libraryLoading } = useLibraryItems()

  const [page, setPage] = useState<AppPage>('dashboard')
  const [generateTab, setGenerateTab] = useState<GenerateTab>('storytelling')

  const openGenerate = (tab: GenerateTab) => {
    setGenerateTab(tab)
    setPage('generate')
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            students={students}
            items={items}
            loading={libraryLoading}
            teacherName={user?.name ?? '선생님'}
            onNavigate={setPage}
            onGenerate={openGenerate}
          />
        )
      case 'students':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">학생 관리</h1>
              <p className="mt-1 text-muted-foreground">
                학생 정보를 등록하고 맞춤 학습 자료 생성에 활용하세요.
              </p>
            </div>
            <StudentManagement
              students={students}
              loading={loading}
              error={error}
              onAdd={addStudent}
              onEdit={editStudent}
              onDelete={removeStudent}
            />
          </div>
        )
      case 'generate':
        return (
          <MaterialGenerator
            students={students}
            activeTab={generateTab}
            onTabChange={setGenerateTab}
          />
        )
      case 'library':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">자료 라이브러리</h1>
              <p className="mt-1 text-muted-foreground">
                저장된 학습 자료를 검색하고 미리보기·PDF 저장·삭제할 수 있습니다.
              </p>
            </div>
            <MaterialLibrary />
          </div>
        )
      case 'reports':
        return (
          <ReportsPage
            items={items}
            studentCount={students.length}
            loading={libraryLoading}
          />
        )
      case 'settings':
        return <SettingsPage />
      default:
        return null
    }
  }

  return (
    <AppShell
      activePage={page}
      onNavigate={setPage}
      teacherName={user?.name ?? '선생님'}
      isDemo={isDemo}
      onSignOut={() => void signOut()}
    >
      {!isSupabaseConfigured && !isDemo ? <SetupNotice /> : null}
      {renderPage()}
    </AppShell>
  )
}

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState message="로그인 상태를 확인하는 중..." />
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <AppContent />
}

export default App
