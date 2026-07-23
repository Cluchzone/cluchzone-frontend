import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chart } from '@/design-system/Chart'
import { Button } from '@/design-system/Button'
import { useAuth } from '@/features/auth'
import { SteamShowcase } from '@/features/inventory'
import styles from './PassportPage.module.css'

type TabKey = 'overview' | 'stats' | 'ux' | 'history' | 'medals' | 'connections'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '📊 Visão Geral' },
  { key: 'stats', label: '🎯 Estatísticas' },
  { key: 'ux', label: '📈 UX Analytics' },
  { key: 'history', label: '📜 Histórico' },
  { key: 'medals', label: '🏅 Medalhas' },
  { key: 'connections', label: '🔌 Conexões' },
]

const PERSONA_STATES = ['Offline', 'Online', 'Ocupado', 'Ausente', 'Soneca', 'Quer trocar', 'Quer jogar']

/**
 * Números de demonstração fiéis à produção atual (dado fixo, sem API por
 * trás). Todo usuário autenticado hoje só tem Steam conectada — o legado
 * tinha uma simulação de "conectar" Supercell/Riot que gerava esses mesmos
 * números (branch "steam conectada"); removida por violar a regra de nunca
 * simular login (ver decisão da Fase 9).
 */
const DEMO_STATS = { rank: 'Global Elite', tournaments: 24, wins: 8, earnings: 'R$ 1.300' }

const HISTORY_DATA = [
  { name: 'Erangel Survivor Cup', game: 'PUBG', date: '07/07/2026', pos: '1º', result: 'win', prize: 'R$ 500' },
  { name: 'Copa Deagle', game: 'CS2', date: '05/07/2026', pos: '5º', result: 'top', prize: 'R$ 50' },
  { name: 'Miramar Desert Clash', game: 'PUBG', date: '03/07/2026', pos: '12º', result: 'loss', prize: '—' },
  { name: 'Gem Grab Pro', game: 'Brawl Stars', date: '01/07/2026', pos: '2º', result: 'top', prize: 'R$ 200' },
  { name: 'Dust II Open', game: 'CS2', date: '28/06/2026', pos: '1º', result: 'win', prize: 'R$ 800' },
  { name: 'CLUTCHZONE Masters', game: 'PUBG', date: '25/06/2026', pos: '7º', result: 'top', prize: '—' },
  { name: 'Liga BR Noturna', game: 'CS2', date: '22/06/2026', pos: '1º', result: 'win', prize: 'R$ 350' },
] as const

const RESULT_LABELS: Record<string, string> = { win: 'Vitória', top: 'Top 10', loss: 'Eliminado' }

const MEDALS_DATA = [
  { icon: '🥇', name: 'Campeão Absoluto', desc: '1º lugar em campeonato', locked: false },
  { icon: '⚡', name: 'Clutch King', desc: '5 clutches 1v3+', locked: false },
  { icon: '🔥', name: 'Em Chamas', desc: '3 vitórias seguidas', locked: false },
  { icon: '🎯', name: 'Sniper Elite', desc: '50% headshots', locked: false },
  { icon: '✈️', name: 'Chicken Dinner', desc: 'Vença via avião PUBG', locked: false },
  { icon: '💣', name: 'Bomb Planted', desc: 'Plante 100 bombas CS2', locked: false },
  { icon: '💎', name: 'Diamond Player', desc: 'Atingir Diamond II', locked: false },
  { icon: '🌟', name: 'Estrela em Ascensão', desc: 'Top 3 cinco vezes', locked: false },
  { icon: '👑', name: 'Organizador Pro', desc: 'Crie 10 campeonatos (Premium)', locked: false },
  { icon: '🌍', name: 'Campeão Regional', desc: 'Vença torneio regional', locked: true },
  { icon: '🏆', name: 'Lenda', desc: 'Vença 25 campeonatos', locked: true },
  { icon: '🚀', name: 'Invicto', desc: 'Torneio sem derrota', locked: true },
] as const

