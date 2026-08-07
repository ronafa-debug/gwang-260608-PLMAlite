import { cn } from '@/lib/utils'
import { getCustomerStatusLabel, type OrderStatus, type ProductType } from '@/types/store'

const FLOW: OrderStatus[] = [
  'submitted',
  'in_production',
  'shipped',
  'invoiced',
  'paid',
]

interface OrderStatusTimelineProps {
  status: OrderStatus
  /** When set, in_production label becomes 제작중 vs 출고 준비중 for customers. */
  items?: Array<{ product_type: ProductType }> | null
  /** Admin board uses generic labels (제작·출고준비). */
  variant?: 'customer' | 'admin'
}

const ADMIN_STEP_LABEL: Record<OrderStatus, string> = {
  submitted: '확인 대기',
  in_production: '제작·출고준비',
  shipped: '출고됨',
  invoiced: '청구서 발송',
  paid: '입금확인',
  cancelled: '취소됨',
}

export function OrderStatusTimeline({
  status,
  items,
  variant = 'customer',
}: OrderStatusTimelineProps) {
  if (status === 'cancelled') {
    return (
      <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
        주문이 취소되었습니다.
      </p>
    )
  }

  const currentIndex = FLOW.indexOf(status)
  const labelFor = (step: OrderStatus) =>
    variant === 'admin'
      ? ADMIN_STEP_LABEL[step]
      : getCustomerStatusLabel(step, items)

  return (
    <ol className="flex flex-wrap gap-2">
      {FLOW.map((step, index) => {
        const done = index <= currentIndex
        return (
          <li
            key={step}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              done
                ? 'bg-primary/15 text-primary'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {labelFor(step)}
          </li>
        )
      })}
    </ol>
  )
}
