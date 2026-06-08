import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppHeader } from '@/components/layout/AppHeader'
import { DiaryGenerator } from '@/components/diary/DiaryGenerator'
import { MaterialLibrary } from '@/components/library/MaterialLibrary'
import { StorytellingGenerator } from '@/components/storytelling/StorytellingGenerator'
import { StudentManagement } from '@/components/students/StudentManagement'
import { useStudents } from '@/hooks/useStudents'
import { isSupabaseConfigured } from '@/lib/supabase'

function SetupNotice() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">환경 설정이 필요합니다</p>
      <p className="mt-1">
        프로젝트 루트에 <code>.env</code> 파일을 만들고 Supabase URL/키를 설정한 뒤,{' '}
        <code>supabase/migrations/001_initial_schema.sql</code>을 실행해 주세요.
      </p>
    </div>
  )
}

function App() {
  const { students, loading, error, addStudent, editStudent, removeStudent } = useStudents()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {!isSupabaseConfigured ? <SetupNotice /> : null}

        <Tabs defaultValue="students" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-4">
            <TabsTrigger value="students">학생관리</TabsTrigger>
            <TabsTrigger value="storytelling">스토리텔링 생성</TabsTrigger>
            <TabsTrigger value="diary">그림일기 생성</TabsTrigger>
            <TabsTrigger value="library">자료 라이브러리</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentManagement
              students={students}
              loading={loading}
              error={error}
              onAdd={addStudent}
              onEdit={editStudent}
              onDelete={removeStudent}
            />
          </TabsContent>

          <TabsContent value="storytelling">
            <StorytellingGenerator students={students} />
          </TabsContent>

          <TabsContent value="diary">
            <DiaryGenerator students={students} />
          </TabsContent>

          <TabsContent value="library">
            <MaterialLibrary />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
