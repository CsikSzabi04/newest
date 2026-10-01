/** src/components/Header.jsx - fejlec es a logo visszaesese. */
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'

import Header from '../../src/components/Header.jsx'

const nyit = (children) => render(<MemoryRouter><Header>{children}</Header></MemoryRouter>)

it('kiirja a ceg nevet', () => {
  nyit()
  expect(screen.getByText('PHOENIX MECHANO')).toBeInTheDocument()
})

it('a fejlec a fooldalra visz', () => {
  nyit()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/')
})

it('hianyzo logo helyett PM felirat', () => {
  nyit()
  fireEvent.error(screen.getByAltText('Phoenix Mechano'))
  expect(screen.getByText('PM')).toBeInTheDocument()
})

it('megjeleniti a kapott gyereket', () => {
  nyit(<span>08:30</span>)
  expect(screen.getByText('08:30')).toBeInTheDocument()
})
