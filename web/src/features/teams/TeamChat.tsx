import { useEffect, useRef, useState } from 'react'
import { HttpError } from '@/core/http'
import { useToast } from '@/design-system/Toast'
import { teamsService } from './teamsService'
import type { TeamMessageView } from './types'
import styles from './TeamChat.module.css'

const POLL_INTERVAL_MS = 8000

/**
 * Chat privado da equipe — feature real do backend (POST/GET
 * /api/teams/:teamId/messages) que nunca existiu na UI legada. Sem
 * WebSocket no backend hoje, então a atualização é por polling leve
 * enquanto o painel está montado.
 */
export function TeamChat({ teamId, currentUserId }: { teamId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<TeamMessageView[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  useEffect(() => {
    let ignore = false
    setLoading(true)

    async function load() {
      try {
        const fresh = await teamsService.listMessages(teamId)
        if (!ignore) setMessages(fresh)
      } catch {
        // Polling silencioso: não interromper o chat por uma falha de rede isolada.
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void load()
    const interval = window.setInterval(load, POLL_INTERVAL_MS)
    return () => {
      ignore = true
      window.clearInterval(interval)
    }
  }, [teamId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setSending(true)
    try {
      const message = await teamsService.sendMessage(teamId, text)
      setMessages((current) => [...current, message])
      setDraft('')
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível enviar a mensagem.', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.chat}>
      <div ref={listRef} className={styles.list}>
        {loading && messages.length === 0 && <p className={styles.empty}>Carregando mensagens…</p>}
        {!loading && messages.length === 0 && (
          <p className={styles.empty}>Nenhuma mensagem ainda. Diga olá para o time.</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={[styles.message, message.userId === currentUserId ? styles.mine : ''].join(' ')}
          >
            <span className={styles.author}>{message.displayName}</span>
            <span className={styles.text}>{message.text}</span>
          </div>
        ))}
      </div>
      <form className={styles.form} onSubmit={handleSend}>
        <input
          className={styles.input}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Mensagem para a equipe…"
          maxLength={500}
        />
        <button type="submit" className={styles.send} disabled={sending || !draft.trim()}>
          Enviar
        </button>
      </form>
    </div>
  )
}
