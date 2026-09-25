// Minden, ami a te adatbázisodtól függ, itt van egy helyen.
// A tényleges értékek a projekt gyökerében lévő .env fájlból jönnek
// (minta: .env.example). A .env nincs verziókezelve.

try {
  process.loadEnvFile(new URL('../.env', import.meta.url))
} catch {
  // nincs .env – marad minden alapértelmezésen
}

const env = process.env

function num(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const config = {
  // ugyanaz a kapcsolat, amit a Workbenchben használsz
  db: {
    host: env.DB_HOST || '127.0.0.1',
    port: num(env.DB_PORT, 3306),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'targonca'
  },

  // a tábla, amibe a Pi-k írnak
  table: env.DB_TABLE || 'positions',

  columns: {
    // ha egy táblában van az összes gép, ez az oszlop választja szét őket;
    // ha üresen hagyod, nincs gépenkénti szűrés
    forklift: env.COL_FORKLIFT === undefined ? 'forklift_id' : env.COL_FORKLIFT.trim(),
    x: env.COL_X || 'x',
    y: env.COL_Y || 'y',

    // TIME_MODE=datetime esetén ez az egy oszlop kell
    time: env.COL_TIME || 'ts',

    // TIME_MODE=parts esetén ez a négy
    month: env.COL_MONTH || 'month',
    day: env.COL_DAY || 'day',
    hour: env.COL_HOUR || 'hour',
    minute: env.COL_MINUTE || 'minute'
  },

  // 'datetime' – egy DATETIME/TIMESTAMP oszlop
  // 'parts'    – külön hónap / nap / óra / perc oszlopok
  timeMode: (env.TIME_MODE || 'datetime').trim().toLowerCase(),

  // 'parts' módban a táblában nincs év – ezt tesszük a dátum elé
  year: num(env.DATA_YEAR, new Date().getFullYear()),

  port: num(env.API_PORT, 3001),
  maxRows: num(env.MAX_ROWS, 20000)
}
