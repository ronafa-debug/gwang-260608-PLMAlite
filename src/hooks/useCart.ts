import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  cartItemCount,
  cartSubtotal,
  clearCart,
  loadCart,
  saveCart,
} from '@/lib/cart'
import type { CartCustomOptions, CartItem, Product } from '@/types/store'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addStockProduct = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.productType === 'stock',
      )
      if (existing) {
        return prev.map((item) =>
          item.lineId === existing.lineId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [
        ...prev,
        {
          lineId: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          productType: 'stock',
          unitPrice: product.unit_price,
          quantity,
        },
      ]
    })
  }, [])

  const addCustomProduct = useCallback(
    (product: Product, quantity: number, custom: CartCustomOptions) => {
      setItems((prev) => [
        ...prev,
        {
          lineId: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          productType: 'custom',
          unitPrice: product.unit_price,
          quantity,
          custom,
        },
      ])
    },
    [],
  )

  /** @deprecated use addStockProduct / addCustomProduct */
  const addProduct = useCallback(
    (product: Product, quantity = 1) => {
      if (product.type === 'custom') {
        throw new Error('맞춤 상품은 시안 확인 후 담아 주세요.')
      }
      addStockProduct(product, quantity)
    },
    [addStockProduct],
  )

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.lineId !== lineId)
      }
      return prev.map((item) =>
        item.lineId === lineId ? { ...item, quantity } : item,
      )
    })
  }, [])

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId))
  }, [])

  const empty = useCallback(() => {
    clearCart()
    setItems([])
  }, [])

  const count = useMemo(() => cartItemCount(items), [items])
  const subtotal = useMemo(() => cartSubtotal(items), [items])

  return {
    items,
    count,
    subtotal,
    addProduct,
    addStockProduct,
    addCustomProduct,
    setQuantity,
    removeItem,
    empty,
  }
}
