export const forklifts = [
  { id: 1, name: 'Targonca 1', area: 'Csarnok A' },
  { id: 2, name: 'Targonca 2', area: 'Csarnok A' },
  { id: 3, name: 'Targonca 3', area: 'Csarnok B' },
  { id: 4, name: 'Targonca 4', area: 'Csarnok B' },
  { id: 5, name: 'Targonca 5', area: 'Raktár' },
  { id: 6, name: 'Targonca 6', area: 'Raktár' }
]

export function getForklift(id) {
  return forklifts.find((f) => f.id === Number(id))
}
