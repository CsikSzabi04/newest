"""Phoenix Mechano - targoncakoveto.  Inditas: python app.py"""

import atexit
import math
import os
import socket
import subprocess
import sys

import mysql.connector
from flask import Flask, jsonify, request, send_from_directory

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist")

DB = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "forklift",
}

# gepenkent kulon tabla: teszt1 ... teszt6
PREFIX = "teszt"

# a tablaban forditva van a ket koordinata
LAT = "longitude"
LON = "latitude"

API_PORT = 5000
WEB_PORT = 5173

app = Flask(__name__, static_folder=None)


def query(sql, params=()):
    conn = mysql.connector.connect(**DB)
    cur = conn.cursor(dictionary=True)
    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()
    return rows


def distance(points):
    total = 0
    for a, b in zip(points, points[1:]):
        dlat = math.radians(b["lat"] - a["lat"])
        dlon = math.radians(b["lon"] - a["lon"])
        h = math.sin(dlat / 2) ** 2 + math.cos(math.radians(a["lat"])) * math.cos(
            math.radians(b["lat"])
        ) * math.sin(dlon / 2) ** 2
        total += 12742000 * math.asin(math.sqrt(min(1, h)))
    return round(total, 1)


@app.errorhandler(Exception)
def failed(err):
    return jsonify({"error": str(err)}), getattr(err, "code", 500)


@app.get("/api/forklifts")
def api_forklifts():
    tables = [list(r.values())[0] for r in query("SHOW TABLES")]
    ids = sorted(
        int(t[len(PREFIX):])
        for t in tables
        if t.startswith(PREFIX) and t[len(PREFIX):].isdigit()
    )
    return jsonify({"forklifts": [{"id": i, "name": f"Targonca {i}"} for i in ids]})


@app.get("/api/days")
def api_days():
    fid = request.args.get("forklift_id", type=int)
    rows = query(
        f"SELECT `datum`, COUNT(*) AS db FROM `{PREFIX}{fid}` "
        "GROUP BY `datum` ORDER BY `datum` DESC"
    )
    return jsonify({"days": [{"date": str(r["datum"])[:10], "count": r["db"]} for r in rows]})


@app.get("/api/positions")
def api_positions():
    fid = request.args.get("forklift_id", type=int)
    date = request.args.get("date", "")
    start = request.args.get("start_time", "00:00")
    end = request.args.get("end_time", "23:59")

    rows = query(
        f"SELECT `time`, `{LAT}` AS lat, `{LON}` AS lon FROM `{PREFIX}{fid}` "
        "WHERE `datum` = %s AND `time` BETWEEN %s AND %s ORDER BY `time`",
        (date, f"{start}:00", f"{end}:59"),
    )
    points = [
        {"ts": str(r["time"])[:8], "lat": float(r["lat"]), "lon": float(r["lon"])}
        for r in rows
        if r["lat"] is not None and r["lon"] is not None
    ]
    return jsonify({"count": len(points), "distance_m": distance(points), "points": points})


@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def web(path):
    file = path if os.path.isfile(os.path.join(DIST, path)) else "index.html"
    return send_from_directory(DIST, file)


if __name__ == "__main__":
    dev = "--no-web" not in sys.argv

    if dev:
        vite = subprocess.Popen(
            f"npm run dev -- --port {WEB_PORT} --strictPort", cwd=ROOT, shell=True
        )
        # a Vite is alljon le velunk
        atexit.register(lambda: os.system(f"taskkill /F /T /PID {vite.pid} >nul 2>&1"))

    ip = socket.gethostbyname(socket.gethostname())
    print(f"\n  http://{ip}:{WEB_PORT if dev else API_PORT}\n")
    app.run(host="0.0.0.0", port=API_PORT, use_reloader=False)
