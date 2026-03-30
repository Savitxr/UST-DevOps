'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getOrders } from '@/lib/api'

const statusConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  created: { label: 'Processing', icon: Clock, color: 'text-muted-foreground' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-accent' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600' },
  cancelled: { label: 'Cancelled', icon: Package, color: 'text-destructive' },
}

interface OrderRecord {
  id: string
  user_id: string
  total_cents: number
  status: string
  created_at?: string
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    setIsFetching(true)
    getOrders(user.id)
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data)
        } else {
          setOrders([])
        }
      })
      .finally(() => setIsFetching(false))
  }, [user])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-muted-foreground">You must sign in to view orders.</p>
        <Link href="/login" className="mt-4 inline-block text-sm uppercase tracking-widest text-accent">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Account</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Your Orders
        </h1>
      </div>

      {isFetching ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Fetching orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-border" />
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const status = statusConfig[order.status] ?? statusConfig.created
            const StatusIcon = status.icon
            const orderDate = order.created_at
              ? new Date(order.created_at).toLocaleDateString()
              : 'Unknown'
            const total = order.total_cents ? order.total_cents / 100 : 0
            return (
              <div key={order.id} className="border border-border bg-card p-6">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Order</p>
                      <p className="text-sm font-medium text-foreground">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Date</p>
                      <p className="text-sm text-foreground">{orderDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn('h-4 w-4', status.color)} />
                    <span className={cn('text-sm font-medium', status.color)}>{status.label}</span>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Item-level details are not included in the current orders response.
                </div>

                {/* Order Total */}
                <div className="mt-4 flex justify-end border-t border-border pt-4">
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</p>
                    <p className="font-serif text-lg font-semibold text-foreground">
                      ${total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
