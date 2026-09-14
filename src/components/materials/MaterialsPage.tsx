import { MaterialGenerator } from '@/components/materials/MaterialGenerator'
import { MaterialLibrary } from '@/components/library/MaterialLibrary'
import { cn } from '@/lib/utils'
import type { GenerateTab, MaterialsSection } from '@/types/navigation'
import type { Student } from '@/types'

interface MaterialsPageProps {
  section: MaterialsSection
  onSectionChange: (section: MaterialsSection) => void
  students: Student[]
  materialType: GenerateTab
  onMaterialTypeChange: (tab: GenerateTab) => void
  entryMode: 'catalog' | 'workspace'
  onEntryModeChange: (mode: 'catalog' | 'workspace') => void
}

const sections: Array<{ id: MaterialsSection; label: string }> = [
  { id: 'create', label: '새 자료' },
  { id: 'library', label: '내 자료' },
]

export function MaterialsPage({
  section,
  onSectionChange,
  students,
  materialType,
  onMaterialTypeChange,
  entryMode,
  onEntryModeChange,
}: MaterialsPageProps) {
  const showSectionTabs = !(section === 'create' && entryMode === 'workspace')

  return (
    <div className="space-y-5 sm:space-y-6">
      {showSectionTabs ? (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">개별 학습 자료</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {section === 'create'
                ? '자료 유형을 고른 뒤 학생 맞춤으로 생성하세요.'
                : '저장된 학습 자료를 검색하고 미리보기·PDF 저장·삭제할 수 있습니다.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onSectionChange(id)
                  if (id === 'create') onEntryModeChange('catalog')
                }}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  section === id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {section === 'create' ? (
        <MaterialGenerator
          students={students}
          activeTab={materialType}
          onTabChange={onMaterialTypeChange}
          entryMode={entryMode}
          onEntryModeChange={onEntryModeChange}
          hidePageHeader
        />
      ) : (
        <MaterialLibrary />
      )}
    </div>
  )
}
