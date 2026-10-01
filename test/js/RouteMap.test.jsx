/** src/components/RouteMap.jsx - mit rajzoltatna a Leafletnek.
 *
 * A Leaflet helyett mock megy: jsdomban nincs igazi terkep, viszont igy
 * ellenorizhető, hogy a jo pontokat kapja.
 */
import { render } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'

const leaflet = vi.hoisted(() => {
  const naplo = { foto: null, polyline: [], jelolok: [], elbontva: 0 }

  const reteg = () => {
    const self = { addTo: () => self, bindTooltip: () => self }
    return self
  }

  const L = {
    map: () => ({
      fitBounds: () => {},
      createPane: () => ({ style: {} }),
      invalidateSize: () => {},
      remove: () => (naplo.elbontva += 1)
    }),
    imageOverlay: (url) => {
      naplo.foto = url
      return reteg()
    },
    layerGroup: () => ({ addTo: () => ({ clearLayers: () => {} }), clearLayers: () => {} }),
    polyline: (pontok) => {
      naplo.polyline.push(pontok)
      return reteg()
    },
    circleMarker: (pont) => {
      naplo.jelolok.push(pont)
      return reteg()
    }
  }

  return { L, naplo }
})

vi.mock('leaflet', () => ({ default: leaflet.L }))

const { naplo } = leaflet
const { default: RouteMap } = await import('../../src/components/RouteMap.jsx')

const PONTOK = [
  { ts: '08:10:00', lat: 46.90835, lon: 19.7162 },
  { ts: '08:10:30', lat: 46.90845, lon: 19.7172 },
  { ts: '08:11:00', lat: 46.9081, lon: 19.718 }
]

beforeEach(() => {
  naplo.foto = null
  naplo.polyline = []
  naplo.jelolok = []
  naplo.elbontva = 0
})

it('a legifotot teszi a terkepre', () => {
  render(<RouteMap points={[]} />)
  expect(naplo.foto).toBe('/map.png')
})

it('ures utvonalnal nem rajzol semmit', () => {
  render(<RouteMap points={[]} />)
  expect(naplo.polyline).toHaveLength(0)
  expect(naplo.jelolok).toHaveLength(0)
})

it('a vonal minden ponton atmegy', () => {
  render(<RouteMap points={PONTOK} />)
  expect(naplo.polyline[0]).toEqual([
    [46.90835, 19.7162],
    [46.90845, 19.7172],
    [46.9081, 19.718]
  ])
})

it('az indulas es az utolso jel kulon jelolot kap', () => {
  render(<RouteMap points={PONTOK} />)
  expect(naplo.jelolok).toHaveLength(PONTOK.length + 2)
  expect(naplo.jelolok.at(-2)).toEqual([46.90835, 19.7162])
  expect(naplo.jelolok.at(-1)).toEqual([46.9081, 19.718])
})

it('leszedeskor elbontja a terkepet', () => {
  const { unmount } = render(<RouteMap points={PONTOK} />)
  unmount()
  expect(naplo.elbontva).toBe(1)
})
