import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex flex-col items-center rounded-sm bg-foreground px-8 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Start Selling</p>
        <h2 className="mt-4 max-w-xl font-serif text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
          <span className="text-balance">Your Timepiece Deserves the Right Audience</span>
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/60">
          List your luxury watch on Meridian and connect with verified collectors and enthusiasts worldwide.
        </p>
        <Link href="/sell" className="mt-8">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-gold-light">
            Sell Your Watch
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
