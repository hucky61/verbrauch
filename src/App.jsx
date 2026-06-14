import { useState } from 'react'
import { useFuelStore } from './store/useFuelStore'
import FillupForm from './components/FillupForm'
import FillupList from './components/FillupList'
import StatsPanel from './components/StatsPanel'
import ConsumptionChart from './components/ConsumptionChart'
import PriceChart from './components/PriceChart'
import DataManager from './components/DataManager'
import './index.css'

const TABS = [
  { id: 'erfassen', label: 'Erfassen', icon: '⛽' },
  { id: 'verlauf', label: 'Verlauf', icon: '📋' },
  { id: 'statistik', label: 'Statistik', icon: '📊' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('erfassen')
  const [editEntry, setEditEntry] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { fillups, addFillup, deleteFillup, updateFillup, importFillups, stats } = useFuelStore()

  // Last odometer reading for validation
  const lastOdometer = fillups.length > 0 ? fillups[fillups.length - 1].odometer : null

  const handleAdd = (entry) => {
    addFillup(entry)
    setActiveTab('verlauf')
  }

  const handleEdit = (entry) => {
    setEditEntry(entry)
  }

  const handleEditSave = (changes) => {
    updateFillup(editEntry.id, changes)
    setEditEntry(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="header-icon">🚗</span>
          <div>
            <div className="header-title">Kfz-Verbrauch</div>
            <div className="header-subtitle">Kraftstoffverbrauch-Tracker</div>
          </div>
        </div>
        <button 
          className="menu-toggle-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü umschalten"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`tabs ${menuOpen ? 'open' : ''}`}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id)
                setMenuOpen(false)
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {activeTab === 'erfassen' && (
          <div className="section-gap">
            <FillupForm onSave={handleAdd} lastOdometer={lastOdometer} />
            {fillups.length > 0 && (
              <div className="card" style={{ padding: '1rem 1.5rem' }}>
                <p className="card-title">💡 Übersicht</p>
                <StatsPanel stats={stats} count={fillups.length} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'verlauf' && (
          <div className="section-gap">
            <FillupList fillups={fillups} onDelete={deleteFillup} onEdit={handleEdit} />
          </div>
        )}

        {activeTab === 'statistik' && (
          <div className="section-gap">
            <StatsPanel stats={stats} count={fillups.length} />
            <ConsumptionChart fillups={fillups} />
            <PriceChart fillups={fillups} />
            <DataManager fillups={fillups} onImport={importFillups} />
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editEntry && (
        <div className="modal-backdrop" onClick={() => setEditEntry(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Eintrag bearbeiten</h2>
              <button className="modal-close" onClick={() => setEditEntry(null)}>✕</button>
            </div>
            <FillupForm
              initialValues={editEntry}
              onSave={handleEditSave}
              onCancel={() => setEditEntry(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
