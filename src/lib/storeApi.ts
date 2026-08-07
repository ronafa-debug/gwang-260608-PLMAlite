import { requireSupabase } from '@/lib/supabase'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type {
  Order,
  OrderItem,
  OrderStatus,
  Product,
  StoreBillingSettings,
  SubmitOrderInput,
  TeacherProfileShipping,
} from '@/types/store'
import { DEFAULT_BILLING_SETTINGS } from '@/types/store'

/** Demo catalog when Supabase missing or demo mode */
export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-p1',
    type: 'stock',
    name: '색종이 세트 (100매)',
    description: '수업·미술 활동용 혼합 색종이',
    category: '소모품',
    unit_price: 4500,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p2',
    type: 'stock',
    name: '풀 스틱 10본',
    description: '고체 풀, 교실 공용',
    category: '소모품',
    unit_price: 3200,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p3',
    type: 'stock',
    name: '가위 (안전형 5자)',
    description: '초등 안전 가위',
    category: '소모품',
    unit_price: 2800,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p4',
    type: 'stock',
    name: '연필 B 1타',
    description: 'HB/B 혼합 연필',
    category: '소모품',
    unit_price: 3500,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p5',
    type: 'stock',
    name: '지우개 20개',
    description: '부드러운 지우개',
    category: '소모품',
    unit_price: 2500,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p6',
    type: 'stock',
    name: '색연필 12색',
    description: '기본 색연필 세트',
    category: '미술용품',
    unit_price: 4800,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p7',
    type: 'stock',
    name: '크레파스 12색',
    description: '어린이 크레파스',
    category: '미술용품',
    unit_price: 4200,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p8',
    type: 'stock',
    name: '도화지 A4 100매',
    description: '백색 도화지',
    category: '미술용품',
    unit_price: 6000,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p9',
    type: 'stock',
    name: '스티커 보상 세트',
    description: '강화용 스티커 혼합',
    category: '소모품',
    unit_price: 3900,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p10',
    type: 'custom',
    name: '학생 얼굴 머그컵',
    description: '사진 인쇄 맞춤 머그 (시안 확인 후 제작) · Phase 2에서 업로드',
    category: '맞춤 굿즈',
    unit_price: 18000,
    image_url: null,
    is_active: true,
    metadata: {},
  },
  {
    id: 'demo-p11',
    type: 'custom',
    name: '학생 티셔츠',
    description: '사진·이름 인쇄 티셔츠 · Phase 2에서 업로드',
    category: '맞춤 굿즈',
    unit_price: 22000,
    image_url: null,
    is_active: true,
    metadata: {},
  },
]

const DEMO_ORDERS_KEY = 'demo_orders'
const DEMO_SHIPPING_KEY = 'demo_shipping'

export function formatWon(amount: number) {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원'
}

const MAX_PRINT_BYTES = 4 * 1024 * 1024

function fileExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName
  }
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'))
    reader.readAsDataURL(file)
  })
}

