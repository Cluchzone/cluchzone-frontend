/** Espelha clutchzone-backend/src/modules/inventory/player-showcase.router.ts + cs2-inventory.service.ts. */
export type ShowcaseGameKey = 'cs2' | 'pubg'

export type ShowcaseHighlight = {
  assetId: string
  name: string
  imageUrl: string | null
  rarityColor: string | null
  marketPrice: { formatted: string }
}

export type ShowcaseInventoryResponse = {
  ok: boolean
  game?: { key: string; name: string; shortName: string }
  showcaseVisible: boolean
  player?: { id: string; displayName: string; avatarUrl: string | null }
  showcaseAvailable?: boolean
  highlights: ShowcaseHighlight[]
  inventory?: { total: number }
}
