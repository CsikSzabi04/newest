import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './RouteMap.css'

// a legifoto sarkai: bal felso, jobb also
const BOUNDS = [
  [46.90848, 19.71331],
  [46.907, 19.7183]
]

// a doboz aranya, hogy a kep kitoltse
const ASPECT = (() => {
  const [[north, west], [south, east]] = BOUNDS
  const mid = (((north + south) / 2) * Math.PI) / 180
  return (Math.abs(east - west) * Math.cos(mid)) / Math.abs(north - south)
})()

const dot = (radius, color, fillColor) => ({
  radius,
  color,
  fillColor,
  weight: 2,
  fillOpacity: 1,
  pane: 'routesPane'
})

export default function RouteMap({ points }) {
  const boxRef = useRef(null)
  const mapRef = useRef(null)
  const routeRef = useRef(null)

  useEffect(() => {
    const map = L.map(boxRef.current, {
      minZoom: 15,
      maxZoom: 28,
      zoomSnap: 0,
      attributionControl: false
    })

    L.imageOverlay('/map.png', BOUNDS).addTo(map)
    map.fitBounds(BOUNDS)

    map.createPane('routesPane').style.zIndex = 650
    routeRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(boxRef.current)

    return () => {
      observer.disconnect()
      map.remove()
    }
  }, [])

  useEffect(() => {
    const group = routeRef.current
    if (!group) return

    group.clearLayers()
    if (!points.length) return

    const line = points.map((p) => [p.lat, p.lon])
    L.polyline(line, { color: '#e30613', weight: 3, pane: 'routesPane' }).addTo(group)

    const step = Math.ceil(points.length / 800)
    points.forEach((p, i) => {
      if (i % step === 0) {
        L.circleMarker([p.lat, p.lon], { ...dot(3, '#111111', '#111111'), weight: 1 })
          .bindTooltip(p.ts, { direction: 'top' })
          .addTo(group)
      }
    })

    const first = points[0]
    const last = points[points.length - 1]

    L.circleMarker([first.lat, first.lon], dot(6, '#111111', '#ffffff'))
      .bindTooltip(`Indulás – ${first.ts}`, { direction: 'top' })
      .addTo(group)

    L.circleMarker([last.lat, last.lon], dot(7, '#ffffff', '#e30613'))
      .bindTooltip(`Utolsó jel – ${last.ts}`, { direction: 'top' })
      .addTo(group)
  }, [points])

  return <div className="route-map" ref={boxRef} style={{ aspectRatio: ASPECT }} />
}
