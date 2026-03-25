function ConsumptionBadge({ value, notFull }) {
  if (notFull) {
    return <span className="consumption-badge badge-partial">⚠️ Nicht voll</span>
  }
  if (value === null || value === undefined) {
    return <span className="consumption-badge badge-none">Erster Eintrag</span>
  }
  const cls = value <= 6 ? 'badge-green' : value <= 9 ? 'badge-yellow' : 'badge-red'
  const icon = value <= 6 ? '🟢' : value <= 9 ? '🟡' : '🔴'
  return (
    <span className={`consumption-badge ${cls}`}>
      {icon} {value.toFixed(2)} L/100km
    </span>
  )
}

export default function FillupList({ fillups, onDelete, onEdit }) {
  if (!fillups.length) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">⛽</div>
          <h3>Noch keine Einträge</h3>
          <p>Wechsle zum Tab „Erfassen", um deine erste Tankfüllung einzutragen.</p>
        </div>
      </div>
    )
  }

  // Keep ascending order for delta calculation, display in reverse
  const sorted = [...fillups].reverse()
  const totalCount = fillups.length

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>km-Stand</th>
              <th>Δ km</th>
              <th>Liter</th>
              <th>€/L</th>
              <th>Gesamt</th>
              <th>Sorte</th>
              <th>Verbrauch</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              // i=0 is the newest entry; ascending index = totalCount-1-i
              const ascIdx = totalCount - 1 - i
              const prev = fillups[ascIdx - 1]
              const deltaKm = prev ? f.odometer - prev.odometer : null
              return (
              <tr key={f.id}>
                <td>{new Date(f.date + 'T12:00:00').toLocaleDateString('de-DE')}</td>
                <td>{f.odometer.toLocaleString('de-DE')} km</td>
                <td>{deltaKm !== null ? <span className="delta-km">+{deltaKm.toLocaleString('de-DE')}</span> : <span className="text-muted">–</span>}</td>
                <td>{f.liters.toFixed(2)} L</td>
                <td>{f.pricePerLiter.toFixed(3)} €</td>
                <td>{f.totalPrice.toFixed(2)} €</td>
                <td><span className="fuel-type">{f.fuelType}</span></td>
                <td><ConsumptionBadge value={f.consumption} notFull={f.notFull} /></td>
                <td style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <button
                    className="btn-icon"
                    title="Eintrag bearbeiten"
                    onClick={() => onEdit(f)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    title="Eintrag löschen"
                    onClick={() => onDelete(f.id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            )})
          </tbody>
        </table>
      </div>
    </div>
  )
}
