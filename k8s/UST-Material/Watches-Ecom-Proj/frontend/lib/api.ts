// API service layer for microservices backend
// These functions are designed to connect to separate backend microservices

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

function resolveApiBase() {
  if (API_BASE) return API_BASE
  return ''
}

async function fetchJson(path: string, options?: RequestInit) {
  const base = resolveApiBase()
  const res = await fetch(`${base}${path}`, options)
  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch (error) {
    return { error: 'invalid_json', status: res.status }
  }
  if (!res.ok) {
    return { ...(data || {}), error: data?.error || 'http_error', status: res.status }
  }
  return data
}

// ─── User Service ───────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  return fetchJson('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export async function registerUser(data: {
  name?: string
  displayName?: string
  email: string
  password: string
}) {
  const displayName = data.displayName ?? data.name
  return fetchJson('/api/users/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName,
      email: data.email,
      password: data.password,
    }),
  })
}

export async function getUserProfile(token: string) {
  return fetchJson('/api/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ─── Product Service ────────────────────────────────────────
export async function getProducts(params?: {
  brand?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.brand) searchParams.set('brand', params.brand)
  if (params?.type) searchParams.set('type', params.type)
  if (params?.minPrice) searchParams.set('minPrice', String(params.minPrice))
  if (params?.maxPrice) searchParams.set('maxPrice', String(params.maxPrice))
  if (params?.sort) searchParams.set('sort', params.sort)
  return fetchJson(`/api/products?${searchParams}`)
}

export async function getProduct(id: string) {
  return fetchJson(`/api/products/${id}`)
}

// ─── Cart Service ───────────────────────────────────────────
export async function getCart(userId: string) {
  return fetchJson(`/api/cart/${userId}`)
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  return fetchJson('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, productId, quantity }),
  })
}

export async function removeFromCart(userId: string, productId: string) {
  return fetchJson(`/api/cart/${userId}/${productId}`, {
    method: 'DELETE',
  })
}

// ─── Order Service ──────────────────────────────────────────
export async function createOrder(data: {
  userId: string
  totalCents: number
}) {
  return fetchJson('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function getOrders(userId: string) {
  return fetchJson(`/api/orders?userId=${encodeURIComponent(userId)}`)
}

// ─── Seller Service ─────────────────────────────────────────
export async function createListing(data: {
  sellerId: string
  name: string
  brand: string
  category: string
  condition?: string
  description?: string
  priceCents: number
}) {
  return fetchJson('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function getMyListings(sellerId: string) {
  return fetchJson(`/api/products?sellerId=${encodeURIComponent(sellerId)}`)
}

// ─── Review Service ─────────────────────────────────────────
export async function getReviews(productId: string) {
  return fetchJson(`/api/reviews/${productId}`)
}

export async function createReview(data: {
  productId: string
  userId: string
  rating: number
  comment: string
}) {
  return fetchJson('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
