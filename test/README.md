# Tesztek

A felület tesztjei (vitest + Testing Library). Nem kell hozzá futó `app.py`,
sem adatbázis: a `fetch` és a Leaflet mockolva van. A backendre nincs teszt.

## Futtatás

```
npm test          # egyszer lefut
npm run test:watch  # fájlmentésre újrafut
```

Egy fájl külön:

```
npx vitest run --config test/vitest.config.js test/js/RouteMap.test.jsx
```

## Fájlok

| fájl                       | mit néz                                              |
| -------------------------- | ---------------------------------------------------- |
| `js/App.test.jsx`          | melyik címre melyik oldal jön                         |
| `js/Home.test.jsx`         | géprács, kattintás, `1`–`6` billentyűk, köszönés      |
| `js/ForkliftPage.test.jsx` | kezdő dátum, betöltés, törlés, időmező, `Esc`, hiba   |
| `js/RouteMap.test.jsx`     | mit rajzoltatna a Leafletnek (mockolt `leaflet`)      |
| `js/Header.test.jsx`       | fejléc és a logó `PM` visszaesése                     |
| `js/Toast.test.jsx`        | a felugró üzenet megjelenése és eltűnése              |
| `js/useClock.test.jsx`     | másodperces frissítés, időzítő leállítása             |
| `js/useForklifts.test.jsx` | géplista betöltése és hibaág                          |
| `js/helpers.js`            | a mockolt `fetch` és a teszt-adatok                   |
| `js/setup.js`              | jsdom kiegészítések (`ResizeObserver`)                |
