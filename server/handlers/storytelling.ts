import { createStructuredResponse, generateImage } from '../openai.js'
import { uploadImage } from '../storage.js'

interface Student {
  id: string
  name: string
  grade: string
  favorite_character: string
  favorite_activity: string
  notes?: string | null
}

export interface StorytellingRequest {
  student: Student
  subject: string
  learningGoal: string
  storySituation: string
  storyLength: string
}

interface StorytellingResult {
  story: string
  questions: Array<{
    type: 'multiple_choice' | 'short_answer' | 'essay'
    question: string
    options?: string[]
    answer: string
  }>
  coloringImagePrompt: string
}

export async function handleStorytelling(body: StorytellingRequest) {
  const { student, subject, learningGoal, storySituation, storyLength } = body

  if (!student?.name || !subject || !learningGoal || !storySituation) {
    throw new Error('Required fields are missing.')
  }

  const lengthGuide =
    storyLength === 'A4 절반'
      ? '짧고 간결하게 2~3문단으로 작성'
      : 'A4 한 장 분량으로 4~6문단으로 작성'

  const instructions = `당신은 초등학생 맞춤형 학습지를 만드는 한국어 교육 콘텐츠 전문가입니다.
학생의 관심사를 학습목표와 자연스럽게 연결한 이야기와 문제 5개를 만듭니다.
문제는 객관식 2개, 단답형 2개, 서술형 1개로 구성합니다.
모든 내용은 한국어로 작성하고, 학생 학년 수준에 맞는 쉬운 표현을 사용합니다.`

  const input = `
학생 이름: ${student.name}
학년: ${student.grade}
좋아하는 캐릭터: ${student.favorite_character}
좋아하는 활동: ${student.favorite_activity}
특이사항: ${student.notes ?? '없음'}
과목: ${subject}
학습목표: ${learningGoal}
스토리 상황: ${storySituation}
이야기 분량: ${storyLength} (${lengthGuide})

요구사항:
1. 이야기에 학생 이름, 좋아하는 캐릭터, 스토리 상황을 반드시 반영
2. 학습목표가 이야기 속에서 자연스럽게 드러나야 함
3. 문제 5개는 이야기 내용과 학습목표에 기반
4. coloringImagePrompt는 흑백 라인아트 색칠공부용 이미지 프롬프트(영문)로 작성
`

  const result = await createStructuredResponse<StorytellingResult>(
    instructions,
    input,
    {
      name: 'storytelling_material',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['story', 'questions', 'coloringImagePrompt'],
        properties: {
          story: { type: 'string' },
          coloringImagePrompt: { type: 'string' },
          questions: {
            type: 'array',
            minItems: 5,
            maxItems: 5,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['type', 'question', 'options', 'answer'],
                properties: {
                  type: {
                    type: 'string',
                    enum: ['multiple_choice', 'short_answer', 'essay'],
                  },
                  question: { type: 'string' },
                  options: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  answer: { type: 'string' },
                },
              },
          },
        },
      },
    },
  )

  const imagePrompt = `${result.coloringImagePrompt}. Black and white line art coloring page for children, simple clean outlines, no shading, no text, printable A4 worksheet style.`
  const image = await generateImage(imagePrompt)
  const imagePath = `${student.id}/${crypto.randomUUID()}.png`
  const coloringImageUrl = await uploadImage(
    'coloring-images',
    imagePath,
    image.bytes,
    image.contentType,
  )

  return {
    story: result.story,
    questions: result.questions,
    coloringImageUrl,
  }
}
