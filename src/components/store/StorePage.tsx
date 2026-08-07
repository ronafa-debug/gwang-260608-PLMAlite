import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/hooks/useCart'
import { useStudents } from '@/hooks/useStudents'
import { DemoNotice } from '@/components/shared/DemoNotice'
import { CartPanel } from '@/components/store/CartPanel'
import { CustomProductDialog } from '@/components/store/CustomProductDialog'
import { StoreCatalog } from '@/components/store/StoreCatalog'
import {
  fetchProducts,
  fetchTeacherShipping,
  submitOrder,
} from '@/lib/storeApi'
import type { CartCustomOptions, Product } from '@/types/store'
import type { AppPage } from '@/types/navigation'

type CategoryFilter = 'all' | '소모품' | '미술용품' | '맞춤 굿즈'

interface StorePageProps {
  onNavigate: (page: AppPage) => void
}

export function StorePage({ onNavigate }: StorePageProps) {
  const { user, isDemo } = useAuth()
  const { students } = useStudents()
  const {
    items,
    count,
    subtotal,
    addStockProduct,
    addCustomProduct,
    setQuantity,
    removeItem,
    empty,
  } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [customProduct, setCustomProduct] = useState<Product | null>(null)

  const [schoolName, setSchoolName] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingContact, setShippingContact] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productList, shipping] = await Promise.all([
        fetchProducts(isDemo),
        fetchTeacherShipping(isDemo),
      ])
      setProducts(productList)
      setSchoolName(shipping.school_name)
      setShippingAddress(shipping.shipping_address)
      setShippingContact(shipping.shipping_contact)
    } catch (err) {
      setError(err instanceof Error ? err.message : '스토어를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => {
    void load()
  }, [load])

  const handleAdd = (product: Product) => {
    if (product.type === 'custom') {
      setCustomProduct(product)
      return
    }
    addStockProduct(product, 1)
    setToast(`${product.name}을(를) 장바구니에 담았습니다.`)
    window.setTimeout(() => setToast(null), 2000)
  }

  const handleCustomConfirm = (
    product: Product,
    quantity: number,
    custom: CartCustomOptions,
  ) => {
    addCustomProduct(product, quantity, custom)
    setToast(`${product.name}을(를) 장바구니에 담았습니다.`)
    window.setTimeout(() => setToast(null), 2000)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
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
      setCartOpen(false)
      setToast('주문이 접수되었습니다. 내 주문에서 확인할 수 있습니다.')
      window.setTimeout(() => {
        setToast(null)
        onNavigate('orders')
      }, 800)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '주문에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-2xl bg-foreground px-4 py-2 text-sm text-background shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="space-y-4">
        {isDemo ? (
          <DemoNotice>
            <p className="font-medium">데모 스토어</p>
            <p className="mt-1 opacity-90">
              주문·장바구니는 이 브라우저 localStorage에만 저장됩니다. 카드 결제 없이
              「배송 시작」으로 접수하고, 사이드바 <strong className="font-semibold">주문 관리</strong>
              에서 출고·청구·입금 확인 흐름을 체험할 수 있습니다.
            </p>
          </DemoNotice>
        ) : null}

        <StoreCatalog
          products={products}
          loading={loading}
          error={error}
          filter={filter}
          onFilterChange={setFilter}
          cartCount={count}
          onOpenCart={() => setCartOpen(true)}
          onAddToCart={handleAdd}
        />
      </div>

      <CustomProductDialog
        product={customProduct}
        students={students}
        open={Boolean(customProduct)}
        onOpenChange={(open) => {
          if (!open) setCustomProduct(null)
        }}
        onConfirm={handleCustomConfirm}
      />

      <CartPanel
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        subtotal={subtotal}
        schoolName={schoolName}
        shippingAddress={shippingAddress}
        shippingContact={shippingContact}
        note={note}
        submitting={submitting}
        error={submitError}
        isDemo={isDemo}
        onSchoolNameChange={setSchoolName}
        onShippingAddressChange={setShippingAddress}
        onShippingContactChange={setShippingContact}
        onNoteChange={setNote}
        onSetQuantity={setQuantity}
        onRemove={removeItem}
        onSubmit={() => void handleSubmit()}
      />
    </>
  )
}
