import { notFound } from 'next/navigation'
import { watches } from '@/lib/mock-data'
import { ProductDetail } from '@/components/shop/product-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const watch = watches.find((w) => w.id === id)

  if (!watch) {
    notFound()
  }

  return <ProductDetail watch={watch} />
}

export async function generateStaticParams() {
  return watches.map((w) => ({ id: w.id }))
}
