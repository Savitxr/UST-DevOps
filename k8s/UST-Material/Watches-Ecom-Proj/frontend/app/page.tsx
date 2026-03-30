import { HeroSection } from '@/components/home/hero-section'
import { FeaturedWatches } from '@/components/home/featured-watches'
import { CategoriesSection } from '@/components/home/categories-section'
import { CtaSection } from '@/components/home/cta-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedWatches />
      <CategoriesSection />
      <CtaSection />
    </>
  )
}
