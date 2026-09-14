import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileText,
  Link2,
  ListTodo,
  MessageSquare,
  NotebookPen,
  StickyNote,
  Users,
  Wallet,
} from 'lucide-react'

export type WorkToolId =
  | 'memo'
  | 'todo'
  | 'scheduler'
  | 'reminder'
  | 'student_log'
  | 'attendance_memo'
  | 'class_fund'
  | 'notice_draft'
  | 'parent_meeting'
  | 'grading_checklist'
  | 'seat_chart'
  | 'link_box'

export interface WorkToolDef {
  id: WorkToolId
  label: string
  description: string
  icon: LucideIcon
  /** false = catalog placeholder only */
  available: boolean
}

export const WORK_TOOLS: WorkToolDef[] = [
  {
    id: 'memo',
    label: '메모장',
    description: '짧은 업무 메모를 빠르게 남기기',
    icon: NotebookPen,
    available: true,
  },
  {
    id: 'todo',
    label: '할 일',
    description: '오늘·이번 주 할 일 체크리스트',
    icon: ListTodo,
    available: true,
  },
  {
    id: 'scheduler',
    label: '스케줄러',
    description: '수업·회의·행사 일정 관리',
    icon: CalendarDays,
    available: true,
  },
  {
    id: 'reminder',
    label: '알림·리마인더',
    description: '마감·안내 일을 잊지 않게 표시',
    icon: Bell,
    available: true,
  },
  {
    id: 'student_log',
    label: '학생 간단 기록',
    description: '상담·행동·특이사항 한 줄 로그',
    icon: StickyNote,
    available: true,
  },
  {
    id: 'attendance_memo',
    label: '출결·지각 메모',
    description: '오늘만 가볍게 남기는 출결 메모',
    icon: ClipboardList,
    available: false,
  },
  {
    id: 'class_fund',
    label: '학급비·경비 장부',
    description: '수입·지출·잔액 간단 기록',
    icon: Wallet,
    available: false,
  },
  {
    id: 'notice_draft',
    label: '가정통신·안내문 초안',
    description: '템플릿으로 안내문 초안 작성',
    icon: FileText,
    available: false,
  },
  {
    id: 'parent_meeting',
    label: '상담 일정',
    description: '학부모 상담 슬롯·메모',
    icon: MessageSquare,
    available: false,
  },
  {
    id: 'grading_checklist',
    label: '평가·채점 체크리스트',
    description: '과목·단원별 채점 완료 체크',
    icon: CheckSquare,
    available: false,
  },
  {
    id: 'seat_chart',
    label: '좌석표·번호표',
    description: '인쇄용 간단 자리·번호 배치',
    icon: Users,
    available: false,
  },
  {
    id: 'link_box',
    label: '파일·링크 보관함',
    description: '자주 쓰는 폼·사이트 링크 모음',
    icon: Link2,
    available: false,
  },
]

export function getWorkTool(id: WorkToolId) {
  return WORK_TOOLS.find((t) => t.id === id)
}
