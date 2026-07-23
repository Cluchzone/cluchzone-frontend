/**
 * Fonte única para formatar valores em centavos, substituindo as duas
 * reimplementações idênticas de `money()` em marketplace.js e seller-erp.js
 * (o dedupe que esta fase deveria fazer — ver plano da Fase 7).
 */
export function formatMoney(cents: number, currencyCode = 'BRL'): string {
  return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: currencyCode }).format(
    Number(cents || 0) / 100,
  )
}
