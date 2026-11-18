"""Count SFPD-operated ALPR cameras per SF supervisor district.

Writes app/district_counts.json with district outlines and COUNTS ONLY.
No camera coordinates are written (organizer rule: no exact camera locations).

Sources: OpenStreetMap via Overpass (crowd-sourced, ODbL) and DataSF
supervisor districts (cqbw-m5m3). Run: python3 app/tools/district_counts.py
"""
import json, sys, urllib.parse, urllib.request
from datetime import date

DISTRICTS = "https://data.sfgov.org/resource/cqbw-m5m3.geojson"
QUERY = '[out:json][timeout:60];node["surveillance:type"="ALPR"]["operator"="San Francisco Police Department"](37.70,-122.52,37.83,-122.35);out;'
OVERPASS = "https://overpass-api.de/api/interpreter?data=" + urllib.parse.quote(QUERY)
UA = {"User-Agent": "flockcast-hackathon/1.0"}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return json.load(r)


def rings_of(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    return geom["coordinates"]  # MultiPolygon


def inside(x, y, ring):
    hit = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            hit = not hit
    return hit


def in_polys(x, y, polys):
    return any(inside(x, y, p[0]) and not any(inside(x, y, h) for h in p[1:]) for p in polys)


def simplify(ring, step):
    out = ring[::step]
    return out if len(out) >= 4 else ring


districts = get(DISTRICTS)["features"]
nodes = [e for e in get(OVERPASS)["elements"] if e.get("type") == "node"]
rows, unassigned = [], 0
assigned = [0] * len(districts)
polys = [rings_of(f["geometry"]) for f in districts]
for n in nodes:
    for i, p in enumerate(polys):
        if in_polys(n["lon"], n["lat"], p):
            assigned[i] += 1
            break
    else:
        unassigned += 1

for f, p, c in zip(districts, polys, assigned):
    pts = sum(len(r) for poly in p for r in poly)
    step = max(1, pts // 400)
    rows.append({
        "district": int(float(f["properties"]["sup_dist"])),
        "count": c,
        "outline": [[[[round(x, 5), round(y, 5)] for x, y in simplify(r, step)] for r in poly] for poly in p],
    })
rows.sort(key=lambda r: r["district"])
out = {
    "retrieved": date.today().isoformat(),
    "what": "SFPD-operated ALPR cameras mapped in OpenStreetMap, counted per supervisor district",
    "total": len(nodes),
    "outside_districts": unassigned,
    "sources": {
        "cameras": "https://www.openstreetmap.org (Overpass query: surveillance:type=ALPR, operator=San Francisco Police Department)",
        "districts": "https://data.sfgov.org/d/cqbw-m5m3",
    },
    "districts": rows,
}
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else "app/district_counts.json", "w"), separators=(",", ":"))
print(out["total"], "cameras;", unassigned, "outside districts;", [(r["district"], r["count"]) for r in rows])
