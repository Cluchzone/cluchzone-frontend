/** Espelha clutchzone-backend/src/modules/teams/team.types.ts — não invente campos que a API não devolve. */
export type TeamMemberRole = 'CAPTAIN' | 'VICE_CAPTAIN' | 'PLAYER' | 'RESERVE'

export type TeamMemberView = {
  userId: string
  displayName: string
  avatarUrl: string | null
  role: TeamMemberRole
}

export type TeamView = {
  id: string
  name: string
  slug: string
  tag: string
  description: string | null
  region: string
  captainUserId: string
  members: TeamMemberView[]
  createdAt: string
  updatedAt: string
}

export type TeamMessageView = {
  id: string
  teamId: string
  userId: string
  displayName: string
  avatarUrl: string | null
  text: string
  createdAt: string
}

export type CreateTeamMemberInput = {
  displayName: string
  role: Exclude<TeamMemberRole, 'CAPTAIN'>
}

export type CreateTeamInput = {
  name: string
  tag: string
  description: string | null
  region: string
  members: CreateTeamMemberInput[]
}
