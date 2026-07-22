# features/

Código organizado por domínio de negócio: `auth/`, `navbar/`, `games/`,
`teams/`, `tournaments/`, `marketplace/`, `seller-erp/`, `passport/`, `chat/`,
`inventory/`. Cada feature reúne seus componentes, hooks e serviços próprios e
consome o `design-system/` e o `core/`.

`games/` é composição compartilhada entre páginas de jogo (ex.: `GameSignatureKit`,
porte de `game-personality.js` — já era um componente único reaproveitado entre
cs2/pubg/brawl no legado, não uma abstração nova desta migração).

Uma feature pode expor componentes de página compostos, mas as páginas em si
(pontos de entrada de rota) ficam em `pages/`.
