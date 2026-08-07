import { Button } from '@/components/ui/button'
import { formatWon } from '@/lib/storeApi'
import { formatDateTime } from '@/lib/utils'
import type { Order, StoreBillingSettings } from '@/types/store'

interface InvoiceViewProps {
  order: Order
  billing: StoreBillingSettings
  onClose?: () => void
}

export function InvoiceView({ order, billing, onClose }: InvoiceViewProps) {
  const items = order.order_items ?? []
  const invoiceNo =
    order.invoice_number ?? `DRAFT-${order.id.slice(0, 8).toUpperCase()}`

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          인쇄
        </Button>
        {onClose ? (
          <Button type="button" variant="outline" onClick={onClose}>
            닫기
          </Button>
        ) : null}
      </div>

      <div
        id="store-invoice"
        className="invoice-print mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-white p-8 text-neutral-900 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <p className="text-xl font-bold">{billing.company_name}</p>
            <p className="mt-1 text-sm text-neutral-600">청구서 (학교 행정실 후불 정산)</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">번호 {invoiceNo}</p>
            <p className="text-neutral-600">{formatDateTime(order.submitted_at)}</p>
          </div>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-neutral-500">학교: </span>
            {order.school_name}
          </p>
          <p>
            <span className="text-neutral-500">담당 교사: </span>
            {order.teacher_name}
          </p>
          <p className="sm:col-span-2">
            <span className="text-neutral-500">배송지: </span>
            {order.shipping_address}
          </p>
          {order.shipping_contact ? (
            <p>
              <span className="text-neutral-500">연락처: </span>
              {order.shipping_contact}
            </p>
          ) : null}
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="py-2 font-medium">품목</th>
              <th className="py-2 font-medium">수량</th>
              <th className="py-2 text-right font-medium">단가</th>
              <th className="py-2 text-right font-medium">금액</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-100">
                <td className="py-2">
                  {item.product_name}
                  {item.print_label ? (
                    <span className="block text-xs text-neutral-500">
                      {item.print_label}
                    </span>
                  ) : null}
                </td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2 text-right">{formatWon(item.unit_price)}</td>
                <td className="py-2 text-right font-medium">
                  {formatWon(item.line_total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t border-neutral-200 pt-4">
          <p className="text-lg font-bold">합계 {formatWon(order.subtotal)}</p>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4 text-sm leading-relaxed">
          <p className="font-semibold">입금 안내</p>
          <p className="mt-1">
            {billing.bank_name} {billing.bank_account} (예금주: {billing.bank_holder})
          </p>
          <p className="mt-2 text-neutral-600">{billing.payment_due_note}</p>
        </div>
      </div>
    </div>
  )
}
