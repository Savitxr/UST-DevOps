'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Watch, CartItem } from '@/lib/mock-data'

interface CartContextType {
  items: CartItem[]
  addItem: (watch: Watch) => void
  removeItem: (watchId: string) => void
  updateQuantity: (watchId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addItem = useCallback((watch: Watch) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.watch.id === watch.id)
      if (existing) {
        return prev.map((item) =>
          item.watch.id === watch.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { watch, quantity: 1 }]
    })
    setIsCartOpen(true)
  }, [])

  const removeItem = useCallback((watchId: string) => {
    setItems((prev) => prev.filter((item) => item.watch.id !== watchId))
  }, [])

  const updateQuantity = useCallback((watchId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.watch.id !== watchId))
    } else {
      setItems((prev) =>
        prev.map((item) => (item.watch.id === watchId ? { ...item, quantity } : item))
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.watch.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
