export type GenerationMaterialType = 'storytelling' | 'diary'

export type GenerationEventType =
  | 'generate_success'
  | 'generate_failed'
  | 'saved'
  | 'deleted'

export interface GenerationEvent {
  id: string
  user_id: string | null
  material_type: GenerationMaterialType
  event_type: GenerationEventType
  duration_ms: number | null
  error_code: string | null
  meta: Record<string, unknown>
  created_at: string
}

export interface ContentQualityStats {
  storytellingTotal: number
  diaryTotal: number
  materialsTotal: number
  withImageCount: number
  withImageRate: number
  subjectCounts: Array<{ subject: string; count: number }>
  last7DaysSaved: number
  last30DaysSaved: number
  activeTeachers: number
  generateSuccess: number
  generateFailed: number
  generateSuccessRate: number
  savedEvents: number
  deletedEvents: number
  saveRate: number
  avgDurationMs: number | null
  recentFailures: Array<{
    material_type: GenerationMaterialType
    error_code: string | null
    created_at: string
  }>
  recentMaterials: Array<{
    id: string
    type: GenerationMaterialType
    title: string
    created_at: string
    hasImage: boolean
  }>
}
