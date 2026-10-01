/** src/pages/ForkliftPage.jsx - datum, idoablak, utvonal betoltese. */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import ForkliftPage from '../../src/pages/ForkliftPage.jsx'
import { NAPOK, PONTOK, mockFetch } from './helpers.js'

// a Leaflet terkep helyett csak a pontok szamat nezzuk
vi.mock('../../src/components/RouteMap.jsx', () => ({
  default: ({ points }) => <div data-testid="map">{points.length}</div>
}))

let fetchMock

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 2, 10, 0))
  fetchMock = mockFetch({ '/api/days': NAPOK, '/api/positions': PONTOK })
})

afterEach(() => vi.useRealTimers())

function Cim() {
  return <span data-testid="cim">{useLocation().pathname}</span>
}

/** Megnyitja a gep oldalat es megvarja, hogy beallon a datum. */
async function nyit(id = '3') {
  render(
    <MemoryRouter initialEntries={[`/targonca/${id}`]}>
      <Routes>
        <Route path="/targonca/:id" element={<ForkliftPage />} />
        <Route path="/" element={<span>fooldal</span>} />
      </Routes>
      <Cim />
    </MemoryRouter>
  )
  await waitFor(() => expect(datum()).toHaveValue('2026-10-02'))
}

const datum = () => document.querySelector('input[type="date"]')
const gomb = (nev) => screen.getByRole('button', { name: nev })
const terkep = () => screen.getByTestId('map')

it('a gep szama a cimben van', async () => {
  await nyit('3')
  expect(screen.getByRole('heading', { name: 'Targonca 3' })).toBeInTheDocument()
})

it('arra a napra all, ahol van adat', async () => {
  await nyit()
  expect(datum()).toHaveValue('2026-10-02')
})

it('a gomb betolti az utvonalat', async () => {
  await nyit()
  fireEvent.click(gomb('Útvonal betöltése'))

  expect(await screen.findByText('3 pont')).toBeInTheDocument()
  expect(terkep()).toHaveTextContent('3')
})

it('kiirja a megtett utat', async () => {
  await nyit()
  fireEvent.click(gomb('Útvonal betöltése'))

  expect(await screen.findByText('351 m')).toBeInTheDocument()
})

it('a beallitott idoablak megy at az API-nak', async () => {
  await nyit()
  fireEvent.click(gomb('Útvonal betöltése'))

  await waitFor(() => {
    const ut = fetchMock.mock.calls.map(([u]) => String(u)).find((u) => u.includes('positions'))
    expect(decodeURIComponent(ut)).toBe(
      '/api/positions?forklift_id=3&date=2026-10-02&start_time=00:00&end_time=23:59'
    )
  })
})

it('a Torles gomb kiuriti a terkepet', async () => {
  await nyit()
  fireEvent.click(gomb('Útvonal betöltése'))
  await screen.findByText('3 pont')

  fireEvent.click(gomb('Törlés'))
  expect(terkep()).toHaveTextContent('0')
})

it('datumvaltas eltunteti a regi utvonalat', async () => {
  await nyit()
  fireEvent.click(gomb('Útvonal betöltése'))
  await screen.findByText('3 pont')

  fireEvent.change(datum(), { target: { value: '2026-09-25' } })
  expect(terkep()).toHaveTextContent('0')
})

it('hiba eseten uzenetet ir ki', async () => {
  mockFetch({ '/api/days': NAPOK, '/api/positions': new TypeError('Failed to fetch') })
  await nyit()
  fireEvent.click(gomb('Útvonal betöltése'))

  expect(await screen.findByText('Nem érhető el az app.py.')).toBeInTheDocument()
})

it('az Escape visszavisz a fooldalra', async () => {
  await nyit()
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.getByTestId('cim')).toHaveTextContent('/')
})

it('az idomezo negy szamjegybol HH:MM-et csinal', async () => {
  await nyit()
  const ettol = screen.getByLabelText('Ettől')

  fireEvent.change(ettol, { target: { value: '0830' } })
  fireEvent.blur(ettol)
  expect(ettol).toHaveValue('08:30')
})

it('az idomezo nem engedi 23:59 fole', async () => {
  await nyit()
  const ettol = screen.getByLabelText('Ettől')

  fireEvent.change(ettol, { target: { value: '9999' } })
  fireEvent.blur(ettol)
  expect(ettol).toHaveValue('23:59')
})
