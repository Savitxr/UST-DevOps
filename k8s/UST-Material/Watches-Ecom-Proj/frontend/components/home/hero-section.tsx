import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-foreground">
      <Image
        src="/images/hero-watch.jpg"
        alt="Luxury watch showcase"
        fill
        className="object-cover opacity-50"
        priority
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
            The Art of Time
          </p>
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-primary-foreground md:text-7xl">
            <span className="text-balance">Timeless Luxury on Your Wrist</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-primary-foreground/70 md:text-lg">
            Discover the world&apos;s finest timepieces. Buy, sell, and collect extraordinary watches from the most prestigious maisons.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-gold-light"
              >
                Explore Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Sell Your Watch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
