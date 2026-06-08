const DIARY_PDF_CSS = `
  * { box-sizing: border-box; }
  .diary-worksheet {
    container-type: inline-size;
    border: 2px solid #1a1a1a !important;
    background-color: #ffffff !important;
    display: flex !important;
    flex-direction: column !important;
    width: 210mm !important;
    height: 297mm !important;
    min-height: 297mm !important;
  }
  .diary-drawing-area {
    flex: 1 1 auto !important;
    min-height: 0 !important;
  }
  .diary-writing-row {
    display: grid !important;
    grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    width: 100% !important;
  }
  .diary-writing-box {
    display: block !important;
    position: relative !important;
    width: 100% !important;
    padding-bottom: 100% !important;
    height: 0 !important;
    border: 1px solid #000000 !important;
    background-color: #ffffff !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .diary-writing-box--empty .diary-cell-char {
    color: transparent !important;
  }
  .diary-cell-char {
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-weight: 700 !important;
    color: #1a1a1a !important;
    line-height: 1 !important;
    text-align: center !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .diary-title-text {
    font-weight: 700 !important;
    color: #1a1a1a !important;
  }
  .diary-date-label {
    font-weight: 500 !important;
    color: #1a1a1a !important;
    font-size: 1.5rem !important;
  }
  .diary-date-gap {
    display: block !important;
    flex: 1 1 auto !important;
    min-width: 10mm !important;
  }
`

function getCellFontSize(boxWidth: number, charCount: number): number {
  const ratio = charCount > 1 ? 0.55 : 0.72
  return Math.max(11, Math.floor(boxWidth * ratio))
}

/**
 * html2canvas는 CSS의 oklch() 색상(Tailwind v4 기본)을 파싱하지 못합니다.
 * 캡처 직전 클론 문서의 스타일시트를 제거하고, 계산된 스타일을 rgb 인라인으로 복사합니다.
 */
export function prepareElementForCanvasCapture(
  sourceRoot: HTMLElement,
  cloneRoot: HTMLElement,
  clonedDoc: Document,
) {
  clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    node.remove()
  })

  const fallbackStyle = clonedDoc.createElement('style')
  fallbackStyle.textContent = DIARY_PDF_CSS
  clonedDoc.head.appendChild(fallbackStyle)

  const sourceNodes = [sourceRoot, ...sourceRoot.querySelectorAll('*')]
  const cloneNodes = [cloneRoot, ...cloneRoot.querySelectorAll('*')]

  sourceNodes.forEach((source, index) => {
    const clone = cloneNodes[index]
    if (!(clone instanceof HTMLElement)) return

    if (clone.classList.contains('diary-writing-row')) {
      clone.style.display = 'grid'
      clone.style.gridTemplateColumns = 'repeat(12, minmax(0, 1fr))'
      clone.style.width = '100%'
      return
    }

    if (clone.classList.contains('diary-writing-box')) {
      const sourceBox = source as HTMLElement
      const boxWidth = sourceBox.offsetWidth || sourceBox.getBoundingClientRect().width || 52
      const charEl = clone.querySelector('.diary-cell-char')
      const charText = charEl?.textContent?.trim() ?? ''
      const hasText = charText.length > 0 && charText !== '\u00A0'
      const charCount = hasText ? charText.length : 1
      const fontSize = getCellFontSize(boxWidth, charCount)

      clone.style.display = 'block'
      clone.style.position = 'relative'
      clone.style.width = '100%'
      clone.style.paddingBottom = '100%'
      clone.style.height = '0'
      clone.style.border = '1px solid #000000'
      clone.style.backgroundColor = '#ffffff'
      clone.style.boxSizing = 'border-box'
      clone.style.overflow = 'hidden'

      if (charEl instanceof HTMLElement) {
        charEl.style.position = 'absolute'
        charEl.style.top = '0'
        charEl.style.right = '0'
        charEl.style.bottom = '0'
        charEl.style.left = '0'
        charEl.style.display = 'flex'
        charEl.style.alignItems = 'center'
        charEl.style.justifyContent = 'center'
        charEl.style.lineHeight = '1'
        charEl.style.textAlign = 'center'
        charEl.style.padding = '0'
        charEl.style.margin = '0'
        if (hasText) {
          charEl.style.fontSize = `${fontSize}px`
          charEl.style.fontWeight = '700'
          charEl.style.color = '#1a1a1a'
        } else {
          charEl.style.color = 'transparent'
        }
      }
      return
    }

    if (clone.classList.contains('diary-drawing-area')) {
      clone.style.flex = '1 1 auto'
      clone.style.minHeight = '0'
      return
    }

    if (
      clone.classList.contains('diary-cell-char') ||
      clone.classList.contains('diary-writing-box') ||
      clone.classList.contains('diary-writing-row')
    ) {
      return
    }

    const computed = window.getComputedStyle(source)
    for (let i = 0; i < computed.length; i++) {
      const name = computed.item(i)
      const value = computed.getPropertyValue(name)
      if (!value || value.includes('oklch(')) continue
      clone.style.setProperty(name, value, computed.getPropertyPriority(name))
    }
  })
}
