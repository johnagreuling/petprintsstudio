'use client'
/* ═══════════════════════════════════════════════════════════════
   Global Cart Context — the single source of truth for cart items
   across all pages. localStorage-backed so items survive refreshes
   and cross-page navigation.
   ═══════════════════════════════════════════════════════════════ */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { CartItem } from './config'

export interface OrderMeta {
  songGenre?: string
  petName?: string
  petType?: string
  sessionFolder?: string
  songAnswers?: Record<string, string>
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (lineId: string) => void
  updateQty: (lineId: string, qty: number) => void
  clearCart: () => void
  subtotal: number
  itemCount: number
  hydrated: boolean
  orderMeta: OrderMeta
  setOrderMeta: (patch: Partial<OrderMeta>) => void
  clearOrderMeta: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'pps_cart_v1'
const META_STORAGE_KEY = 'pps_order_meta_v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [orderMeta, setOrderMetaState] = useState<OrderMeta>({})
  const [hydrated, setHydrated] = useState(false)

  // Load cart + orderMeta from localStorage once on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
      const metaRaw = localStorage.getItem(META_STORAGE_KEY)
      if (metaRaw) {
        const metaParsed = JSON.parse(metaRaw)
        if (metaParsed && typeof metaParsed === 'object') setOrderMetaState(metaParsed)
      }
    } catch (e) {
      // ignore parse errors
    }
    setHydrated(true)
  }, [])

  // Persist cart to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      // ignore quota errors
    }
  }, [items, hydrated])

  // Persist orderMeta to localStorage whenever it changes (after hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(META_STORAGE_KEY, JSON.stringify(orderMeta))
    } catch (e) {
      // ignore quota errors
    }
  }, [orderMeta, hydrated])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => [...prev, item])
  }, [])

  const removeItem = useCallback((lineId: string) => {
    setItems(prev => prev.filter(i => i.lineId !== lineId))
  }, [])

  const updateQty = useCallback((lineId: string, qty: number) => {
    if (qty < 1) {
      setItems(prev => prev.filter(i => i.lineId !== lineId))
      return
    }
    setItems(prev => prev.map(i => i.lineId === lineId ? { ...i, quantity: qty } : i))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const setOrderMeta = useCallback((patch: Partial<OrderMeta>) => {
    setOrderMetaState(prev => ({ ...prev, ...patch }))
  }, [])

  const clearOrderMeta = useCallback(() => {
    setOrderMetaState({})
  }, [])

  const subtotal = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, subtotal, itemCount, hydrated, orderMeta, setOrderMeta, clearOrderMeta }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    // Return a safe no-op context if used outside provider (e.g., server-side).
    // This prevents crashes during SSR before hydration.
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQty: () => {},
      clearCart: () => {},
      subtotal: 0,
      itemCount: 0,
      hydrated: false,
      orderMeta: {},
      setOrderMeta: () => {},
      clearOrderMeta: () => {},
    }
  }
  return ctx
}
