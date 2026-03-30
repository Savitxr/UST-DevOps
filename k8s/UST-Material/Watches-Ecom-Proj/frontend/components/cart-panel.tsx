'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'

interface CartPanelProps {
  open: boolean
  onClose: () => void
}

export function CartPanel({ open, onClose }: CartPanelProps) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-serif text-xl font-semibold text-foreground">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <ShoppingBag className="h-12 w-12 text-border" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button variant="outline" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {items.map((item) => (
                <li key={item.watch.id} className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={item.watch.image}
                      alt={`${item.watch.brand} ${item.watch.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {item.watch.brand}
                      </p>
                      <p className="text-sm font-medium text-foreground">{item.watch.model}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.watch.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.watch.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                          ${(item.watch.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeItem(item.watch.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove ${item.watch.model}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm uppercase tracking-wider text-muted-foreground">Total</span>
              <span className="font-serif text-xl font-semibold text-foreground">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
