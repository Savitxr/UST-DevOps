'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Star, Shield, Truck, RotateCcw } from 'lucide-react'
import type { Watch } from '@/lib/mock-data'
import { mockReviews } from '@/lib/mock-data'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { ReviewSection } from '@/components/shop/review-section'

interface ProductDetailProps {
  watch: Watch
}

export function ProductDetail({ watch }: ProductDetailProps) {
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const images = watch.images || [watch.image]

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Back Link */}
      <Link
        href="/shop"
        className="mb-8 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <Image
              src={images[selectedImage]}
              alt={`${watch.brand} ${watch.model}`}
              fill
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-accent' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${watch.brand} ${watch.model} view ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">{watch.brand}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {watch.model}
          </h1>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(watch.rating)
                      ? 'fill-accent text-accent'
                      : 'fill-border text-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {watch.rating} ({watch.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-center gap-3">
            <span className="font-serif text-3xl font-bold text-foreground">
              ${watch.price.toLocaleString()}
            </span>
            {watch.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                ${watch.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Condition */}
          {watch.condition && (
            <p className="mt-4 text-sm text-muted-foreground">
              Condition: <span className="font-medium text-foreground">{watch.condition}</span>
            </p>
          )}

          {/* Description */}
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{watch.description}</p>

          {/* CTA */}
          <Button
            onClick={() => addItem(watch)}
            size="lg"
            className="mt-8 w-full bg-foreground text-background hover:bg-foreground/90 md:w-auto md:min-w-[240px]"
          >
            Add to Cart
          </Button>

          {/* Trust Signals */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Authenticated</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Truck className="h-5 w-5 text-accent" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Insured Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <RotateCcw className="h-5 w-5 text-accent" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">14-Day Returns</span>
            </div>
          </div>

          {/* Specifications */}
          {watch.specs && (
            <div className="mt-8 border-t border-border pt-8">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
                Specifications
              </h3>
              <dl className="flex flex-col gap-3">
                {Object.entries(watch.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-border pb-3 last:border-0">
                    <dt className="text-sm text-muted-foreground">{key}</dt>
                    <dd className="text-sm font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection reviews={mockReviews} averageRating={watch.rating} totalReviews={watch.reviewCount} />
    </div>
  )
}
