'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Tag, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getMyListings } from '@/lib/api'

interface Listing {
  id: string
  name: string
  brand: string
  category: string
  condition: string | null
  description: string | null
  price_cents: number
  created_at: string
}

export default function MyListingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getMyListings(user.id)
      .then((data) => {
        if (Array.isArray(data)) {
          setListings(data)
        } else {
          setError(data?.error || 'Failed to load listings')
        }
      })
      .catch(() => setError('Failed to load listings'))
      .finally(() => setIsLoading(false))
  }, [user, authLoading])

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-muted-foreground">Loading your listings...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-muted-foreground">You must be signed in to view your listings.</p>
        <Link href="/login">
          <Button className="mt-4 bg-foreground text-background hover:bg-foreground/90">
            Sign In
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Seller Portal</p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            My Listings
          </h1>
        </div>
        <Link href="/sell">
          <Button className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {error && (
        <p className="mb-6 text-sm text-destructive">{error}</p>
      )}

      {listings.length === 0 ? (
        <div className="flex flex-col items-center border border-dashed border-border py-24 text-center">
          <Tag className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">No listings yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            List your first watch and reach thousands of collectors.
          </p>
          <Link href="/sell" className="mt-6">
            <Button className="bg-foreground text-background hover:bg-foreground/90">
              Sell a Watch
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-start gap-6 border border-border bg-card p-6"
            >
              {/* Icon placeholder */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-secondary">
                <Tag className="h-6 w-6 text-muted-foreground" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg font-semibold text-foreground truncate">
                  {listing.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
                  {listing.brand} &middot; {listing.category}
                  {listing.condition ? ` · ${listing.condition}` : ''}
                </p>
                {listing.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {listing.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(listing.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                <p className="font-serif text-xl font-bold text-foreground">
                  ${(listing.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
                <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
