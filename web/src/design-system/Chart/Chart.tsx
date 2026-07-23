import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type ChartType,
} from 'chart.js'
import { useEffect, useRef } from 'react'

// Registro pontual (só os tipos usados no Passaporte: line/bar/doughnut) em vez
// de `registerables` inteiro — evita puxar radar/bubble/scatter/financial etc.
// no bundle por uma feature que usa 3 de ~12 tipos de gráfico do Chart.js.
ChartJS.register(
  LineController,
  BarController,
  DoughnutController,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Filler,
  Legend,
  Tooltip,
)

type ChartProps<T extends ChartType> = {
  type: T
  data: ChartData<T>
  options?: ChartOptions<T>
}

/**
 * Porte do Chart.js do CDN (`chart.umd.min.js`, passport.html) para npm.
 * Cria a instância no mount e a destrói no unmount/troca de props — o Chart.js
 * não desmonta sozinho ao remover o `<canvas>` do DOM, então sem isso cada
 * visita à aba de estatísticas empilharia uma instância nova (memory leak).
 */
export function Chart<T extends ChartType>({ type, data, options }: ChartProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartJS<T> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    chartRef.current = new ChartJS(canvas, { type, data, options })
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, data, options])

  return <canvas ref={canvasRef} />
}
