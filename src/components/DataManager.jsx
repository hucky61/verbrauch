import * as XLSX from 'xlsx'

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

  // ── Import Excel ─────────────────────────────────────────────
  const handleExcelImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

        if (!rawRows || rawRows.length === 0) {
          throw new Error('Die Excel-Datei ist leer.')
        }

        const DATE_KEYS = ['datum', 'date', 'zeit', 'tag']
        const ODOMETER_KEYS = ['km', 'kilometer', 'odometer', 'tacho', 'stand']
        const LITERS_KEYS = ['liter', 'menge', 'volumen', 'anzahl']
        const PRICE_PER_LITER_KEYS = ['preisl', 'preis/l', 'literpreis', 'price/l', 'priceperliter', 'preisproliter', 'preis/liter', 'price/liter']
        const TOTAL_PRICE_KEYS = ['gesamt', 'total', 'kosten', 'betrag', 'summe']
        const FUEL_TYPE_KEYS = ['kraftstoff', 'fuel', 'typ', 'type']
        const NOT_FULL_KEYS = ['nichtvoll', 'nicht-voll', 'teil', 'partial', 'notfull', 'not-full']

        const findValue = (row, keywords) => {
          for (const key of Object.keys(row)) {
            const normKey = key.toLowerCase().trim().replace(/[^a-z0-9/]/g, '')
            if (keywords.some(kw => normKey.includes(kw))) {
              return row[key]
            }
          }
          return undefined
        }

        const parseNum = (val) => {
          if (typeof val === 'number') return val
          if (typeof val === 'string') {
            const clean = val.replace(/\s/g, '').replace(',', '.')
            const parsed = parseFloat(clean)
            return isNaN(parsed) ? undefined : parsed
          }
          return undefined
        }

        const parsedEntries = []

        for (const row of rawRows) {
          const rawDate = findValue(row, DATE_KEYS)
          const rawOdo = findValue(row, ODOMETER_KEYS)
          const rawLiters = findValue(row, LITERS_KEYS)
          const rawPriceL = findValue(row, PRICE_PER_LITER_KEYS)
          const rawTotal = findValue(row, TOTAL_PRICE_KEYS)
          const rawFuel = findValue(row, FUEL_TYPE_KEYS)
          const rawNotFull = findValue(row, NOT_FULL_KEYS)

          // Require at least Date and Odometer
          if (rawDate === undefined || rawOdo === undefined) {
            continue
          }

          // Parse Date
          let dateStr = ''
          if (rawDate instanceof Date && !isNaN(rawDate)) {
            const y = rawDate.getFullYear()
            const m = String(rawDate.getMonth() + 1).padStart(2, '0')
            const d = String(rawDate.getDate()).padStart(2, '0')
            dateStr = `${y}-${m}-${d}`
          } else if (typeof rawDate === 'string') {
            const germanMatch = rawDate.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
            if (germanMatch) {
              dateStr = `${germanMatch[3]}-${germanMatch[2].padStart(2, '0')}-${germanMatch[1].padStart(2, '0')}`
            } else {
              const d = new Date(rawDate)
              if (!isNaN(d.getTime())) {
                const y = d.getFullYear()
                const m = String(d.getMonth() + 1).padStart(2, '0')
                const dateD = String(d.getDate()).padStart(2, '0')
                dateStr = `${y}-${m}-${dateD}`
              }
            }
          } else if (typeof rawDate === 'number') {
            const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000))
            if (!isNaN(d.getTime())) {
              const y = d.getFullYear()
              const m = String(d.getMonth() + 1).padStart(2, '0')
              const dateD = String(d.getDate()).padStart(2, '0')
              dateStr = `${y}-${m}-${dateD}`
            }
          }

          if (!dateStr) {
            continue
          }

          const odometer = Math.round(parseNum(rawOdo))
          if (isNaN(odometer)) continue

          let liters = parseNum(rawLiters) || 0
          let pricePerLiter = parseNum(rawPriceL) || 0
          let totalPrice = parseNum(rawTotal) || 0

          // Calculate missing numerical fields if possible
          if (totalPrice === 0 && liters > 0 && pricePerLiter > 0) {
            totalPrice = liters * pricePerLiter
          } else if (pricePerLiter === 0 && totalPrice > 0 && liters > 0) {
            pricePerLiter = totalPrice / liters
          } else if (liters === 0 && totalPrice > 0 && pricePerLiter > 0) {
            liters = totalPrice / pricePerLiter
          }

          const fuelType = typeof rawFuel === 'string' && rawFuel.trim() ? rawFuel.trim() : 'Super 95'

          let notFull = false
          if (rawNotFull !== undefined) {
            if (typeof rawNotFull === 'boolean') {
              notFull = rawNotFull
            } else if (typeof rawNotFull === 'number') {
              notFull = rawNotFull === 1
            } else if (typeof rawNotFull === 'string') {
              const cleanVal = rawNotFull.toLowerCase().trim()
              notFull = cleanVal === 'ja' || cleanVal === 'yes' || cleanVal === 'true' || cleanVal === '1'
            }
          }

          parsedEntries.push({
            id: Date.now() + Math.random(),
            date: dateStr,
            odometer,
            liters,
            pricePerLiter,
            totalPrice,
            fuelType,
            notFull
          })
        }

        if (parsedEntries.length === 0) {
          alert('❌ Keine gültigen Daten in der Excel-Datei gefunden. Stellen Sie sicher, dass mindestens die Spalten für Datum und km-Stand vorhanden sind.')
          return
        }

        onImport(parsedEntries)
        alert(`✅ ${parsedEntries.length} Einträge erfolgreich aus Excel-Datei importiert.`)
      } catch (err) {
        console.error(err)
        alert('❌ Fehler beim Importieren der Excel-Datei: ' + err.message)
      }
    }

    reader.readAsArrayBuffer(file)
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
        <label className="btn-secondary" style={{ cursor: 'pointer' }} id="btn-import-excel-label">
          🟢 Import Excel
          <input
            id="input-import-excel-file"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelImport}
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
