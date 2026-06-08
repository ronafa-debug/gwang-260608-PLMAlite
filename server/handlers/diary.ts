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

export interface DiaryRequest {
  student: Student
  rawInput: string
}

interface DiaryResult {
  title: string
  sentences: string[]
  illustrationPrompt: string
}

function buildIllustrationPrompt(scenePrompt: string): string {
  return [
    'Create ONE vertical A4 portrait image split into exactly two equal horizontal halves.',
    'TOP HALF ONLY: vibrant full-color children\'s storybook illustration.',
    'BOTTOM HALF ONLY: the identical scene as pure black-and-white coloring book line art with bold clean outlines, no color, no gray fill, no shading.',
    'Both halves must show the same characters, poses, and composition.',
    `Scene: ${scenePrompt}`,
    'No text, no letters, no watermark, no border decoration.',
  ].join(' ')
}

export async function handleDiary(body: DiaryRequest) {
  const { student, rawInput } = body

  if (!student?.name || !rawInput?.trim()) {
    throw new Error('Required fields are missing.')
  }

  const instructions = `당신은 초등학생 그림일기를 돕는 한국어 교육 전문가입니다.
학생이 말한 경험을 학년 수준에 맞는 정돈된 그림일기 문장으로 바꿉니다.
문장은 2~4개로 구성하고, 각 문장은 마침표로 끝나는 완전한 문장이어야 합니다.
제목은 핵심 경험을 담은 짧은 한국어 제목으로 작성합니다.
illustrationPrompt는 학생의 일기 내용 전체를 반영한 장면을 그리는 영문 프롬프트입니다.`

  const input = `
학생 이름: ${student.name}
학년: ${student.grade}
좋아하는 캐릭터: ${student.favorite_character}
좋아하는 활동: ${student.favorite_activity}
특이사항: ${student.notes ?? '없음'}

학생이 한 일:
${rawInput}

요구사항:
1. 학생의 경험을 바탕으로 하되 학년에 맞게 문장을 다듬기
2. sentences 배열은 2~4문장
3. illustrationPrompt는 일기 전체 장면을 담은 영문 프롬프트 (인물, 장소, 행동 포함)
`

  const result = await createStructuredResponse<DiaryResult>(instructions, input, {
    name: 'diary_material',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'sentences', 'illustrationPrompt'],
      properties: {
        title: { type: 'string' },
        sentences: {
          type: 'array',
          minItems: 2,
          maxItems: 4,
          items: { type: 'string' },
        },
        illustrationPrompt: { type: 'string' },
      },
    },
  })

  const imagePrompt = buildIllustrationPrompt(result.illustrationPrompt)
  const image = await generateImage(imagePrompt)
  const imagePath = `${student.id}/illustrations/${crypto.randomUUID()}.png`
  const illustrationUrl = await uploadImage('diary-images', imagePath, image.bytes, image.contentType)

  return {
    title: result.title,
    sentences: result.sentences,
    illustrationUrl,
    imageUrl: illustrationUrl,
  }
}
