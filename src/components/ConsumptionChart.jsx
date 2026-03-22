import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
)

export default function ConsumptionChart({ fillups }) {
  const chartData = fillups.filter(f => f.consumption !== null)

  if (chartData.length < 2) {
    return (
      <div className="card">
        <p className="card-title">📈 Verbrauchsverlauf</p>
        <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
          <div className="empty-state-icon">📉</div>
          <p>Mindestens 2 Tankfüllungen für den Verbrauchsgraphen erforderlich.</p>
        </div>
      </div>
    )
  }

  const labels = chartData.map(f =>
    new Date(f.date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
  )
  const values = chartData.map(f => +f.consumption.toFixed(2))
  const avg = values.reduce((a, b) => a + b, 0) / values.length

  const data = {
    labels,
    datasets: [
      {
        label: 'Verbrauch (L/100km)',
        data: values,
        borderColor: 'hsl(210, 80%, 55%)',
        backgroundColor: 'hsla(210, 80%, 55%, 0.12)',
        pointBackgroundColor: values.map(v =>
          v <= 6 ? 'hsl(145,65%,42%)' : v <= 9 ? 'hsl(45,90%,52%)' : 'hsl(0,70%,55%)'
        ),
        pointBorderColor: 'hsl(222,18%,12%)',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 9,
        tension: 0.4,
        fill: true,
      },
      {
        label: `Ø ${avg.toFixed(2)} L/100km`,
        data: values.map(() => +avg.toFixed(2)),
        borderColor: 'hsla(210, 80%, 70%, 0.4)',
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
          label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} L/100km`,
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
          callback: v => `${v} L`,
        },
        suggestedMin: Math.max(0, Math.min(...values) - 2),
        suggestedMax: Math.max(...values) + 2,
      },
    },
  }

  return (
    <div className="card">
      <p className="card-title">📈 Verbrauchsverlauf</p>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
