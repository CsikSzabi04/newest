/** src/pages/Home.jsx - geprács, billentyuk, koszones. */
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'

import Home from '../../src/pages/Home.jsx'
import { GEPEK, mockFetch } from './helpers.js'

function Cim() {
  return <span data-testid="cim">{useLocation().pathname}</span>
}

function nyit() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Home />
      <Cim />
    </MemoryRouter>
  )
}

const cim = () => screen.getByTestId('cim').textContent

afterEach(() => vi.useRealTimers())

it('kiirja a gepeket es a szamukat', async () => {
  mockFetch({ '/api/forklifts': GEPEK })
  nyit()

  expect(await screen.findByText('Targonca 1')).toBeInTheDocument()
  expect(screen.getByText('3 egység')).toBeInTheDocument()
})

it('kattintasra megnyitja a gep oldalat', async () => {
  mockFetch({ '/api/forklifts': GEPEK })
  nyit()

  fireEvent.click(await screen.findByText('Targonca 2'))
  expect(cim()).toBe('/targonca/2')
})

it('a szambillentyu is megnyitja a gepet', async () => {
  mockFetch({ '/api/forklifts': GEPEK })
  nyit()
  await screen.findByText('Targonca 1')

  fireEvent.keyDown(window, { key: '3' })
  expect(cim()).toBe('/targonca/3')
})

it('a listan kivuli szam nem visz sehova', async () => {
  mockFetch({ '/api/forklifts': GEPEK })
  nyit()
  await screen.findByText('Targonca 1')

  fireEvent.keyDown(window, { key: '9' })
  expect(cim()).toBe('/')
})

it('ha nincs szerver, kiirja a hibat', async () => {
  mockFetch({ '/api/forklifts': new TypeError('Failed to fetch') })
  nyit()

  expect(await screen.findByText('Nincs kapcsolat a szerverrel.')).toBeInTheDocument()
})

it.each([
  [8, 'Jó reggelt'],
  [14, 'Jó napot'],
  [20, 'Jó estét']
])('%i orakor koszones: %s', (ora, szoveg) => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 2, ora, 0))
  // a koszones nem fugg a geplistatol, ezert a lekerdezes itt varakozhat
  globalThis.fetch = vi.fn(() => new Promise(() => {}))
  nyit()

  expect(screen.getByText(szoveg, { exact: false })).toBeInTheDocument()
})
