/** src/hooks/useForklifts.js - a geplista betoltese. */
import { render, screen, waitFor } from '@testing-library/react'
import { expect, it } from 'vitest'

import { useForklifts } from '../../src/hooks/useForklifts.js'
import { GEPEK, mockFetch } from './helpers.js'

function Lista() {
  const { forklifts, error } = useForklifts()
  return (
    <div>
      <span data-testid="hiba">{error ?? ''}</span>
      <ul>
        {forklifts.map((f) => (
          <li key={f.id}>{f.name}</li>
        ))}
      </ul>
    </div>
  )
}

const hiba = () => screen.getByTestId('hiba').textContent

it('betolti a gepeket', async () => {
  mockFetch({ '/api/forklifts': GEPEK })
  render(<Lista />)

  await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(3))
  expect(hiba()).toBe('')
})

it('ures valasz eseten sincs hiba', async () => {
  mockFetch({ '/api/forklifts': { forklifts: [] } })
  render(<Lista />)

  await waitFor(() => expect(hiba()).toBe(''))
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

it('halozati hiba eseten uzenetet ad', async () => {
  mockFetch({ '/api/forklifts': new TypeError('Failed to fetch') })
  render(<Lista />)

  await waitFor(() => expect(hiba()).toBe('Nem érhető el az app.py. Elindítottad?'))
})
