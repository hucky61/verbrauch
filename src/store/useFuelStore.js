import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'verbrauch_fillups'

function calcConsumption(liters, deltaKm) {
  if (!deltaKm || deltaKm <= 0) return null
  return (liters / deltaKm) * 100
}

export function useFuelStore() {
  const [fillups, setFillups] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fillups))
  }, [fillups])

  const addFillup = useCallback((entry) => {
    setFillups(prev => {
      const sorted = [...prev, { ...entry, id: Date.now() }]
        .sort((a, b) => new Date(a.date) - new Date(b.date) || a.odometer - b.odometer)
      return sorted
    })
  }, [])

  const deleteFillup = useCallback((id) => {
    setFillups(prev => prev.filter(f => f.id !== id))
  }, [])

  const updateFillup = useCallback((id, changes) => {
    setFillups(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, ...changes } : f)
      return updated.sort((a, b) => new Date(a.date) - new Date(b.date) || a.odometer - b.odometer)
    })
  }, [])

  // Derive consumption for each entry (needs the previous entry's odometer)
  // Skip consumption for entries marked notFull, and for the entry right after one,
  // because we cannot know the real starting fuel level after a partial fill.
  const fillupsWithConsumption = fillups.map((f, i) => {
    if (i === 0) return { ...f, consumption: null }
    const prev = fillups[i - 1]
    if (f.notFull || prev.notFull) return { ...f, consumption: null }
    const deltaKm = f.odometer - prev.odometer
    return { ...f, consumption: calcConsumption(f.liters, deltaKm) }
  })

  // Stats
  const validConsumptions = fillupsWithConsumption
    .map(f => f.consumption)
    .filter(c => c !== null && c > 0)

  const avgConsumption = validConsumptions.length
    ? validConsumptions.reduce((a, b) => a + b, 0) / validConsumptions.length
    : null

  const totalCost = fillups.reduce((sum, f) => sum + (f.totalPrice || 0), 0)
  const totalLiters = fillups.reduce((sum, f) => sum + (f.liters || 0), 0)

  const totalKm = fillups.length >= 2
    ? fillups[fillups.length - 1].odometer - fillups[0].odometer
    : 0

  const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : null

  return {
    fillups: fillupsWithConsumption,
    addFillup,
    deleteFillup,
    updateFillup,
    stats: { avgConsumption, totalCost, totalLiters, totalKm, avgPricePerLiter },
  }
}
