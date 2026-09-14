import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Calculator,
  Clock,
  Heart,
  ImageIcon,
  ListChecks,
  Palette,
  PencilLine,
  Smile,
  Wallet,
} from 'lucide-react'

/** Material generator catalog ids. Only storytelling & diary are live. */
export type MaterialTypeId =
  | 'storytelling'
  | 'diary'
  | 'tracing'
  | 'dictation'
  | 'counting'
  | 'clock'
  | 'money'
  | 'emotion'
  | 'social'
  | 'coloring'

export type MaterialCategoryId =
  | 'all'
  | 'literacy'
  | 'math'
  | 'sel'
  | 'art'

export interface MaterialTypeDef {
  id: MaterialTypeId
  label: string
  description: string
  category: Exclude<MaterialCategoryId, 'all'>
  icon: LucideIcon
  /** false = catalog placeholder only */
  available: boolean
}

export const MATERIAL_CATEGORIES: Array<{ id: MaterialCategoryId; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'literacy', label: '읽기·쓰기' },
  { id: 'math', label: '수학·생활' },
  { id: 'sel', label: '사회·정서' },
  { id: 'art', label: '감각·미술' },
]

export const MATERIAL_TYPES: MaterialTypeDef[] = [
  {
    id: 'storytelling',
    label: '스토리텔링',
    description: '이야기와 학습 문제, 색칠하기',
    category: 'literacy',
    icon: BookOpen,
    available: true,
  },
  {
    id: 'diary',
    label: '그림일기',
    description: '원고지 따라쓰기와 일러스트',
    category: 'literacy',
    icon: ImageIcon,
    available: true,
  },
  {
    id: 'tracing',
    label: '따라쓰기',
    description: '글자·단어 따라쓰기 연습',
    category: 'literacy',
    icon: PencilLine,
    available: false,
  },
  {
    id: 'dictation',
    label: '받아쓰기',
    description: '짧은 문장 받아쓰기 학습지',
    category: 'literacy',
    icon: ListChecks,
    available: false,
  },
  {
    id: 'counting',
    label: '수 세기',
    description: '숫자·개수 세기 활동',
    category: 'math',
    icon: Calculator,
    available: false,
  },
  {
    id: 'clock',
    label: '시계 읽기',
    description: '시각 읽기·하루 일과',
    category: 'math',
    icon: Clock,
    available: false,
  },
  {
    id: 'money',
    label: '돈 계산',
    description: '생활 속 금액·거스름돈',
    category: 'math',
    icon: Wallet,
    available: false,
  },
  {
    id: 'emotion',
    label: '감정 카드',
    description: '감정 이름 짓기와 표현',
    category: 'sel',
    icon: Smile,
    available: false,
  },
  {
    id: 'social',
    label: '사회성 상황',
    description: '교실·또래 상황 연습',
    category: 'sel',
    icon: Heart,
    available: false,
  },
  {
    id: 'coloring',
    label: '색칠하기',
    description: '관심사 맞춤 색칠 도안',
    category: 'art',
    icon: Palette,
    available: false,
  },
]

export function getMaterialType(id: MaterialTypeId): MaterialTypeDef | undefined {
  return MATERIAL_TYPES.find((item) => item.id === id)
}
