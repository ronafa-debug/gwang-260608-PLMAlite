import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** A4 그림일기 한 줄 칸 수 */
export const DIARY_BOXES_PER_ROW = 12

/** PDF A4 전체 크기 */
export const DIARY_PDF_WIDTH = '210mm'
export const DIARY_PDF_PAGE_HEIGHT = '297mm'

const SENTENCE_END_PUNCT = new Set(['.', '!', '?'])

export function joinDiarySentences(sentences: string[]): string {
  return sentences.join(' ')
}

export function splitIntoDiaryCells(text: string): string[] {
  return Array.from(text).filter((ch) => ch !== '\n' && ch !== '\t')
}

export interface DiaryWritingRow {
  model: string[]
  practice: string[]
}

function padRow(cells: string[], boxesPerRow = DIARY_BOXES_PER_ROW): string[] {
  const padded = [...cells]
  while (padded.length < boxesPerRow) {
    padded.push('')
  }
  return padded
}

function pushRow(rows: string[][], row: string[]) {
  if (row.length > 0) {
    rows.push(row)
  }
}

function appendPunctuation(row: string[], punct: string): string[] {
  if (row.length === 0) return [punct]

  const lastIndex = row.length - 1
  const last = row[lastIndex]
  if (last === '') {
    row[lastIndex] = punct
  } else {
    row[lastIndex] = last + punct
  }
  return row
}

function startsWithLonePunctuation(row: string[]): boolean {
  const first = row.find((cell) => cell !== '')
  return first !== undefined && first.length === 1 && SENTENCE_END_PUNCT.has(first)
}

function mergeLonePunctuationRows(modelRows: string[][]) {
  for (let i = 1; i < modelRows.length; i++) {
    if (startsWithLonePunctuation(modelRows[i])) {
      const punct = modelRows[i].find((cell) => cell !== '') ?? ''
      modelRows[i] = modelRows[i].map((cell) => (cell === punct ? '' : cell))
      const prev = modelRows[i - 1]
      const prevLast = prev[prev.length - 1]
      prev[prev.length - 1] = prevLast === '' ? punct : prevLast + punct
    }
  }
}

/** 원고지 규칙: 문장은 띄어쓰기로 이어 쓰기, 마침표는 글자와 같은 칸 */
export function buildManuscriptRowsFromText(
  text: string,
  boxesPerRow = DIARY_BOXES_PER_ROW,
): DiaryWritingRow[] {
  const modelRows: string[][] = []
  let currentRow: string[] = ['']
  const chars = splitIntoDiaryCells(text)

  for (const ch of chars) {
    if (SENTENCE_END_PUNCT.has(ch)) {
      currentRow = appendPunctuation(currentRow, ch)
      continue
    }

    if (currentRow.length >= boxesPerRow) {
      pushRow(modelRows, currentRow)
      currentRow = []
    }

    currentRow.push(ch)
  }

  pushRow(modelRows, currentRow)
  mergeLonePunctuationRows(modelRows)

  return modelRows.map((model) => ({
    model: padRow(model, boxesPerRow),
    practice: Array.from({ length: boxesPerRow }, () => ''),
  }))
}

export function buildManuscriptRowsFromSentences(
  sentences: string[],
  boxesPerRow = DIARY_BOXES_PER_ROW,
): DiaryWritingRow[] {
  return buildManuscriptRowsFromText(joinDiarySentences(sentences), boxesPerRow)
}

/** @deprecated buildManuscriptRowsFromSentences 사용 */
export function buildDiaryWritingRows(
  text: string,
  boxesPerRow = DIARY_BOXES_PER_ROW,
): DiaryWritingRow[] {
  return buildManuscriptRowsFromText(text, boxesPerRow)
}

export function buildDiaryWritingRowsFromSentences(
  sentences: string[],
  boxesPerRow = DIARY_BOXES_PER_ROW,
): DiaryWritingRow[] {
  return buildManuscriptRowsFromSentences(sentences, boxesPerRow)
}
