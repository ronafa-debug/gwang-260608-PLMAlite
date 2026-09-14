import { useMemo, useState } from 'react'
import { ArrowLeft, Construction, Search, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnalogClockTool } from '@/components/tools/AnalogClockTool'
import { AttendanceTool } from '@/components/tools/AttendanceTool'
import { CalculatorTool } from '@/components/tools/CalculatorTool'
import { DiceTool } from '@/components/tools/DiceTool'
import { GroupSeatingTool } from '@/components/tools/GroupSeatingTool'
import { LadderTool } from '@/components/tools/LadderTool'
import { RandomPickerTool } from '@/components/tools/RandomPickerTool'
import { RpsTool } from '@/components/tools/RpsTool'
import { ScoreboardTool } from '@/components/tools/ScoreboardTool'
import { SoundAlertTool } from '@/components/tools/SoundAlertTool'
import { StopwatchTool } from '@/components/tools/StopwatchTool'
import { TimerTool } from '@/components/tools/TimerTool'
import { WhiteboardTool } from '@/components/tools/WhiteboardTool'
import { MemoTool } from '@/components/tools/work/MemoTool'
import { ReminderTool } from '@/components/tools/work/ReminderTool'
import { SchedulerTool } from '@/components/tools/work/SchedulerTool'
import { StudentLogTool } from '@/components/tools/work/StudentLogTool'
import { TodoTool } from '@/components/tools/work/TodoTool'
import {
  CLASSROOM_TOOL_CATEGORIES,
  CLASSROOM_TOOLS,
  getClassroomTool,
  type ClassroomToolCategoryId,
  type ClassroomToolId,
} from '@/lib/classroomTools'
import { WORK_TOOLS, getWorkTool, type WorkToolId } from '@/lib/workTools'
import { cn } from '@/lib/utils'

type HubTab = 'class' | 'work'
type View = 'catalog' | 'workspace'

function ClassToolWorkspace({ id }: { id: ClassroomToolId }) {
  switch (id) {
    case 'timer':
      return <TimerTool />
    case 'stopwatch':
      return <StopwatchTool />
    case 'analog_clock':
      return <AnalogClockTool />
    case 'random_picker':
      return <RandomPickerTool />
    case 'ladder':
      return <LadderTool />
    case 'calculator':
      return <CalculatorTool />
    case 'dice':
      return <DiceTool />
    case 'whiteboard':
      return <WhiteboardTool />
    case 'group_seating':
      return <GroupSeatingTool />
    case 'attendance':
      return <AttendanceTool />
    case 'sound_alert':
      return <SoundAlertTool />
    case 'rps':
      return <RpsTool />
    case 'scoreboard':
      return <ScoreboardTool />
    default:
      return null
  }
}

function WorkToolWorkspace({ id }: { id: WorkToolId }) {
  switch (id) {
    case 'memo':
      return <MemoTool />
    case 'todo':
      return <TodoTool />
    case 'scheduler':
      return <SchedulerTool />
    case 'reminder':
      return <ReminderTool />
    case 'student_log':
      return <StudentLogTool />
    default:
      return (
        <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Construction className="h-7 w-7" />
          </div>
          <p className="font-semibold text-foreground">준비 중인 업무 도구입니다</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            목록에만 배치된 미리보기입니다. 기능은 이후에 연결됩니다.
          </p>
        </div>
      )
  }
}

export function ClassroomToolsPage() {
  const [hub, setHub] = useState<HubTab>('class')
  const [view, setView] = useState<View>('catalog')
  const [classId, setClassId] = useState<ClassroomToolId>('timer')
  const [workId, setWorkId] = useState<WorkToolId>('memo')
  const [category, setCategory] = useState<ClassroomToolCategoryId>('all')
  const [query, setQuery] = useState('')

  const classSelected = getClassroomTool(classId)
  const workSelected = getWorkTool(workId)

  const filteredClass = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CLASSROOM_TOOLS.filter((item) => {
      if (category !== 'all' && item.category !== category) return false
      if (!q) return true
      return (
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      )
    })
  }, [category, query])

  const filteredWork = useMemo(() => {
    const q = query.trim().toLowerCase()
    return WORK_TOOLS.filter((item) => {
      if (!q) return true
      return (
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      )
    })
  }, [query])

  const switchHub = (next: HubTab) => {
    setHub(next)
    setView('catalog')
    setQuery('')
    setCategory('all')
  }

  if (view === 'workspace') {
    const title = hub === 'class' ? classSelected?.label : workSelected?.label
    const description =
      hub === 'class' ? classSelected?.description : workSelected?.description

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-0.5 shrink-0 rounded-xl"
            onClick={() => setView('catalog')}
          >
            <ArrowLeft className="h-4 w-4" />
            목록
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5 md:p-6">
          {hub === 'class' && classSelected ? (
            <ClassToolWorkspace id={classSelected.id} />
          ) : null}
          {hub === 'work' && workSelected ? <WorkToolWorkspace id={workSelected.id} /> : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">도구</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          교실에서 쓰는 수업 도구와, 책상에서 쓰는 업무 도구를 모았습니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['class', '수업 도구'],
            ['work', '업무 도구'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => switchHub(id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              hub === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="도구 검색"
          className="rounded-2xl pl-9"
        />
      </div>

      {hub === 'class' ? (
        <div className="flex flex-wrap gap-2">
          {CLASSROOM_TOOL_CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                category === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {hub === 'class'
          ? filteredClass.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setClassId(tool.id)
                    setView('workspace')
                  }}
                  className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{tool.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </button>
              )
            })
          : filteredWork.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setWorkId(tool.id)
                    setView('workspace')
                  }}
                  className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{tool.label}</p>
                      {tool.available ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          사용 가능
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          준비 중
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </button>
              )
            })}
      </div>
      {(hub === 'class' ? filteredClass : filteredWork).length === 0 ? (
        <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
      ) : null}
    </div>
  )
}
