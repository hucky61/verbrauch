function StatCard({ icon, label, value, unit, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{icon} {label}</div>
      {value !== null && value !== undefined ? (
        <div className="stat-value" style={color ? { color } : {}}>
          {value} <span className="stat-unit">{unit}</span>
        </div>
      ) : (
        <div className="stat-value" style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          – <span className="stat-unit">Noch keine Daten</span>
        </div>
      )}
    </div>
  )
}

export default function StatsPanel({ stats, count }) {
  const { avgConsumption, totalCost, totalLiters, totalKm, avgPricePerLiter } = stats

  const consumptionColor = avgConsumption === null ? null
    : avgConsumption <= 6 ? 'var(--green)'
    : avgConsumption <= 9 ? 'var(--yellow)'
    : 'var(--red)'

  return (
    <div className="stats-grid">
      <StatCard
        icon="📊"
        label="Ø Verbrauch"
        value={avgConsumption !== null ? avgConsumption.toFixed(2) : null}
        unit="L / 100 km"
        color={consumptionColor}
      />
      <StatCard
        icon="🛣️"
        label="Gesamtstrecke"
        value={totalKm > 0 ? totalKm.toLocaleString('de-DE') : null}
        unit="km"
      />
      <StatCard
        icon="💰"
        label="Gesamtkosten"
        value={totalCost > 0 ? totalCost.toFixed(2) : null}
        unit="€"
      />
      <StatCard
        icon="🪣"
        label="Getankte Liter"
        value={totalLiters > 0 ? totalLiters.toFixed(1) : null}
        unit="L"
      />
      <StatCard
        icon="🏷️"
        label="Ø Preis / Liter"
        value={avgPricePerLiter !== null ? avgPricePerLiter.toFixed(3) : null}
        unit="€"
      />
      <StatCard
        icon="🔢"
        label="Tankfüllungen"
        value={count}
        unit="Einträge"
      />
    </div>
  )
}
