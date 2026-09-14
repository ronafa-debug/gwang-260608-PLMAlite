export type ProductType = 'stock' | 'custom'

export type OrderStatus =
  | 'submitted'
  | 'in_production'
  | 'shipped'
  | 'invoiced'
  | 'paid'
  | 'cancelled'

export interface Product {
  id: string
  type: ProductType
  name: string
  description: string
  category: string
  unit_price: number
  image_url: string | null
  is_active: boolean
  metadata: Record<string, unknown>
  created_at?: string
}

/** Custom options attached when productType is custom */
export interface CartCustomOptions {
  studentId?: string | null
  studentName?: string | null
  printImagePath: string
  /** data URL (demo) or signed/public preview URL for cart UI */
  printImagePreviewUrl: string
  printLabel?: string | null
  previewConfirmedAt: string
}

export interface CartItem {
  lineId: string
  productId: string
  productName: string
  productType: ProductType
  unitPrice: number
  quantity: number
  custom?: CartCustomOptions
}

export interface TeacherProfileShipping {
  school_name: string
  shipping_address: string
  shipping_contact: string
  admin_office_note: string
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  school_name: string
  shipping_address: string
  shipping_contact: string
  teacher_name: string
  subtotal: number
  note: string | null
  invoice_number: string | null
  submitted_at: string
  shipped_at: string | null
  paid_at: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_type: ProductType
  quantity: number
  unit_price: number
  line_total: number
  student_id?: string | null
  print_image_path?: string | null
  print_label?: string | null
  options?: Record<string, unknown>
  preview_confirmed_at?: string | null
  /** UI-only: resolved preview URL after fetch */
  printImagePreviewUrl?: string | null
}

export interface SubmitOrderInput {
  school_name: string
  shipping_address: string
  shipping_contact: string
  teacher_name: string
  note?: string
  items: CartItem[]
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  submitted: '확인 대기',
  in_production: '제작·출고준비',
  shipped: '출고됨',
  invoiced: '청구서 발송',
  paid: '입금확인',
  cancelled: '취소됨',
}

/** Teacher-facing timeline / status copy (admin keeps ORDER_STATUS_LABEL). */
export const CUSTOMER_STATUS_LABEL: Record<OrderStatus, string> = {
  submitted: '주문완료',
  in_production: '출고준비중',
  shipped: '배송중',
  invoiced: '배송완료',
  paid: '입금확인',
  cancelled: '취소됨',
}

/** Customer-facing label. */
export function getCustomerStatusLabel(
  status: OrderStatus,
  _items?: Array<{ product_type: ProductType }> | null,
): string {
  return CUSTOMER_STATUS_LABEL[status]
}

export function orderHasCustomItems(order: Order): boolean {
  return order.order_items?.some((item) => item.product_type === 'custom') ?? false
}

/** Allowed admin transitions (excluding cancelled which is separate) */
export const ADMIN_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  submitted: ['in_production', 'cancelled'],
  in_production: ['shipped', 'cancelled'],
  shipped: ['invoiced'],
  invoiced: ['paid'],
  paid: [],
  cancelled: [],
}

export interface StoreBillingSettings {
  company_name: string
  bank_name: string
  bank_account: string
  bank_holder: string
  payment_due_note: string
}

export const DEFAULT_BILLING_SETTINGS: StoreBillingSettings = {
  company_name: 'PLMA Lite',
  bank_name: '국민은행',
  bank_account: '000000-00-000000',
  bank_holder: 'PLMA',
  payment_due_note: '행정실 후불 정산 · 청구서 수령 후 계좌이체 부탁드립니다.',
}
