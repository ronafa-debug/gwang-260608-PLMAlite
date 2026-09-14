import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { AdminContentPage } from '@/components/admin/AdminContentPage'
import { AdminOrdersPage } from '@/components/admin/AdminOrdersPage'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { MaterialsPage } from '@/components/materials/MaterialsPage'
import { ClassroomToolsPage } from '@/components/tools/ClassroomToolsPage'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { OrdersPage } from '@/components/store/OrdersPage'
import { CartPage } from '@/components/store/CartPage'
import { CheckoutPage } from '@/components/store/CheckoutPage'
import { StorePage } from '@/components/store/StorePage'
import { LoadingState } from '@/components/shared/LoadingState'
import { useAuth } from '@/contexts/AuthContext'
import { useLibraryItems } from '@/hooks/useLibraryItems'
import { useStudents } from '@/hooks/useStudents'
import { LoginPage } from '@/pages/LoginPage'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { AppPage, GenerateTab, MaterialsSection, SettingsTab } from '@/types/navigation'

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
  const { user, isDemo, isAdmin, signOut } = useAuth()
  const { students, loading, error, addStudent, editStudent, removeStudent } = useStudents()
  const { items, loading: libraryLoading } = useLibraryItems()

  const [page, setPage] = useState<AppPage>('dashboard')
  const [generateTab, setGenerateTab] = useState<GenerateTab>('storytelling')
  const [generateEntry, setGenerateEntry] = useState<'catalog' | 'workspace'>('catalog')
  const [materialsSection, setMaterialsSection] = useState<MaterialsSection>('create')
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('teacher')

  const goToPage = (next: AppPage) => {
    if (next === 'library') {
      setMaterialsSection('library')
      setGenerateEntry('catalog')
      setPage('generate')
      return
    }
    if (next === 'generate') {
      setMaterialsSection('create')
      setGenerateEntry('catalog')
    }
    if (next === 'students') {
      setSettingsTab('students')
      setPage('settings')
      return
    }
    if (next === 'settings') {
      setSettingsTab('teacher')
    }
    setPage(next)
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
            onNavigate={goToPage}
          />
        )
      case 'students':
        return null
      case 'generate':
      case 'library':
        return (
          <MaterialsPage
            section={materialsSection}
            onSectionChange={setMaterialsSection}
            students={students}
            materialType={generateTab}
            onMaterialTypeChange={setGenerateTab}
            entryMode={generateEntry}
            onEntryModeChange={setGenerateEntry}
          />
        )
      case 'tools':
        return <ClassroomToolsPage />
      case 'store':
        return <StorePage onNavigate={goToPage} />
      case 'cart':
        return <CartPage onNavigate={goToPage} />
      case 'checkout':
        return <CheckoutPage onNavigate={goToPage} />
      case 'orders':
        return <OrdersPage onNavigate={goToPage} />
      case 'admin_orders':
        return isAdmin ? (
          <AdminOrdersPage />
        ) : (
          <p className="text-sm text-muted-foreground">관리자만 접근할 수 있습니다.</p>
        )
      case 'admin_content':
        return isAdmin ? (
          <AdminContentPage />
        ) : (
          <p className="text-sm text-muted-foreground">관리자만 접근할 수 있습니다.</p>
        )
      case 'settings':
        return (
          <SettingsPage
            activeTab={settingsTab}
            onTabChange={setSettingsTab}
            students={students}
            studentsLoading={loading}
            studentsError={error}
            onAddStudent={addStudent}
            onEditStudent={editStudent}
            onDeleteStudent={removeStudent}
          />
        )
      default:
        return null
    }
  }

  return (
    <AppShell
      activePage={page}
      onNavigate={goToPage}
      teacherName={user?.name ?? '선생님'}
      isDemo={isDemo}
      isAdmin={isAdmin}
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
