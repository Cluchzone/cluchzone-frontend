# core/

Infraestrutura transversal, sem UI: cliente HTTP para o backend (`api/`),
serviço de sessão/auth (fetch direto ao backend, cookies `HttpOnly` —
**nunca** reimplementar auth aqui), storage keys, config de ambiente.

Peças de lógica pura do `clutchzone-app/` legado (ex.: `core/api`,
`bracket-engine.ts`, `sanitize.ts`, `STORAGE_KEYS`) são portadas por **cópia
deliberada** para cá, não por reuso da pasta antiga.

Regras de segurança (ver `SECURITY.md`/`CLAUDE.md` da raiz): identidade,
sessão, Steam OpenID e roles pertencem exclusivamente ao backend. O frontend
nunca confia em ID vindo do browser como autorização, nem guarda identidade em
`localStorage`.
