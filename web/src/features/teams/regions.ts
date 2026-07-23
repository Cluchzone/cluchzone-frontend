/** Espelha communityRegionCodes (clutchzone-backend/src/modules/global/globalization.catalog.ts). */
export const REGION_OPTIONS = [
  { value: 'south-america', label: 'South America / América do Sul' },
  { value: 'north-america', label: 'North America / América do Norte' },
  { value: 'europe', label: 'Europe / Europa' },
  { value: 'middle-east', label: 'Middle East / Oriente Médio' },
  { value: 'africa', label: 'Africa / África' },
  { value: 'asia', label: 'Asia / Ásia' },
  { value: 'oceania', label: 'Oceania' },
] as const

const REGION_LABELS_PT: Record<string, string> = {
  'south-america': 'América do Sul',
  'north-america': 'América do Norte',
  europe: 'Europa',
  'middle-east': 'Oriente Médio',
  africa: 'África',
  asia: 'Ásia',
  oceania: 'Oceania',
}

export function regionLabelPt(region: string): string {
  return REGION_LABELS_PT[region] ?? region
}
