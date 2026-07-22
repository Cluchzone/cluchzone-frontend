# features/

Código organizado por domínio de negócio: `auth/`, `navbar/`, `games/`, `pubg/`,
`teams/`, `tournaments/`, `marketplace/`, `seller-erp/`, `passport/`, `chat/`,
`inventory/`. Cada feature reúne seus componentes, hooks e serviços próprios e
consome o `design-system/` e o `core/`.

`games/` é composição compartilhada entre páginas de jogo (ex.: `GameSignatureKit`,
porte de `game-personality.js` — já era um componente único reaproveitado entre
cs2/pubg/brawl no legado, não uma abstração nova desta migração).

`pubg/` tem lógica de domínio real (diferente de `brawlstars`, que ficou
inteiro em `pages/` por ser majoritariamente estático): `AirplaneLobby`
gerencia seleção de assento, timer e persistência do lobby do avião via
`/api/store/cluchzone_pubg_tournaments`.

Uma feature pode expor componentes de página compostos, mas as páginas em si
(pontos de entrada de rota) ficam em `pages/`.
