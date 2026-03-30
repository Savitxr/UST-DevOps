import { Star } from 'lucide-react'
import type { Review } from '@/lib/mock-data'

interface ReviewSectionProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export function ReviewSection({ reviews, averageRating, totalReviews }: ReviewSectionProps) {
  return (
    <section className="mt-16 border-t border-border pt-16">
      <div className="flex flex-col gap-8 md:flex-row md:gap-16">
        {/* Rating Summary */}
        <div className="flex-shrink-0 md:w-64">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">
            Customer Reviews
          </h2>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-serif text-5xl font-bold text-foreground">{averageRating}</span>
            <div className="pb-1">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(averageRating)
                        ? 'fill-accent text-accent'
                        : 'fill-border text-border'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on {totalReviews} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1">
          <ul className="flex flex-col gap-8">
            {reviews.map((review) => (
              <li key={review.id} className="border-b border-border pb-8 last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{review.userName}</p>
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? 'fill-accent text-accent'
                              : 'fill-border text-border'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
