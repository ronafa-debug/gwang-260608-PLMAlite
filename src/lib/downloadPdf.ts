import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { prepareElementForCanvasCapture } from '@/lib/pdfCapture'

const DEFAULT_PAGE_MARGIN_MM = 10

interface SectionPdfOptions {
  /** 이 인덱스의 섹션은 한 페이지에 맞춤(축소). 색칠하기 등 이미지용 */
  fitOnSinglePage?: number[]
  /** 페이지 여백(mm). 0이면 표가 페이지에 꽉 참 */
  pageMarginMm?: number
}

async function captureSection(element: HTMLElement) {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    onclone: (clonedDoc, clonedElement) => {
      prepareElementForCanvasCapture(element, clonedElement, clonedDoc)
    },
  })
}

function addSectionCanvas(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  isFirstPdfPage: boolean,
  fitSinglePage: boolean,
  pageMarginMm: number,
) {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - pageMarginMm * 2
  const contentHeight = pageHeight - pageMarginMm * 2
  const imgData = canvas.toDataURL('image/png')

  let drawWidth = contentWidth
  let drawHeight = (canvas.height * drawWidth) / canvas.width

  if (fitSinglePage && drawHeight > contentHeight) {
    drawHeight = contentHeight
    drawWidth = (canvas.width * drawHeight) / canvas.height
  }

  const x = pageMarginMm + (contentWidth - drawWidth) / 2

  if (fitSinglePage || drawHeight <= contentHeight) {
    if (!isFirstPdfPage) pdf.addPage()
    pdf.addImage(imgData, 'PNG', x, pageMarginMm, drawWidth, drawHeight)
    return false
  }

  let heightLeft = drawHeight
  let position = pageMarginMm
  let isFirst = isFirstPdfPage

  while (heightLeft > 0) {
    if (!isFirst) pdf.addPage()
    pdf.addImage(imgData, 'PNG', x, position, drawWidth, drawHeight)
    heightLeft -= contentHeight
    position = pageMarginMm - (drawHeight - heightLeft)
    isFirst = false
  }

  return false
}

export async function downloadSectionsAsPdf(
  sections: HTMLElement[],
  filename: string,
  options: SectionPdfOptions = {},
) {
  const { fitOnSinglePage = [], pageMarginMm = DEFAULT_PAGE_MARGIN_MM } = options
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let isFirstPdfPage = true

  for (let index = 0; index < sections.length; index++) {
    const canvas = await captureSection(sections[index])
    const fitSingle = fitOnSinglePage.includes(index)
    isFirstPdfPage = addSectionCanvas(
      pdf,
      canvas,
      isFirstPdfPage,
      fitSingle,
      pageMarginMm,
    )
  }

  pdf.save(filename)
}

/** @deprecated 단일 요소 전체 캡처 — 섹션별 PDF는 downloadSectionsAsPdf 사용 */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  await downloadSectionsAsPdf([element], filename)
}
