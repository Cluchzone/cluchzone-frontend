# ⚠️ Diretório CONGELADO

`clutchzone-app/` foi uma tentativa anterior de evolução do frontend (Vite + TS
vanilla, sem framework de UI). A migração real acontece em **`web/`** (React +
Vite + TS) — ver `CONTRIBUTING.md` e o plano de migração faseada.

**Não edite, não estenda e não importe nada deste diretório.** Ele está acoplado
ao legado da raiz de formas que a nova arquitetura precisa desfazer (o
`vite.config.ts` lê arquivos JS/CSS direto da raiz; `auth-service.ts` tem uma
ponte reversa para `window.ClutchAuth`).

Peças de **lógica pura** daqui (ex.: `src/core/api`, `bracket-engine.ts`,
`sanitize.ts`, os `STORAGE_KEYS`) podem ser portadas para `web/` por **cópia
deliberada e revisada**, nunca por reuso da pasta.

Este diretório será **removido na Fase 5** da migração.
