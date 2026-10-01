/** src/hooks/useClock.js - masodpercenkent frissulo ora. */
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { useClock } from '../../src/hooks/useClock.js'

function Ora() {
  return <span data-testid="ora">{useClock().toISOString()}</span>
}

const ertek = () => screen.getByTestId('ora').textContent

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-02T08:30:00Z'))
})

afterEach(() => vi.useRealTimers())

it('a mostani idovel indul', () => {
  render(<Ora />)
  expect(ertek()).toBe('2026-10-02T08:30:00.000Z')
})

it('masodpercenkent frissul', () => {
  render(<Ora />)
  act(() => vi.advanceTimersByTime(1000))
  expect(ertek()).toBe('2026-10-02T08:30:01.000Z')
})

it('leszedeskor leallitja az idozitot', () => {
  const clear = vi.spyOn(globalThis, 'clearInterval')
  const { unmount } = render(<Ora />)
  unmount()
  expect(clear).toHaveBeenCalled()
})
