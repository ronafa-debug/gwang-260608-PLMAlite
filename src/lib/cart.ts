import type { CartItem } from '@/types/store'
import { getStorageItem, setStorageItem } from '@/lib/storage'

const CART_KEY = 'store_cart'

function normalizeCartItem(raw: Partial<CartItem> & { productId?: string }): CartItem | null {
  if (!raw.productId || !raw.productName || raw.unitPrice == null) return null
  return {
    lineId: raw.lineId ?? crypto.randomUUID(),
    productId: raw.productId,
    productName: raw.productName,
    productType: raw.productType ?? 'stock',
    unitPrice: raw.unitPrice,
    quantity: raw.quantity ?? 1,
    custom: raw.custom,
  }
}

export function loadCart(): CartItem[] {
  const stored = getStorageItem<unknown[]>(CART_KEY, [])
  if (!Array.isArray(stored)) return []
  return stored
    .map((item) => normalizeCartItem(item as Partial<CartItem>))
    .filter((item): item is CartItem => item != null)
}

export function saveCart(items: CartItem[]) {
  setStorageItem(CART_KEY, items)
}

export function clearCart() {
  setStorageItem(CART_KEY, [])
}

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}
