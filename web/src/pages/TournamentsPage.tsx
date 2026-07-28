import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/design-system/Button'
import { Modal } from '@/design-system/Modal'
import { useToast } from '@/design-system/Toast'
import { useAuth } from '@/features/auth'
import { HttpError } from '@/core/http'
import {
  ENTRY_KIND_LABELS,
  RegistrationsPanel,
  STATUS_LABELS,
  STATUS_TRANSITIONS,
  TRANSITION_ACTION_LABELS,
  tournamentsService,
  type TournamentEntryKind,
  type TournamentStatus,
  type TournamentView,
} from '@/features/tournaments'
import styles from './TournamentsPage.module.css'

const GAME_OPTIONS = [
  { value: 'cs2', label: 'CS2' },
  { value: 'pubg', label: 'PUBG' },
  { value: 'brawl', label: 'Brawl Stars' },
  { value: 'valorant', label: 'Valorant' },
  { value: 'lol', label: 'League of Legends' },
]

const ENTRY_KIND_OPTIONS: TournamentEntryKind[] = ['TEAM', 'SOLO', 'MIXED']

/** ISO (UTC, do backend) → valor de <input type="datetime-local"> (local, sem segundos). */
function toDateTimeLocal(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

/** valor de <input type="datetime-local"> (local) → ISO com offset, como o zod do backend exige. */
function fromDateTimeLocal(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function formatStartsAt(iso: string | null): string {
  if (!iso) return 'Data a definir'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Data a definir'
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type FormState = {
  name: string
  game: string
  entryKind: TournamentEntryKind
  maxEntries: string
  startsAt: string
}

const EMPTY_FORM: FormState = { name: '', game: 'cs2', entryKind: 'TEAM', maxEntries: '', startsAt: '' }

function formFromTournament(t: TournamentView): FormState {
  return {
    name: t.name,
    game: t.game,
    entryKind: t.entryKind,
    maxEntries: t.maxEntries === null ? '' : String(t.maxEntries),
    startsAt: toDateTimeLocal(t.startsAt),
  }
}

/**
 * Porte do organizer-panel.html + create-tournament.html restrito ao que a API
 * real /api/tournaments garante (Fase 8a). O legado guardava campeonatos num
 * blob global de localStorage (`cluchzone_cs2_camps`) via /api/store, sem dono
 * nem autorização, e embutia um fluxo de pagamento Pix e campos livres de
 * premiação/região/regras. Nada disso é reproduzido aqui: o backend endurecido
 * modela dono (ownerId), papel (organizer/admin) e a máquina de status, e não
 * tem pagamento (SECURITY.md ainda marca pagamentos como não-endurecidos). O
 * gate de UI abaixo é só conveniência — a autorização é sempre do backend.
 *
 * Inscrições (Fase 8b) usam o mesmo gate de UI. Chaveamento (bracket) chega
 * na Fase 8c.
 */
export function TournamentsPage() {
  const { user, state, login } = useAuth()
  const toast = useToast()
  const [tournaments, setTournaments] = useState<TournamentView[] | null>(null)
  const [editing, setEditing] = useState<TournamentView | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [registrationsFor, setRegistrationsFor] = useState<TournamentView | null>(null)

  const canCreate = user?.role === 'organizer' || user?.role === 'admin'

  useEffect(() => {
    if (state !== 'authenticated') return
    let ignore = false
    tournamentsService
      .list()
      .then((fresh) => {
        if (!ignore) setTournaments(fresh)
      })
      .catch((error) => {
        if (ignore) return
        toast(error instanceof HttpError ? error.message : 'Não foi possível carregar os torneios.', 'error')
        setTournaments([])
      })
    return () => {
      ignore = true
    }
  }, [state, toast])

  const isOperator = useMemo(
    () => (t: TournamentView) => user?.role === 'admin' || t.ownerId === user?.id,
    [user],
  )

  if (state === 'loading') {
    return <div className={styles.container}>Sincronizando sessão…</div>
  }

  if (state !== 'authenticated' || !user) {
    return (
      <div className={styles.gate}>
        <p className={styles.gateBadge}>Área restrita</p>
        <h1 className={styles.gateTitle}>Entre com Steam para ver os torneios</h1>
        <Button onClick={() => login()}>Entrar com Steam</Button>
      </div>
    )
  }

  const modalOpen = creating || editing !== null

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setCreating(true)
  }

  function openEdit(t: TournamentView) {
    setCreating(false)
    setEditing(t)
    setForm(formFromTournament(t))
  }

  function closeModal(open: boolean) {
    if (open || submitting) return
    setCreating(false)
    setEditing(null)
  }

  function upsert(next: TournamentView) {
    setTournaments((current) => {
      if (!current) return [next]
      const index = current.findIndex((t) => t.id === next.id)
      if (index === -1) return [next, ...current]
      const copy = [...current]
      copy[index] = next
      return copy
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const name = form.name.trim()
    if (name.length < 3) {
      toast('⚠️ O nome do torneio precisa ter pelo menos 3 caracteres.', 'error')
      return
    }
    const maxEntries = form.maxEntries.trim() === '' ? null : Number(form.maxEntries)
    if (maxEntries !== null && (!Number.isInteger(maxEntries) || maxEntries < 2)) {
      toast('⚠️ O limite de inscrições precisa ser um número inteiro de 2 ou mais (ou vazio para ilimitado).', 'error')
      return
    }
    const startsAt = fromDateTimeLocal(form.startsAt)

    setSubmitting(true)
    try {
      if (editing) {
        const updated = await tournamentsService.update(editing.id, {
          name,
          entryKind: form.entryKind,
          maxEntries,
          startsAt,
        })
        upsert(updated)
        toast(`🏆 Torneio ${updated.name} atualizado.`, 'success')
      } else {
        const created = await tournamentsService.create({
          name,
          game: form.game,
          entryKind: form.entryKind,
          maxEntries,
          startsAt,
        })
        upsert(created)
        toast(`🏆 Torneio ${created.name} criado como rascunho.`, 'success')
      }
      setCreating(false)
      setEditing(null)
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível salvar o torneio.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTransition(t: TournamentView, next: TournamentStatus) {
    setBusyId(t.id)
    try {
      const updated = await tournamentsService.changeStatus(t.id, next)
      upsert(updated)
      toast(`🏆 ${updated.name}: ${STATUS_LABELS[updated.status].toLowerCase()}.`, 'success')
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível mudar o status.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>🏆 Torneios</p>
          <h1 className={styles.title}>Central de Torneios</h1>
          <p className={styles.lead}>
            {canCreate
              ? 'Crie e gerencie seus torneios. Rascunhos ficam visíveis só para você até serem publicados.'
              : 'Acompanhe os torneios publicados na CLUTCHZONE.'}
          </p>
        </div>
        {canCreate && (
          <Button size="lg" onClick={openCreate}>
            ➕ Criar Torneio
          </Button>
        )}
      </header>

      {tournaments === null && <div className={styles.state}>Carregando torneios…</div>}

      {tournaments !== null && tournaments.length === 0 && (
        <div className={styles.empty}>
          {canCreate
            ? 'Nenhum torneio ainda. Crie o primeiro para começar.'
            : 'Nenhum torneio publicado no momento.'}
        </div>
      )}

      {tournaments !== null && tournaments.length > 0 && (
        <ul className={styles.grid}>
          {tournaments.map((t) => {
            const operator = isOperator(t)
            const transitions = operator ? STATUS_TRANSITIONS[t.status] : []
            return (
              <li key={t.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.game}>{t.game.toUpperCase()}</span>
                  <span className={styles.status} data-status={t.status}>
                    {STATUS_LABELS[t.status]}
                  </span>
                </div>
                <h2 className={styles.cardName}>{t.name}</h2>
                <dl className={styles.meta}>
                  <div className={styles.metaRow}>
                    <dt>Formato</dt>
                    <dd>{ENTRY_KIND_LABELS[t.entryKind]}</dd>
                  </div>
                  <div className={styles.metaRow}>
                    <dt>Vagas</dt>
                    <dd>{t.maxEntries === null ? 'Ilimitadas' : t.maxEntries}</dd>
                  </div>
                  <div className={styles.metaRow}>
                    <dt>Início</dt>
                    <dd>{formatStartsAt(t.startsAt)}</dd>
                  </div>
                </dl>

                <div className={styles.actions}>
                  {t.status !== 'DRAFT' && (
                    <Button variant="ghost" onClick={() => setRegistrationsFor(t)}>
                      👥 Inscrições
                    </Button>
                  )}
                  {operator && (
                    <>
                      {(t.status === 'DRAFT' ||
                        t.status === 'PUBLISHED' ||
                        t.status === 'REGISTRATION_CLOSED' ||
                        t.status === 'LIVE') && (
                        <Button variant="ghost" onClick={() => openEdit(t)} disabled={busyId === t.id}>
                          ✏️ Editar
                        </Button>
                      )}
                      {transitions.map((next) => (
                        <Button
                          key={next}
                          variant="ghost"
                          onClick={() => handleTransition(t, next)}
                          disabled={busyId === t.id}
                          className={next === 'CANCELLED' ? styles.danger : undefined}
                        >
                          {TRANSITION_ACTION_LABELS[next]}
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={closeModal}
        title={editing ? 'Editar torneio' : 'Criar torneio'}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tn-name">
              Nome do torneio *
            </label>
            <input
              id="tn-name"
              className={styles.input}
              type="text"
              placeholder="Ex: Copa CLUTCHZONE de Verão"
              maxLength={140}
              required
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="tn-game">
              Jogo
            </label>
            <select
              id="tn-game"
              className={styles.input}
              value={form.game}
              disabled={editing !== null}
              onChange={(event) => setForm((f) => ({ ...f, game: event.target.value }))}
            >
              {GAME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {editing && <p className={styles.hint}>O jogo não pode ser alterado depois de criado.</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="tn-kind">
              Formato de inscrição
            </label>
            <select
              id="tn-kind"
              className={styles.input}
              value={form.entryKind}
              onChange={(event) =>
                setForm((f) => ({ ...f, entryKind: event.target.value as TournamentEntryKind }))
              }
            >
              {ENTRY_KIND_OPTIONS.map((kind) => (
                <option key={kind} value={kind}>
                  {ENTRY_KIND_LABELS[kind]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="tn-max">
              Limite de inscrições
            </label>
            <input
              id="tn-max"
              className={styles.input}
              type="number"
              min={2}
              max={1024}
              step={1}
              placeholder="Vazio = ilimitado"
              value={form.maxEntries}
              onChange={(event) => setForm((f) => ({ ...f, maxEntries: event.target.value }))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="tn-starts">
              Data de início
            </label>
            <input
              id="tn-starts"
              className={styles.input}
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => setForm((f) => ({ ...f, startsAt: event.target.value }))}
            />
          </div>

          <Button type="submit" full size="lg" disabled={submitting}>
            {submitting ? 'Salvando…' : editing ? 'Salvar alterações' : 'Criar rascunho'}
          </Button>
        </form>
      </Modal>

      <Modal
        open={registrationsFor !== null}
        onOpenChange={(open) => !open && setRegistrationsFor(null)}
        title={registrationsFor ? `Inscrições — ${registrationsFor.name}` : 'Inscrições'}
        wide
      >
        {registrationsFor && (
          <RegistrationsPanel
            tournament={registrationsFor}
            currentUser={user}
            isOperator={isOperator(registrationsFor)}
          />
        )}
      </Modal>
    </div>
  )
}
