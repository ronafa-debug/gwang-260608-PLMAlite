import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchDiaryMaterials, fetchStorytellingMaterials } from '@/lib/api'
import { getStorageItem } from '@/lib/storage'
import type { LibraryItem } from '@/types'

export function useLibraryItems() {
  const { isDemo } = useAuth()
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (isDemo) {
      const stored = getStorageItem<LibraryItem[]>('demo_library', [])
      setItems(stored)
      setLoading(false)
      return
    }

    try {
      const [storytelling, diary] = await Promise.all([
        fetchStorytellingMaterials(),
        fetchDiaryMaterials(),
      ])

      const merged: LibraryItem[] = [
        ...storytelling.map((data) => ({ type: 'storytelling' as const, data })),
        ...diary.map((data) => ({ type: 'diary' as const, data })),
      ].sort(
        (a, b) =>
          new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime(),
      )

      setItems(merged)
    } catch (err) {
      setError(err instanceof Error ? err.message : '자료를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => {
    void load()
  }, [load])

  return { items, loading, error, reload: load }
}
