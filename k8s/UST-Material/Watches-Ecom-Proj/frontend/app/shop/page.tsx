import { Suspense } from 'react'
import { ShopContent } from '@/components/shop/shop-content'

export default function ShopPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Collection</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Our Timepieces
        </h1>
      </div>
      <Suspense fallback={null}>
        <ShopContent />
      </Suspense>
    </section>
  )
}
