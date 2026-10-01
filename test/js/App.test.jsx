/** Melyik cimre melyik oldal jon. */
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'

import App from '../../src/App.jsx'
import { GEPEK, NAPOK, mockFetch } from './helpers.js'

vi.mock('../../src/components/RouteMap.jsx', () => ({
  default: () => <div data-testid="map" />
}))

beforeEach(() => {
  mockFetch({ '/api/forklifts': GEPEK, '/api/days': NAPOK })
})

const nyit = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )

it('a gyoker a fooldal', async () => {
  nyit('/')
  expect(await screen.findByText('Gépek')).toBeInTheDocument()
})

it('a /targonca/:id a reszletek oldal', async () => {
  nyit('/targonca/3')
  expect(await screen.findByRole('heading', { name: 'Targonca 3' })).toBeInTheDocument()
})

it('ismeretlen cim a fooldalra visz', async () => {
  nyit('/nincs-ilyen')
  expect(await screen.findByText('Gépek')).toBeInTheDocument()
})
