import type { ListingKind, ListingStatus, OrderStatus, SellerCategory } from './types'

/** Fonte única dos rótulos — outro dedupe: marketplace.js e seller-erp.js tinham cada um o seu mapa. */
export const LISTING_KIND_LABELS: Record<ListingKind, string> = {
  SPONSORSHIP: 'Patrocínio',
  STREAMER_SERVICE: 'Streamer',
  PRODUCT: 'Produto',
}

export const LISTING_KIND_GLYPHS: Record<ListingKind, string> = {
  SPONSORSHIP: 'SPN',
  STREAMER_SERVICE: 'LIVE',
  PRODUCT: 'GEAR',
}

export const SELLER_CATEGORY_LABELS: Record<SellerCategory, string> = {
  SPONSOR: 'Patrocinador',
  STREAMER: 'Streamer / criador',
  MERCHANT: 'Vendedor',
  AGENCY: 'Agência',
}

export const STATUS_LABELS: Record<ListingStatus | OrderStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  PAUSED: 'Pausado',
  ARCHIVED: 'Arquivado',
  PENDING: 'Pendente',
  ACCEPTED: 'Aceito',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}
