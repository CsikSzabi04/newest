HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Opener-Policy": "same-origin",
    # a Leaflet stilust ir az elemekre, ezert kell az unsafe-inline
    "Content-Security-Policy": (
        "default-src 'self'; "
        "img-src 'self' data: blob:; "
        "style-src 'self' 'unsafe-inline'; "
        "script-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none'"
    ),
}


def install(app):
    @app.after_request
    def add_headers(response):
        for key, value in HEADERS.items():
            response.headers.setdefault(key, value)
        return response
