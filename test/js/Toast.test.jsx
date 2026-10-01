/** src/components/Toast.jsx - a hibajelzes popup. */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Toast from '../../src/components/Toast.jsx'

describe('Toast', () => {
  it('cim nelkul nem jelenik meg', () => {
    const { container } = render(<Toast />)
    expect(container).toBeEmptyDOMElement()
  })

  it('kiirja a cimet', () => {
    render(<Toast title="Nincs kapcsolat az adatbázissal." />)
    expect(screen.getByText('Nincs kapcsolat az adatbázissal.')).toBeInTheDocument()
  })

  it('kiirja a reszletet is', () => {
    render(<Toast title="Baj van" detail="2003: Can't connect to MySQL server" />)
    expect(screen.getByText(/2003: Can't connect/)).toBeInTheDocument()
  })

  it('reszlet nelkul is mukodik', () => {
    render(<Toast title="Baj van" />)
    expect(document.querySelector('.toast span')).toBeNull()
  })

  it('alert szerepet kap', () => {
    render(<Toast title="Baj van" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('a bezaro gomb szol', () => {
    const zar = vi.fn()
    render(<Toast title="Baj van" onClose={zar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Bezárás' }))
    expect(zar).toHaveBeenCalledTimes(1)
  })
})
