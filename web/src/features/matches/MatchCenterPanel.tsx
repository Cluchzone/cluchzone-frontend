import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HttpError } from '@/core/http'
import { useToast } from '@/design-system/Toast'
import type { AuthState, AuthUser } from '@/features/auth'
import { matchesService } from './matchesService'
import { SERVER_STATUS_LABELS } from './labels'
import type { MatchView, ServerCommandType, ServerRoomView } from './types'
import styles from './MatchCenterPanel.module.css'

/** Mesmo UUID v1-5 aceito pelo backend (match.router.ts usa z.string().uuid()). */
const MATCH_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type BadgeState = 'idle' | 'busy' | 'ready' | 'error'
type MatchCenterPanelProps = {
  currentUser: AuthUser | null
  authState: AuthState
}

/**
 * Match Center (Fase 11b) — porte de `refreshDedicatedServerPanel` e das ações
 * RCON do csgo.js legado, agora contra `/api/matches` (endurecido: requireAuth,
 * autorização por recurso, idempotência).
 *
 * O id da partida vive no query param `?match=` (compartilhável e persistente no
 * reload), como no legado, mas atualizado via SPA sem recarregar a página. Só é
 * possível operar uma partida existente pelo id — criar partida não é portável
 * (exige `participants[].userId` e não há lookup de usuário por id no backend).
 * A automação de servidor pode responder 503 (`CS2_AUTOMATION_UNAVAILABLE`)
 * quando a chave CS2 não está configurada no backend — tratado como "em
 * preparação", não como erro fatal.
 */
