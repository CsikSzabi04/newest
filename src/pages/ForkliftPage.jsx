import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { getForklift } from '../data/forklifts.js'

import './ForkliftPage.css'

export default function ForkliftPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const forklift = getForklift(id)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') navigate('/')
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  if (!forklift) {
    return (
      <div className="page">
        <Header />
        <main className="detail">
          <p className="missing">Nincs ilyen targonca.</p>
          <button className="back" onClick={() => navigate('/')}>
            Vissza a listához
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <Header>
        <button className="back" onClick={() => navigate('/')}>
          &larr; Vissza
        </button>
      </Header>

      <section className="detail-bar">
        <span className="detail-no">{String(forklift.id).padStart(2, '0')}</span>
        <div className="detail-title">
          <h1>{forklift.name}</h1>
          <p>{forklift.area}</p>
        </div>
      </section>

      <main className="detail">
        {/*
          Ide jön a targonca felülete.
          A gépet a `forklift` objektum azonosítja (id, name, area), az URL pedig
          /targonca/:id alakú, tehát useParams()-ból is kiolvasható.

          Az adatok a server/ mappában futó API-n keresztül érhetők el:
            /api/forklifts/:id/positions?date=YYYY-MM-DD
            /api/forklifts/:id/latest
            /api/forklifts/:id/days
        */}
        <section className="slot">
          <span>Idejön a canva</span>
        </section>
      </main>
    </div>
  )
}
