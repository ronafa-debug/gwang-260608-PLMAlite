import { useCallback, useState } from 'react'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { ClassroomToolId } from '@/lib/classroomTools'
import type { WorkToolId } from '@/lib/workTools'
import type { MaterialTypeId } from '@/lib/materialTypes'

const CLASS_KEY = 'tool_favorites_class'
const WORK_KEY = 'tool_favorites_work'
const MATERIAL_KEY = 'material_favorites'

function toggleId<T extends string>(list: T[], id: T): T[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [id, ...list]
}

export function useToolFavorites() {
  const [classFavorites, setClassFavorites] = useState<ClassroomToolId[]>(() =>
    getStorageItem<ClassroomToolId[]>(CLASS_KEY, []),
  )
  const [workFavorites, setWorkFavorites] = useState<WorkToolId[]>(() =>
    getStorageItem<WorkToolId[]>(WORK_KEY, []),
  )
  const [materialFavorites, setMaterialFavorites] = useState<MaterialTypeId[]>(() =>
    getStorageItem<MaterialTypeId[]>(MATERIAL_KEY, []),
  )

  const isClassFavorite = useCallback(
    (id: ClassroomToolId) => classFavorites.includes(id),
    [classFavorites],
  )

  const isWorkFavorite = useCallback(
    (id: WorkToolId) => workFavorites.includes(id),
    [workFavorites],
  )

  const isMaterialFavorite = useCallback(
    (id: MaterialTypeId) => materialFavorites.includes(id),
    [materialFavorites],
  )

  const toggleClassFavorite = useCallback((id: ClassroomToolId) => {
    setClassFavorites((prev) => {
      const next = toggleId(prev, id)
      setStorageItem(CLASS_KEY, next)
      return next
    })
  }, [])

  const toggleWorkFavorite = useCallback((id: WorkToolId) => {
    setWorkFavorites((prev) => {
      const next = toggleId(prev, id)
      setStorageItem(WORK_KEY, next)
      return next
    })
  }, [])

  const toggleMaterialFavorite = useCallback((id: MaterialTypeId) => {
    setMaterialFavorites((prev) => {
      const next = toggleId(prev, id)
      setStorageItem(MATERIAL_KEY, next)
      return next
    })
  }, [])

  return {
    classFavorites,
    workFavorites,
    materialFavorites,
    isClassFavorite,
    isWorkFavorite,
    isMaterialFavorite,
    toggleClassFavorite,
    toggleWorkFavorite,
    toggleMaterialFavorite,
  }
}

/** Favorites first (order of starring preserved), then original list order */
export function sortWithFavorites<T extends { id: string }>(
  items: T[],
  favoriteIds: string[],
): T[] {
  if (favoriteIds.length === 0) return items
  const favSet = new Set(favoriteIds)
  const favOrder = new Map(favoriteIds.map((id, i) => [id, i]))
  const favs: T[] = []
  const rest: T[] = []
  for (const item of items) {
    if (favSet.has(item.id)) favs.push(item)
    else rest.push(item)
  }
  favs.sort((a, b) => (favOrder.get(a.id) ?? 0) - (favOrder.get(b.id) ?? 0))
  return [...favs, ...rest]
}
