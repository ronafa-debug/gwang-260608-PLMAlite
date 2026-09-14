import { requireSupabase } from '@/lib/supabase'
import { logGenerationEvent } from '@/lib/adminContentApi'
import type {
  DiaryGenerateRequest,
  DiaryGenerateResponse,
  DiaryMaterial,
  DiaryStickerImage,
  StorytellingGenerateRequest,
  StorytellingGenerateResponse,
  StorytellingMaterial,
  Student,
  StudentInput,
  WorksheetQuestion,
} from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

async function requireUserId() {
  const client = requireSupabase()
  const {
    data: { user },
    error,
  } = await client.auth.getUser()
  if (error || !user) {
    throw new Error('로그인이 필요합니다.')
  }
  return user.id
}

const MAX_STUDENT_PHOTO_BYTES = 4 * 1024 * 1024
const STUDENT_PHOTO_BUCKET = 'student-photos'

function studentPhotoExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName
  }
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'))
    reader.readAsDataURL(file)
  })
}

/** Upload optional student photo. Demo: stores data URL as path. */
export async function uploadStudentPhoto(
  useDemo: boolean,
  file: File,
): Promise<{ path: string; previewUrl: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.')
  }
  if (file.size > MAX_STUDENT_PHOTO_BYTES) {
    throw new Error('이미지는 4MB 이하만 가능합니다.')
  }

  if (useDemo) {
    const dataUrl = await readFileAsDataUrl(file)
    return { path: dataUrl, previewUrl: dataUrl }
  }

  const client = requireSupabase()
  const userId = await requireUserId()
  const ext = studentPhotoExtension(file)
  const path = `${userId}/${crypto.randomUUID()}.${ext}`
  const { error } = await client.storage.from(STUDENT_PHOTO_BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data: signed, error: signedError } = await client.storage
    .from(STUDENT_PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7)

  if (signedError || !signed?.signedUrl) {
    throw new Error(signedError?.message ?? '미리보기 URL을 만들지 못했습니다.')
  }

  return { path, previewUrl: signed.signedUrl }
}

export async function resolveStudentPhotoUrl(
  photoPath: string | null | undefined,
): Promise<string | null> {
  if (!photoPath) return null
  if (photoPath.startsWith('data:') || photoPath.startsWith('http')) {
    return photoPath
  }

  try {
    const client = requireSupabase()
    const { data, error } = await client.storage
      .from(STUDENT_PHOTO_BUCKET)
      .createSignedUrl(photoPath, 60 * 60 * 24)
    if (error || !data?.signedUrl) return null
    return data.signedUrl
  } catch {
    return null
  }
}

async function withPhotoUrl(student: Student): Promise<Student> {
  const photoUrl = await resolveStudentPhotoUrl(student.photo_path)
  return { ...student, photoUrl }
}

