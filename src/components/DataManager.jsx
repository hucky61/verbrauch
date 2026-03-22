export default function DataManager({ fillups, onImport }) {
  // ── Export JSON ──────────────────────────────────────────────
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(fillups, null, 2)], { type: 'application/json' })
    download(blob, 'verbrauch-export.json')
  }

  // ── Export CSV ───────────────────────────────────────────────
  const exportCSV = () => {
    const header = 'Datum,km-Stand,Liter,Preis/L,Gesamt,Kraftstoff,Nicht voll'
    const rows = fillups.map(f =>
      [f.date, f.odometer, f.liters.toFixed(2), f.pricePerLiter.toFixed(3),
       f.totalPrice.toFixed(2), f.fuelType, f.notFull ? 'ja' : 'nein'].join(',')
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    download(blob, 'verbrauch-export.csv')
  }

  // ── Import JSON ──────────────────────────────────────────────
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) throw new Error('Kein Array')
        onImport(data)
        alert(`✅ ${data.length} Einträge importiert.`)
      } catch {
        alert('❌ Ungültige Datei. Bitte eine gültige JSON-Exportdatei wählen.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="card">
      <p className="card-title">💾 Daten verwalten</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button className="btn-secondary" onClick={exportJSON} id="btn-export-json">
          ⬇ Export JSON
        </button>
        <button className="btn-secondary" onClick={exportCSV} id="btn-export-csv">
          ⬇ Export CSV
        </button>
        <label className="btn-secondary" style={{ cursor: 'pointer' }} id="btn-import-label">
          ⬆ Import JSON
          <input
            id="input-import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
        Import ersetzt alle vorhandenen Daten durch die importierten Einträge.
      </p>
    </div>
  )
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
