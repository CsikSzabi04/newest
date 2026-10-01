# Phoenix Mechano – targoncakezelő felület

A targoncákon Raspberry Pi fut, ezek írják a pozíciókat a MySQL-be. A felület
egy légifotóra rajzolja rá az adott gép adott napi útvonalát.

- backend: `app.py` – egy fájl, Flask + MySQL
- frontend: Vite + React, a térkép Leaflet

## Indítás

```
npm install
pip install -r requirements.txt
python app.py
```

Ennyi. Az `app.py` elindítja az API-t **és** a Vite dev szervert is, majd
kiírja a címeket:

```
  API ........ http://localhost:5000
  Felulet .... http://localhost:5173
  Halozatrol . http://192.168.x.x:5173
  Adatbazis .. root@127.0.0.1/forklift
```

A hálózati IP-t magától megtalálja, nem kell sehova beírni – tabletről ez a cím
nyitható meg. Leállítás: `Ctrl+C` (a Vite is leáll vele).

Ha csak az API kell: `python app.py --no-web`.

## Beállítás

Minden az `app.py` tetején van, egy helyen: a `DB` kapcsolat, a tábla
névelőtagja, az oszlopnevek és a portok. Nincs `.env`, nincs config fájl.

A gépek listáját nem kell karbantartani: a `forklifts()` a `SHOW TABLES`-ből
szedi ki (`teszt3` → 3-as targonca), tehát ha új tábla keletkezik, magától
megjelenik a főoldalon.

## Adatbázis

`forklift` adatbázis, **gépenként külön tábla**: `teszt1` … `teszt6`
(a névminta `TABLE = "teszt{}"`, a `{}` helyére a gép száma kerül).

| oszlop      | típus       | tartalom              |
| ----------- | ----------- | --------------------- |
| `id`        | int         | sorszám               |
| `datum`     | varchar(20) | `2026-10-02`          |
| `time`      | varchar(20) | `08:40:00`            |
| `longitude` | double      | **szélesség** (46.9…) |
| `latitude`  | double      | **hosszúság** (19.7…) |

### A két koordináta fel van cserélve

Az adatbázisban a `longitude` oszlopban van a szélesség, a `latitude`-ban a
hosszúság. Ezt a régi `map.html` is így kezelte rajzoláskor
(`const lat = parseFloat(p.lon)`), a távolságszámítás viszont nem cserélte
vissza – így a kirajzolt útvonal jó volt, a megtett út viszont rosszul jött ki.

Itt a szerver adja vissza mindkettőt helyesen. A csere két sor az `app.py`
tetején:

```python
LAT = "longitude"
LON = "latitude"
```

Ha egyszer helyrerakjátok az oszlopneveket a táblában, csak ezt a kettőt kell
visszacserélni.

### Egyéb

- `teszt1`-ben van egy `targonca_id` oszlop is (20800), a többiben nincs. Mivel
  minden gépnek saját táblája van, a lekérdezés nem használja.
- `datum` és `time` varchar, nem DATE/TIME. A szűrés emiatt szövegként megy –
  a `YYYY-MM-DD` és a `HH:MM:SS` alaknál ez ugyanaz a sorrend, mint az időrend.

A lekérdezés a `positions()` függvényben van – a munkahelyi kódot oda kell
bemásolni. `{"ts", "lat", "lon"}` kulcsú elemekből álló listát kell
visszaadnia, a program többi része erre épül.

## A felületről

- **Rajzolni csak az „Útvonal betöltése” gomb rajzol.** Ha a dátumot vagy az
  időablakot átírod, a korábbi útvonal eltűnik – így sosem marad kint egy régi
  lekérdezés eredménye a már átírt mezők mellett.
- Csak azok a pontok kerülnek ki, amelyek az „Ettől – Eddig” órák közé esnek.
- Az adat szórtan van a táblákban (teszt1–2: szept. 25., teszt3–4: okt. 2.,
  teszt5–6: okt. 9.), ezért a dátummező megnyitáskor **arra a napra áll, ahol
  van adat**: ha ma van, akkor a mai, különben a legutolsó ilyen nap.
- Az időablak alapból `00:00–23:59`, hogy semmi ne maradjon ki.
- Az „Ettől – Eddig” mezők mindig 0–24 órás alakot mutatnak. A natív
  `<input type="time">` a böngésző nyelvét követi (angol böngészőn AM/PM-et
  írna, és ezt a `lang` attribútum nem írja felül), ezért ezek saját mezők:
  beírod a négy számjegyet, a kettőspont magától kerül a helyére, kilépéskor
  pedig `HH:MM`-re igazítja magát. A dátummezőnél a natív naptár megmarad,
  de a címke magyarul is kiírja a napot.

## Végpontok

```
/api/forklifts              a gépek listája (a teszt* táblákból)
/api/days?forklift_id=3     mely napokon van adat
/api/positions              ?forklift_id=3&date=2026-10-02&start_time=00:00&end_time=23:59
```

A `/api/positions` válasza:

```json
{
  "forklift_id": 3,
  "date": "2026-10-02",
  "count": 5,
  "distance_m": 350.8,
  "points": [{ "ts": "08:10:00", "lat": 46.90835, "lon": 19.7162 }]
}
```

## A térkép

A légifotó a `public/map.png`, a sarkai:

```
bal felső:  46.90848, 19.71331
jobb alsó:  46.90700, 19.71830
```

Ez a két koordináta a `src/components/RouteMap.jsx`-ben van (`MAP_BOUNDS`).

## Felépítés

- `app.py` – beállítások, MySQL, API, indító
- `src/pages/Home.jsx` – géprács
- `src/pages/ForkliftPage.jsx` – dátum/idő vezérlők, megtett út, térkép
- `src/components/RouteMap.jsx` – a Leaflet térkép és az útvonal
- `public/map.png` – a légifotó
- `public/logo.png` – a cég logója (csere esetén a `Header.jsx`-ben és az
  `index.html` favicon sorában is át kell írni a fájlnevet)

## Kezelés

- `1`–`6` billentyű a főoldalon: az adott targonca oldala egyből megnyílik
- `Esc` a targonca oldalán: vissza a főoldalra
- a pontok fölé húzva kiírja az időt

## Tesztek

```
npm test
```

A felület tesztjei (vitest). Nem kell hozzá futó `app.py`, sem adatbázis –
a `fetch` és a Leaflet mockolva van. Részletek: `test/README.md`.

## Éles futtatás

```
npm run build
python app.py --no-web
```

Ilyenkor a Flask a `dist/`-et is kiszolgálja, minden az 5000-es porton megy.
