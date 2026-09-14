import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DemoNotice } from '@/components/shared/DemoNotice'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/hooks/useCart'
import { fetchTeacherShipping, formatWon, submitOrder } from '@/lib/storeApi'
import type { AppPage } from '@/types/navigation'

interface CheckoutPageProps {
  onNavigate: (page: AppPage) => void
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { user, isDemo } = useAuth()
  const { items, subtotal, empty } = useCart()

  const [schoolName, setSchoolName] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingContact, setShippingContact] = useState('')
  const [note, setNote] = useState('')
  const [loadingShipping, setLoadingShipping] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadShipping = useCallback(async () => {
    setLoadingShipping(true)
    try {
      const shipping = await fetchTeacherShipping(isDemo)
      setSchoolName(shipping.school_name)
      setShippingAddress(shipping.shipping_address)
      setShippingContact(shipping.shipping_contact)
    } catch {
      // Leave fields empty; user can still fill in
    } finally {
      setLoadingShipping(false)
    }
  }, [isDemo])

  useEffect(() => {
    void loadShipping()
  }, [loadShipping])

  useEffect(() => {
    if (items.length === 0) {
      onNavigate('cart')
    }
  }, [items.length, onNavigate])

  const handleSubmit = async () => {
    if (items.length === 0) {
      onNavigate('cart')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await submitOrder(isDemo, {
        school_name: schoolName,
        shipping_address: shippingAddress,
        shipping_contact: shippingContact,
        teacher_name: user?.name ?? '선생님',
        note,
        items,
      })
      empty()
      setNote('')
      onNavigate('orders')
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">주문하기</h1>
          <p className="mt-1 text-muted-foreground">
            배송 정보를 확인한 뒤 배송을 시작합니다.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => onNavigate('cart')}>
          장바구니로
        </Button>
      </div>

      {isDemo ? (
        <DemoNotice>
          데모 모드: 주문은 이 기기에만 저장됩니다. 카드 결제 없이 「배송 시작」으로
          접수합니다.
        </DemoNotice>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground">주문 상품</p>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.lineId} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted-foreground">
                {item.productName} × {item.quantity}
              </span>
              <span className="shrink-0 font-medium">
                {formatWon(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <span>합계</span>
          <span>{formatWon(subtotal)}</span>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground">배송 정보</p>
        {loadingShipping ? (
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="checkout-school">학교명</Label>
              <Input
                id="checkout-school"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="○○초등학교"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-address">배송 주소 (행정실 등)</Label>
              <Textarea
                id="checkout-address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="학교 주소 및 행정실"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-contact">연락처</Label>
              <Input
                id="checkout-contact"
                value={shippingContact}
                onChange={(e) => setShippingContact(e.target.value)}
                placeholder="010-0000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-note">요청 메모 (선택)</Label>
              <Textarea
                id="checkout-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="행정실 전달 시 참고 사항"
                rows={2}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              설정에서 학교·배송지를 저장해 두면 다음에 자동으로 채워집니다. 카드 결제 없이
              배송 후 청구서가 동봉되며 행정실에서 계좌이체로 정산합니다.
            </p>
          </>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="button"
        className="h-11 w-full rounded-2xl"
        disabled={submitting || loadingShipping}
        onClick={() => void handleSubmit()}
      >
        {submitting ? '주문 처리 중...' : '배송 시작'}
      </Button>
    </div>
  )
}
