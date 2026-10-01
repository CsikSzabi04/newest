"""Vedett inditas:  python guard/run.py"""

import os
import socket
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

import app as backend
import guard

guard.install(backend.app)

if __name__ == "__main__":
    if not os.path.isdir(os.path.join(ROOT, "dist")):
        sys.exit("Eloszor buildeld a felulet:  npm run build")

    ip = socket.gethostbyname(socket.gethostname())
    print(f"\n  vedett  http://{ip}:{backend.API_PORT}\n")
    backend.app.run(host="0.0.0.0", port=backend.API_PORT, use_reloader=False)
