import { apiFetch } from '@/core/http'
import type { CreateTeamInput, TeamMessageView, TeamView } from './types'

const BASE = '/api/teams'

/**
 * Cliente fino sobre /api/teams. O backend só expõe criar, listar minhas
 * equipes e chat privado — sem convite, promoção, remoção, edição ou
 * dissolução de equipe (ver team.router.ts). Não simular essas ações aqui.
 */
export const teamsService = {
  listMine(): Promise<TeamView[]> {
    return apiFetch<{ ok: boolean; teams: TeamView[] }>(`${BASE}/mine`).then((res) => res.teams)
  },

  create(input: CreateTeamInput): Promise<TeamView> {
    return apiFetch<{ ok: boolean; team: TeamView }>(BASE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }).then((res) => res.team)
  },

  listMessages(teamId: string): Promise<TeamMessageView[]> {
    return apiFetch<{ ok: boolean; messages: TeamMessageView[] }>(`${BASE}/${teamId}/messages`).then(
      (res) => res.messages,
    )
  },

  sendMessage(teamId: string, text: string): Promise<TeamMessageView> {
    return apiFetch<{ ok: boolean; message: TeamMessageView }>(`${BASE}/${teamId}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then((res) => res.message)
  },
}