function formatSteamDate(value: string | null, includeTime = false): string {
  if (!value) return 'Não informado'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Não informado'
  return new Intl.DateTimeFormat(
    navigator.language,
    includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { month: 'short', year: 'numeric' },
  ).format(date)
}

function heatmapLevel(random: number): string {
  if (random > 0.8) return styles.l4
  if (random > 0.6) return styles.l3
  if (random > 0.4) return styles.l2
  if (random > 0.2) return styles.l1
  return ''
}

/**
 * Porte de passport.html/passport.js. Escopo decidido na Fase 9:
 * - Real: cartão de perfil Steam (campos vêm de /auth/me, hoje descartados
 *   pela UI) e a vitrine pública de inventário (features/inventory).
 * - Fiel ao legado como dado de demonstração: gráficos, histórico,
 *   medalhas, ranking global e comparativos — 100% estático hoje, sem API.
 * - Removido: login simulado de Supercell/Riot (gerava estatística
 *   fictícia como se fosse real — viola a regra de nunca simular login) e
 *   o editor de nome/avatar (já é código morto: salva no localStorage mas
 *   nunca é lido de volta na renderização real).
 */
export function PassportPage() {
  const { user, state, login } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [heatmap] = useState<number[]>(() => Array.from({ length: 364 }, () => Math.random()))

  const rankingChartData = useMemo(
    () => ({
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Pontos de Ranking',
          data: [180, 220, 195, 280, 310, 340],
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0,212,255,.08)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#00d4ff',
          pointRadius: 5,
        },
      ],
    }),
    [],
  )

  const winrateChartData = useMemo(
    () => ({
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Win %',
          data: [22, 18, 31, 28, 25, 38, 30],
          backgroundColor: 'rgba(0,212,255,.25)',
          borderColor: '#00d4ff',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    }),
    [],
  )

  const gamesChartData = useMemo(
    () => ({
      labels: ['PUBG', 'CS2', 'Brawl Stars'],
      datasets: [
        {
          data: [45, 35, 20],
          backgroundColor: ['rgba(255,165,0,.7)', 'rgba(0,160,255,.7)', 'rgba(255,215,0,.7)'],
          borderColor: ['#ffa500', '#00a0ff', '#ffd700'],
          borderWidth: 2,
        },
      ],
    }),
    [],
  )

  const revenueChartData = useMemo(
    () => ({
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'R$',
          data: [0, 200, 150, 500, 300, 1450],
          borderColor: '#ffd700',
          backgroundColor: 'rgba(255,215,0,.08)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ffd700',
          pointRadius: 4,
        },
      ],
    }),
    [],
  )

  if (state === 'loading') {
    return <div className={styles.gate}>Sincronizando sessão…</div>
  }

  if (state !== 'authenticated' || !user) {
    return (
      <div className={styles.gate}>
        <div className={styles.gateCard}>
          <div className={styles.gateIcon}>🛂</div>
          <h1>Passaporte restrito</h1>
          <p>Entre com sua conta Steam para visualizar seu histórico de eSports, troféus e métricas de jogo.</p>
          <Button onClick={() => login()}>Entrar com Steam</Button>
        </div>
      </div>
    )
  }

  const location = [user.countryCode, user.stateCode].filter(Boolean).join(' - ')
  const validProfileUrl = user.profileUrl && /^https:\/\/steamcommunity\.com\//.test(user.profileUrl)

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <div className={styles.bannerGlow} />
        <div className={styles.bannerLines} />
      </div>

      <div className={styles.profileSection}>
        <div className={styles.profile}>
          <div className={styles.avatarWrap}>
            {user.avatarUrl && /^https:\/\//.test(user.avatarUrl) ? (
              <img src={user.avatarUrl} alt="Avatar" />
            ) : (
              <div className={styles.avatarFallback}>🎮</div>
            )}
            <div className={styles.avatarLevel}>
              {typeof user.steamLevel === 'number' ? `STEAM ${user.steamLevel}` : 'STEAM --'}
            </div>
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileNick}>{user.displayName}</div>
            <div className={styles.profileHandle}>
              Steam · Conta desde {formatSteamDate(user.steamCreatedAt)}
              {location ? ` · ${location}` : ''}
            </div>
            <div className={styles.profileTags}>
              <span className={[styles.tag, styles.tagRank].join(' ')}>💎 Diamond II</span>
              <span className={[styles.tag, styles.tagTours].join(' ')}>⚔️ 47 Campeonatos</span>
              <span className={[styles.tag, styles.tagWins].join(' ')}>🏆 12 Vitórias</span>
            </div>
            <div className={styles.xpBarWrap}>
              <div className={styles.xpBarTrack}>
                <div className={styles.xpBarFill} style={{ width: '72%' }} />
              </div>
              <span className={styles.xpBarLabel}>7.200 / 10.000 XP → LVL 43</span>
            </div>
          </div>
        </div>

        <div className={styles.statsStrip}>
          <div className={styles.pstat}>
            <div className={[styles.pstatNum, styles.cyan].join(' ')}>{DEMO_STATS.rank}</div>
            <div className={styles.pstatLbl}>Ranking</div>
          </div>
          <div className={styles.pstat}>
            <div className={[styles.pstatNum, styles.purple].join(' ')}>{DEMO_STATS.tournaments}</div>
            <div className={styles.pstatLbl}>Campeonatos</div>
          </div>
          <div className={styles.pstat}>
            <div className={[styles.pstatNum, styles.green].join(' ')}>{DEMO_STATS.wins}</div>
            <div className={styles.pstatLbl}>Vitórias</div>
          </div>
          <div className={styles.pstat}>
            <div className={[styles.pstatNum, styles.gold].join(' ')}>{DEMO_STATS.earnings}</div>
            <div className={styles.pstatLbl}>Ganhos</div>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={[styles.tab, activeTab === tab.key ? styles.tabActive : ''].join(' ')}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.gridWide}>
            <div className={styles.column}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Perfil Steam Oficial</div>
                <div className={styles.steamInfoGrid}>
                  <div>
                    <div className={styles.infoLbl}>Nível Steam</div>
                    <div className={styles.infoValSteam}>
                      {typeof user.steamLevel === 'number' ? user.steamLevel : 'Não público'}
                    </div>
                  </div>
                  <div>
                    <div className={styles.infoLbl}>Status</div>
                    <div className={styles.infoVal}>{PERSONA_STATES[user.personaState ?? -1] ?? 'Não informado'}</div>
                  </div>
                  <div>
                    <div className={styles.infoLbl}>Visibilidade</div>
                    <div className={styles.infoVal}>
                      {user.visibilityState === 3 ? 'Público' : user.visibilityState === 1 ? 'Privado' : 'Não informado'}
                    </div>
                  </div>
                  <div>
                    <div className={styles.infoLbl}>Localização</div>
                    <div className={styles.infoVal}>{location || 'Não informada'}</div>
                  </div>
                  <div>
                    <div className={styles.infoLbl}>Conta Steam desde</div>
                    <div className={styles.infoVal}>{formatSteamDate(user.steamCreatedAt)}</div>
                  </div>
                  <div>
                    <div className={styles.infoLbl}>Último logoff</div>
                    <div className={styles.infoVal}>{formatSteamDate(user.lastLogoffAt, true)}</div>
                  </div>
                </div>
                <div className={styles.steamInfoFooter}>
                  <code>SteamID64: {user.steamId64 || 'Não informado'}</code>
                  {validProfileUrl && (
                    <a href={user.profileUrl ?? '#'} target="_blank" rel="noopener noreferrer">
                      Abrir perfil Steam ↗
                    </a>
                  )}
                </div>
              </div>

              <SteamShowcase userId={user.id} playerName={user.displayName} />

              <div className={styles.card}>
                <div className={styles.cardTitle}>Jogos Conectados</div>
                <div className={styles.connectedGames}>
                  <div className={[styles.connGame, styles.linked].join(' ')}>🪂 PUBG</div>
                  <div className={[styles.connGame, styles.linked].join(' ')}>🔫 CS2</div>
                  <div className={[styles.connGame, styles.linked].join(' ')}>⭐ Brawl Stars</div>
                  <div className={[styles.connGame, styles.unlinked].join(' ')}>⊕ Valorant</div>
                  <div className={[styles.connGame, styles.unlinked].join(' ')}>⊕ Apex Legends</div>
                  <div className={[styles.connGame, styles.unlinked].join(' ')}>⊕ League of Legends</div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Estatísticas por Jogo</div>
                <div className={styles.gameStatRow}>
                  <div className={styles.gameStatInfo}>
                    <div className={styles.gameStatName}>CS2</div>
                    <div className={styles.gameStatSub}>Sincronizado via Steam ID</div>
                  </div>
                  <div className={styles.gameStatVals}>
                    <div className={styles.statChip}>
                      <div className={styles.statChipNum}>1.42</div>
                      <div className={styles.statChipLbl}>K/D</div>
                    </div>
                    <div className={styles.statChip}>
                      <div className={styles.statChipNum}>58%</div>
                      <div className={styles.statChipLbl}>Win %</div>
                    </div>
                    <div className={styles.statChip}>
                      <div className={styles.statChipNum}>210</div>
                      <div className={styles.statChipLbl}>ADR</div>
                    </div>
                  </div>
                </div>
                <div className={styles.gameStatRow}>
                  <div className={styles.gameStatInfo}>
                    <div className={styles.gameStatName}>PUBG</div>
                    <div className={styles.gameStatSub}>Sincronizado via Steam ID</div>
                  </div>
                  <div className={styles.gameStatVals}>
                    <div className={styles.statChip}>
                      <div className={styles.statChipNum}>3.20</div>
                      <div className={styles.statChipLbl}>K/D</div>
                    </div>
                    <div className={styles.statChip}>
                      <div className={styles.statChipNum}>18%</div>
                      <div className={styles.statChipLbl}>Win %</div>
                    </div>
                    <div className={styles.statChip}>
                      <div className={styles.statChipNum}>147</div>
                      <div className={styles.statChipLbl}>TOP10</div>
                    </div>
                  </div>
                </div>
                <div className={styles.gameStatRow}>
                  <div className={styles.gameStatInfo}>
                    <div className={styles.gameStatName}>Brawl Stars</div>
                    <div className={styles.gameStatSubMuted}>Integração via Supercell ID ainda não disponível</div>
                  </div>
                </div>
                <div className={styles.gameStatRow}>
                  <div className={styles.gameStatInfo}>
                    <div className={styles.gameStatName}>Valorant</div>
                    <div className={styles.gameStatSubMuted}>Integração via Riot Games ainda não disponível</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.column}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Últimas Conquistas</div>
                <div className={styles.achievements}>
                  <div className={[styles.achievement, styles.achievementGold].join(' ')}>
                    <span>🥇</span>
                    <div>
                      <div className={styles.achievementTitleGold}>1º Lugar — Erangel Cup</div>
                      <div className={styles.achievementMeta}>2 dias atrás · R$ 500</div>
                    </div>
                  </div>
                  <div className={[styles.achievement, styles.achievementCyan].join(' ')}>
                    <span>🏅</span>
                    <div>
                      <div className={styles.achievementTitleCyan}>Top 10 — CS2 Liga</div>
                      <div className={styles.achievementMeta}>5 dias atrás</div>
                    </div>
                  </div>
                  <div className={[styles.achievement, styles.achievementPurple].join(' ')}>
                    <span>⚡</span>
                    <div>
                      <div className={styles.achievementTitlePurple}>Nível 42 Atingido</div>
                      <div className={styles.achievementMeta}>1 semana atrás</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Ranking Global</div>
                <div className={styles.rankingCard}>
                  <div className={styles.rankingIcon}>💎</div>
                  <div className={styles.rankingName}>Diamond II</div>
                  <div className={styles.rankingSub}>Top 8% da plataforma</div>
                  <div className={styles.rankingProgress}>
                    <div className={styles.rankingProgressLabels}>
                      <span>Diamond II</span>
                      <span>Diamond I</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: '68%' }} />
                    </div>
                    <div className={styles.progressNote}>340 / 500 pts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <>
            <div className={styles.gridThree}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>PUBG — Métricas</div>
                <MetricList
                  rows={[
                    ['Kills médias/partida', '4.8'],
                    ['Dano médio/partida', '312'],
                    ['Sobrevivência média', '14min'],
                    ['Taxa de Chicken Dinner', '18%', 'green'],
                    ['Kills em zonas', '62%', 'gold'],
                    ['Arma favorita', 'M416'],
                  ]}
                />
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>CS2 — Métricas</div>
                <MetricList
                  rows={[
                    ['Headshot %', '41%'],
                    ['HLTV Rating 2.0', '1.24'],
                    ['Clutch 1vX (%)', '34%', 'green'],
                    ['Bombas plantadas', '180'],
                    ['Mapa favorito', 'Mirage'],
                    ['Função principal', 'Lurker', 'gold'],
                  ]}
                />
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Brawl Stars — Métricas</div>
                <MetricList
                  rows={[
                    ['Troféus totais', '48.210'],
                    ['Vitórias 3v3', '61%', 'green'],
                    ['Brawler favorito', 'Leon'],
                    ['Gemas coletadas', '24.800'],
                    ['Showdown wins', '412', 'gold'],
                    ['Power Points totais', '89.430'],
                  ]}
                />
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Evolução de Ranking — Últimos 6 Meses</div>
              <div className={styles.chartWrap}>
                <Chart
                  type="line"
                  data={rankingChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { min: 100, max: 500 } },
                  }}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'ux' && (
          <>
            <div className={styles.uxKpiGrid}>
              <div className={styles.uxKpi}>
                <div className={[styles.uxKpiNum, styles.cyan].join(' ')}>284h</div>
                <div className={styles.uxKpiLbl}>Tempo Total</div>
              </div>
              <div className={styles.uxKpi}>
                <div className={[styles.uxKpiNum, styles.gold].join(' ')}>25.5%</div>
                <div className={styles.uxKpiLbl}>Win Rate Geral</div>
              </div>
              <div className={styles.uxKpi}>
                <div className={[styles.uxKpiNum, styles.green].join(' ')}>47</div>
                <div className={styles.uxKpiLbl}>Campeonatos</div>
              </div>
              <div className={styles.uxKpi}>
                <div className={[styles.uxKpiNum, styles.purple].join(' ')}>R$2.4k</div>
                <div className={styles.uxKpiLbl}>Total Ganho</div>
              </div>
            </div>
            <div className={styles.gridTwo}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Win Rate Semanal</div>
                <div className={styles.chartWrap}>
                  <Chart
                    type="bar"
                    data={winrateChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { min: 0, max: 50 } },
                    }}
                  />
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Distribuição de Jogos</div>
                <div className={styles.chartWrap}>
                  <Chart
                    type="doughnut"
                    data={gamesChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Mapa de Atividade — Últimos 12 Meses</div>
              <div className={styles.heatmap}>
                {heatmap.map((value, index) => (
                  <div key={index} className={[styles.hmCell, heatmapLevel(value)].join(' ')} />
                ))}
              </div>
              <div className={styles.heatmapLegend}>
                Menos
                <div className={styles.hmLegendCell} />
                <div className={[styles.hmLegendCell, styles.l1].join(' ')} />
                <div className={[styles.hmLegendCell, styles.l2].join(' ')} />
                <div className={[styles.hmLegendCell, styles.l3].join(' ')} />
                <div className={[styles.hmLegendCell, styles.l4].join(' ')} />
                Mais
              </div>
            </div>
            <div className={styles.gridTwo}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Comparativo com a Média</div>
                <ComparisonBar label="Win Rate" you="25.5%" avg="14%" percent={25.5} color="var(--green)" />
                <ComparisonBar label="K/D Ratio" you="3.2" avg="1.4" percent={70} color="var(--cyan)" />
                <ComparisonBar label="Campeonatos/mês" you="7.8" avg="2.1" percent={85} color="var(--gold)" />
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Receita por Campeonato</div>
                <div className={styles.chartWrap}>
                  <Chart
                    type="line"
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { min: 0 } },
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Histórico de Campeonatos ({HISTORY_DATA.length})</div>
            <table className={styles.histTable}>
              <thead>
                <tr>
                  <th>Campeonato</th>
                  <th>Jogo</th>
                  <th>Data</th>
                  <th>Posição</th>
                  <th>Resultado</th>
                  <th>Prêmio</th>
                </tr>
              </thead>
              <tbody>
                {HISTORY_DATA.map((h) => (
                  <tr key={h.name}>
                    <td>{h.name}</td>
                    <td>{h.game}</td>
                    <td>{h.date}</td>
                    <td>{h.pos}</td>
                    <td>
                      <span className={[styles.histResult, styles[h.result]].join(' ')}>{RESULT_LABELS[h.result]}</span>
                    </td>
                    <td className={styles.prize}>{h.prize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'medals' && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Medalhas e Conquistas</div>
            <div className={styles.medalsGrid}>
              {MEDALS_DATA.map((medal) => (
                <div key={medal.name} className={[styles.medalItem, medal.locked ? styles.medalLocked : ''].join(' ')}>
                  <div className={styles.medalIcon}>{medal.icon}</div>
                  <div className={styles.medalName}>{medal.name}</div>
                  <div className={styles.medalDesc}>{medal.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className={styles.connectionsList}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>🔌 Conexões de Plataformas</div>
              <p className={styles.connectionsLead}>
                Sua conta Steam já está sincronizada. Outras plataformas ainda não têm integração real na
                CLUTCHZONE.
              </p>
              <div className={styles.connectionsGrid}>
                <div className={[styles.connectionCard, styles.connectionActive].join(' ')}>
                  <div className={styles.connectionLeft}>
                    <div className={styles.connectionIcon}>🎮</div>
                    <div>
                      <strong>Steam</strong>
                      <div className={styles.connectionDesc}>Sincroniza inventários e estatísticas de PUBG e CS2.</div>
                      <div className={styles.connectionStatus}>
                        ✓ Conectado como {user.displayName}
                        {typeof user.steamLevel === 'number' ? ` (Nível ${user.steamLevel})` : ''}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.connectionCard}>
                  <div className={styles.connectionLeft}>
                    <div className={styles.connectionIcon}>⭐</div>
                    <div>
                      <strong>Supercell ID</strong>
                      <div className={styles.connectionDesc}>Sincroniza troféus e brawlers de Brawl Stars.</div>
                      <div className={styles.connectionSoon}>Em breve</div>
                    </div>
                  </div>
                </div>
                <div className={styles.connectionCard}>
                  <div className={styles.connectionLeft}>
                    <div className={styles.connectionIcon}>⚔️</div>
                    <div>
                      <strong>Riot Games</strong>
                      <div className={styles.connectionDesc}>Sincroniza elo e partidas de Valorant e League of Legends.</div>
                      <div className={styles.connectionSoon}>Em breve</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footerLinkWrap}>
        <Link to="/">Voltar ao início</Link>
      </div>
    </div>
  )
}

function MetricList({ rows }: { rows: [string, string, ('green' | 'gold')?][] }) {
  return (
    <div className={styles.metricList}>
      {rows.map(([label, value, color]) => (
        <div key={label} className={styles.metricRow}>
          <span className={styles.metricLabel}>{label}</span>
          <span className={[styles.metricValue, color ? styles[color] : ''].join(' ')}>{value}</span>
        </div>
      ))}
    </div>
  )
}

function ComparisonBar({
  label,
  you,
  avg,
  percent,
  color,
}: {
  label: string
  you: string
  avg: string
  percent: number
  color: string
}) {
  return (
    <div className={styles.comparisonRow}>
      <div className={styles.comparisonHead}>
        <span>{label}</span>
        <span style={{ color }}>
          Você: {you} vs Média: {avg}
        </span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  )
}
