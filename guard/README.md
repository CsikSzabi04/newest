# guard – külső védelmi réteg

Ez a mappa **nem nyúl semmihez**. Az `app.py` és a frontend változatlan; a
védelem kívülről rakódik rá a Flask appra, és külön indítóval kapcsolható be.

```
python app.py         normál, védelem nélkül (változatlan)
python guard/run.py   ugyanaz + védelem
```

Ha törlöd a `guard/` mappát, minden megy tovább ugyanúgy.

## Mi van benne

| fájl            | mit csinál                                            |
| --------------- | ----------------------------------------------------- |
| `config.py`     | mi legyen bekapcsolva – csak ezt kell szerkeszteni     |
| `network.py`    | csak a megadott hálózatokról enged be, másnak 403      |
| `ratelimit.py`  | IP-nként kérésszám-korlát, fölötte 429                 |
| `headers.py`    | biztonsági fejlécek (CSP, clickjacking, sniffing)      |
| `run.py`        | az indító: `app.py` + a fenti rétegek                  |

Új védelem: új fájl `install(app)` függvénnyel, és egy sor a `__init__.py`-ba.

## Beállítás – `guard/config.py`

```python
NETWORKS = ["127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
RATE_LIMIT = 240          # kérés / perc / IP
RATE_WINDOW = 60
SECURITY_HEADERS = True
```

- `NETWORKS` üres lista → nincs hálózati szűrés. Alapból csak a helyi hálózat
  megy, tehát kívülről akkor sem érhető el, ha a gép ki van téve.
- `RATE_LIMIT = 0` → nincs kérésszám-korlát.

## Miért csak éles módban

A `guard/run.py` a buildelt felületet szolgálja ki, Vite nélkül:

```
npm run build
python guard/run.py
```

Fejlesztéskor a böngésző a Vite-tal (5173) beszél, és az csak a `/api` kéréseket
továbbítja a Flasknek. Ilyenkor minden kérés a saját gépről érkezőnek látszik,
vagyis a hálózati szűrés ott nem érne semmit. Ezért a védett indító csak az
éles módot csinálja.

## Amit ellenőriztem

- a három réteg külön-külön (403 / 429 / fejlécek)
- a CSP nem töri el a Leafletet: a térkép és az útvonal kirajzolódik,
  nincs egyetlen CSP-sértés sem a konzolon
