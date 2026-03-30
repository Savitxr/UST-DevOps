import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { watches } from '@/lib/mock-data'
import { WatchCard } from '@/components/watch-card'

export function FeaturedWatches() {
  const featured = watches.filter((w) => w.featured).slice(0, 4)

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Curated Selection</p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Featured Timepieces
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden items-center gap-1 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent md:flex"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((watch) => (
          <WatchCard key={watch.id} watch={watch} />
        ))}
      </div>

      <div className="mt-8 flex justify-center md:hidden">
        <Link
          href="/shop"
          className="flex items-center gap-1 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
