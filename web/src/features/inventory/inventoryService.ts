import { apiFetch } from '@/core/http'
import type { ShowcaseGameKey, ShowcaseInventoryResponse } from './types'

/** Cliente sobre /api/players — vitrine pública de inventário Steam (real, com autorização por recurso). */
export const inventoryService = {
  getShowcaseVisibility(): Promise<boolean> {
    return apiFetch<{ ok: boolean; visible: boolean }>('/api/players/me/showcase-visibility').then(
      (res) => res.visible,
    )
  },

  setShowcaseVisibility(visible: boolean): Promise<boolean> {
    return apiFetch<{ ok: boolean; visible: boolean }>('/api/players/me/showcase-visibility', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ visible }),
    }).then((res) => res.visible)
  },

  getShowcaseInventory(userId: string, game: ShowcaseGameKey): Promise<ShowcaseInventoryResponse> {
    return apiFetch<ShowcaseInventoryResponse>(`/api/players/${userId}/showcases/${game}/inventory`)
  },
}