export function MatchCenterPanel({ currentUser, authState }: MatchCenterPanelProps) {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const matchId = (searchParams.get('match') ?? '').trim()

  const [inputValue, setInputValue] = useState(matchId)
  const [match, setMatch] = useState<MatchView | null>(null)
  const [room, setRoom] = useState<ServerRoomView | null>(null)
  const [badge, setBadge] = useState<{ state: BadgeState; text: string }>({
    state: 'idle',
    text: 'AGUARDANDO PARTIDA',
  })
  const [feedback, setFeedback] = useState<{ text: string; error: boolean }>({ text: '', error: false })

  // Sincroniza o input quando o id muda por fora (ex.: link compartilhado).
  useEffect(() => {
    setInputValue(matchId)
  }, [matchId])

  const refresh = useCallback(async () => {
    if (!matchId) {
      setMatch(null)
      setRoom(null)
      setBadge({ state: 'idle', text: 'AGUARDANDO PARTIDA' })
      setFeedback({
        text: currentUser
          ? 'Cole o ID de uma partida oficial acima para acompanhar o servidor.'
          : 'Entre com sua conta Steam para acessar uma partida oficial.',
        error: false,
      })
      return
    }
    if (!MATCH_UUID.test(matchId)) {
      setMatch(null)
      setRoom(null)
      setBadge({ state: 'error', text: 'ID INVÁLIDO' })
      setFeedback({ text: 'O ID da partida não é um UUID válido.', error: true })
      return
    }
    if (!currentUser) {
      setMatch(null)
      setRoom(null)
      if (authState === 'loading') {
        setBadge({ state: 'idle', text: 'SINCRONIZANDO' })
        setFeedback({ text: 'Verificando sua sessão Steam...', error: false })
      } else {
        setBadge({ state: 'idle', text: 'LOGIN NECESSÁRIO' })
        setFeedback({
          text: 'Entre com sua conta Steam para ver os dados protegidos da sala.',
          error: true,
        })
      }
      return
    }

    try {
      const nextMatch = await matchesService.getMatch(matchId)
      let nextRoom: ServerRoomView | null = null
      let roomUnavailable = false
      try {
        nextRoom = await matchesService.getRoom(matchId)
      } catch (error) {
        // 503 = automação de servidor não configurada no backend; não é fatal.
        if (error instanceof HttpError && error.status === 503) roomUnavailable = true
      }
      setMatch(nextMatch)
      setRoom(nextRoom)

      if (nextRoom?.connectCommand) {
        setBadge({ state: 'ready', text: 'SERVIDOR PRONTO' })
        setFeedback({
          text: 'A senha é exibida apenas para jogadores confirmados e organizadores desta partida.',
          error: false,
        })
      } else if (nextMatch.status === 'FAILED') {
        setBadge({ state: 'error', text: 'FALHA NO SERVIDOR' })
        setFeedback({
          text: 'O provisionamento falhou. O organizador pode solicitar uma nova tentativa.',
          error: true,
        })
      } else {
        setBadge({
          state: 'busy',
          text: (SERVER_STATUS_LABELS[nextMatch.status] ?? 'Em preparação').toUpperCase(),
        })
        setFeedback({
          text: roomUnavailable
            ? 'A automação de servidor ainda não está configurada no backend (CS2_SECRET_KEY).'
            : 'O painel atualiza automaticamente enquanto o worker prepara o servidor.',
          error: false,
        })
      }
    } catch (error) {
      setMatch(null)
      setRoom(null)
      setBadge({ state: 'error', text: 'ACESSO INDISPONÍVEL' })
      setFeedback({
        text:
          error instanceof HttpError && error.status === 404
            ? 'Partida não encontrada ou sua conta não faz parte dela.'
            : error instanceof HttpError
              ? error.message
              : 'Não foi possível carregar a partida.',
        error: true,
      })
    }
  }, [matchId, currentUser, authState])

  // Carrega ao mudar o id/sessão e faz polling de 5s (pausado com a aba oculta).
  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => {
      if (matchId && !document.hidden) void refresh()
    }, 5000)
    return () => window.clearInterval(timer)
  }, [refresh, matchId])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = inputValue.trim()
    if (!MATCH_UUID.test(value)) {
      setBadge({ state: 'error', text: 'ID INVÁLIDO' })
      setFeedback({ text: 'Cole um UUID de partida válido.', error: true })
      return
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('match', value)
        return next
      },
      { replace: false },
    )
  }

  async function handleCheckIn() {
    try {
      await matchesService.checkIn(matchId)
      toast('✓ Check-in confirmado.', 'success')
      await refresh()
    } catch (error) {
      setFeedback({
        text: error instanceof HttpError ? error.message : 'A solicitação foi recusada.',
        error: true,
      })
    }
  }

  async function handleProvision() {
    try {
      await matchesService.provision(matchId)
      toast('Servidor CS2 solicitado.', 'info')
      await refresh()
    } catch (error) {
      setFeedback({
        text: error instanceof HttpError ? error.message : 'A solicitação foi recusada.',
        error: true,
      })
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast('Link protegido da partida copiado.', 'info')
    } catch {
      toast('Não foi possível copiar o link.', 'error')
    }
  }

  async function handleRcon(type: ServerCommandType) {
    try {
      await matchesService.serverAction(matchId, type)
      toast('Comando enviado ao host CS2.', 'info')
      window.setTimeout(() => void refresh(), 1200)
    } catch (error) {
      setFeedback({
        text: error instanceof HttpError ? error.message : 'O comando RCON foi recusado.',
        error: true,
      })
    }
  }

  async function handleCopyConnect() {
    if (!room?.connectCommand) return
    try {
      await navigator.clipboard.writeText(room.connectCommand)
      toast('Comando de conexão copiado.', 'success')
    } catch {
      toast('Não foi possível copiar.', 'error')
    }
  }

  const showCheckIn = match !== null && ['SCHEDULED', 'CHECK_IN', 'VETO'].includes(match.status)
  const showProvision =
    Boolean(room?.canOperate) && match !== null && ['VETO', 'RETRYING'].includes(match.status)
  const showRcon = Boolean(room?.canOperate) && ['READY', 'LIVE'].includes(room?.allocationStatus ?? '')
  const hasConnection = Boolean(room?.connectCommand)

  return (
    <section className={styles.panel} aria-labelledby="cs2-match-center-title">
      <div className={styles.head}>
        <div>
          <span className={styles.kicker}>STEAMCMD · DOCKER · RCON</span>
          <h2 id="cs2-match-center-title">Servidor dedicado automático</h2>
          <p className={styles.desc}>
            Cole o ID de uma partida oficial para acompanhar o provisionamento, entrar no servidor e
            controlá-lo via RCON. Conectado ao backend endurecido de partidas.
          </p>
        </div>
        <span className={styles.badge} data-state={badge.state}>
          <i aria-hidden="true" />
          <span>{badge.text}</span>
        </span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="cs2-match-id">ID da partida oficial</label>
        <div className={styles.formRow}>
          <input
            id="cs2-match-id"
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <button type="submit" className={styles.submit}>
            Abrir partida
          </button>
        </div>
      </form>

      {match !== null && (
        <div className={styles.details}>
          <dl className={styles.meta}>
            <div>
              <dt>Etapa</dt>
              <dd>{SERVER_STATUS_LABELS[match.status] ?? match.status}</dd>
            </div>
            <div>
              <dt>Formato</dt>
              <dd>{match.format === 'BEST_OF_3' ? 'MD3' : 'MD1'}</dd>
            </div>
            <div>
              <dt>Região</dt>
              <dd>{room?.regionCode ?? match.regionCode ?? 'Calculando latência'}</dd>
            </div>
            <div>
              <dt>Servidor</dt>
              <dd>{room?.endpoint ?? 'Aguardando provisionamento'}</dd>
            </div>
          </dl>

          {hasConnection && (
            <div className={styles.connectBox}>
              <code>{room?.connectCommand}</code>
              <button type="button" onClick={handleCopyConnect}>
                Copiar conexão
              </button>
            </div>
          )}

          <div className={styles.actions}>
            {showCheckIn && (
              <button type="button" onClick={handleCheckIn}>
                Fazer check-in
              </button>
            )}
            {showProvision && (
              <button type="button" onClick={handleProvision}>
                Criar servidor
              </button>
            )}
            <button type="button" onClick={handleShare}>
              Copiar link da partida
            </button>
          </div>

          {showRcon && (
            <div className={styles.rconActions}>
              <span>CONTROLE RCON RESTRITO</span>
              <button type="button" onClick={() => handleRcon('PAUSE')}>
                Pausar
              </button>
              <button type="button" onClick={() => handleRcon('UNPAUSE')}>
                Retomar
              </button>
              <button type="button" onClick={() => handleRcon('RESTART')}>
                Reiniciar round
              </button>
              <button type="button" className={styles.danger} onClick={() => handleRcon('RELEASE')}>
                Liberar servidor
              </button>
            </div>
          )}
        </div>
      )}

      {feedback.text && (
        <p className={styles.feedback} data-error={feedback.error} role="status" aria-live="polite">
          {feedback.text}
        </p>
      )}
    </section>
  )
}
