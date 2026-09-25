import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { forklifts } from '../data/forklifts.js'
import { useClock } from '../hooks/useClock.js'
import './Home.css'

function greeting(hour) {
  if (hour < 10) return 'Jó reggelt'
  if (hour < 18) return 'Jó napot'
  return 'Jó estét'
}

export default function Home() {
  const navigate = useNavigate()
  const now = useClock()

  useEffect(() => {
    const onKey = (e) => {
      const n = Number(e.key)
      if (n >= 1 && n <= forklifts.length) navigate(`/targonca/${n}`)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  const hour = now.getHours()

  return (
    <div className="page">
      <Header>
        <span className="clock">
          {now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </Header>

      <section className="hero">
        <h1>
          {greeting(hour)}
          <span className="hero-stop">.</span>
        </h1>
        <h1>
          Targ
          <span className="hero-stop">o</span>
          nca-
          <span className="hero-stop">K</span>
          ezelő
        </h1>
        <p className="hero-date">
          {now.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </section>

      <div className="sawtooth" />

      <main className="home">
        <div className="section-head">
          <h2>Gépek</h2>
          <span>{forklifts.length} egység</span>
        </div>

        <div className="grid">
          {forklifts.map((f) => (
            <button
              key={f.id}
              className="card"
              onClick={() => navigate(`/targonca/${f.id}`)}
            >
              <span className="card-top">
                <span className="card-no">{String(f.id).padStart(2, '0')}</span>
                <span className="dot" />
              </span>
              <span className="card-name">{f.name}</span>
              <span className="card-meta">{f.area}</span>
              <span className="card-host"></span>
            </button>
          ))}
        </div>

        <p className="hint">
          Az <kbd>1</kbd> – <kbd>6</kbd> billentyűvel is nyitható a megfelelő gép.
        </p>
      </main>
    </div>
  )
}
