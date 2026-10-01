import time
from collections import defaultdict, deque

from flask import jsonify, request


def install(app, limit, window):
    hits = defaultdict(deque)

    @app.before_request
    def check_rate():
        now = time.monotonic()
        seen = hits[request.remote_addr]

        while seen and now - seen[0] > window:
            seen.popleft()

        if len(seen) >= limit:
            return jsonify({"error": "Tul sok keres, varj egy kicsit."}), 429

        seen.append(now)
