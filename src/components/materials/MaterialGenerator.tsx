import { useMemo, useState } from 'react'
import { ArrowLeft, Construction, Search } from 'lucide-react'
import { DiaryGenerator } from '@/components/diary/DiaryGenerator'
import { StorytellingGenerator } from '@/components/storytelling/StorytellingGenerator'
import { DemoNotice } from '@/components/shared/DemoNotice'
import { FavoriteStarButton } from '@/components/shared/FavoriteStarButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { sortWithFavorites, useToolFavorites } from '@/hooks/useToolFavorites'
import {
  MATERIAL_CATEGORIES,
  MATERIAL_TYPES,
  getMaterialType,
  type MaterialCategoryId,
  type MaterialTypeId,
} from '@/lib/materialTypes'
import { cn } from '@/lib/utils'
import type { Student } from '@/types'

interface MaterialGeneratorProps {
  students: Student[]
  activeTab: MaterialTypeId
  onTabChange: (tab: MaterialTypeId) => void
  entryMode?: 'catalog' | 'workspace'
  onEntryModeChange?: (mode: 'catalog' | 'workspace') => void
  /** Parent page (개별 학습 자료) already shows title/tabs */
  hidePageHeader?: boolean
}

export function MaterialGenerator({
  students,
  activeTab,
  onTabChange,
  entryMode = 'catalog',
  onEntryModeChange,
  hidePageHeader = false,
}: MaterialGeneratorProps) {
  const { isDemo } = useAuth()
  const [category, setCategory] = useState<MaterialCategoryId>('all')
  const [query, setQuery] = useState('')
  const { materialFavorites, isMaterialFavorite, toggleMaterialFavorite } = useToolFavorites()

  const view = entryMode
  const setView = (mode: 'catalog' | 'workspace') => {
    onEntryModeChange?.(mode)
  }

  const selected = getMaterialType(activeTab)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = MATERIAL_TYPES.filter((item) => {
      if (category !== 'all' && item.category !== category) return false
      if (!q) return true
      return (
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      )
    })
    return sortWithFavorites(list, materialFavorites)
  }, [category, query, materialFavorites])

  const openType = (id: MaterialTypeId) => {
    onTabChange(id)
    setView('workspace')
  }

  const backToCatalog = () => {
    setView('catalog')
  }

  if (view === 'workspace' && selected) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-0.5 shrink-0 rounded-xl"
            onClick={backToCatalog}
          >
            <ArrowLeft className="h-4 w-4" />
            목록
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">{selected.label}</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {selected.description}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5 md:p-6">
          {selected.available && selected.id === 'storytelling' ? (
            <StorytellingGenerator students={students} />
          ) : null}
          {selected.available && selected.id === 'diary' ? (
            <DiaryGenerator students={students} />
          ) : null}
          {!selected.available ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Construction className="h-7 w-7" />
              </div>
              <p className="font-semibold text-foreground">준비 중인 학습 자료입니다</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                목록·메뉴 배치만 반영된 미리보기입니다. 생성 기능은 이후에 연결됩니다.
              </p>
              <Button type="button" variant="outline" className="mt-2 rounded-xl" onClick={backToCatalog}>
                다른 자료 고르기
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {!hidePageHeader ? (
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">개별 학습 자료</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            만들 자료 유형을 고른 뒤 학생 맞춤으로 생성하세요. 별표로 즐겨찾기를 고정할 수
            있습니다.
          </p>
        </div>
      ) : null}

      {isDemo ? (
        <DemoNotice>
          데모에서는 화면만 미리 볼 수 있습니다. 「생성」을 누르면 회원가입 화면으로 이동합니다.
        </DemoNotice>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="자료 검색 (예: 일기, 시계)"
          className="h-11 rounded-2xl pl-9"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {MATERIAL_CATEGORIES.map(({ id, label }) => {
          const active = category === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => {
          const Icon = item.icon
          const favorited = isMaterialFavorite(item.id)
          return (
            <div key={item.id} className="relative">
              <FavoriteStarButton
                active={favorited}
                label={item.label}
                onToggle={() => toggleMaterialFavorite(item.id)}
              />
              <button
                type="button"
                onClick={() => openType(item.id)}
                className="flex w-full items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 pr-10 text-left shadow-sm transition-all hover:border-primary/25 hover:bg-muted/20 active:scale-[0.99] sm:gap-4 sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{item.label}</p>
                    {item.available ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        사용 가능
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        준비 중
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
      ) : null}
    </div>
  )
}
