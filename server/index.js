import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import express from 'express'

import { config } from './config.js'
import { ping } from './db.js'
import { getPositions, getLatest, getDays } from './positions.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const app = express()

app.disable('x-powered-by')

// A route-ok mind ugyanúgy hibáznak, ezért egy helyen csomagoljuk őket.
// Ha az adatbázis nem elérhető, 503 megy vissza olvasható üzenettel –
// a felület ezt írja ki a canvas helyén.
function route(handler) {
  return async (req, res) => {
    try {
      res.json(await handler(req))
    } catch (err) {
      const offline = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST']
      const status = offline.includes(err.code) ? 503 : 500
      console.error('[api]', req.path, err.code || '', err.message)
      res.status(status).json({ error: err.message, code: err.code || null })
    }
  }
}

function forkliftId(req) {
  const n = Number(req.params.id)
  return Number.isInteger(n) ? n : null
}

// 'YYYY-MM-DD' vagy null
function dateParam(req) {
  const d = String(req.query.date || '').trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
}

app.get(
  '/api/health',
  route(async () => {
    await ping()
    return {
      ok: true,
      database: config.db.database,
      table: config.table,
      timeMode: config.timeMode
    }
  })
)

// Egy gép egy napi útvonala
app.get(
  '/api/forklifts/:id/positions',
  route(async (req) => {
    const date = dateParam(req)
    const points = await getPositions(forkliftId(req), date)
    return { id: forkliftId(req), date, count: points.length, points }
  })
)

// A legutolsó ismert pozíció
app.get(
  '/api/forklifts/:id/latest',
  route(async (req) => ({
    id: forkliftId(req),
    point: await getLatest(forkliftId(req))
  }))
)

// Mely napokon van adat
app.get(
  '/api/forklifts/:id/days',
  route(async (req) => ({
    id: forkliftId(req),
    days: await getDays(forkliftId(req))
  }))
)

// Buildelt felület kiszolgálása, ha van – így élesben egy process elég.
// Fejlesztéskor a Vite fut külön, és a /api kéréseket ide proxyzza.
const dist = path.join(root, 'dist')

if (existsSync(dist)) {
  app.use(express.static(dist))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.listen(config.port, () => {
  console.log(`[api] http://localhost:${config.port}`)
  console.log(`[api] ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database} – tábla: ${config.table} (${config.timeMode})`)
})
