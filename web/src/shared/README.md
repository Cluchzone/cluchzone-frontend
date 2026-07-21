# shared/

Utilitários genéricos sem domínio nem UI: helpers de formatação (`money`,
`formatCurrency`), `escapeHtml`/sanitização, `byId`, tipos compartilhados.

Objetivo explícito da migração: eliminar a duplicação literal desses helpers
que hoje existe no legado (ex.: `byId`/`money`/`formatCurrency` copiados entre
`marketplace.js` e `seller-erp.js`). Aqui eles têm um dono único.
