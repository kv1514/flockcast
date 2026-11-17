# FlockCast — shared context for both Claudes

> **Track the Flock.** Map every license-plate camera in San Francisco, show where that data goes, and check it against the rules SFPD has published.

Two people are building this at the same time, each with their own Claude. **Before you do anything, ask your human: "Are you Builder A or Builder B?"** Then open [TASKS.md](TASKS.md) and work only on that builder's tasks and files.

## The event

- Claude Impact Lab SF: AI Trust & Safety, Tue Nov 17 2026. https://luma.com/claude-sf-impact-lab
- Track: **Privacy: map the surveillance tech deployed in SF and where the data goes.**
- **Build time is about 75 minutes (7:15 to 8:30 PM, submissions close at 8:30).** Demos at 8:45.
- The organizers share a starter repo with public datasets at kickoff. If your human pastes that link, check it first; it may already have cleaned SF data.
- Judges care about trust and safety. A working, honest demo beats a big, half-built one.

## What we're building (the demo in one sentence)

A web map of SF where you can see every ALPR (Flock) camera, click one to see who can search its data and for how long, and see a red flag wherever that sharing or retention conflicts with SFPD's own published policy, with the policy quote and the source link.

### Demo path (build toward this, in this order)

1. Map of SF loads with camera dots. **(must have)**
2. Click a camera: popup with operator, direction, and the SFPD Flock policy summary (retention, who can access). **(must have)**
3. Side panel "Where the data goes": the agencies that can search SF's Flock data (local, out-of-state, federal), with flags where policy says they shouldn't. **(must have)**
4. Every flag cites the policy text and source URL. **(must have, this is our credibility)**
5. "Ask the policy" box where you type a question and Claude answers from the policy PDFs. **(stretch)**

## Data sources

| Source | What we use it for |
|---|---|
| DeFlock open data, https://github.com/flockhopper3/deflock-data | Camera locations. Daily US GeoJSON: `https://data.dontgetflocked.com/cameras.geojson.gz` (filter to the SF bounding box). Or query OpenStreetMap Overpass directly for `surveillance:type=ALPR` inside SF. The repo's `eyesonflock/` folder has the agency **sharing network** (who shares with whom). |
| SFPD Flock Transparency Portal, https://transparency.flocksafety.com/san-francisco-ca-pd | Camera count, retention period, list of agencies with access, search counts. Copy these numbers into `data/portal.json` by hand if scraping is slow. |
| SFPD Biannual Surveillance Report 2026, https://www.sanfranciscopolice.org/pol-biannual-surveillance-report-2026 | Documented incidents and access-policy concerns. |
| SFPD 19B Surveillance Technology Policies, https://www.sanfranciscopolice.org/your-sfpd/policies/19b-surveillance-technology-policies | The official rules (ALPR policy PDF especially). |

SF bounding box: west -122.52, south 37.70, east -122.35, north 37.83.

## Ground rules (both builders)

- **Public data only.** We read published data and documents. We do not touch, probe, log into, or plant anything in Flock's or SFPD's systems: no tracking pixels in their images, no scraping behind logins, no automated hammering of their sites. That would be unauthorized access, and at a trust and safety event it would sink the project. "Who opens the data" comes from the published agency-access list, sharing network, and audit numbers.
- **Every claim needs a source.** Any flag or number shown in the UI carries a `source_url` and, for policy flags, a short quote. If Claude extracted it, show "extracted by Claude, check the source".
- **Say "possible conflict", not "violation".** We're showing where public data and public policy don't line up, not making legal findings.
- **No API keys in the browser or in git.** Keys live in `.env` (already gitignored). Read them with `ANTHROPIC_API_KEY`.
- **Stay in your lane's files** (see TASKS.md) so the two of you never edit the same file. Commit small and often; `git pull --rebase` before every push.
- Claude model for anything AI: `claude-fable-5-2`.

## Stack (keep it boring, it's 75 minutes)

- **Frontend:** one static page, `web/index.html` + `web/app.js` + `web/style.css`, with MapLibre GL from a CDN (`https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js` and `.css`) and a free basemap (`https://tiles.openfreemap.org/styles/positron`). No build step. Serve with `python3 -m http.server 8000` from the repo root and open http://localhost:8000/web/.
- **Data and AI scripts:** Python 3 in `scripts/`, output JSON into `data/`. The page only reads files from `data/`.
- **Stretch "Ask the policy":** tiny Python server `scripts/ask_server.py` (Flask or http.server) with one `POST /ask` endpoint that calls Claude with the policy text. Only if the must-haves are done.

## The contract between A and B (these files are the handoff)

Builder A produces these; Builder B reads them. **B starts with mock versions of these exact shapes** so B never waits on A. If you change a shape, update this section and tell the other human.

`data/cameras.geojson`: GeoJSON FeatureCollection of points in SF.
```json
{"type":"FeatureCollection","features":[
  {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.4194,37.7749]},
   "properties":{"id":"osm-123","operator":"SFPD","brand":"Flock Safety","direction":90,"source_url":"https://www.openstreetmap.org/node/123"}}
]}
```

`data/portal.json`: facts from the transparency portal.
```json
{"agency":"San Francisco Police Department","camera_count":400,"retention_days":30,
 "searches_last_30_days":null,"source_url":"https://transparency.flocksafety.com/san-francisco-ca-pd","retrieved":"2026-11-17"}
```

`data/agencies.json`: who can search SF's Flock data.
```json
[{"name":"Example County Sheriff","type":"local|state|out_of_state|federal|private",
  "state":"CA","source_url":"https://...","flags":["flag-id-1"]}]
```

`data/policies.json`: the rules, extracted from the policy PDFs by Claude.
```json
{"documents":[{"id":"sfpd-alpr-19b","title":"SFPD ALPR Surveillance Technology Policy","source_url":"https://..."}],
 "rules":[{"id":"retention","document_id":"sfpd-alpr-19b","summary":"ALPR data kept no longer than N days unless tied to an investigation",
   "quote":"exact short quote from the PDF","value":30}],
 "flags":[{"id":"flag-id-1","severity":"high|medium|low","title":"Out-of-state agency has access",
   "explanation":"one or two plain sentences","rule_id":"sharing","quote":"...","source_url":"https://..."}]}
```
