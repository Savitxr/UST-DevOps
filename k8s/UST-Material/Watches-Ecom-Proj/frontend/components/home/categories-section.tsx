import Link from 'next/link'
import { Watch, Dumbbell, Smartphone, Clock } from 'lucide-react'
import { categories } from '@/lib/mock-data'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  luxury: Watch,
  sport: Dumbbell,
  smart: Smartphone,
  vintage: Clock,
}

export function CategoriesSection() {
  return (
    <section className="bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Browse By</p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Categories
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.slug]
            return (
              <Link
                key={cat.slug}
                href={`/shop?type=${cat.slug}`}
                className="group flex flex-col items-center gap-4 rounded-sm border border-border bg-card p-8 text-center transition-all duration-300 hover:border-accent hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-accent/10">
                  <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">{cat.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
