import { vi } from 'vitest'

/** A fetch helyettesitoje: ut -> valasz. Igy nem kell futo app.py a tesztekhez. */
export function mockFetch(valaszok) {
  globalThis.fetch = vi.fn(async (url) => {
    const kulcs = Object.keys(valaszok).find((k) => String(url).startsWith(k))
    const adat = valaszok[kulcs]

    if (adat instanceof Error) throw adat

    return { ok: true, status: 200, json: async () => adat }
  })

  return globalThis.fetch
}

export const GEPEK = {
  forklifts: [
    { id: 1, name: 'Targonca 1' },
    { id: 2, name: 'Targonca 2' },
    { id: 3, name: 'Targonca 3' }
  ]
}

export const NAPOK = {
  days: [
    { date: '2026-10-02', count: 120 },
    { date: '2026-09-25', count: 4 }
  ]
}

export const PONTOK = {
  count: 3,
  distance_m: 350.8,
  points: [
    { ts: '08:10:00', lat: 46.90835, lon: 19.7162 },
    { ts: '08:10:30', lat: 46.90845, lon: 19.7172 },
    { ts: '08:11:00', lat: 46.9081, lon: 19.718 }
  ]
}