async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`/api/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const payload = (await response.json()) as T & { error?: string }

  if (!response.ok) {
    throw new Error(payload.error || `${name} 호출에 실패했습니다.`)
  }

  if (payload?.error) {
    throw new Error(payload.error)
  }

  return payload as T
}

export async function fetchStudents(): Promise<Student[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('students')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  const rows = (data ?? []) as Student[]
  return Promise.all(rows.map((row) => withPhotoUrl(row)))
}

export async function createStudent(input: StudentInput): Promise<Student> {
  const client = requireSupabase()
  const userId = await requireUserId()

  const { data: maxRow } = await client
    .from('students')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder =
    typeof maxRow?.sort_order === 'number' ? maxRow.sort_order + 1 : 0

  const { data, error } = await client
    .from('students')
    .insert({
      name: input.name,
      grade: input.grade,
      favorite_character: input.favorite_character,
      favorite_activity: input.favorite_activity,
      notes: input.notes ?? null,
      photo_path: input.photo_path ?? null,
      sort_order: input.sort_order ?? nextOrder,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return withPhotoUrl(data as Student)
}

export async function updateStudent(
  id: string,
  input: Partial<StudentInput>,
): Promise<Student> {
  const client = requireSupabase()
  const payload: Record<string, unknown> = {}
  if (input.name !== undefined) payload.name = input.name
  if (input.grade !== undefined) payload.grade = input.grade
  if (input.favorite_character !== undefined) {
    payload.favorite_character = input.favorite_character
  }
  if (input.favorite_activity !== undefined) {
    payload.favorite_activity = input.favorite_activity
  }
  if (input.notes !== undefined) payload.notes = input.notes
  if (input.photo_path !== undefined) payload.photo_path = input.photo_path
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order

  const { data, error } = await client
    .from('students')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return withPhotoUrl(data as Student)
}

/** Persist full list order (0..n-1). */
export async function saveStudentSortOrder(
  orderedIds: string[],
): Promise<void> {
  const client = requireSupabase()
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      client.from('students').update({ sort_order: index }).eq('id', id),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

export async function deleteStudent(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('students').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function generateStorytelling(
  request: StorytellingGenerateRequest,
): Promise<StorytellingGenerateResponse> {
  const started = Date.now()
  try {
    const result = await invokeFunction<StorytellingGenerateResponse>(
      'generate-storytelling',
      { ...request },
    )
    await logGenerationEvent({
      materialType: 'storytelling',
      eventType: 'generate_success',
      durationMs: Date.now() - started,
      meta: { subject: request.subject },
    })
    return result
  } catch (err) {
    await logGenerationEvent({
      materialType: 'storytelling',
      eventType: 'generate_failed',
      durationMs: Date.now() - started,
      errorCode: err instanceof Error ? err.message : 'unknown',
      meta: { subject: request.subject },
    })
    throw err
  }
}

export async function saveStorytellingMaterial(
  payload: Omit<StorytellingMaterial, 'id' | 'created_at' | 'students' | 'user_id'>,
): Promise<StorytellingMaterial> {
  const client = requireSupabase()
  const userId = await requireUserId()
  const { data, error } = await client
    .from('storytelling_materials')
    .insert({
      ...payload,
      user_id: userId,
      worksheet_content: payload.worksheet_content,
    })
    .select('*, students(name)')
    .single()

  if (error) throw new Error(error.message)

  await logGenerationEvent({
    materialType: 'storytelling',
    eventType: 'saved',
    meta: {
      subject: payload.subject,
      hasImage: Boolean(payload.coloring_image_url),
    },
  })

  return {
    ...data,
    worksheet_content: data.worksheet_content as WorksheetQuestion[],
    students: data.students as { name: string } | undefined,
  }
}

export async function generateDiary(
  request: DiaryGenerateRequest,
): Promise<DiaryGenerateResponse> {
  const started = Date.now()
  try {
    const result = await invokeFunction<DiaryGenerateResponse>('generate-diary', {
      ...request,
    })
    await logGenerationEvent({
      materialType: 'diary',
      eventType: 'generate_success',
      durationMs: Date.now() - started,
    })
    return result
  } catch (err) {
    await logGenerationEvent({
      materialType: 'diary',
      eventType: 'generate_failed',
      durationMs: Date.now() - started,
      errorCode: err instanceof Error ? err.message : 'unknown',
    })
    throw err
  }
}

export type DiaryMaterialInput = Omit<
  DiaryMaterial,
  'id' | 'created_at' | 'students' | 'sticker_images'
>

export async function saveDiaryMaterial(payload: DiaryMaterialInput): Promise<DiaryMaterial> {
  const client = requireSupabase()
  const userId = await requireUserId()
  const { data, error } = await client
    .from('diary_materials')
    .insert({
      student_id: payload.student_id,
      title: payload.title,
      raw_input: payload.raw_input,
      final_text: payload.final_text,
      image_url: payload.image_url,
      user_id: userId,
    })
    .select('*, students(name)')
    .single()

  if (error) throw new Error(error.message)

  await logGenerationEvent({
    materialType: 'diary',
    eventType: 'saved',
    meta: { hasImage: Boolean(payload.image_url) },
  })

  return {
    ...data,
    sticker_images: [],
    students: data.students as { name: string } | undefined,
  }
}

export async function fetchStorytellingMaterials(): Promise<StorytellingMaterial[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('storytelling_materials')
    .select('*, students(name)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((item) => ({
    ...item,
    worksheet_content: item.worksheet_content as WorksheetQuestion[],
    students: item.students as { name: string } | undefined,
  }))
}

export async function fetchDiaryMaterials(): Promise<DiaryMaterial[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('diary_materials')
    .select('*, students(name)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((item) => ({
    ...item,
    sticker_images: (item.sticker_images as DiaryStickerImage[] | null) ?? [],
    students: item.students as { name: string } | undefined,
  }))
}

export async function deleteStorytellingMaterial(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('storytelling_materials')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  await logGenerationEvent({
    materialType: 'storytelling',
    eventType: 'deleted',
    meta: { id },
  })
}

export async function deleteDiaryMaterial(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('diary_materials').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logGenerationEvent({
    materialType: 'diary',
    eventType: 'deleted',
    meta: { id },
  })
}

export function getFunctionsBaseUrl() {
  return supabaseUrl ? `${supabaseUrl}/functions/v1` : ''
}
