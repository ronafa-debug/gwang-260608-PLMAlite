import { cn } from '@/lib/utils'
import {
  CUSTOMER_STATUS_LABEL,
  type OrderStatus,
  type ProductType,
} from '@/types/store'

const FLOW: OrderStatus[] = [
  'submitted',
  'in_production',
  'shipped',
  'invoiced',
  'paid',
]

interface OrderStatusTimelineProps {
  status: OrderStatus
  /** Kept for call-site compatibility; customer labels no longer depend on item type. */
  items?: Array<{ product_type: ProductType }> | null
  /** Admin board uses operational labels (확인 대기 · 출고 · 청구 …). */
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
    variant === 'admin' ? ADMIN_STEP_LABEL[step] : CUSTOMER_STATUS_LABEL[step]

  return (
    <ol className="flex flex-wrap gap-2">
      {FLOW.map((step, index) => {
        const isPast = index < currentIndex
        const isCurrent = index === currentIndex
        return (
          <li
            key={step}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              isCurrent && 'bg-primary text-primary-foreground',
              isPast && 'bg-primary/20 text-primary',
              !isPast && !isCurrent && 'bg-muted text-muted-foreground',
            )}
          >
            {labelFor(step)}
          </li>
        )
      })}
    </ol>
  )
}
