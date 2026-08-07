import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { DemoNotice } from '@/components/shared/DemoNotice'
import { InvoiceView } from '@/components/store/InvoiceView'
import { OrderStatusTimeline } from '@/components/store/OrderStatusTimeline'
import {
  cancelOrder,
  fetchBillingSettings,
  fetchMyOrders,
  formatWon,
} from '@/lib/storeApi'
import { formatDateTime } from '@/lib/utils'
import {
  getCustomerStatusLabel,
  type Order,
  type StoreBillingSettings,
} from '@/types/store'
import type { AppPage } from '@/types/navigation'

interface OrdersPageProps {
  onNavigate: (page: AppPage) => void
}

export function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { isDemo } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [billing, setBilling] = useState<StoreBillingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, settings] = await Promise.all([
        fetchMyOrders(isDemo),
        fetchBillingSettings(isDemo),
      ])
      setOrders(data)
      setBilling(settings)
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => {
    void load()
  }, [load])

  const handleCancel = async (orderId: string) => {
    if (
      !window.confirm(
        '이 주문을 취소할까요? 관리자가 주문을 확인(접수)하기 전까지만 가능합니다.',
      )
    ) {
      return
    }
    try {
      await cancelOrder(isDemo, orderId)
      await load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '취소에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">내 주문</h1>
          <p className="mt-1 text-muted-foreground">
            배송 시작 후 접수된 주문과 진행 상태를 확인합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void load()}>
            새로고침
          </Button>
          <Button type="button" onClick={() => onNavigate('store')}>
            스토어로 가기
          </Button>
        </div>
      </div>

      {isDemo ? (
        <DemoNotice>
          주문 직후 ·확인 대기· 상태에서는 취소할 수 있습니다. 관리자가 주문확인(접수)하면
          ·제작중· 또는 ·출고 준비중·으로 바뀌며 취소가 잠깁니다.
        </DemoNotice>
      ) : null}

      {loading ? <p className="text-sm text-muted-foreground">불러오는 중...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-3 p-8 text-center">
            <p className="text-sm text-muted-foreground">아직 주문이 없습니다.</p>
            <Button type="button" onClick={() => onNavigate('store')}>
              스토어에서 담기
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {orders.map((order) => {
          const expanded = expandedId === order.id
          const items = order.order_items ?? []
          const canInvoice =
            Boolean(order.invoice_number) ||
            order.status === 'invoiced' ||
            order.status === 'paid' ||
            order.status === 'shipped'

          return (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">
                      {order.school_name || '학교 미기재'} · {formatWon(order.subtotal)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(order.submitted_at)} · 주문{' '}
                      {order.id.slice(0, 8)}…
                      {order.invoice_number ? ` · ${order.invoice_number}` : ''}
                    </p>
                    <OrderStatusTimeline
                      status={order.status}
                      items={order.order_items}
                      variant="customer"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {getCustomerStatusLabel(order.status, order.order_items)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(expanded ? null : order.id)}
                    >
                      {expanded ? '접기' : '상세'}
                    </Button>
                    {canInvoice ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInvoiceOrder(order)}
                      >
                        청구서
                      </Button>
                    ) : null}
                    {order.status === 'submitted' ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleCancel(order.id)}
                      >
                        취소
                      </Button>
                    ) : null}
                  </div>
                </div>

                {expanded ? (
                  <div className="space-y-3 rounded-2xl bg-muted/40 p-4 text-sm">
                    <p>
                      <span className="text-muted-foreground">배송지: </span>
                      {order.shipping_address}
                    </p>
                    {order.shipping_contact ? (
                      <p>
                        <span className="text-muted-foreground">연락처: </span>
                        {order.shipping_contact}
                      </p>
                    ) : null}
                    {order.note ? (
                      <p>
                        <span className="text-muted-foreground">메모: </span>
                        {order.note}
                      </p>
                    ) : null}
                    <ul className="divide-y divide-border/80 rounded-xl bg-card">
                      {items.map((item) => {
                        const preview =
                          item.printImagePreviewUrl ??
                          (item.options?.demoPreviewUrl as string | undefined) ??
                          null
                        return (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 px-3 py-2"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {preview ? (
                                <img
                                  src={preview}
                                  alt=""
                                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                />
                              ) : null}
                              <div className="min-w-0">
                                <p>
                                  {item.product_name} × {item.quantity}
                                </p>
                                {item.product_type === 'custom' ? (
                                  <p className="text-xs text-muted-foreground">
                                    {item.print_label
                                      ? `라벨: ${item.print_label}`
                                      : '맞춤 굿즈'}
                                    {item.preview_confirmed_at ? ' · 시안 확인' : null}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <span className="shrink-0 font-medium">
                              {formatWon(item.line_total)}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={Boolean(invoiceOrder)} onOpenChange={() => setInvoiceOrder(null)}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>청구서</DialogTitle>
          </DialogHeader>
          {invoiceOrder && billing ? (
            <InvoiceView
              order={invoiceOrder}
              billing={billing}
              onClose={() => setInvoiceOrder(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
