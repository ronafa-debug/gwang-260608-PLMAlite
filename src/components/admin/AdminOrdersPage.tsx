import { useCallback, useEffect, useMemo, useState } from 'react'
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
  adminUpdateOrderStatus,
  fetchAllOrders,
  fetchBillingSettings,
  formatWon,
} from '@/lib/storeApi'
import { cn, formatDateTime } from '@/lib/utils'
import {
  ADMIN_STATUS_TRANSITIONS,
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
  type StoreBillingSettings,
} from '@/types/store'

type StatusFilter = 'all' | OrderStatus | 'unpaid'

const STATUS_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  in_production: '주문확인(접수)',
  shipped: '출고 처리',
  invoiced: '청구서 발송',
  paid: '입금 확인',
  cancelled: '주문 취소',
}

export function AdminOrdersPage() {
  const { isDemo, isAdmin } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [billing, setBilling] = useState<StoreBillingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [list, settings] = await Promise.all([
        fetchAllOrders(isDemo),
        fetchBillingSettings(isDemo),
      ])
      setOrders(list)
      setBilling(settings)
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    if (filter === 'all') return orders
    if (filter === 'unpaid') {
      return orders.filter(
        (o) =>
          o.status === 'shipped' ||
          o.status === 'invoiced' ||
          o.status === 'submitted' ||
          o.status === 'in_production',
      )
    }
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  const handleTransition = async (order: Order, next: OrderStatus) => {
    setActionError(null)
    setBusyId(order.id)
    try {
      const updated = await adminUpdateOrderStatus(isDemo, order.id, next)
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
      if (next === 'invoiced') setInvoiceOrder(updated)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  if (!isAdmin) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          관리자만 접근할 수 있습니다.
        </CardContent>
      </Card>
    )
  }

  const filters: Array<{ id: StatusFilter; label: string }> = [
    { id: 'all', label: '전체' },
    { id: 'submitted', label: '확인 대기' },
    { id: 'in_production', label: '제작·출고준비' },
    { id: 'shipped', label: '출고' },
    { id: 'invoiced', label: '청구' },
    { id: 'unpaid', label: '미수·진행' },
    { id: 'paid', label: '입금확인' },
    { id: 'cancelled', label: '취소' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">주문 관리</h1>
          <p className="mt-1 text-muted-foreground">
            출고 · 청구서 · 입금 확인 (관리자 전용)
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()}>
          새로고침
        </Button>
      </div>

      {isDemo ? (
        <DemoNotice>
          <p className="font-medium">데모 관리자</p>
          <p className="mt-1 opacity-90">
            추천 흐름: 교사가 주문(확인 대기) → 여기서{' '}
            <strong className="font-semibold">주문확인(접수)</strong>
            하면 교사 화면은 제작중/출고 준비중으로 바뀌고 취소가 잠깁니다 → 출고 → 청구서 → 입금
            확인.
          </p>
        </DemoNotice>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium',
              filter === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">불러오는 중...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      {!loading && filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            해당 조건의 주문이 없습니다.
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {filtered.map((order) => {
          const expanded = expandedId === order.id
          const nextStatuses = ADMIN_STATUS_TRANSITIONS[order.status] ?? []
          const items = order.order_items ?? []

          return (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {order.school_name || '학교 미기재'} · {order.teacher_name} ·{' '}
                      {formatWon(order.subtotal)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(order.submitted_at)} · {order.id.slice(0, 8)}…
                      {order.invoice_number ? ` · ${order.invoice_number}` : ''}
                    </p>
                    <OrderStatusTimeline
                      status={order.status}
                      items={order.order_items}
                      variant="admin"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(expanded ? null : order.id)}
                    >
                      {expanded ? '접기' : '상세'}
                    </Button>
                    {(order.status === 'invoiced' ||
                      order.status === 'shipped' ||
                      order.status === 'paid' ||
                      order.invoice_number) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInvoiceOrder(order)}
                      >
                        청구서
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((next) => (
                    <Button
                      key={next}
                      type="button"
                      size="sm"
                      variant={next === 'cancelled' ? 'destructive' : 'default'}
                      disabled={busyId === order.id}
                      onClick={() => void handleTransition(order, next)}
                    >
                      {STATUS_ACTION_LABEL[next] ?? ORDER_STATUS_LABEL[next]}
                    </Button>
                  ))}
                </div>

                {expanded ? (
                  <div className="space-y-3 rounded-2xl bg-muted/40 p-4 text-sm">
                    <p>
                      <span className="text-muted-foreground">배송: </span>
                      {order.shipping_address}
                    </p>
                    {order.note ? (
                      <p>
                        <span className="text-muted-foreground">메모: </span>
                        {order.note}
                      </p>
                    ) : null}
                    <ul className="divide-y divide-border/60 rounded-xl bg-card">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {item.printImagePreviewUrl ? (
                              <a
                                href={item.printImagePreviewUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={item.printImagePreviewUrl}
                                  alt=""
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              </a>
                            ) : null}
                            <div>
                              <p>
                                {item.product_name} × {item.quantity}
                              </p>
                              {item.print_label ? (
                                <p className="text-xs text-muted-foreground">
                                  {item.print_label}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <span className="font-medium">{formatWon(item.line_total)}</span>
                        </li>
                      ))}
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
