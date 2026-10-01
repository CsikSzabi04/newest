import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import RouteMap from '../components/RouteMap.jsx'
import Toast from '../components/Toast.jsx'

import './ForkliftPage.css'

const EMPTY = { points: [], distance: null, loaded: false }

function today() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-')
}

// a nyers hibauzenetbol olvashato cim + reszlet
function popup(message) {
  if (message === 'Failed to fetch') {
    return { title: 'Nem érhető el az app.py.', detail: 'Fut a szerver?' }
  }
  if (/mysql|2003|10061/i.test(message)) {
    return { title: 'Nincs kapcsolat az adatbázissal.', detail: message }
  }
  return { title: 'Nem sikerült betölteni az útvonalat.', detail: message }
}

function huDate(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// a bongeszo nyelvetol fuggetlenul 0-24 oras
function TimeField({ label, value, onChange }) {
  const [text, setText] = useState(value)

  useEffect(() => setText(value), [value])

  const commit = () => {
    const parts = text.match(/^(\d{1,2}):?(\d{0,2})$/)
    if (!parts) return setText(value)

    const hour = String(Math.min(23, Number(parts[1] || 0))).padStart(2, '0')
    const minute = String(Math.min(59, Number(parts[2] || 0))).padStart(2, '0')

    setText(`${hour}:${minute}`)
    onChange(`${hour}:${minute}`)
  }

  return (
    <label className="field">
      <span>{label}</span>
      <input
        className="time"
        type="text"
        inputMode="numeric"
        maxLength={5}
        value={text}
        onChange={(e) => {
          const n = e.target.value.replace(/\D/g, '').slice(0, 4)
          setText(n.length > 2 ? `${n.slice(0, 2)}:${n.slice(2)}` : n)
        }}
        onFocus={(e) => e.target.select()}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
      />
    </label>
  )
}

export default function ForkliftPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('00:00')
  const [endTime, setEndTime] = useState('23:59')
  const [route, setRoute] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && navigate('/')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  // a legutolso nap, amin van adat
  useEffect(() => {
    fetch(`/api/days?forklift_id=${id}`)
      .then((res) => res.json())
      .then(({ days = [] }) => {
        const now = today()
        setDate(days.some((d) => d.date === now) ? now : days[0]?.date || now)
      })
      .catch(() => setDate(today()))
  }, [id])

  // rajzolni csak a gomb rajzol
  useEffect(() => {
    setRoute(EMPTY)
    setError(null)
  }, [id, date, startTime, endTime])

  const load = async () => {
    setLoading(true)
    setError(null)

    const query = new URLSearchParams({
      forklift_id: id,
      date,
      start_time: startTime,
      end_time: endTime
    })

    try {
      const res = await fetch(`/api/positions?${query}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setRoute({ points: data.points, distance: data.distance_m, loaded: true })
    } catch (err) {
      setError(err.message)
      setRoute(EMPTY)
    }

    setLoading(false)
  }

  return (
    <div className="page">
      <Header>
        <button className="back" onClick={() => navigate('/')}>
          &larr; Vissza
        </button>
      </Header>

      <section className="detail-bar">
        <span className="detail-no">{String(id).padStart(2, '0')}</span>
        <div className="detail-title">
          <h1>Targonca {id}</h1>
        </div>

        <div className="detail-distance">
          <span className="detail-distance-label">Megtett út</span>
          <strong>{route.points.length ? `${Math.round(route.distance)} m` : '–'}</strong>
        </div>
      </section>

      <main className="detail detail--map">
        <div className="controls">
          <label className="field">
            <span>Dátum{date && ` · ${huDate(date)}`}</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <TimeField label="Ettől" value={startTime} onChange={setStartTime} />
          <TimeField label="Eddig" value={endTime} onChange={setEndTime} />

          <button className="btn" onClick={() => setDate(today())}>
            Ma
          </button>

          <button className="btn btn-primary" onClick={load} disabled={loading || !date}>
            {loading ? 'Betöltés…' : 'Útvonal betöltése'}
          </button>

          <button className="btn" onClick={() => setRoute(EMPTY)} disabled={!route.points.length}>
            Törlés
          </button>

          <span className="controls-status">
            {error ? (
              <em className="is-error">betöltés sikertelen</em>
            ) : route.points.length ? (
              `${route.points.length} pont`
            ) : route.loaded ? (
              'ebben az időszakban nincs adat'
            ) : (
              'nyomj az Útvonal betöltése gombra'
            )}
          </span>
        </div>

        <RouteMap points={route.points} />
      </main>

      {error && <Toast {...popup(error)} onClose={() => setError(null)} />}
    </div>
  )
}
