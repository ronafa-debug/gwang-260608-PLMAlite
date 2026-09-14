import { requireSupabase } from '@/lib/supabase'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type {
  ContentQualityStats,
  GenerationEvent,
  GenerationEventType,
  GenerationMaterialType,
} from '@/types/adminContent'
import type { LibraryItem } from '@/types'

const DEMO_EVENTS_KEY = 'demo_generation_events'

function isDemoMode() {
  return getStorageItem('isDemo', false)
}

function emptyStats(): ContentQualityStats {
  return {
    storytellingTotal: 0,
    diaryTotal: 0,
    materialsTotal: 0,
    withImageCount: 0,
    withImageRate: 0,
    subjectCounts: [],
    last7DaysSaved: 0,
    last30DaysSaved: 0,
    activeTeachers: 0,
    generateSuccess: 0,
    generateFailed: 0,
    generateSuccessRate: 0,
    savedEvents: 0,
    deletedEvents: 0,
    saveRate: 0,
    avgDurationMs: null,
    recentFailures: [],
    recentMaterials: [],
  }
}

function daysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function rate(part: number, whole: number) {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 1000) / 10
}

/** Best-effort client log; never throws to callers. */
export async function logGenerationEvent(input: {
  materialType: GenerationMaterialType
  eventType: GenerationEventType
  durationMs?: number | null
  errorCode?: string | null
  meta?: Record<string, unknown>
}): Promise<void> {
  try {
    const useDemo = isDemoMode()
    if (useDemo) {
      const prev = getStorageItem<GenerationEvent[]>(DEMO_EVENTS_KEY, [])
      const row: GenerationEvent = {
        id: crypto.randomUUID(),
        user_id: 'demo-user-001',
        material_type: input.materialType,
        event_type: input.eventType,
        duration_ms: input.durationMs ?? null,
        error_code: input.errorCode ?? null,
        meta: input.meta ?? {},
        created_at: new Date().toISOString(),
      }
      setStorageItem(DEMO_EVENTS_KEY, [row, ...prev].slice(0, 500))
      return
    }

    const client = requireSupabase()
    const {
      data: { user },
    } = await client.auth.getUser()
    if (!user) return

    await client.from('generation_events').insert({
      user_id: user.id,
      material_type: input.materialType,
      event_type: input.eventType,
      duration_ms: input.durationMs ?? null,
      error_code: input.errorCode?.slice(0, 200) ?? null,
      meta: input.meta ?? {},
    })
  } catch {
    // ignore logging failures
  }
}

