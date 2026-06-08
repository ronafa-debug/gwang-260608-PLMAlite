import { buildDiaryWritingRowsFromSentences, cn, DIARY_BOXES_PER_ROW } from '@/lib/utils'

interface TracingPracticeProps {
  sentences: string[]
  className?: string
}

function WritingBox({
  children,
  practice,
}: {
  children?: string
  practice?: boolean
}) {
  const isSpace = children === ' '
  const hasChar = Boolean(children && !isSpace)
  const display = practice || isSpace || !hasChar ? undefined : children
  const charCount = display?.length ?? 0

  return (
    <span
      className={cn(
        'diary-writing-box w-full border border-black bg-white',
        practice || !hasChar ? 'diary-writing-box--empty' : 'diary-model-text',
      )}
      style={{
        display: 'block',
        position: 'relative',
        width: '100%',
        paddingBottom: '100%',
        height: 0,
        border: '1px solid #000000',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <span
        className="diary-cell-char absolute inset-0 flex items-center justify-center font-bold leading-none"
        style={{
          fontSize: charCount > 1 ? 'clamp(11px, 4cqi, 32px)' : 'clamp(14px, 5.8cqi, 46px)',
          lineHeight: 1,
          color: display ? '#1a1a1a' : 'transparent',
        }}
      >
        {display ?? '\u00A0'}
      </span>
    </span>
  )
}

function WritingRow({
  cells,
  empty,
}: {
  cells: string[]
  empty?: boolean
}) {
  return (
    <div
      className="diary-writing-row w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${DIARY_BOXES_PER_ROW}, minmax(0, 1fr))`,
        width: '100%',
      }}
    >
      {cells.map((cell, index) => (
        <WritingBox key={index} practice={empty}>
          {empty ? undefined : cell}
        </WritingBox>
      ))}
    </div>
  )
}

export function TracingPractice({ sentences, className }: TracingPracticeProps) {
  const rows = buildDiaryWritingRowsFromSentences(sentences)

  return (
    <div className={cn('w-full shrink-0 space-y-0', className)}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex}>
          <WritingRow cells={row.model} />
          <WritingRow cells={row.practice} empty />
        </div>
      ))}
    </div>
  )
}
