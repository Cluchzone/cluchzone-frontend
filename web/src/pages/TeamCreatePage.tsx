import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/design-system/Button'
import { useToast } from '@/design-system/Toast'
import { useAuth } from '@/features/auth'
import { HttpError } from '@/core/http'
import { REGION_OPTIONS, teamsService, type CreateTeamMemberInput } from '@/features/teams'
import styles from './TeamCreatePage.module.css'

const MAX_MEMBERS = 15
const MIN_STARTERS = 3

function splitNicks(value: string): string[] {
  return value
    .split(',')
    .map((nick) => nick.trim())
    .filter((nick) => nick !== '')
}

/**
 * Porte de team-create.html restrito ao que POST /api/teams aceita
 * (createTeamSchema em team.router.ts). Sem logo/banner/redes sociais: o
 * backend não tem campo para nenhum dos três, e inventar upload de imagem
 * aqui não teria onde persistir. O backend também exige que cada nick
 * corresponda a um usuário já cadastrado (resolução única por displayName).
 */
export function TeamCreatePage() {
  const { user, state, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [description, setDescription] = useState('')
  const [region, setRegion] = useState<string>(REGION_OPTIONS[0].value)
  const [viceCaptain, setViceCaptain] = useState('')
  const [playersList, setPlayersList] = useState('')
  const [reservesList, setReservesList] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (state === 'loading') {
    return <div className={styles.container}>Sincronizando sessão…</div>
  }

  if (state !== 'authenticated' || !user) {
    return (
      <div className={styles.gate}>
        <p className={styles.gateBadge}>Área restrita</p>
        <h1 className={styles.gateTitle}>Entre com Steam para criar uma equipe</h1>
        <Button onClick={() => login()}>Entrar com Steam</Button>
      </div>
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedTag = tag.trim().toUpperCase()

    if (trimmedName.length < 3) {
      toast('⚠️ O nome da equipe precisa ter pelo menos 3 caracteres.', 'error')
      return
    }
    if (trimmedTag.length < 2) {
      toast('⚠️ A TAG da equipe precisa ter pelo menos 2 caracteres.', 'error')
      return
    }

    const titulares = splitNicks(playersList)
    const reservas = splitNicks(reservesList)
    if (titulares.length < MIN_STARTERS) {
      toast(`⚠️ Adicione pelo menos ${MIN_STARTERS} titulares além do capitão e do vice.`, 'error')
      return
    }

    const members: CreateTeamMemberInput[] = [
      ...(viceCaptain.trim() ? [{ displayName: viceCaptain.trim(), role: 'VICE_CAPTAIN' as const }] : []),
      ...titulares.map((displayName) => ({ displayName, role: 'PLAYER' as const })),
      ...reservas.map((displayName) => ({ displayName, role: 'RESERVE' as const })),
    ]
    if (members.length > MAX_MEMBERS) {
      toast(`⚠️ Uma equipe pode ter no máximo ${MAX_MEMBERS} membros além do capitão.`, 'error')
      return
    }

    setSubmitting(true)
    try {
      const team = await teamsService.create({
        name: trimmedName,
        tag: trimmedTag,
        description: description.trim() || null,
        region,
        members,
      })
      toast(`🛡️ Equipe ${team.name} criada com sucesso!`, 'success')
      navigate('/teams')
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível criar a equipe.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🛡️ Cadastrar Nova Equipe</h1>
        <p className={styles.lead}>
          Forme o seu esquadrão oficial. Como capitão, você poderá inscrever a equipe em campeonatos e
          conversar com o time pelo chat privado.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tm-name">
                Nome da Equipe *
              </label>
              <input
                id="tm-name"
                className={styles.input}
                type="text"
                placeholder="Ex: Imperial Esports"
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="tm-tag">
                TAG da Equipe *
              </label>
              <input
                id="tm-tag"
                className={styles.input}
                style={{ textTransform: 'uppercase' }}
                type="text"
                placeholder="Ex: IMP"
                maxLength={12}
                required
                value={tag}
                onChange={(event) => setTag(event.target.value)}
              />
            </div>

            <div className={[styles.field, styles.full].join(' ')}>
              <label className={styles.label} htmlFor="tm-desc">
                Descrição da Equipe
              </label>
              <textarea
                id="tm-desc"
                className={styles.textarea}
                placeholder="Conte sobre a história do time, objetivos ou foco tático…"
                maxLength={1000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="tm-region">
                Região do Time
              </label>
              <select
                id="tm-region"
                className={styles.select}
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                {REGION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.divider} />

            <div className={styles.field}>
              <label className={styles.label} htmlFor="tm-captain">
                Capitão (Você) *
              </label>
              <input id="tm-captain" className={styles.input} type="text" disabled value={user.displayName} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="tm-vice">
                Vice-Capitão (nick exato de um jogador cadastrado)
              </label>
              <input
                id="tm-vice"
                className={styles.input}
                type="text"
                placeholder="Nick do vice-capitão"
                value={viceCaptain}
                onChange={(event) => setViceCaptain(event.target.value)}
              />
            </div>

            <div className={[styles.field, styles.full].join(' ')}>
              <label className={styles.label} htmlFor="tm-players">
                Titulares adicionais (nicks separados por vírgula) *
              </label>
              <input
                id="tm-players"
                className={styles.input}
                type="text"
                placeholder="Jogador3, Jogador4, Jogador5"
                required
                value={playersList}
                onChange={(event) => setPlayersList(event.target.value)}
              />
              <p className={styles.hint}>
                Cada nick precisa corresponder exatamente ao nome de exibição de um jogador já cadastrado na
                CLUTCHZONE.
              </p>
            </div>

            <div className={[styles.field, styles.full].join(' ')}>
              <label className={styles.label} htmlFor="tm-reserves">
                Reservas (nicks separados por vírgula)
              </label>
              <input
                id="tm-reserves"
                className={styles.input}
                type="text"
                placeholder="Reserva1, Reserva2"
                value={reservesList}
                onChange={(event) => setReservesList(event.target.value)}
              />
            </div>
          </div>

          <Button type="submit" full size="lg" disabled={submitting} className={styles.submit}>
            {submitting ? 'Publicando…' : '🛡️ Publicar e Criar Equipe'}
          </Button>
        </form>
      </div>
    </div>
  )
}
