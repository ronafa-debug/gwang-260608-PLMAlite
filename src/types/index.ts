export interface Student {
  id: string
  user_id?: string
  name: string
  grade: string
  favorite_character: string
  favorite_activity: string
  notes: string | null
  created_at: string
}

export type StudentInput = Omit<Student, 'id' | 'created_at'>

export type Subject = '국어' | '수학' | '사회' | '과학' | '기타'
export type StoryLength = 'A4 절반' | 'A4 한 장'

export interface WorksheetQuestion {
  type: 'multiple_choice' | 'short_answer' | 'essay'
  question: string
  options?: string[]
  answer: string
}

export interface StorytellingMaterial {
  id: string
  student_id: string
  subject: Subject
  learning_goal: string
  story_situation: string
  story_length: StoryLength
  story_content: string
  worksheet_content: WorksheetQuestion[]
  coloring_image_url: string | null
  created_at: string
  students?: Pick<Student, 'name'>
}

export interface DiaryStickerImage {
  label: string
  imageUrl: string
}

export interface DiaryMaterial {
  id: string
  student_id: string
  title: string
  raw_input: string
  final_text: string
  image_url: string | null
  sticker_images?: DiaryStickerImage[] | null
  created_at: string
  students?: Pick<Student, 'name'>
}

export interface StorytellingGenerateRequest {
  student: Student
  subject: Subject
  learningGoal: string
  storySituation: string
  storyLength: StoryLength
}

export interface StorytellingGenerateResponse {
  story: string
  questions: WorksheetQuestion[]
  coloringImageUrl: string
}

export interface DiaryGenerateRequest {
  student: Student
  rawInput: string
}

export interface DiaryGenerateResponse {
  title: string
  sentences: string[]
  illustrationUrl: string
  /** 하위 호환용 */
  imageUrl: string
}

export type LibraryItem =
  | { type: 'storytelling'; data: StorytellingMaterial }
  | { type: 'diary'; data: DiaryMaterial }
