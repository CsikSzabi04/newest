import ipaddress

from flask import request


def install(app, networks):
    allowed = [ipaddress.ip_network(n) for n in networks]

    @app.before_request
    def check_network():
        try:
            ip = ipaddress.ip_address(request.remote_addr or "")
        except ValueError:
            return "Ismeretlen cim.", 403

        if not any(ip in net for net in allowed):
            return "Ez a gep nincs engedelyezve.", 403