function aggregateFromRows(
  storytelling: Array<{
    id: string
    subject: string
    coloring_image_url: string | null
    user_id: string | null
    created_at: string
    learning_goal?: string
  }>,
  diary: Array<{
    id: string
    title: string
    image_url: string | null
    user_id: string | null
    created_at: string
  }>,
  events: GenerationEvent[],
): ContentQualityStats {
  const stats = emptyStats()
  stats.storytellingTotal = storytelling.length
  stats.diaryTotal = diary.length
  stats.materialsTotal = storytelling.length + diary.length

  const withImage =
    storytelling.filter((r) => Boolean(r.coloring_image_url)).length +
    diary.filter((r) => Boolean(r.image_url)).length
  stats.withImageCount = withImage
  stats.withImageRate = rate(withImage, stats.materialsTotal)

  const subjectMap = new Map<string, number>()
  for (const row of storytelling) {
    subjectMap.set(row.subject, (subjectMap.get(row.subject) ?? 0) + 1)
  }
  stats.subjectCounts = [...subjectMap.entries()]
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)

  const week = daysAgo(7).getTime()
  const month = daysAgo(30).getTime()
  const allMaterials = [
    ...storytelling.map((r) => ({ created: new Date(r.created_at).getTime(), user: r.user_id })),
    ...diary.map((r) => ({ created: new Date(r.created_at).getTime(), user: r.user_id })),
  ]
  stats.last7DaysSaved = allMaterials.filter((m) => m.created >= week).length
  stats.last30DaysSaved = allMaterials.filter((m) => m.created >= month).length
  stats.activeTeachers = new Set(
    allMaterials.map((m) => m.user).filter(Boolean) as string[],
  ).size

  const success = events.filter((e) => e.event_type === 'generate_success')
  const failed = events.filter((e) => e.event_type === 'generate_failed')
  stats.generateSuccess = success.length
  stats.generateFailed = failed.length
  stats.generateSuccessRate = rate(
    stats.generateSuccess,
    stats.generateSuccess + stats.generateFailed,
  )
  stats.savedEvents = events.filter((e) => e.event_type === 'saved').length
  stats.deletedEvents = events.filter((e) => e.event_type === 'deleted').length
  stats.saveRate = rate(stats.savedEvents, stats.generateSuccess)

  const durations = success
    .map((e) => e.duration_ms)
    .filter((n): n is number => typeof n === 'number' && n > 0)
  stats.avgDurationMs =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null

  stats.recentFailures = failed.slice(0, 8).map((e) => ({
    material_type: e.material_type,
    error_code: e.error_code,
    created_at: e.created_at,
  }))

  const recent = [
    ...storytelling.map((r) => ({
      id: r.id,
      type: 'storytelling' as const,
      title: `${r.subject} · ${r.learning_goal ?? '학습목표'}`,
      created_at: r.created_at,
      hasImage: Boolean(r.coloring_image_url),
    })),
    ...diary.map((r) => ({
      id: r.id,
      type: 'diary' as const,
      title: r.title || '그림일기',
      created_at: r.created_at,
      hasImage: Boolean(r.image_url),
    })),
  ]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 10)
  stats.recentMaterials = recent

  return stats
}

export async function fetchContentQualityStats(
  useDemo: boolean,
): Promise<ContentQualityStats> {
  if (useDemo) {
    const library = getStorageItem<LibraryItem[]>('demo_library', [])
    const storytelling = library
      .filter((item) => item.type === 'storytelling')
      .map((item) => ({
        id: item.data.id,
        subject: item.data.subject,
        coloring_image_url: item.data.coloring_image_url,
        user_id:
          'user_id' in item.data
            ? ((item.data as { user_id?: string }).user_id ?? 'demo-user-001')
            : 'demo-user-001',
        created_at: item.data.created_at,
        learning_goal: item.data.learning_goal,
      }))
    const diary = library
      .filter((item) => item.type === 'diary')
      .map((item) => ({
        id: item.data.id,
        title: item.data.title,
        image_url: item.data.image_url,
        user_id:
          'user_id' in item.data
            ? ((item.data as { user_id?: string }).user_id ?? 'demo-user-001')
            : 'demo-user-001',
        created_at: item.data.created_at,
      }))
    const events = getStorageItem<GenerationEvent[]>(DEMO_EVENTS_KEY, [])
    return aggregateFromRows(storytelling, diary, events)
  }

  const client = requireSupabase()
  const [storyRes, diaryRes, eventsRes] = await Promise.all([
    client
      .from('storytelling_materials')
      .select('id, subject, coloring_image_url, user_id, created_at, learning_goal')
      .order('created_at', { ascending: false })
      .limit(2000),
    client
      .from('diary_materials')
      .select('id, title, image_url, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(2000),
    client
      .from('generation_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000),
  ])

  if (storyRes.error) throw new Error(storyRes.error.message)
  if (diaryRes.error) throw new Error(diaryRes.error.message)
  const events = (eventsRes.error ? [] : (eventsRes.data ?? [])) as GenerationEvent[]

  return aggregateFromRows(
    (storyRes.data ?? []) as Parameters<typeof aggregateFromRows>[0],
    (diaryRes.data ?? []) as Parameters<typeof aggregateFromRows>[1],
    events,
  )
}

export function formatDurationMs(ms: number | null): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}초`
}
