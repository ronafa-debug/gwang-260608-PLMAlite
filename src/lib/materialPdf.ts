import { downloadSectionsAsPdf } from '@/lib/downloadPdf'
import type { DiaryMaterial, LibraryItem, StorytellingMaterial } from '@/types'

function safeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '').slice(0, 40)
}

export function getMaterialPdfFilename(item: LibraryItem) {
  const studentName = item.data.students?.name ?? '학생'

  if (item.type === 'storytelling') {
    const data = item.data as StorytellingMaterial
    return `스토리텔링_${safeFilename(`${studentName}_${data.subject}_${data.learning_goal}`)}.pdf`
  }

  const data = item.data as DiaryMaterial
  return `그림일기_${safeFilename(`${studentName}_${data.title}`)}.pdf`
}

export async function downloadMaterialPdf(root: HTMLElement, item: LibraryItem) {
  const sections = root.querySelectorAll<HTMLElement>('[data-pdf-section]')
  if (sections.length === 0) {
    throw new Error('PDF로보낼 내용을 찾지 못했습니다.')
  }

  const filename = getMaterialPdfFilename(item)
  const options =
    item.type === 'diary'
      ? {
          pageMarginMm: 0,
          fitOnSinglePage:
            (item.data as DiaryMaterial).image_url != null ? [1] : [],
        }
      : { fitOnSinglePage: [0, 1] }

  await downloadSectionsAsPdf(Array.from(sections), filename, options)
}

export async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  )
}
