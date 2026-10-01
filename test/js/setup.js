import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// a Leaflet a jsdomban is peldanyosit egyet
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub

// a jsdom nem ismeri, a Leaflet viszont hivja
window.HTMLElement.prototype.scrollIntoView ??= () => {}

// a react-router v7-es figyelmeztetesei nem a tesztekrol szolnak
const eredetiWarn = console.warn
console.warn = (...args) => {
  if (String(args[0]).includes('React Router Future Flag Warning')) return
  eredetiWarn(...args)
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
