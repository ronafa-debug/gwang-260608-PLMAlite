import { Minus, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatWon } from '@/lib/storeApi'
import type { CartItem } from '@/types/store'

interface CartPanelProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  subtotal: number
  schoolName: string
  shippingAddress: string
  shippingContact: string
  note: string
  submitting: boolean
  error: string | null
  isDemo: boolean
  onSchoolNameChange: (value: string) => void
  onShippingAddressChange: (value: string) => void
  onShippingContactChange: (value: string) => void
  onNoteChange: (value: string) => void
  onSetQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onSubmit: () => void
}

export function CartPanel({
  open,
  onClose,
  items,
  subtotal,
  schoolName,
  shippingAddress,
  shippingContact,
  note,
  submitting,
  error,
  isDemo,
  onSchoolNameChange,
  onShippingAddressChange,
  onShippingContactChange,
  onNoteChange,
  onSetQuantity,
  onRemove,
  onSubmit,
}: CartPanelProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">장바구니</h2>
          <button
            type="button"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">장바구니가 비어 있습니다.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.lineId}
                  className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 gap-3">
                      {item.custom?.printImagePreviewUrl ? (
                        <img
                          src={item.custom.printImagePreviewUrl}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatWon(item.unitPrice)} ·{' '}
                          {item.productType === 'custom' ? '맞춤' : '소모품'}
                        </p>
                        {item.custom ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.custom.printLabel
                              ? `라벨: ${item.custom.printLabel}`
                              : null}
                            {item.custom.studentName
                              ? ` · 학생: ${item.custom.studentName}`
                              : null}
                            {' · 시안 확인됨'}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(item.lineId)}
                      aria-label="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onSetQuantity(item.lineId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onSetQuantity(item.lineId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold">
                      {formatWon(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">배송 정보</p>
            <div className="space-y-2">
              <Label htmlFor="cart-school">학교명</Label>
              <Input
                id="cart-school"
                value={schoolName}
                onChange={(e) => onSchoolNameChange(e.target.value)}
                placeholder="○○초등학교"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cart-address">배송 주소 (행정실 등)</Label>
              <Textarea
                id="cart-address"
                value={shippingAddress}
                onChange={(e) => onShippingAddressChange(e.target.value)}
                placeholder="학교 주소 및 행정실"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cart-contact">연락처</Label>
              <Input
                id="cart-contact"
                value={shippingContact}
                onChange={(e) => onShippingContactChange(e.target.value)}
                placeholder="010-0000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cart-note">요청 메모 (선택)</Label>
              <Textarea
                id="cart-note"
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="행정실 전달 시 참고 사항"
                rows={2}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              설정에서 학교·배송지를 저장해 두면 다음에 자동으로 채워집니다. 카드 결제 없이
              배송 후 청구서가 동봉되며 행정실에서 계좌이체로 정산합니다.
            </p>
            {isDemo ? (
              <p className="text-xs text-amber-800">
                데모 모드: 주문은 이 기기에만 저장됩니다.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 border-t border-border px-5 py-4">
          <div className="flex items-center justify-between text-base font-semibold">
            <span>합계</span>
            <span>{formatWon(subtotal)}</span>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            type="button"
            className="h-11 w-full rounded-2xl"
            disabled={items.length === 0 || submitting}
            onClick={onSubmit}
          >
            {submitting ? '주문 처리 중...' : '배송 시작'}
          </Button>
        </div>
      </div>
    </div>
  )
}
