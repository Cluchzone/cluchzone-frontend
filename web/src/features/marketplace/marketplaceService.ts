import { apiFetch } from '@/core/http'
import type {
  ListingFilters,
  ListingInput,
  ListingStatus,
  ListingView,
  OrderStatus,
  OrderView,
  SellerDashboard,
  SellerProfileInput,
  SellerView,
} from './types'

/**
 * Cliente sobre /api/marketplace e /api/seller. Diferente de Teams (Fase 6),
 * o legado (marketplace.js/seller-erp.js) já falava com esses endpoints reais
 * via CluchAPI — não há contrato de localStorage a substituir aqui.
 */
export const marketplaceService = {
  listListings(filters: ListingFilters = {}): Promise<ListingView[]> {
    const query = new URLSearchParams()
    if (filters.kind) query.set('kind', filters.kind)
    if (filters.game) query.set('game', filters.game)
    if (filters.q) query.set('q', filters.q)
    const suffix = query.toString() ? `?${query}` : ''
    return apiFetch<{ ok: boolean; listings: ListingView[] }>(`/api/marketplace/listings${suffix}`).then(
      (res) => res.listings,
    )
  },

  createOrder(listingId: string, input: { quantity: number; brief: string }): Promise<OrderView> {
    return apiFetch<{ ok: boolean; order: OrderView }>(`/api/marketplace/listings/${listingId}/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }).then((res) => res.order)
  },

  getSellerDashboard(): Promise<SellerDashboard> {
    return apiFetch<{ ok: boolean; dashboard: SellerDashboard }>('/api/seller/dashboard').then(
      (res) => res.dashboard,
    )
  },

  saveSellerProfile(input: SellerProfileInput): Promise<SellerView> {
    return apiFetch<{ ok: boolean; seller: SellerView }>('/api/seller/profile', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }).then((res) => res.seller)
  },

  createSellerListing(input: ListingInput): Promise<ListingView> {
    return apiFetch<{ ok: boolean; listing: ListingView }>('/api/seller/listings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }).then((res) => res.listing)
  },

  updateSellerListingStatus(listingId: string, status: ListingStatus): Promise<ListingView> {
    return apiFetch<{ ok: boolean; listing: ListingView }>(`/api/seller/listings/${listingId}/status`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then((res) => res.listing)
  },

  updateSellerOrderStatus(orderId: string, status: OrderStatus): Promise<OrderView> {
    return apiFetch<{ ok: boolean; order: OrderView }>(`/api/seller/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then((res) => res.order)
  },
}
