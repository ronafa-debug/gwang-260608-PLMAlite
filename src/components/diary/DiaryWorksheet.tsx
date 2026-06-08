import { TracingPractice } from '@/components/shared/TracingPractice'
import { DIARY_PDF_PAGE_HEIGHT, DIARY_PDF_WIDTH } from '@/lib/utils'

interface DiaryWorksheetTemplateProps {
  title: string
  sentences: string[]
}

interface DiaryIllustrationPageProps {
  illustrationUrl: string
  title: string
}

function DateWriteGap() {
  return <span className="diary-date-gap min-w-[10mm] flex-1" aria-hidden="true" />
}

export function DiaryWorksheetTemplate({ title, sentences }: DiaryWorksheetTemplateProps) {
  return (
    <div
      className="diary-worksheet flex flex-col overflow-hidden border-2 border-neutral-800 bg-white text-neutral-900"
      style={{
        width: DIARY_PDF_WIDTH,
        minHeight: DIARY_PDF_PAGE_HEIGHT,
        height: DIARY_PDF_PAGE_HEIGHT,
      }}
    >
      <div className="flex shrink-0 border-b-2 border-neutral-800">
        <div className="flex min-w-0 flex-1 items-center border-r border-neutral-800 px-2 py-2">
          <span className="diary-date-label shrink-0 text-2xl">년</span>
          <DateWriteGap />
          <span className="diary-date-label shrink-0 text-2xl">월</span>
          <DateWriteGap />
          <span className="diary-date-label shrink-0 text-2xl">일</span>
          <DateWriteGap />
          <span className="diary-date-label shrink-0 text-2xl">요일</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 px-2 py-2 text-sm">
          <span className="font-medium">날씨</span>
          <span className="text-xl leading-none">☀️</span>
          <span className="text-xl leading-none">🌥️</span>
          <span className="text-xl leading-none">🌧️</span>
          <span className="text-xl leading-none">❄️</span>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 border-b border-neutral-800 text-sm">
        <div className="border-r border-neutral-800 px-3 py-2">일어난 시간:</div>
        <div className="px-3 py-2">잠드는 시간:</div>
      </div>

      <div className="diary-drawing-area relative min-h-0 flex-1 border-b-2 border-neutral-800">
        <p
          className="absolute left-3 top-3 text-sm"
          style={{ color: '#9ca3af' }}
        >
          그림을 그리거나 사진을 붙여 보세요.
        </p>
      </div>

      <div className="flex shrink-0 border-b-2 border-neutral-800 text-sm">
        <div className="flex w-16 shrink-0 items-center justify-center border-r border-neutral-800 py-2 font-medium">
          제목
        </div>
        <div
          className="diary-title-text flex flex-1 items-center px-3 py-2 font-bold"
          style={{
            fontSize: 'clamp(24px, 4.5cqi, 42px)',
            fontWeight: 700,
            color: '#1a1a1a',
          }}
        >
          {title}
        </div>
      </div>

      <TracingPractice sentences={sentences} />
    </div>
  )
}

export function DiaryIllustrationPage({ illustrationUrl, title }: DiaryIllustrationPageProps) {
  return (
    <div
      className="diary-illustration-page flex flex-col bg-white"
      style={{ width: DIARY_PDF_WIDTH, minHeight: DIARY_PDF_PAGE_HEIGHT, height: DIARY_PDF_PAGE_HEIGHT }}
    >
      <div className="flex h-full flex-1 items-center justify-center p-1">
        <img
          src={illustrationUrl}
          alt={title}
          crossOrigin="anonymous"
          className="max-h-full w-full object-contain"
        />
      </div>
    </div>
  )
}

interface DiaryWorksheetProps {
  title: string
  sentences: string[]
  illustrationUrl?: string | null
}

export function DiaryWorksheet({ title, sentences, illustrationUrl }: DiaryWorksheetProps) {
  return (
    <div className="mx-auto space-y-6" style={{ width: DIARY_PDF_WIDTH }}>
      <DiaryWorksheetTemplate title={title} sentences={sentences} />
      {illustrationUrl ? (
        <DiaryIllustrationPage illustrationUrl={illustrationUrl} title={title} />
      ) : null}
    </div>
  )
}
