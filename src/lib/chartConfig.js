import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend,
  LineElement, LinearScale, PointElement, Tooltip,
} from 'chart.js'

ChartJS.register(
  ArcElement, BarElement, CategoryScale, Filler, Legend,
  LineElement, LinearScale, PointElement, Tooltip,
)

ChartJS.defaults.font.family =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'
ChartJS.defaults.borderColor = 'rgba(148, 163, 184, 0.2)'
ChartJS.defaults.plugins.legend.labels.usePointStyle = true
ChartJS.defaults.plugins.legend.labels.boxWidth = 8
ChartJS.defaults.plugins.legend.labels.padding = 16
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)'
ChartJS.defaults.plugins.tooltip.titleColor = '#fff'
ChartJS.defaults.plugins.tooltip.bodyColor = '#e2e8f0'
ChartJS.defaults.plugins.tooltip.padding = 12
ChartJS.defaults.plugins.tooltip.cornerRadius = 12
ChartJS.defaults.plugins.tooltip.boxPadding = 6

export function applyTheme(isDark) {
  ChartJS.defaults.color = isDark ? '#cbd5e1' : '#475569'
  ChartJS.defaults.borderColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)'
}
