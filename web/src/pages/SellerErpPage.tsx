import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/design-system/Button'
import { useToast } from '@/design-system/Toast'
import { useAuth } from '@/features/auth'
import { apiFetch, HttpError } from '@/core/http'
import {
  formatMoney,
  LISTING_KIND_LABELS,
  marketplaceService,
  SELLER_CATEGORY_LABELS,
  STATUS_LABELS,
  type ListingStatus,
  type ListingView,
  type OrderStatus,
  type OrderView,
  type SellerCategory,
  type SellerDashboard,
} from '@/features/marketplace'
import styles from './SellerErpPage.module.css'

/** Ações por status, espelhando as transições reais do backend (prisma-marketplace.repository.ts). */
const LISTING_STATUS_ACTIONS: Record<ListingStatus, { label: string; to: ListingStatus; variant: 'primary' | 'warning' | 'danger' }[]> = {
  DRAFT: [
    { label: 'PUBLICAR', to: 'PUBLISHED', variant: 'primary' },
    { label: 'ARQUIVAR', to: 'ARCHIVED', variant: 'danger' },
  ],
  PUBLISHED: [
    { label: 'PAUSAR', to: 'PAUSED', variant: 'warning' },
    { label: 'ARQUIVAR', to: 'ARCHIVED', variant: 'danger' },
  ],
  PAUSED: [
    { label: 'PUBLICAR', to: 'PUBLISHED', variant: 'primary' },
    { label: 'ARQUIVAR', to: 'ARCHIVED', variant: 'danger' },
  ],
  ARCHIVED: [],
}

const ORDER_STATUS_ACTIONS: Record<OrderStatus, { label: string; to: OrderStatus; variant: 'primary' | 'danger' }[]> = {
  PENDING: [
    { label: 'ACEITAR', to: 'ACCEPTED', variant: 'primary' },
    { label: 'CANCELAR', to: 'CANCELLED', variant: 'danger' },
  ],
  ACCEPTED: [
    { label: 'CONCLUIR', to: 'COMPLETED', variant: 'primary' },
    { label: 'CANCELAR', to: 'CANCELLED', variant: 'danger' },
  ],
  COMPLETED: [],
  CANCELLED: [],
}

/**
 * Porte de seller-erp.html. Assim como MarketplacePage, o legado já falava
 * com os endpoints reais de /api/seller — sem contrato de localStorage.
 * Anúncio novo fica travado até o vendedor salvar o perfil (mesma regra do
 * backend: createListing exige SellerProfile existente).
 */
