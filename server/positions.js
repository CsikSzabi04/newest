import { pool } from './db.js'
import { config } from './config.js'

const IDENT = /^[A-Za-z0-9_$]+$/

// A tábla- és oszlopnevek .env-ből jönnek, ezért nem mehetnek paraméterként
// a lekérdezésbe – megnézzük, hogy tényleg csak azonosító, aztán backtick.
function id(name) {
  if (!IDENT.test(name)) {
    throw new Error(`Érvénytelen tábla- vagy oszlopnév a .env-ben: "${name}"`)
  }
  return `\`${name}\``
}

const C = config.columns
const TABLE = () => id(config.table)
const isParts = () => config.timeMode === 'parts'

function pad(n) {
  return String(n).padStart(2, '0')
}

// Gépenkénti szűrés – ha nincs ilyen oszlop, üres feltétel
function forkliftWhere(forkliftId) {
  if (!C.forklift || forkliftId == null) return { sql: '', params: [] }
  return { sql: `${id(C.forklift)} = ?`, params: [forkliftId] }
}

function timeSelect() {
  if (isParts()) {
    return `${id(C.month)} AS mo, ${id(C.day)} AS d, ${id(C.hour)} AS h, ${id(C.minute)} AS mi`
  }
  return `${id(C.time)} AS t`
}

// A rendezés iránya minden oszlopra rá kell menjen: az `a, b DESC` csak
// b-re vonatkozna, és a "legutolsó pozíció" rossz sort adna vissza.
function timeOrder(dir) {
  if (isParts()) {
    return [C.month, C.day, C.hour, C.minute].map((c) => `${id(c)} ${dir}`).join(', ')
  }
  return `${id(C.time)} ${dir}`
}

// Egy sorból a UI-nak való { t, x, y }.
// t mindig helyi idő, időzóna-jelölés nélkül: 'YYYY-MM-DDTHH:mm:ss'
function toPoint(row) {
  const x = Number(row.x)
  const y = Number(row.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null

  let t
  if (isParts()) {
    t = `${config.year}-${pad(row.mo)}-${pad(row.d)}T${pad(row.h)}:${pad(row.mi)}:00`
  } else if (row.t instanceof Date) {
    const d = row.t
    t = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  } else {
    t = String(row.t).trim().replace(' ', 'T').slice(0, 19)
  }

  return { t, x, y }
}

// date: 'YYYY-MM-DD' vagy null (= nincs napszűrés)
function dayWhere(date) {
  if (!date) return { sql: '', params: [] }

  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return { sql: '', params: [] }

  if (isParts()) {
    return {
      sql: `${id(C.month)} = ? AND ${id(C.day)} = ?`,
      params: [month, day]
    }
  }

  const start = `${date} 00:00:00`
  const next = new Date(year, month - 1, day + 1)
  const end = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())} 00:00:00`

  return { sql: `${id(C.time)} >= ? AND ${id(C.time)} < ?`, params: [start, end] }
}

function buildWhere(parts) {
  const used = parts.filter((p) => p.sql)
  return {
    sql: used.length ? `WHERE ${used.map((p) => p.sql).join(' AND ')}` : '',
    params: used.flatMap((p) => p.params)
  }
}

// Egy gép egy napi útvonala, időrendben
export async function getPositions(forkliftId, date) {
  const where = buildWhere([forkliftWhere(forkliftId), dayWhere(date)])

  const sql = `
    SELECT ${timeSelect()}, ${id(C.x)} AS x, ${id(C.y)} AS y
    FROM ${TABLE()}
    ${where.sql}
    ORDER BY ${timeOrder('ASC')}
    LIMIT ${Number(config.maxRows)}
  `

  const [rows] = await pool.query(sql, where.params)
  return rows.map(toPoint).filter(Boolean)
}

// A legutolsó ismert pozíció – ebből lesz az élő pont a canvason
export async function getLatest(forkliftId) {
  const where = buildWhere([forkliftWhere(forkliftId)])

  const sql = `
    SELECT ${timeSelect()}, ${id(C.x)} AS x, ${id(C.y)} AS y
    FROM ${TABLE()}
    ${where.sql}
    ORDER BY ${timeOrder('DESC')}
    LIMIT 1
  `

  const [rows] = await pool.query(sql, where.params)
  return rows.length ? toPoint(rows[0]) : null
}

// Mely napokon van egyáltalán adat – a dátumválasztó ebből dolgozik
export async function getDays(forkliftId, limit = 60) {
  const where = buildWhere([forkliftWhere(forkliftId)])

  const dayExpr = isParts()
    ? `CONCAT(${Number(config.year)}, '-', LPAD(${id(C.month)}, 2, '0'), '-', LPAD(${id(C.day)}, 2, '0'))`
    : `DATE(${id(C.time)})`

  const sql = `
    SELECT ${dayExpr} AS date, COUNT(*) AS count
    FROM ${TABLE()}
    ${where.sql}
    GROUP BY date
    ORDER BY date DESC
    LIMIT ${Number(limit)}
  `

  const [rows] = await pool.query(sql, where.params)
  return rows.map((r) => ({ date: String(r.date).slice(0, 10), count: Number(r.count) }))
}
