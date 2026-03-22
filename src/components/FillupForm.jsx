import { useState } from 'react'

const today = () => new Date().toISOString().slice(0, 10)

const EMPTY = {
  date: '',
  odometer: '',
  liters: '',
  pricePerLiter: '',
  totalPrice: '',
  fuelType: 'Benzin',
  notFull: false,
}

export default function FillupForm({ onSave, initialValues = null, onCancel, lastOdometer = null }) {
  const editMode = !!initialValues

  const [form, setForm] = useState(() =>
    initialValues
      ? {
          date: initialValues.date,
          odometer: String(initialValues.odometer),
          liters: String(initialValues.liters),
          pricePerLiter: String(initialValues.pricePerLiter),
          totalPrice: String(initialValues.totalPrice),
          fuelType: initialValues.fuelType,
          notFull: initialValues.notFull ?? false,
        }
      : { ...EMPTY, date: today() }
  )
  const [errors, setErrors] = useState({})

  const set = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'liters' || field === 'pricePerLiter') {
        const l = parseFloat(field === 'liters' ? value : next.liters)
        const p = parseFloat(field === 'pricePerLiter' ? value : next.pricePerLiter)
        if (!isNaN(l) && !isNaN(p)) next.totalPrice = (l * p).toFixed(2)
      }
      if (field === 'totalPrice') {
        const l = parseFloat(next.liters)
        const t = parseFloat(value)
        if (!isNaN(l) && l > 0 && !isNaN(t)) next.pricePerLiter = (t / l).toFixed(3)
      }
      return next
    })
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.date) errs.date = 'Datum erforderlich'
    if (!form.odometer || isNaN(+form.odometer) || +form.odometer <= 0)
      errs.odometer = 'Gültiger km-Stand erforderlich'
    else if (!editMode && lastOdometer !== null && +form.odometer <= lastOdometer)
      errs.odometer = `Muss größer als letzter km-Stand sein (${lastOdometer.toLocaleString('de-DE')} km)`
    if (!form.liters || isNaN(+form.liters) || +form.liters <= 0)
      errs.liters = 'Liter erforderlich'
    if (!form.pricePerLiter || isNaN(+form.pricePerLiter) || +form.pricePerLiter <= 0)
      errs.pricePerLiter = 'Preis/Liter erforderlich'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    onSave({
      date: form.date,
      odometer: +form.odometer,
      liters: +form.liters,
      pricePerLiter: +form.pricePerLiter,
      totalPrice: +form.totalPrice || +(+form.liters * +form.pricePerLiter).toFixed(2),
      fuelType: form.fuelType,
      notFull: form.notFull,
    })

    if (!editMode) {
      setForm({ ...EMPTY, date: today() })
      setErrors({})
    }
  }

  return (
    <div className={editMode ? '' : 'card'}>
      {!editMode && <p className="card-title">⛽ Neue Tankfüllung erfassen</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Datum</label>
            <input id="input-date" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label>Kilometerstand (km)</label>
            <input id="input-odometer" type="number" min="0" step="1"
              placeholder={lastOdometer ? `Letzter: ${lastOdometer.toLocaleString('de-DE')}` : 'z. B. 45230'}
              value={form.odometer} onChange={e => set('odometer', e.target.value)} />
            {errors.odometer && <span className="form-error">{errors.odometer}</span>}
          </div>

          <div className="form-group">
            <label>Getankte Liter</label>
            <input id="input-liters" type="number" min="0" step="0.01" placeholder="z. B. 42.50"
              value={form.liters} onChange={e => set('liters', e.target.value)} />
            {errors.liters && <span className="form-error">{errors.liters}</span>}
          </div>

          <div className="form-group">
            <label>Preis / Liter (€)</label>
            <input id="input-price-per-liter" type="number" min="0" step="0.001" placeholder="z. B. 1.829"
              value={form.pricePerLiter} onChange={e => set('pricePerLiter', e.target.value)} />
            {errors.pricePerLiter && <span className="form-error">{errors.pricePerLiter}</span>}
          </div>

          <div className="form-group">
            <label>Gesamtpreis (€)</label>
            <input id="input-total-price" type="number" min="0" step="0.01" placeholder="Auto-berechnet"
              value={form.totalPrice} onChange={e => set('totalPrice', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Kraftstoffsorte</label>
            <select id="select-fuel-type" value={form.fuelType} onChange={e => set('fuelType', e.target.value)}>
              <option>Benzin</option>
              <option>E10</option>
              <option>Super Plus</option>
              <option>Diesel</option>
              <option>Autogas (LPG)</option>
              <option>Elektro</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            id="input-not-full"
            type="checkbox"
            checked={form.notFull}
            onChange={e => setForm(prev => ({ ...prev, notFull: e.target.checked }))}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Nicht voll getankt</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Kein Verbrauch wird für diesen Eintrag berechnet.</div>
          </div>
        </div>

        <div className="form-actions" style={{ gap: '0.75rem' }}>
          {editMode && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Abbrechen
            </button>
          )}
          <button id={editMode ? 'btn-save-edit' : 'btn-add-fillup'} type="submit" className="btn-primary">
            {editMode ? '💾 Änderungen speichern' : '✚ Eintrag speichern'}
          </button>
        </div>
      </form>
    </div>
  )
}
