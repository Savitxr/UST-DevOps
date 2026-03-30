'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { watches, brands, categories } from '@/lib/mock-data'
import { WatchCard } from '@/components/watch-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ShopContent() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type') || ''
  const initialBrand = searchParams.get('brand') || ''

  const [selectedBrand, setSelectedBrand] = useState(initialBrand)
  const [selectedType, setSelectedType] = useState(initialType)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000])
  const [sortBy, setSortBy] = useState('featured')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = watches

    if (selectedBrand) {
      result = result.filter((w) => w.brand === selectedBrand)
    }
    if (selectedType) {
      result = result.filter((w) => w.category === selectedType)
    }
    result = result.filter((w) => w.price >= priceRange[0] && w.price <= priceRange[1])

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      default:
        result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return result
  }, [selectedBrand, selectedType, priceRange, sortBy])

  const activeFilters = [
    selectedBrand && { label: selectedBrand, clear: () => setSelectedBrand('') },
    selectedType && {
      label: categories.find((c) => c.slug === selectedType)?.name || selectedType,
      clear: () => setSelectedType(''),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  const clearAll = () => {
    setSelectedBrand('')
    setSelectedType('')
    setPriceRange([0, 200000])
    setSortBy('featured')
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Mobile filter toggle */}
      <button
        onClick={() => setFiltersOpen(!filtersOpen)}
        className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {/* Sidebar Filters */}
      <aside
        className={cn(
          'w-full flex-shrink-0 lg:w-64',
          filtersOpen ? 'block' : 'hidden lg:block'
        )}
      >
        <div className="flex flex-col gap-8">
          {/* Brand Filter */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Brand
            </h3>
            <ul className="flex flex-col gap-2">
              {brands.map((brand) => (
                <li key={brand}>
                  <button
                    onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                    className={cn(
                      'w-full text-left text-sm transition-colors',
                      selectedBrand === brand
                        ? 'font-medium text-accent'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {brand}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Category
            </h3>
            <ul className="flex flex-col gap-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => setSelectedType(selectedType === cat.slug ? '' : cat.slug)}
                    className={cn(
                      'w-full text-left text-sm transition-colors',
                      selectedType === cat.slug
                        ? 'font-medium text-accent'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Price Range
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Under $5,000', range: [0, 5000] as [number, number] },
                { label: '$5,000 - $15,000', range: [5000, 15000] as [number, number] },
                { label: '$15,000 - $50,000', range: [15000, 50000] as [number, number] },
                { label: 'Over $50,000', range: [50000, 200000] as [number, number] },
                { label: 'All Prices', range: [0, 200000] as [number, number] },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => setPriceRange(option.range)}
                  className={cn(
                    'w-full text-left text-sm transition-colors',
                    priceRange[0] === option.range[0] && priceRange[1] === option.range[1]
                      ? 'font-medium text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Sort By
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Featured', value: 'featured' },
                { label: 'Price: Low to High', value: 'price-asc' },
                { label: 'Price: High to Low', value: 'price-desc' },
                { label: 'Top Rated', value: 'rating' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    'w-full text-left text-sm transition-colors',
                    sortBy === option.value
                      ? 'font-medium text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter.label}
                className="inline-flex items-center gap-1 border border-border bg-secondary px-3 py-1 text-xs uppercase tracking-wider text-foreground"
              >
                {filter.label}
                <button onClick={filter.clear} aria-label={`Remove ${filter.label} filter`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Clear All
            </button>
          </div>
        )}

        <p className="mb-6 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'timepiece' : 'timepieces'}
        </p>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No watches match your filters.</p>
            <Button variant="outline" className="mt-4" onClick={clearAll}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((watch) => (
              <WatchCard key={watch.id} watch={watch} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
