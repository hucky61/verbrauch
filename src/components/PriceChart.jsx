import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function PriceChart({ fillups }) {
  if (fillups.length < 2) {
    return (
      <div className="card">
        <p className="card-title">🏷️ Kraftstoffpreis-Verlauf</p>
        <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
          <div className="empty-state-icon">💸</div>
          <p>Mindestens 2 Tankfüllungen erforderlich.</p>
        </div>
      </div>
    )
  }

  const labels = fillups.map(f =>
    new Date(f.date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
  )
  const prices = fillups.map(f => +f.pricePerLiter.toFixed(3))
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

  const data = {
    labels,
    datasets: [
      {
        label: '€ / Liter',
        data: prices,
        borderColor: 'hsl(35, 90%, 60%)',
        backgroundColor: 'hsla(35, 90%, 60%, 0.12)',
        pointBackgroundColor: 'hsl(35, 90%, 60%)',
        pointBorderColor: 'hsl(222,18%,12%)',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
      },
      {
        label: `Ø ${avgPrice.toFixed(3)} €/L`,
        data: prices.map(() => +avgPrice.toFixed(3)),
        borderColor: 'hsla(35, 90%, 70%, 0.4)',
        borderDash: [6, 4],
        pointRadius: 0,
        tension: 0,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: {
          color: 'hsl(210,12%,60%)',
          font: { family: 'Inter', size: 12 },
          boxWidth: 14,
        },
      },
      tooltip: {
        backgroundColor: 'hsl(222,18%,12%)',
        borderColor: 'hsl(222,14%,22%)',
        borderWidth: 1,
        titleColor: 'hsl(210,20%,95%)',
        bodyColor: 'hsl(210,12%,60%)',
        padding: 12,
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(3)} €`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'hsla(222,14%,22%,0.6)' },
        ticks: { color: 'hsl(210,12%,60%)', font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'hsla(222,14%,22%,0.6)' },
        ticks: {
          color: 'hsl(210,12%,60%)',
          font: { family: 'Inter', size: 11 },
          callback: v => `${v.toFixed(2)} €`,
        },
        suggestedMin: Math.max(0, Math.min(...prices) - 0.1),
        suggestedMax: Math.max(...prices) + 0.1,
      },
    },
  }

  return (
    <div className="card">
      <p className="card-title">🏷️ Kraftstoffpreis-Verlauf</p>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
