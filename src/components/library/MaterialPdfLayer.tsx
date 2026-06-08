import {
  DiaryIllustrationPage,
  DiaryWorksheetTemplate,
} from '@/components/diary/DiaryWorksheet'
import { StorytellingWorksheet } from '@/components/storytelling/StorytellingWorksheet'
import { DIARY_PDF_WIDTH } from '@/lib/utils'
import type { DiaryMaterial, LibraryItem, StorytellingMaterial } from '@/types'

interface MaterialPdfLayerProps {
  item: LibraryItem | null
  pdfRef: React.RefObject<HTMLDivElement | null>
}

export function MaterialPdfLayer({ item, pdfRef }: MaterialPdfLayerProps) {
  if (!item) return null

  if (item.type === 'storytelling') {
    const data = item.data as StorytellingMaterial
    return (
      <div
        ref={pdfRef}
        className="pointer-events-none fixed -left-[9999px] top-0 w-[210mm] opacity-0"
        aria-hidden="true"
      >
        <StorytellingWorksheet
          story={data.story_content}
          questions={data.worksheet_content}
          coloringImageUrl={data.coloring_image_url}
        />
      </div>
    )
  }

  const data = item.data as DiaryMaterial
  const sentences = data.final_text.split('\n').filter(Boolean)

  return (
    <div
      ref={pdfRef}
      className="pointer-events-none fixed -left-[9999px] top-0 bg-white opacity-0"
      style={{ width: DIARY_PDF_WIDTH }}
      aria-hidden="true"
    >
      <div data-pdf-section>
        <DiaryWorksheetTemplate title={data.title} sentences={sentences} />
      </div>
      {data.image_url ? (
        <div data-pdf-section>
          <DiaryIllustrationPage illustrationUrl={data.image_url} title={data.title} />
        </div>
      ) : null}
    </div>
  )
}
