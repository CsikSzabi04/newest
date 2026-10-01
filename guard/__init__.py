"""Kulso vedelmi reteg. Az app.py-hoz nem nyul hozza."""

from . import config, headers, network, ratelimit


def install(app):
    if config.NETWORKS:
        network.install(app, config.NETWORKS)

    if config.RATE_LIMIT:
        ratelimit.install(app, config.RATE_LIMIT, config.RATE_WINDOW)

    if config.SECURITY_HEADERS:
        headers.install(app)

    return app
