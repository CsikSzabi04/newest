import { useEffect, useState } from 'react'

export function useForklifts() {
  const [forklifts, setForklifts] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/forklifts')
      .then((res) => res.json())
      .then((data) => setForklifts(data.forklifts || []))
      .catch(() => setError('Nem érhető el az app.py. Elindítottad?'))
  }, [])

  return { forklifts, error }
}
