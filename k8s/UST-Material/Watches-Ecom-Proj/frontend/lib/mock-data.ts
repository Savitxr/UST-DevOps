export interface Watch {
  id: string
  brand: string
  model: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  images?: string[]
  category: 'luxury' | 'sport' | 'smart' | 'vintage'
  condition?: 'New' | 'Like New' | 'Excellent' | 'Good' | 'Fair'
  description?: string
  specs?: Record<string, string>
  featured?: boolean
}

export interface CartItem {
  watch: Watch
  quantity: number
}

export interface Order {
  id: string
  date: string
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  items: CartItem[]
  total: number
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export const watches: Watch[] = [
  {
    id: '1',
    brand: 'Patek Philippe',
    model: 'Nautilus 5711/1A',
    price: 142500,
    originalPrice: 155000,
    rating: 4.9,
    reviewCount: 124,
    image: '/images/watch-1.jpg',
    images: ['/images/watch-1.jpg', '/images/watch-2.jpg', '/images/watch-3.jpg'],
    category: 'luxury',
    condition: 'Like New',
    featured: true,
    description: 'The Patek Philippe Nautilus is one of the most coveted luxury sport watches in the world. Designed by Gerald Genta in 1976, its distinctive porthole-shaped case and horizontally embossed dial have made it an icon of modern horology.',
    specs: {
      'Case Material': 'Stainless Steel',
      'Case Diameter': '40mm',
      'Movement': 'Automatic Caliber 26-330 SC',
      'Water Resistance': '120m',
      'Crystal': 'Sapphire',
      'Power Reserve': '45 hours',
    },
  },
  {
    id: '2',
    brand: 'Rolex',
    model: 'Submariner Date 126610LN',
    price: 14850,
    rating: 4.8,
    reviewCount: 312,
    image: '/images/watch-3.jpg',
    images: ['/images/watch-3.jpg', '/images/watch-1.jpg'],
    category: 'sport',
    condition: 'New',
    featured: true,
    description: 'The Rolex Submariner is the reference among divers watches. Launched in 1953, it was the first wristwatch waterproof to a depth of 100 metres.',
    specs: {
      'Case Material': 'Oystersteel',
      'Case Diameter': '41mm',
      'Movement': 'Perpetual, mechanical, self-winding',
      'Water Resistance': '300m',
      'Crystal': 'Sapphire with Cyclops lens',
      'Power Reserve': '70 hours',
    },
  },
  {
    id: '3',
    brand: 'Audemars Piguet',
    model: 'Royal Oak 15500ST',
    price: 52000,
    originalPrice: 58000,
    rating: 4.9,
    reviewCount: 89,
    image: '/images/watch-2.jpg',
    images: ['/images/watch-2.jpg', '/images/watch-4.jpg'],
    category: 'luxury',
    condition: 'Excellent',
    featured: true,
    description: 'The Audemars Piguet Royal Oak, another masterpiece by Gerald Genta, features the iconic octagonal bezel with exposed screws and the tapisserie dial pattern.',
    specs: {
      'Case Material': 'Stainless Steel',
      'Case Diameter': '41mm',
      'Movement': 'Calibre 4302',
      'Water Resistance': '50m',
      'Crystal': 'Sapphire',
      'Power Reserve': '70 hours',
    },
  },
  {
    id: '4',
    brand: 'Omega',
    model: 'Speedmaster Moonwatch',
    price: 7350,
    rating: 4.7,
    reviewCount: 456,
    image: '/images/watch-4.jpg',
    images: ['/images/watch-4.jpg', '/images/watch-1.jpg'],
    category: 'vintage',
    condition: 'Good',
    featured: true,
    description: 'The Omega Speedmaster Professional, known as the Moonwatch, was the first watch worn on the Moon. This iconic chronograph has been a staple of space exploration since 1957.',
    specs: {
      'Case Material': 'Stainless Steel',
      'Case Diameter': '42mm',
      'Movement': 'Manual-winding Calibre 1861',
      'Water Resistance': '50m',
      'Crystal': 'Hesalite',
      'Power Reserve': '48 hours',
    },
  },
  {
    id: '5',
    brand: 'TAG Heuer',
    model: 'Connected Calibre E4',
    price: 2150,
    rating: 4.3,
    reviewCount: 178,
    image: '/images/watch-5.jpg',
    images: ['/images/watch-5.jpg', '/images/watch-6.jpg'],
    category: 'smart',
    condition: 'New',
    description: 'The TAG Heuer Connected combines Swiss watchmaking tradition with cutting-edge digital technology. Its luxury design and advanced features make it the ultimate smart luxury timepiece.',
    specs: {
      'Case Material': 'Titanium',
      'Case Diameter': '45mm',
      'Display': 'OLED Touchscreen',
      'Water Resistance': '50m',
      'Battery Life': 'All day',
      'OS': 'Wear OS',
    },
  },
  {
    id: '6',
    brand: 'A. Lange & Sohne',
    model: 'Lange 1 191.032',
    price: 38900,
    rating: 4.9,
    reviewCount: 34,
    image: '/images/watch-6.jpg',
    images: ['/images/watch-6.jpg', '/images/watch-2.jpg'],
    category: 'luxury',
    condition: 'Like New',
    description: 'The Lange 1 is the most recognizable timepiece from the renowned German manufacturer. Its asymmetric dial layout and outsize date have become hallmarks of fine German watchmaking.',
    specs: {
      'Case Material': '18K Rose Gold',
      'Case Diameter': '38.5mm',
      'Movement': 'Manual-winding Calibre L121.1',
      'Water Resistance': '30m',
      'Crystal': 'Sapphire',
      'Power Reserve': '72 hours',
    },
  },
  {
    id: '7',
    brand: 'Rolex',
    model: 'Daytona 116500LN',
    price: 32500,
    originalPrice: 36000,
    rating: 4.8,
    reviewCount: 267,
    image: '/images/watch-1.jpg',
    images: ['/images/watch-1.jpg'],
    category: 'sport',
    condition: 'Excellent',
    description: 'The Rolex Cosmograph Daytona is the ultimate chronograph, designed for professional racing drivers. Its tachymetric bezel and reliable movement make it both functional and iconic.',
    specs: {
      'Case Material': 'Oystersteel',
      'Case Diameter': '40mm',
      'Movement': 'Perpetual, mechanical chronograph',
      'Water Resistance': '100m',
      'Crystal': 'Sapphire',
      'Power Reserve': '72 hours',
    },
  },
  {
    id: '8',
    brand: 'Jaeger-LeCoultre',
    model: 'Reverso Classic',
    price: 8450,
    rating: 4.7,
    reviewCount: 92,
    image: '/images/watch-4.jpg',
    images: ['/images/watch-4.jpg'],
    category: 'vintage',
    condition: 'Excellent',
    description: 'The Reverso is one of the most recognizable watches in the world. Created in 1931 for polo players, its reversible case is a masterpiece of Art Deco design.',
    specs: {
      'Case Material': 'Stainless Steel',
      'Case Dimensions': '45.6 x 27.4mm',
      'Movement': 'Manual-winding Calibre 822/2',
      'Water Resistance': '30m',
      'Crystal': 'Sapphire',
      'Power Reserve': '45 hours',
    },
  },
]

export const mockReviews: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: 'James W.',
    rating: 5,
    comment: 'Absolutely stunning timepiece. The finishing is impeccable and it keeps perfect time. Worth every penny.',
    date: '2025-12-15',
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: 'Michael T.',
    rating: 4,
    comment: 'Beautiful watch with incredible craftsmanship. The only minor note is the clasp could be a bit more refined, but overall exceptional.',
    date: '2025-11-28',
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: 'Sarah L.',
    rating: 5,
    comment: 'Purchased this as an investment piece and I couldn\'t be happier. The dial catches the light beautifully. Meridian made the buying process seamless.',
    date: '2025-10-04',
  },
  {
    id: 'r4',
    userId: 'u4',
    userName: 'David K.',
    rating: 5,
    comment: 'This watch exceeded my expectations in every way. The movement is buttery smooth and the case finishing is museum quality.',
    date: '2025-09-12',
  },
]

export const mockOrders: Order[] = [
  {
    id: 'ORD-2025-001',
    date: '2025-12-20',
    status: 'Delivered',
    items: [{ watch: watches[0], quantity: 1 }],
    total: 142500,
  },
  {
    id: 'ORD-2025-002',
    date: '2026-01-15',
    status: 'Shipped',
    items: [{ watch: watches[1], quantity: 1 }],
    total: 14850,
  },
  {
    id: 'ORD-2026-003',
    date: '2026-02-28',
    status: 'Processing',
    items: [{ watch: watches[4], quantity: 1 }],
    total: 2150,
  },
]

export const categories = [
  { name: 'Luxury', slug: 'luxury', description: 'Haute horlogerie from the finest maisons' },
  { name: 'Sport', slug: 'sport', description: 'Built for performance and precision' },
  { name: 'Smart', slug: 'smart', description: 'Where tradition meets technology' },
  { name: 'Vintage', slug: 'vintage', description: 'Timeless pieces with enduring character' },
]

export const brands = [
  'Patek Philippe',
  'Rolex',
  'Audemars Piguet',
  'Omega',
  'TAG Heuer',
  'A. Lange & Sohne',
  'Jaeger-LeCoultre',
]
