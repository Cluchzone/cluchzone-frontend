/** Espelha clutchzone-backend/src/modules/marketplace/marketplace.types.ts. */
export type SellerCategory = 'SPONSOR' | 'STREAMER' | 'MERCHANT' | 'AGENCY'
export type ListingKind = 'SPONSORSHIP' | 'STREAMER_SERVICE' | 'PRODUCT'
export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED'
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED'

export type SellerView = {
  id: string
  storeName: string
  slug: string
  category: SellerCategory
  description: string
  websiteUrl: string | null
  currencyCode: string
  verified: boolean
}

export type ListingView = {
  id: string
  kind: ListingKind
  status: ListingStatus
  title: string
  description: string
  game: string
  audience: string | null
  priceCents: number
  currencyCode: string
  stockQuantity: number
  imageUrl: string | null
  seller: SellerView
  createdAt: string
  updatedAt: string
}

export type OrderView = {
  id: string
  listingId: string
  listingTitle: string
  buyerUserId: string
  buyerDisplayName: string
  quantity: number
  totalCents: number
  currencyCode: string
  status: OrderStatus
  brief: string
  createdAt: string
  updatedAt: string
}

export type SellerDashboard = {
  seller: SellerView | null
  listings: ListingView[]
  orders: OrderView[]
  metrics: {
    totalListings: number
    publishedListings: number
    pendingOrders: number
    completedRevenueCents: number
    completedRevenueByCurrency: Array<{ currencyCode: string; totalCents: number }>
  }
}

export type SellerProfileInput = {
  storeName: string
  category: SellerCategory
  description: string
  websiteUrl: string | null
  currencyCode: string
}

export type ListingInput = {
  kind: ListingKind
  title: string
  description: string
  game: string
  audience: string | null
  priceCents: number
  stockQuantity: number
  imageUrl: string | null
}

export type ListingFilters = {
  kind?: ListingKind
  game?: string
  q?: string
}
