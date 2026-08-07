import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { formatWon, uploadPrintImage } from '@/lib/storeApi'
import type { CartCustomOptions, Product } from '@/types/store'
import type { Student } from '@/types'

interface CustomProductDialogProps {
  product: Product | null
  students: Student[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (product: Product, quantity: number, custom: CartCustomOptions) => void
}

export function CustomProductDialog({
  product,
  students,
  open,
  onOpenChange,
  onConfirm,
}: CustomProductDialogProps) {
  const { isDemo } = useAuth()
  const [studentId, setStudentId] = useState<string>('')
  const [printLabel, setPrintLabel] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [printPath, setPrintPath] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setStudentId('')
    setPrintLabel('')
    setQuantity(1)
    setPreviewUrl(null)
    setPrintPath(null)
    setConfirmed(false)
    setUploading(false)
    setError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleFile = async (file: File | null) => {
    if (!file) return
    setError(null)
    setConfirmed(false)
    setUploading(true)
    try {
      const { path, previewUrl: url } = await uploadPrintImage(isDemo, file)
      setPrintPath(path)
      setPreviewUrl(url)
    } catch (err) {
      setPrintPath(null)
      setPreviewUrl(null)
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleConfirm = () => {
    if (!product) return
    if (!printPath || !previewUrl) {
      setError('인쇄할 사진을 업로드해 주세요.')
      return
    }
    if (!confirmed) {
      setError('시안 확인 및 동의를 체크해 주세요.')
      return
    }

    const student = students.find((s) => s.id === studentId)
    const label =
      printLabel.trim() || student?.name || product.name

    onConfirm(product, quantity, {
      studentId: studentId || null,
      studentName: student?.name ?? null,
      printImagePath: printPath,
      printImagePreviewUrl: previewUrl,
      printLabel: label,
      previewConfirmedAt: new Date().toISOString(),
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>{product?.name ?? '맞춤 굿즈'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            학생 얼굴 사진은 주문·인쇄 목적에만 사용됩니다. 보호자·학교 동의 하에
            업로드해 주세요.
          </p>

          <div className="space-y-2">
            <Label>학생 선택 (선택)</Label>
            <Select
              value={studentId || '__none__'}
              onValueChange={(value) => setStudentId(value === '__none__' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="학생을 선택하거나 비워 두세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">선택 안 함</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="print-label">인쇄 라벨 (이름 등)</Label>
            <Input
              id="print-label"
              value={printLabel}
              onChange={(e) => setPrintLabel(e.target.value)}
              placeholder="학생 이름 또는 별칭"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="print-photo">사진 업로드</Label>
            <Input
              id="print-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
            />
            {uploading ? (
              <p className="text-xs text-muted-foreground">업로드 중...</p>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted/50 p-4">
            <p className="text-sm font-medium text-foreground">시안 미리보기</p>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="인쇄 시안"
                className="max-h-48 max-w-full rounded-xl object-contain shadow-sm"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                사진을 올리면 여기에 표시됩니다
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-qty">수량</Label>
            <Input
              id="custom-qty"
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-sidebar-active/60 px-3 py-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 accent-primary"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              시안을 확인했으며, 학생 초상·사진을 인쇄 주문 목적에 사용하는 데 동의합니다.
              (잘못된 시안으로 인한 반품은 어려울 수 있습니다.)
            </span>
          </label>

          {product ? (
            <p className="text-right text-lg font-bold">
              {formatWon(product.unit_price * quantity)}
            </p>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              취소
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={uploading || !product}>
              장바구니 담기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
