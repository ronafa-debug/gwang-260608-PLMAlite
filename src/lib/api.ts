import { requireSupabase } from '@/lib/supabase'
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
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createStudent(input: StudentInput): Promise<Student> {
  const client = requireSupabase()
  const userId = await requireUserId()
  const { data, error } = await client
    .from('students')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateStudent(
  id: string,
  input: Partial<StudentInput>,
): Promise<Student> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('students')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteStudent(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('students').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function generateStorytelling(
  request: StorytellingGenerateRequest,
): Promise<StorytellingGenerateResponse> {
  return invokeFunction<StorytellingGenerateResponse>('generate-storytelling', {
    ...request,
  })
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
  return {
    ...data,
    worksheet_content: data.worksheet_content as WorksheetQuestion[],
    students: data.students as { name: string } | undefined,
  }
}

export async function generateDiary(
  request: DiaryGenerateRequest,
): Promise<DiaryGenerateResponse> {
  return invokeFunction<DiaryGenerateResponse>('generate-diary', { ...request })
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
}

export async function deleteDiaryMaterial(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('diary_materials').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export function getFunctionsBaseUrl() {
  return supabaseUrl ? `${supabaseUrl}/functions/v1` : ''
}
