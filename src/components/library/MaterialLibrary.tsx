import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Eye, RefreshCw, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DiaryWorksheet } from '@/components/diary/DiaryWorksheet'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { StorytellingWorksheet } from '@/components/storytelling/StorytellingWorksheet'
import { MaterialPdfLayer } from '@/components/library/MaterialPdfLayer'
import {
  deleteDiaryMaterial,
  deleteStorytellingMaterial,
  fetchDiaryMaterials,
  fetchStorytellingMaterials,
} from '@/lib/api'
import { downloadMaterialPdf, waitForImages } from '@/lib/materialPdf'
import { formatDateTime } from '@/lib/utils'
import type { DiaryMaterial, LibraryItem, StorytellingMaterial } from '@/types'

export function MaterialLibrary() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null)
  const [pdfTarget, setPdfTarget] = useState<LibraryItem | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [storytelling, diary] = await Promise.all([
        fetchStorytellingMaterials(),
        fetchDiaryMaterials(),
      ])

      const merged: LibraryItem[] = [
        ...storytelling.map((data) => ({ type: 'storytelling' as const, data })),
        ...diary.map((data) => ({ type: 'diary' as const, data })),
      ].sort(
        (a, b) =>
          new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime(),
      )

      setItems(merged)
    } catch (err) {
      setError(err instanceof Error ? err.message : '자료를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!pdfTarget || !pdfRef.current) return

    const run = async () => {
      setDownloadingId(pdfTarget.data.id)
      setPdfError(null)
      try {
        await waitForImages(pdfRef.current!)
        await downloadMaterialPdf(pdfRef.current!, pdfTarget)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'PDF 저장에 실패했습니다.'
        setPdfError(message)
        window.alert(message)
      } finally {
        setDownloadingId(null)
        setPdfTarget(null)
      }
    }

    const timer = window.setTimeout(() => {
      void run()
    }, 100)

    return () => window.clearTimeout(timer)
  }, [pdfTarget])

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return items

    return items.filter((item) => {
      if (item.type === 'storytelling') {
        const data = item.data as StorytellingMaterial
        return [
          data.students?.name,
          data.subject,
          data.learning_goal,
          data.story_situation,
          data.story_content,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(keyword))
      }

      const data = item.data as DiaryMaterial
      return [data.students?.name, data.title, data.final_text, data.raw_input]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    })
  }, [items, search])

  const handleDelete = async (item: LibraryItem) => {
    if (!window.confirm('이 자료를 삭제할까요?')) return

    try {
      if (item.type === 'storytelling') {
        await deleteStorytellingMaterial(item.data.id)
      } else {
        await deleteDiaryMaterial(item.data.id)
      }
      setItems((prev) => prev.filter((current) => current.data.id !== item.data.id))
      if (previewItem?.data.id === item.data.id) setPreviewItem(null)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    }
  }

  const handleDownloadPdf = (item: LibraryItem) => {
    setPdfTarget(item)
  }

  const getTitle = (item: LibraryItem) => {
    if (item.type === 'storytelling') {
      const data = item.data as StorytellingMaterial
      return `${data.subject} · ${data.learning_goal}`
    }
    return (item.data as DiaryMaterial).title
  }

  const isDownloading = (item: LibraryItem) => downloadingId === item.data.id

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>자료 라이브러리</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="학생명, 제목, 학습목표로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {pdfError ? <p className="text-sm text-destructive">{pdfError}</p> : null}
      {loading ? <LoadingState message="자료를 불러오는 중..." /> : null}
      {!loading && error ? (
        <EmptyState title="자료를 불러올 수 없습니다" description={error} />
      ) : null}
      {!loading && !error && filteredItems.length === 0 ? (
        <EmptyState
          title="저장된 자료가 없습니다"
          description="스토리텔링 또는 그림일기를 생성한 뒤 저장해 보세요."
        />
      ) : null}

      {!loading && !error && filteredItems.length > 0 ? (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card key={`${item.type}-${item.data.id}`}>
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {item.type === 'storytelling' ? '스토리텔링' : '그림일기'}
                    </span>
                    <p className="font-semibold">{getTitle(item)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    학생: {item.data.students?.name ?? '알 수 없음'} · 생성일:{' '}
                    {formatDateTime(item.data.created_at)}
                  </p>
                  {item.type === 'storytelling' ? (
                    <p className="text-sm text-muted-foreground">
                      과목: {(item.data as StorytellingMaterial).subject} · 학습목표:{' '}
                      {(item.data as StorytellingMaterial).learning_goal}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewItem(item)}
                  >
                    <Eye className="h-4 w-4" />
                    미리보기
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPdf(item)}
                    disabled={isDownloading(item)}
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading(item) ? 'PDF 생성 중...' : 'PDF 저장'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => void handleDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <MaterialPdfLayer item={pdfTarget} pdfRef={pdfRef} />

      <Dialog open={Boolean(previewItem)} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          {previewItem ? (
            <>
              <DialogHeader>
                <DialogTitle>{getTitle(previewItem)}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPdf(previewItem)}
                  disabled={isDownloading(previewItem)}
                >
                  <Download className="h-4 w-4" />
                  {isDownloading(previewItem) ? 'PDF 생성 중...' : 'PDF 저장'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => void handleDelete(previewItem)}
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </Button>
              </div>

              {previewItem.type === 'storytelling' ? (
                <StorytellingPreview data={previewItem.data as StorytellingMaterial} />
              ) : (
                <DiaryPreview data={previewItem.data as DiaryMaterial} />
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StorytellingPreview({ data }: { data: StorytellingMaterial }) {
  return (
    <StorytellingWorksheet
      story={data.story_content}
      questions={data.worksheet_content}
      coloringImageUrl={data.coloring_image_url}
    />
  )
}

function DiaryPreview({ data }: { data: DiaryMaterial }) {
  const sentences = data.final_text.split('\n').filter(Boolean)

  return (
    <DiaryWorksheet
      title={data.title}
      sentences={sentences}
      illustrationUrl={data.image_url}
    />
  )
}
