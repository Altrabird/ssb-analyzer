import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend,
  LineElement, LinearScale, PointElement, Tooltip,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import dataLabelsPlugin from 'chartjs-plugin-datalabels'

ChartJS.register(
  ArcElement, BarElement, CategoryScale, Filler, Legend,
  LineElement, LinearScale, PointElement, Tooltip,
  annotationPlugin, dataLabelsPlugin,
)

// Disable datalabels by default — opt-in per chart by setting options.plugins.datalabels.display
ChartJS.defaults.plugins.datalabels = ChartJS.defaults.plugins.datalabels || {}
ChartJS.defaults.plugins.datalabels.display = false

ChartJS.defaults.font.family =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'
ChartJS.defaults.borderColor = 'rgba(148, 163, 184, 0.18)'
ChartJS.defaults.plugins.legend.labels.usePointStyle = true
ChartJS.defaults.plugins.legend.labels.boxWidth = 8
ChartJS.defaults.plugins.legend.labels.padding = 16
ChartJS.defaults.plugins.tooltip.enabled = true
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.96)'
ChartJS.defaults.plugins.tooltip.titleColor = '#ffffff'
ChartJS.defaults.plugins.tooltip.titleFont = { weight: '600', size: 13 }
ChartJS.defaults.plugins.tooltip.bodyColor = '#e2e8f0'
ChartJS.defaults.plugins.tooltip.bodyFont = { size: 12 }
ChartJS.defaults.plugins.tooltip.padding = 12
ChartJS.defaults.plugins.tooltip.cornerRadius = 12
ChartJS.defaults.plugins.tooltip.boxPadding = 6
ChartJS.defaults.plugins.tooltip.displayColors = true
ChartJS.defaults.plugins.tooltip.usePointStyle = true
ChartJS.defaults.plugins.tooltip.caretPadding = 8

// Reduced-motion: if user has prefers-reduced-motion, disable Chart.js animations
const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
if (prefersReducedMotion) {
  ChartJS.defaults.animation = false
  ChartJS.defaults.animations = { colors: false, x: false, y: false }
} else {
  ChartJS.defaults.animation.duration = 700
  ChartJS.defaults.animation.easing = 'easeOutCubic'
}

export function applyTheme(isDark) {
  ChartJS.defaults.color = isDark ? '#cbd5e1' : '#475569'
  ChartJS.defaults.borderColor = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.18)'
  ChartJS.defaults.plugins.tooltip.backgroundColor = isDark
    ? 'rgba(2, 6, 23, 0.96)'
    : 'rgba(15, 23, 42, 0.96)'
}

// Canvas-context gradient helpers (cached per dataset/chart re-render).
export function makeBarGradient(ctx, color, dir = 'horizontal') {
  if (!ctx) return color
  const { chartArea } = ctx
  if (!chartArea) return color
  const g = dir === 'horizontal'
    ? ctx.ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
    : ctx.ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  g.addColorStop(0, color + 'cc')
  g.addColorStop(1, color)
  return g
}

export function makeAreaGradient(ctx, color) {
  if (!ctx) return color + '33'
  const { chartArea } = ctx
  if (!chartArea) return color + '33'
  const g = ctx.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  g.addColorStop(0, color + '55')
  g.addColorStop(1, color + '00')
  return g
}

// Threshold annotation factory — dashed horizontal lines for 75% / 50% benchmarks.
export function thresholdAnnotations({ axis = 'y' } = {}) {
  return {
    good: {
      type: 'line',
      [`${axis}Min`]: 75,
      [`${axis}Max`]: 75,
      borderColor: 'rgba(16, 185, 129, 0.55)',
      borderWidth: 1.5,
      borderDash: [6, 6],
      label: {
        display: true,
        content: 'Sasaran 75%',
        position: 'end',
        backgroundColor: 'rgba(16, 185, 129, 0.92)',
        color: '#fff',
        font: { size: 10, weight: '600' },
        padding: { x: 6, y: 2 },
        borderRadius: 6,
      },
    },
    warn: {
      type: 'line',
      [`${axis}Min`]: 50,
      [`${axis}Max`]: 50,
      borderColor: 'rgba(245, 158, 11, 0.45)',
      borderWidth: 1.5,
      borderDash: [4, 6],
      label: {
        display: true,
        content: 'Amaran 50%',
        position: 'start',
        backgroundColor: 'rgba(245, 158, 11, 0.92)',
        color: '#fff',
        font: { size: 10, weight: '600' },
        padding: { x: 6, y: 2 },
        borderRadius: 6,
      },
    },
  }
}

// Tooltip footer formatter — adds context like "vs purata" delta.
export function deltaFooter(avg) {
  return (items) => {
    if (!items?.length) return ''
    const value = items[0].parsed?.x ?? items[0].parsed?.y ?? items[0].parsed
    if (typeof value !== 'number' || avg == null) return ''
    const diff = +(value - avg).toFixed(1)
    if (diff === 0) return 'Tepat seperti purata'
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff}% berbanding purata (${avg.toFixed(1)}%)`
  }
}