/** Upload print photo. Demo: returns data URL path prefix demo: */
export async function uploadPrintImage(
  useDemo: boolean,
  file: File,
): Promise<{ path: string; previewUrl: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.')
  }
  if (file.size > MAX_PRINT_BYTES) {
    throw new Error('이미지는 4MB 이하만 가능합니다.')
  }

  if (useDemo) {
    const dataUrl = await readFileAsDataUrl(file)
    return { path: `demo:${crypto.randomUUID()}`, previewUrl: dataUrl }
  }

  const client = requireSupabase()
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const ext = fileExtension(file)
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`
  const { error } = await client.storage.from('store-print-assets').upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data: signed, error: signedError } = await client.storage
    .from('store-print-assets')
    .createSignedUrl(path, 60 * 60 * 24 * 7)

  if (signedError || !signed?.signedUrl) {
    throw new Error(signedError?.message ?? '미리보기 URL을 만들지 못했습니다.')
  }

  return { path, previewUrl: signed.signedUrl }
}

export async function resolvePrintImageUrl(
  useDemo: boolean,
  path: string | null | undefined,
  fallbackDataUrl?: string | null,
): Promise<string | null> {
  if (!path) return fallbackDataUrl ?? null
  if (path.startsWith('demo:')) return fallbackDataUrl ?? null
  if (useDemo) return fallbackDataUrl ?? null

  const client = requireSupabase()
  const { data, error } = await client.storage
    .from('store-print-assets')
    .createSignedUrl(path, 60 * 60)

  if (error || !data?.signedUrl) return fallbackDataUrl ?? null
  return data.signedUrl
}

export async function fetchProducts(useDemo: boolean): Promise<Product[]> {
  if (useDemo) return DEMO_PRODUCTS

  const client = requireSupabase()
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name')

  if (error) throw new Error(error.message)
  return (data ?? []) as Product[]
}

export async function fetchTeacherShipping(useDemo: boolean): Promise<TeacherProfileShipping> {
  const empty: TeacherProfileShipping = {
    school_name: '',
    shipping_address: '',
    shipping_contact: '',
    admin_office_note: '',
  }

  if (useDemo) {
    return getStorageItem(DEMO_SHIPPING_KEY, empty)
  }

  const client = requireSupabase()
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return empty

  const { data, error } = await client
    .from('profiles')
    .select('school_name, shipping_address, shipping_contact, admin_office_note')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)

  return {
    school_name: data?.school_name ?? '',
    shipping_address: data?.shipping_address ?? '',
    shipping_contact: data?.shipping_contact ?? '',
    admin_office_note: data?.admin_office_note ?? '',
  }
}

export async function saveTeacherShipping(
  useDemo: boolean,
  input: TeacherProfileShipping,
): Promise<void> {
  if (useDemo) {
    setStorageItem(DEMO_SHIPPING_KEY, input)
    return
  }

  const client = requireSupabase()
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { error } = await client
    .from('profiles')
    .update({
      school_name: input.school_name,
      shipping_address: input.shipping_address,
      shipping_contact: input.shipping_contact,
      admin_office_note: input.admin_office_note,
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}

export async function submitOrder(
  useDemo: boolean,
  input: SubmitOrderInput,
): Promise<Order> {
  if (input.items.length === 0) {
    throw new Error('장바구니가 비어 있습니다.')
  }
  if (!input.school_name.trim() || !input.shipping_address.trim()) {
    throw new Error('학교명과 배송 주소를 입력해 주세요. (설정에서 저장할 수 있습니다)')
  }

  for (const item of input.items) {
    if (item.productType === 'custom') {
      if (!item.custom?.printImagePath || !item.custom.previewConfirmedAt) {
        throw new Error(
          `「${item.productName}」맞춤 상품은 사진 업로드와 시안 확인이 필요합니다.`,
        )
      }
    }
  }

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )
  /** Always wait for admin order confirmation before production/shipment prep. */
  const initialStatus = 'submitted' as const

  if (useDemo) {
    const orderId = crypto.randomUUID()
    const now = new Date().toISOString()
    const orderItems: OrderItem[] = input.items.map((item) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      product_type: item.productType,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.unitPrice * item.quantity,
      student_id: item.custom?.studentId ?? null,
      print_image_path: item.custom?.printImagePath ?? null,
      print_label: item.custom?.printLabel ?? item.custom?.studentName ?? null,
      options: item.custom
        ? {
            studentName: item.custom.studentName ?? null,
            demoPreviewUrl: item.custom.printImagePreviewUrl,
          }
        : {},
      preview_confirmed_at: item.custom?.previewConfirmedAt ?? null,
      printImagePreviewUrl: item.custom?.printImagePreviewUrl ?? null,
    }))

    const order: Order = {
      id: orderId,
      user_id: 'demo-user-001',
      status: initialStatus,
      school_name: input.school_name.trim(),
      shipping_address: input.shipping_address.trim(),
      shipping_contact: input.shipping_contact.trim(),
      teacher_name: input.teacher_name.trim(),
      subtotal,
      note: input.note?.trim() || null,
      invoice_number: null,
      submitted_at: now,
      shipped_at: null,
      paid_at: null,
      created_at: now,
      order_items: orderItems,
    }

    const prev = getStorageItem<Order[]>(DEMO_ORDERS_KEY, [])
    setStorageItem(DEMO_ORDERS_KEY, [order, ...prev])
    return order
  }

  const client = requireSupabase()
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser()
  if (userError || !user) throw new Error('로그인이 필요합니다.')

  const { data: order, error: orderError } = await client
    .from('orders')
    .insert({
      user_id: user.id,
      status: initialStatus,
      school_name: input.school_name.trim(),
      shipping_address: input.shipping_address.trim(),
      shipping_contact: input.shipping_contact.trim(),
      teacher_name: input.teacher_name.trim(),
      subtotal,
      note: input.note?.trim() || null,
    })
    .select()
    .single()

  if (orderError) throw new Error(orderError.message)

  const rows = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId.startsWith('demo-') ? null : item.productId,
    product_name: item.productName,
    product_type: item.productType,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.unitPrice * item.quantity,
    student_id: item.custom?.studentId ?? null,
    print_image_path: item.custom?.printImagePath ?? null,
    print_label: item.custom?.printLabel ?? item.custom?.studentName ?? null,
    options: item.custom
      ? { studentName: item.custom.studentName ?? null }
      : {},
    preview_confirmed_at: item.custom?.previewConfirmedAt ?? null,
  }))

  const { data: items, error: itemsError } = await client
    .from('order_items')
    .insert(rows)
    .select()

  if (itemsError) {
    await client.from('orders').delete().eq('id', order.id)
    throw new Error(itemsError.message)
  }

  return {
    ...(order as Order),
    order_items: (items ?? []) as OrderItem[],
  }
}

export async function fetchMyOrders(useDemo: boolean): Promise<Order[]> {
  if (useDemo) {
    const orders = getStorageItem<Order[]>(DEMO_ORDERS_KEY, [])
    return orders.map((order) => ({
      ...order,
      order_items: (order.order_items ?? []).map((item) => ({
        ...item,
        printImagePreviewUrl:
          item.printImagePreviewUrl ??
          (item.options?.demoPreviewUrl as string | undefined) ??
          null,
      })),
    }))
  }

  const client = requireSupabase()
  const { data, error } = await client
    .from('orders')
    .select('*, order_items(*)')
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(error.message)

  const orders = (data ?? []) as Order[]

  await Promise.all(
    orders.map(async (order) => {
      if (!order.order_items) return
      order.order_items = await Promise.all(
        order.order_items.map(async (item) => {
          if (item.product_type !== 'custom' || !item.print_image_path) return item
          const preview = await resolvePrintImageUrl(
            false,
            item.print_image_path,
            (item.options?.demoPreviewUrl as string | undefined) ?? null,
          )
          return { ...item, printImagePreviewUrl: preview }
        }),
      )
    }),
  )

  return orders
}

export async function cancelOrder(useDemo: boolean, orderId: string): Promise<void> {
  if (useDemo) {
    const prev = getStorageItem<Order[]>(DEMO_ORDERS_KEY, [])
    const target = prev.find((order) => order.id === orderId)
    if (!target) throw new Error('주문을 찾을 수 없습니다.')
    if (target.status !== 'submitted') {
      throw new Error('관리자가 주문을 확인한 뒤에는 취소할 수 없습니다.')
    }
    setStorageItem(
      DEMO_ORDERS_KEY,
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'cancelled' as const } : order,
      ),
    )
    return
  }

  const client = requireSupabase()
  const { data: existing, error: fetchError } = await client
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single()

  if (fetchError) throw new Error(fetchError.message)
  if (existing.status !== 'submitted') {
    throw new Error('관리자가 주문을 확인한 뒤에는 취소할 수 없습니다.')
  }

  const { error } = await client
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) throw new Error(error.message)
}

function makeInvoiceNumber() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const suffix = Math.floor(Math.random() * 9000 + 1000)
  return `INV-${ymd}-${suffix}`
}

async function enrichOrderItems(useDemo: boolean, orders: Order[]): Promise<Order[]> {
  if (useDemo) {
    return orders.map((order) => ({
      ...order,
      order_items: (order.order_items ?? []).map((item) => ({
        ...item,
        printImagePreviewUrl:
          item.printImagePreviewUrl ??
          (item.options?.demoPreviewUrl as string | undefined) ??
          null,
      })),
    }))
  }

  await Promise.all(
    orders.map(async (order) => {
      if (!order.order_items) return
      order.order_items = await Promise.all(
        order.order_items.map(async (item) => {
          if (item.product_type !== 'custom' || !item.print_image_path) return item
          const preview = await resolvePrintImageUrl(
            false,
            item.print_image_path,
            (item.options?.demoPreviewUrl as string | undefined) ?? null,
          )
          return { ...item, printImagePreviewUrl: preview }
        }),
      )
    }),
  )
  return orders
}

export async function fetchBillingSettings(useDemo: boolean): Promise<StoreBillingSettings> {
  if (useDemo) return { ...DEFAULT_BILLING_SETTINGS }

  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('store_billing_settings')
      .select('company_name, bank_name, bank_account, bank_holder, payment_due_note')
      .eq('id', 1)
      .maybeSingle()

    if (error || !data) return { ...DEFAULT_BILLING_SETTINGS }
    return {
      company_name: data.company_name,
      bank_name: data.bank_name,
      bank_account: data.bank_account,
      bank_holder: data.bank_holder,
      payment_due_note: data.payment_due_note,
    }
  } catch {
    return { ...DEFAULT_BILLING_SETTINGS }
  }
}

export async function fetchAllOrders(useDemo: boolean): Promise<Order[]> {
  if (useDemo) {
    const orders = getStorageItem<Order[]>(DEMO_ORDERS_KEY, [])
    return enrichOrderItems(true, orders)
  }

  const client = requireSupabase()
  const { data, error } = await client
    .from('orders')
    .select('*, order_items(*)')
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(error.message)
  return enrichOrderItems(false, (data ?? []) as Order[])
}

export async function adminUpdateOrderStatus(
  useDemo: boolean,
  orderId: string,
  nextStatus: OrderStatus,
): Promise<Order> {
  if (useDemo) {
    const prev = getStorageItem<Order[]>(DEMO_ORDERS_KEY, [])
    const now = new Date().toISOString()
    let updated: Order | null = null

    const nextList = prev.map((order) => {
      if (order.id !== orderId) return order
      const patch: Order = {
        ...order,
        status: nextStatus,
      }
      if (nextStatus === 'shipped' && !patch.shipped_at) patch.shipped_at = now
      if (nextStatus === 'invoiced') {
        if (!patch.invoice_number) patch.invoice_number = makeInvoiceNumber()
        if (!patch.shipped_at) patch.shipped_at = now
      }
      if (nextStatus === 'paid' && !patch.paid_at) patch.paid_at = now
      updated = patch
      return patch
    })

    if (!updated) throw new Error('주문을 찾을 수 없습니다.')
    setStorageItem(DEMO_ORDERS_KEY, nextList)
    return updated
  }

  const client = requireSupabase()
  const { data: existing, error: fetchError } = await client
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const now = new Date().toISOString()
  const payload: Record<string, unknown> = {
    status: nextStatus,
    updated_at: now,
  }
  if (nextStatus === 'shipped') {
    payload.shipped_at = existing.shipped_at ?? now
  }
  if (nextStatus === 'invoiced') {
    payload.invoice_number = existing.invoice_number ?? makeInvoiceNumber()
    if (!existing.shipped_at) payload.shipped_at = now
  }
  if (nextStatus === 'paid') {
    payload.paid_at = existing.paid_at ?? now
  }

  const { data: updated, error } = await client
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .select('*, order_items(*)')
    .single()

  if (error) throw new Error(error.message)

  const [enriched] = await enrichOrderItems(false, [updated as Order])
  return enriched
}

