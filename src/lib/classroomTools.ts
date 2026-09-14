import type { LucideIcon } from 'lucide-react'
import {
  Calculator,
  Clock,
  Dice5,
  GitBranch,
  Hand,
  LayoutGrid,
  ListChecks,
  Music2,
  Pencil,
  Shuffle,
  Timer,
  Trophy,
  Watch,
} from 'lucide-react'

export type ClassroomToolId =
  | 'timer'
  | 'stopwatch'
  | 'analog_clock'
  | 'random_picker'
  | 'ladder'
  | 'calculator'
  | 'dice'
  | 'whiteboard'
  | 'group_seating'
  | 'attendance'
  | 'sound_alert'
  | 'rps'
  | 'scoreboard'

export type ClassroomToolCategoryId = 'all' | 'time' | 'pick' | 'util' | 'class'

export interface ClassroomToolDef {
  id: ClassroomToolId
  label: string
  description: string
  category: Exclude<ClassroomToolCategoryId, 'all'>
  icon: LucideIcon
}

export const CLASSROOM_TOOL_CATEGORIES: Array<{
  id: ClassroomToolCategoryId
  label: string
}> = [
  { id: 'all', label: '전체' },
  { id: 'time', label: '시간' },
  { id: 'pick', label: '뽑기·게임' },
  { id: 'util', label: '유틸' },
  { id: 'class', label: '학급' },
]

export const CLASSROOM_TOOLS: ClassroomToolDef[] = [
  {
    id: 'timer',
    label: '타이머',
    description: '활동·정리 시간 카운트다운 · 선택 BGM',
    category: 'time',
    icon: Timer,
  },
  {
    id: 'stopwatch',
    label: '스톱워치',
    description: '경과 시간 측정과 랩 기록',
    category: 'time',
    icon: Watch,
  },
  {
    id: 'analog_clock',
    label: '아날로그 시계',
    description: '지금 시각 · 연습 시계(드래그·오전/오후·문제 모드)',
    category: 'time',
    icon: Clock,
  },
  {
    id: 'random_picker',
    label: '랜덤 뽑기',
    description: '발표자·번호·이름 무작위 선택',
    category: 'pick',
    icon: Shuffle,
  },
  {
    id: 'ladder',
    label: '사다리타기',
    description: '역할·발표 순서 사다리로 배정',
    category: 'pick',
    icon: GitBranch,
  },
  {
    id: 'dice',
    label: '주사위·숫자',
    description: '주사위와 숫자 범위 뽑기',
    category: 'pick',
    icon: Dice5,
  },
  {
    id: 'rps',
    label: '가위바위보',
    description: '선생님 vs 교실 한판',
    category: 'pick',
    icon: Hand,
  },
  {
    id: 'calculator',
    label: '계산기',
    description: '큰 화면 사칙연산',
    category: 'util',
    icon: Calculator,
  },
  {
    id: 'whiteboard',
    label: '화이트보드',
    description: '칠판처럼 크게 적어 보여주기',
    category: 'util',
    icon: Pencil,
  },
  {
    id: 'sound_alert',
    label: '박수·알림음',
    description: '집중·전환용 짧은 효과음',
    category: 'util',
    icon: Music2,
  },
  {
    id: 'group_seating',
    label: '모둠·자리 섞기',
    description: '학생을 무작위로 모둠·자리 배치',
    category: 'class',
    icon: LayoutGrid,
  },
  {
    id: 'attendance',
    label: '출석·호명',
    description: '간단 출석 체크와 호명 목록',
    category: 'class',
    icon: ListChecks,
  },
  {
    id: 'scoreboard',
    label: '점수판',
    description: '모둠·팀 점수 빠르게 올리기',
    category: 'class',
    icon: Trophy,
  },
]

export function getClassroomTool(id: ClassroomToolId) {
  return CLASSROOM_TOOLS.find((t) => t.id === id)
}
