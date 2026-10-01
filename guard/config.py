"""Mit kapcsoljunk be. Reszletek: guard/README.md"""

# honnan engedjuk be - ures lista = barhonnan
NETWORKS = [
    "127.0.0.0/8",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
]

# keres / perc / IP - 0 = nincs korlat
RATE_LIMIT = 240
RATE_WINDOW = 60

SECURITY_HEADERS = True
