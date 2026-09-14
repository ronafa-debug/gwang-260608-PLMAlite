import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { formatWon } from '@/lib/storeApi'
import type { AppPage } from '@/types/navigation'

interface CartPageProps {
  onNavigate: (page: AppPage) => void
}

export function CartPage({ onNavigate }: CartPageProps) {
  const { items, subtotal, setQuantity, removeItem } = useCart()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">장바구니</h1>
          <p className="mt-1 text-muted-foreground">담은 상품을 확인하고 주문으로 넘어갑니다.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => onNavigate('store')}>
          스토어로 가기
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">장바구니가 비어 있습니다.</p>
          <Button
            type="button"
            className="mt-4 rounded-2xl"
            onClick={() => onNavigate('store')}
          >
            상품 담기
          </Button>
        </div>
      ) : (
        <>
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
                    onClick={() => removeItem(item.lineId)}
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
                      onClick={() => setQuantity(item.lineId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-semibold">{formatWon(item.unitPrice * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-4 sm:justify-start">
              <span className="text-sm text-muted-foreground">합계</span>
              <span className="text-lg font-semibold">{formatWon(subtotal)}</span>
            </div>
            <Button
              type="button"
              className="h-11 rounded-2xl sm:min-w-[10rem]"
              onClick={() => onNavigate('checkout')}
            >
              주문하기
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
