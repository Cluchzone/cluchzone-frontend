import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '@/design-system/Modal'
import { useToast } from '@/design-system/Toast'
import { useAuth } from '@/features/auth'
import { HttpError } from '@/core/http'
import {
  formatMoney,
  LISTING_KIND_GLYPHS,
  LISTING_KIND_LABELS,
  marketplaceService,
  type ListingKind,
  type ListingView,
} from '@/features/marketplace'
import styles from './MarketplacePage.module.css'

function safeImage(url: string | null): string {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' ? parsed.href : ''
  } catch {
    return ''
  }
}

/** Porte de marketplace.html. Já falava com endpoints reais no legado — sem contrato de localStorage a substituir. */
export function MarketplacePage() {
  const { state, login } = useAuth()
  const toast = useToast()

  const [kind, setKind] = useState<ListingKind | ''>('')
  const [game, setGame] = useState('')
  const [query, setQuery] = useState('')
  const [listings, setListings] = useState<ListingView[] | null>(null)
  const [listError, setListError] = useState('')

  const [selectedListing, setSelectedListing] = useState<ListingView | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [brief, setBrief] = useState('')
  const [orderError, setOrderError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function loadListings() {
    setListError('')
    setListings(null)
    try {
      const fresh = await marketplaceService.listListings({
        ...(kind ? { kind } : {}),
        ...(game.trim() ? { game: game.trim() } : {}),
        ...(query.trim() ? { q: query.trim() } : {}),
      })
      setListings(fresh)
    } catch (error) {
      setListings([])
      setListError(error instanceof HttpError ? error.message : 'A vitrine não pôde ser sincronizada agora.')
    }
  }

  useEffect(() => {
    void loadListings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFilterSubmit(event: FormEvent) {
    event.preventDefault()
    void loadListings()
  }

  function openOrder(listing: ListingView) {
    if (state !== 'authenticated') {
      login()
      return
    }
    setSelectedListing(listing)
    setQuantity(1)
    setBrief('')
    setOrderError('')
  }

  function closeOrder() {
    setSelectedListing(null)
  }

  const maxQuantity = selectedListing
    ? selectedListing.kind === 'PRODUCT'
      ? Math.max(1, Math.min(100, selectedListing.stockQuantity))
      : 1
    : 1

  const orderTotal =
    selectedListing && selectedListing.priceCents
      ? formatMoney(selectedListing.priceCents * quantity, selectedListing.currencyCode)
      : 'A definir com o vendedor'

  async function handleSubmitOrder(event: FormEvent) {
    event.preventDefault()
    if (!selectedListing) return
    setOrderError('')

    if (brief.trim().length < 10) {
      setOrderError('O briefing precisa ter pelo menos 10 caracteres.')
      return
    }

    setSubmitting(true)
    try {
      await marketplaceService.createOrder(selectedListing.id, { quantity, brief: brief.trim() })
      closeOrder()
      toast('Pedido enviado. O vendedor já pode acompanhar a solicitação no ERP.', 'success')
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) login()
      else setOrderError(error instanceof HttpError ? error.message : 'Não foi possível enviar o pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>CLUTCH BUSINESS NETWORK</p>
          <h1>
            Marcas encontram <span>audiência.</span> Criadores encontram oportunidades.
          </h1>
          <p className={styles.heroLead}>
            Um ambiente competitivo para patrocínios, ativações com streamers e produtos gamer. As negociações
            começam aqui; identidade e pedidos são validados no backend da ClutchZone.
          </p>
          <Link to="/seller-erp" className={styles.sellerCta}>
            Já vende na CLUTCHZONE? Acesse o ERP do vendedor →
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <strong>3</strong>
            <span>frentes comerciais</span>
          </div>
          <div className={styles.stat}>
            <strong>24/7</strong>
            <span>vitrine disponível</span>
          </div>
          <div className={styles.stat}>
            <strong>1×</strong>
            <span>login Steam</span>
          </div>
          <div className={styles.stat}>
            <strong>100%</strong>
            <span>pedidos rastreáveis</span>
          </div>
        </div>
      </section>

      <section className={styles.paths}>
        <article className={styles.path}>
          <div className={styles.pathIcon}>◎</div>
          <h2>Patrocínios</h2>
          <p>Projetos para equipes, campeonatos, naming rights, mídia e ativações dentro da comunidade.</p>
        </article>
        <article className={styles.path}>
          <div className={styles.pathIcon}>◉</div>
          <h2>Streamers</h2>
          <p>Publis, transmissões, presença em eventos e pacotes de conteúdo por jogo e audiência.</p>
        </article>
        <article className={styles.path}>
          <div className={styles.pathIcon}>◇</div>
          <h2>Produtos</h2>
          <p>Equipamentos, colecionáveis e itens comerciais com estoque controlado pelo vendedor.</p>
        </article>
      </section>

      <section>
        <form className={styles.toolbar} onSubmit={handleFilterSubmit}>
          <div className={styles.field}>
            <label htmlFor="market-search">Buscar oportunidade</label>
            <input
              id="market-search"
              className={styles.input}
              maxLength={100}
              placeholder="Marca, produto, streamer..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="market-kind">Categoria</label>
            <select
              id="market-kind"
              className={styles.select}
              value={kind}
              onChange={(event) => setKind(event.target.value as ListingKind | '')}
            >
              <option value="">Todas</option>
              <option value="SPONSORSHIP">Patrocínios</option>
              <option value="STREAMER_SERVICE">Streamers</option>
              <option value="PRODUCT">Produtos</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="market-game">Jogo</label>
            <input
              id="market-game"
              className={styles.input}
              maxLength={60}
              placeholder="CS2, PUBG..."
              value={game}
              onChange={(event) => setGame(event.target.value)}
            />
          </div>
          <button className={styles.button} type="submit">
            FILTRAR RADAR
          </button>
        </form>

        <div className={styles.sectionHead}>
          <div>
            <h2>Oportunidades em destaque</h2>
            <p>Somente anúncios publicados aparecem nesta vitrine.</p>
          </div>
          <span className={styles.count}>
            {listings === null
              ? 'CARREGANDO'
              : listError
                ? 'INDISPONÍVEL'
                : `${listings.length} ${listings.length === 1 ? 'ANÚNCIO' : 'ANÚNCIOS'}`}
          </span>
        </div>

        {listError && <div className={styles.errorBox}>{listError}</div>}

        <div className={styles.grid}>
          {listings === null && <div className={styles.loading}>Sincronizando oportunidades...</div>}
          {listings !== null && listings.length === 0 && !listError && (
            <div className={styles.empty}>
              Nenhum anúncio publicado corresponde a este radar. Ajuste os filtros ou volte em breve.
            </div>
          )}
          {listings?.map((listing) => {
            const image = safeImage(listing.imageUrl)
            return (
              <article key={listing.id} className={styles.card}>
                <div className={styles.cover}>
                  {image ? (
                    <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <span className={styles.glyph}>{LISTING_KIND_GLYPHS[listing.kind]}</span>
                  )}
                  <span className={styles.kindBadge}>{LISTING_KIND_LABELS[listing.kind]}</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.seller}>
                    <i className={styles.dot} aria-hidden="true" />
                    <span>
                      {listing.seller.storeName}
                      {listing.seller.verified ? ' · verificado' : ''}
                    </span>
                  </div>
                  <h3>{listing.title}</h3>
                  <p className={styles.description}>{listing.description}</p>
                  <div className={styles.meta}>
                    {[listing.game, listing.audience].filter(Boolean).map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                    {listing.kind === 'PRODUCT' && <span>{listing.stockQuantity} em estoque</span>}
                  </div>
                  <div className={styles.bottom}>
                    <div className={styles.price}>
                      <strong>
                        {listing.priceCents ? formatMoney(listing.priceCents, listing.currencyCode) : 'Sob proposta'}
                      </strong>
                      <small>{listing.kind === 'PRODUCT' ? 'por unidade' : 'valor base'}</small>
                    </div>
                    <button
                      type="button"
                      className={styles.button}
                      disabled={listing.kind === 'PRODUCT' && listing.stockQuantity < 1}
                      onClick={() => openOrder(listing)}
                    >
                      {listing.kind === 'PRODUCT' ? 'COMPRAR' : 'NEGOCIAR'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <Modal open={selectedListing !== null} onOpenChange={(open) => !open && closeOrder()} title="Iniciar negociação">
        {selectedListing && (
          <form className={styles.orderForm} onSubmit={handleSubmitOrder}>
            <p className={styles.orderListingName}>
              {selectedListing.title} · {selectedListing.seller.storeName}
            </p>
            <div className={styles.orderGrid}>
              <div className={styles.field}>
                <label htmlFor="order-quantity">Quantidade</label>
                <input
                  id="order-quantity"
                  className={styles.input}
                  type="number"
                  min={1}
                  max={maxQuantity}
                  required
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Math.min(maxQuantity, Number(event.target.value))))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="order-total">Total estimado</label>
                <input id="order-total" className={styles.input} readOnly value={orderTotal} />
              </div>
              <div className={[styles.field, styles.full].join(' ')}>
                <label htmlFor="order-brief">Briefing para o vendedor</label>
                <textarea
                  id="order-brief"
                  className={styles.textarea}
                  minLength={10}
                  maxLength={500}
                  required
                  placeholder="Conte o objetivo, prazo e detalhes da parceria ou compra."
                  value={brief}
                  onChange={(event) => setBrief(event.target.value)}
                />
              </div>
            </div>
            {orderError && <div className={styles.errorBox}>{orderError}</div>}
            <div className={styles.orderActions}>
              <button type="button" className={[styles.button, styles.secondary].join(' ')} onClick={closeOrder}>
                CANCELAR
              </button>
              <button type="submit" className={styles.button} disabled={submitting}>
                ENVIAR PEDIDO
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
