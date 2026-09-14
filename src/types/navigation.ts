import type { MaterialTypeId } from '@/lib/materialTypes'

export type AppPage =
  | 'dashboard'
  | 'students'
  | 'generate'
  | 'library'
  | 'store'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'community'
  | 'admin_orders'
  | 'admin_content'
  | 'tools'
  | 'settings'

/** Alias for material catalog ids used by generate flow */
export type GenerateTab = MaterialTypeId

/** 개별 학습 자료: 새 자료 / 내 자료 */
export type MaterialsSection = 'create' | 'library'

/** Settings hub tabs */
export type SettingsTab = 'teacher' | 'students'

/** Catalog · cart · checkout · my orders — highlight 스토어 in nav */
export function isStoreSection(page: AppPage): boolean {
  return page === 'store' || page === 'cart' || page === 'checkout' || page === 'orders'
}

/** 개별 학습 자료 (생성·라이브러리) */
export function isMaterialsSection(page: AppPage): boolean {
  return page === 'generate' || page === 'library'
}
