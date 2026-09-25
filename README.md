# Phoenix Mechano – targoncakezelő felület

Vite + React felület a 6 targonca kezeléséhez. A targoncákon Raspberry Pi fut,
ezek írják a pozíciókat a MySQL-be; a hozzájuk tartozó oldal a `/targonca/:id`
útvonalon kap helyet.

## Indítás

Két terminál kell, mert a böngésző nem tud közvetlenül MySQL-hez kapcsolódni:

```
npm install
npm run server     # adatbázis-API, 3001-es port
npm run dev        # felület, 5173-as port
```

A dev szerver a hálózaton is hallgat (`host: true`), tehát tabletről is
megnyitható a gép IP-címén. A `/api` kéréseket a Vite automatikusan a 3001-es
portra továbbítja.

## Adatbázis beállítása

A kapcsolat a projekt gyökerében lévő `.env` fájlból jön – minta: `.env.example`.
Ugyanazokat az értékeket kell beírni, amikkel a Workbenchben belépsz:

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=...
DB_NAME=targonca
DB_TABLE=positions
```

Utána az oszlopneveket kell a saját tábládhoz igazítani:

```
COL_FORKLIFT=forklift_id   # melyik gép; ha nincs ilyen oszlop, hagyd üresen
COL_X=x
COL_Y=y
```

Az időt kétféle tárolás szerint tudja olvasni:

- `TIME_MODE=datetime` – egy DATETIME/TIMESTAMP oszlop van, ezt a `COL_TIME`
  adja meg
- `TIME_MODE=parts` – külön hónap / nap / óra / perc oszlop, ezeket a
  `COL_MONTH`, `COL_DAY`, `COL_HOUR`, `COL_MINUTE` adja meg. Ilyenkor a táblában
  nincs év, azt a `DATA_YEAR` pótolja.

Hogy jól állnak-e a beállítások, ezzel ellenőrizhető:

```
curl http://localhost:3001/api/health
```

## Végpontok

Mind `{ t, x, y }` alakú pontokat ad vissza; `t` helyi idő, időzóna-jelölés
nélkül (`2026-09-22T08:14:00`).

```
/api/health                             kapcsolat-ellenőrzés
/api/forklifts/:id/positions?date=...   egy gép egy napi útvonala
/api/forklifts/:id/latest               a legutolsó ismert pozíció
/api/forklifts/:id/days                 mely napokon van adat
```

## Felépítés

- `server/config.js` – minden adatbázistól függő beállítás egy helyen
- `server/positions.js` – a lekérdezések; innen jön a `{ t, x, y }` alak
- `server/index.js` – az API, élesben a `dist/`-et is kiszolgálja
- `src/data/forklifts.js` – a targoncák neve és területe
- `src/pages/Home.jsx` – géprács
- `src/pages/ForkliftPage.jsx` – ide kerül az adott targonca kész felülete
- `public/logo.png` – a cég logója (csere esetén a `Header.jsx`-ben és az
  `index.html` favicon sorában is át kell írni a fájlnevet)

## Kezelés

- `1`–`6` billentyű a főoldalon: az adott targonca oldala egyből megnyílik
- `Esc` a targonca oldalán: vissza a főoldalra

## Éles futtatás

```
npm run build
npm start
```

Ilyenkor egy process elég: a `server/index.js` a `dist/`-et is kiszolgálja,
minden a 3001-es porton megy.
