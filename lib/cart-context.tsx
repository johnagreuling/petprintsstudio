'use client'
/* ═══════════════════════════════════════════════════════════════
   Global Cart Context — the single source of truth for cart items
   across all pages. localStorage-backed so items survive refreshes
   and cross-page navigation.
   ═══════════════════════════════════════════════════════════════ */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { CartItem } from './config'

interface CartContextValue {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (lineId: string) => void
  updateQty: (lineId: string, qty: number) => void
  clearCart: () => void
  subtotal: number
  itemCount: number
  hydrated: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'pps_cart_v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage once on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch (e) {
      // ignore parse errors
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      // ignore quota errors
    }
  }, [items, hydrated])

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

  const subtotal = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, subtotal, itemCount, hydrated }}>
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
    }
  }
  return ctx
}
