# features/

Código organizado por domínio de negócio: `auth/`, `navbar/`, `teams/`,
`tournaments/`, `marketplace/`, `seller-erp/`, `passport/`, `chat/`,
`inventory/`. Cada feature reúne seus componentes, hooks e serviços próprios e
consome o `design-system/` e o `core/`.

Uma feature pode expor componentes de página compostos, mas as páginas em si
(pontos de entrada de rota) ficam em `pages/`.
