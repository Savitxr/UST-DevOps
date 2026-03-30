'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import type { Watch } from '@/lib/mock-data'

interface WatchCardProps {
  watch: Watch
}

export function WatchCard({ watch }: WatchCardProps) {
  return (
    <Link href={`/shop/${watch.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={watch.image}
          alt={`${watch.brand} ${watch.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {watch.originalPrice && (
          <span className="absolute left-3 top-3 bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
            Sale
          </span>
        )}
      </div>
      <div className="pt-4">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {watch.brand}
        </p>
        <h3 className="mt-1 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
          {watch.model}
        </h3>
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="text-xs text-muted-foreground">
            {watch.rating} ({watch.reviewCount})
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            ${watch.price.toLocaleString()}
          </span>
          {watch.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ${watch.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