export function SellerErpPage() {
  const { user, state, login } = useAuth()
  const toast = useToast()

  const [dashboard, setDashboard] = useState<SellerDashboard | null>(null)
  const [loadError, setLoadError] = useState('')
  const [currencies, setCurrencies] = useState<string[]>(['BRL'])
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({
    storeName: '',
    category: 'MERCHANT' as SellerCategory,
    description: '',
    websiteUrl: '',
    currencyCode: 'BRL',
  })
  const [profileError, setProfileError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [listingForm, setListingForm] = useState({
    kind: 'SPONSORSHIP' as ListingView['kind'],
    game: '',
    title: '',
    description: '',
    audience: '',
    price: '0',
    stock: '1',
    imageUrl: '',
  })
  const [listingError, setListingError] = useState('')
  const [creatingListing, setCreatingListing] = useState(false)

  async function loadDashboard() {
    setLoadError('')
    try {
      const fresh = await marketplaceService.getSellerDashboard()
      setDashboard(fresh)
    } catch (error) {
      setLoadError(error instanceof HttpError ? error.message : 'Não foi possível carregar seu painel.')
    }
  }

  useEffect(() => {
    if (state !== 'authenticated') return
    void loadDashboard()
    apiFetch<{ ok: boolean; currencies: string[] }>('/api/global/catalog')
      .then((res) => setCurrencies(res.currencies))
      .catch(() => {})
  }, [state])

  useEffect(() => {
    const seller = dashboard?.seller
    if (!seller) return
    setProfileForm({
      storeName: seller.storeName,
      category: seller.category,
      description: seller.description,
      websiteUrl: seller.websiteUrl ?? '',
      currencyCode: seller.currencyCode,
    })
  }, [dashboard?.seller])

  if (state === 'loading') {
    return <div className={styles.container}>Sincronizando sessão…</div>
  }

  if (state !== 'authenticated' || !user) {
    return (
      <div className={styles.gate}>
        <p className={styles.gateBadge}>Acesso com identidade validada</p>
        <h1 className={styles.gateTitle}>Entre com Steam para abrir sua operação</h1>
        <p className={styles.gateLead}>
          Seu perfil de vendedor, anúncios e pedidos ficam vinculados à sua sessão segura no backend.
        </p>
        <Button onClick={() => login()}>Entrar com Steam</Button>
      </div>
    )
  }

  async function handleSaveProfile(event: FormEvent) {
    event.preventDefault()
    setProfileError('')
    setSavingProfile(true)
    try {
      await marketplaceService.saveSellerProfile({
        storeName: profileForm.storeName.trim(),
        category: profileForm.category,
        description: profileForm.description.trim(),
        websiteUrl: profileForm.websiteUrl.trim() || null,
        currencyCode: profileForm.currencyCode,
      })
      await loadDashboard()
      toast('Operação salva com sucesso.', 'success')
    } catch (error) {
      setProfileError(error instanceof HttpError ? error.message : 'Não foi possível salvar a operação.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleCreateListing(event: FormEvent) {
    event.preventDefault()
    setListingError('')
    setCreatingListing(true)
    try {
      const priceCents = Math.round(Number(listingForm.price) * 100)
      await marketplaceService.createSellerListing({
        kind: listingForm.kind,
        title: listingForm.title.trim(),
        description: listingForm.description.trim(),
        game: listingForm.game.trim(),
        audience: listingForm.audience.trim() || null,
        priceCents,
        stockQuantity: Number(listingForm.stock),
        imageUrl: listingForm.imageUrl.trim() || null,
      })
      setListingForm({
        kind: 'SPONSORSHIP',
        game: '',
        title: '',
        description: '',
        audience: '',
        price: '0',
        stock: '1',
        imageUrl: '',
      })
      await loadDashboard()
      toast('Anúncio criado como rascunho.', 'success')
    } catch (error) {
      setListingError(error instanceof HttpError ? error.message : 'Não foi possível criar o anúncio.')
    } finally {
      setCreatingListing(false)
    }
  }

  async function handleListingStatus(listing: ListingView, to: ListingStatus) {
    const key = `listing:${listing.id}`
    setPendingAction(key)
    try {
      await marketplaceService.updateSellerListingStatus(listing.id, to)
      await loadDashboard()
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível atualizar o anúncio.', 'error')
    } finally {
      setPendingAction(null)
    }
  }

  async function handleOrderStatus(order: OrderView, to: OrderStatus) {
    const key = `order:${order.id}`
    setPendingAction(key)
    try {
      await marketplaceService.updateSellerOrderStatus(order.id, to)
      await loadDashboard()
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível atualizar o pedido.', 'error')
    } finally {
      setPendingAction(null)
    }
  }

  const seller = dashboard?.seller ?? null
  const metrics = dashboard?.metrics
  const revenueLabel = metrics?.completedRevenueByCurrency.length
    ? metrics.completedRevenueByCurrency.map((total) => formatMoney(total.totalCents, total.currencyCode)).join(' · ')
    : formatMoney(0, seller?.currencyCode ?? profileForm.currencyCode)

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h1>SELLER OPS</h1>
        <p>Controle comercial ClutchZone</p>
        <Link to="/marketplace" className={[styles.button, styles.secondary, styles.sidebarLink].join(' ')}>
          VER VITRINE
        </Link>
      </aside>

      <div className={styles.content}>
        <section className={styles.welcome}>
          <p className={styles.eyebrow}>OPERAÇÃO EM TEMPO REAL</p>
          <h2>{seller ? `${seller.storeName} · Seller Ops` : 'Configure sua operação comercial'}</h2>
          <p>Publique oportunidades, acompanhe propostas e controle o estoque comercial.</p>
        </section>

        {loadError && <div className={styles.errorBox}>{loadError}</div>}

        <section className={styles.metrics}>
          <article className={styles.metric}>
            <strong>{metrics?.totalListings ?? 0}</strong>
            <span>anúncios totais</span>
          </article>
          <article className={styles.metric}>
            <strong>{metrics?.publishedListings ?? 0}</strong>
            <span>publicados</span>
          </article>
          <article className={styles.metric}>
            <strong>{metrics?.pendingOrders ?? 0}</strong>
            <span>pedidos pendentes</span>
          </article>
          <article className={styles.metric}>
            <strong>{revenueLabel}</strong>
            <span>receita concluída</span>
          </article>
        </section>

        <section className={styles.panel}>
          <h2>Perfil comercial</h2>
          <form className={styles.form} onSubmit={handleSaveProfile}>
            <div className={styles.field}>
              <label htmlFor="seller-name">Nome da operação</label>
              <input
                id="seller-name"
                className={styles.input}
                minLength={3}
                maxLength={100}
                required
                value={profileForm.storeName}
                onChange={(event) => setProfileForm((f) => ({ ...f, storeName: event.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="seller-category">Perfil</label>
              <select
                id="seller-category"
                className={styles.select}
                required
                value={profileForm.category}
                onChange={(event) =>
                  setProfileForm((f) => ({ ...f, category: event.target.value as SellerCategory }))
                }
              >
                {Object.entries(SELLER_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="seller-currency">Moeda da operação</label>
              <select
                id="seller-currency"
                className={styles.select}
                required
                value={profileForm.currencyCode}
                onChange={(event) => setProfileForm((f) => ({ ...f, currencyCode: event.target.value }))}
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div className={[styles.field, styles.full].join(' ')}>
              <label htmlFor="seller-description">Apresentação</label>
              <textarea
                id="seller-description"
                className={styles.textarea}
                minLength={20}
                maxLength={1500}
                required
                placeholder="Descreva sua marca, audiência, catálogo ou especialidade."
                value={profileForm.description}
                onChange={(event) => setProfileForm((f) => ({ ...f, description: event.target.value }))}
              />
            </div>
            <div className={[styles.field, styles.full].join(' ')}>
              <label htmlFor="seller-website">Site ou mídia oficial (opcional)</label>
              <input
                id="seller-website"
                className={styles.input}
                type="url"
                maxLength={500}
                placeholder="https://..."
                value={profileForm.websiteUrl}
                onChange={(event) => setProfileForm((f) => ({ ...f, websiteUrl: event.target.value }))}
              />
            </div>
            {profileError && <div className={[styles.errorBox, styles.full].join(' ')}>{profileError}</div>}
            <div className={styles.full}>
              <button type="submit" className={styles.button} disabled={savingProfile}>
                {savingProfile ? 'Salvando…' : 'SALVAR OPERAÇÃO'}
              </button>
            </div>
          </form>
        </section>

        {seller && (
          <section className={styles.panel}>
            <h2>Novo anúncio</h2>
            <form className={styles.form} onSubmit={handleCreateListing}>
              <div className={styles.field}>
                <label htmlFor="listing-kind">Tipo</label>
                <select
                  id="listing-kind"
                  className={styles.select}
                  value={listingForm.kind}
                  onChange={(event) =>
                    setListingForm((f) => ({ ...f, kind: event.target.value as ListingView['kind'] }))
                  }
                >
                  <option value="SPONSORSHIP">Patrocínio</option>
                  <option value="STREAMER_SERVICE">Serviço de streamer</option>
                  <option value="PRODUCT">Produto</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="listing-game">Jogo</label>
                <input
                  id="listing-game"
                  className={styles.input}
                  minLength={2}
                  maxLength={60}
                  placeholder="CS2"
                  required
                  value={listingForm.game}
                  onChange={(event) => setListingForm((f) => ({ ...f, game: event.target.value }))}
                />
              </div>
              <div className={[styles.field, styles.full].join(' ')}>
                <label htmlFor="listing-title">Título</label>
                <input
                  id="listing-title"
                  className={styles.input}
                  minLength={5}
                  maxLength={140}
                  required
                  value={listingForm.title}
                  onChange={(event) => setListingForm((f) => ({ ...f, title: event.target.value }))}
                />
              </div>
              <div className={[styles.field, styles.full].join(' ')}>
                <label htmlFor="listing-description">Descrição comercial</label>
                <textarea
                  id="listing-description"
                  className={styles.textarea}
                  minLength={20}
                  maxLength={2500}
                  required
                  value={listingForm.description}
                  onChange={(event) => setListingForm((f) => ({ ...f, description: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="listing-audience">Audiência / público</label>
                <input
                  id="listing-audience"
                  className={styles.input}
                  maxLength={80}
                  placeholder="Ex.: 18–34, competitivo"
                  value={listingForm.audience}
                  onChange={(event) => setListingForm((f) => ({ ...f, audience: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="listing-price">Valor base ({profileForm.currencyCode})</label>
                <input
                  id="listing-price"
                  className={styles.input}
                  type="number"
                  min={0}
                  max={1000000}
                  step="0.01"
                  required
                  value={listingForm.price}
                  onChange={(event) => setListingForm((f) => ({ ...f, price: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="listing-stock">Estoque / vagas</label>
                <input
                  id="listing-stock"
                  className={styles.input}
                  type="number"
                  min={0}
                  max={1000000}
                  required
                  value={listingForm.stock}
                  onChange={(event) => setListingForm((f) => ({ ...f, stock: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="listing-image">Imagem HTTPS (opcional)</label>
                <input
                  id="listing-image"
                  className={styles.input}
                  type="url"
                  maxLength={1000}
                  placeholder="https://..."
                  value={listingForm.imageUrl}
                  onChange={(event) => setListingForm((f) => ({ ...f, imageUrl: event.target.value }))}
                />
              </div>
              {listingError && <div className={[styles.errorBox, styles.full].join(' ')}>{listingError}</div>}
              <div className={styles.full}>
                <button type="submit" className={styles.button} disabled={creatingListing}>
                  {creatingListing ? 'Publicando…' : 'CRIAR COMO RASCUNHO'}
                </button>
              </div>
            </form>
          </section>
        )}

        {seller && (
          <section className={styles.panel}>
            <h2>Anúncios</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Anúncio</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Estoque</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboard?.listings.length ?? 0) === 0 && (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        Nenhum anúncio criado. Seu primeiro anúncio começará como rascunho.
                      </td>
                    </tr>
                  )}
                  {dashboard?.listings.map((listing) => (
                    <tr key={listing.id}>
                      <td>{listing.title}</td>
                      <td>{LISTING_KIND_LABELS[listing.kind]}</td>
                      <td>{listing.priceCents ? formatMoney(listing.priceCents, listing.currencyCode) : 'Sob proposta'}</td>
                      <td>{listing.stockQuantity}</td>
                      <td>
                        <span className={[styles.statusBadge, styles[`status${listing.status}`]].join(' ')}>
                          {STATUS_LABELS[listing.status]}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        {LISTING_STATUS_ACTIONS[listing.status].length === 0 && '—'}
                        {LISTING_STATUS_ACTIONS[listing.status].map((action) => (
                          <button
                            key={action.to}
                            type="button"
                            className={[styles.actionButton, styles[action.variant]].join(' ')}
                            disabled={pendingAction === `listing:${listing.id}`}
                            onClick={() => handleListingStatus(listing, action.to)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {seller && (
          <section className={styles.panel}>
            <h2>Pedidos e propostas</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Comprador</th>
                    <th>Anúncio</th>
                    <th>Total</th>
                    <th>Briefing</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboard?.orders.length ?? 0) === 0 && (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        Nenhum pedido recebido até agora.
                      </td>
                    </tr>
                  )}
                  {dashboard?.orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.buyerDisplayName}</td>
                      <td>
                        {order.listingTitle} × {order.quantity}
                      </td>
                      <td>{formatMoney(order.totalCents, order.currencyCode)}</td>
                      <td className={styles.brief} title={order.brief}>
                        {order.brief}
                      </td>
                      <td>
                        <span className={[styles.statusBadge, styles[`status${order.status}`]].join(' ')}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        {ORDER_STATUS_ACTIONS[order.status].length === 0 && '—'}
                        {ORDER_STATUS_ACTIONS[order.status].map((action) => (
                          <button
                            key={action.to}
                            type="button"
                            className={[styles.actionButton, styles[action.variant]].join(' ')}
                            disabled={pendingAction === `order:${order.id}`}
                            onClick={() => handleOrderStatus(order, action.to)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
