# FlockCast — who builds what

Read [CLAUDE.md](CLAUDE.md) first. Then do **only** your builder's tasks, in order, and only touch your builder's files. Check a box (`- [x]`) and commit when a task is done, so the other side can see progress with `git pull`.

| | Builder A — Data + AI | Builder B — Map + UI |
|---|---|---|
| Owns | `scripts/`, `data/` (except mocks), `requirements.txt` | `web/`, `data/mock/` |
| Never edits | `web/` | `scripts/`, real files in `data/` |
| Shared (edit only after telling the other human) | `CLAUDE.md`, `TASKS.md`, `README.md` | same |

Timeline (build starts 7:15): **7:45** checkpoint, real data replaces mocks. **8:10** feature freeze, only fixes and demo polish. **8:25** final push. **8:30** submissions close.

---

## Builder A — Data + AI

Goal: fill `data/` with real, sourced files in the shapes from CLAUDE.md.

- [ ] **A1. Cameras (by ~7:35).** `scripts/fetch_cameras.py`: query Overpass for ALPR nodes in the SF bounding box (`node["surveillance:type"="ALPR"](37.70,-122.52,37.83,-122.35);`), or download the DeFlock daily GeoJSON and filter to the box. Write `data/cameras.geojson` in the contract shape. Print the count. Commit and push right away; B is waiting to swap the mock.
- [ ] **A2. Portal facts (by ~7:40).** Open the SFPD Flock transparency portal in the browser, read camera count, retention, and the agency access list. Write `data/portal.json`, and the agencies into `data/agencies.json` with a `type` for each (local / state / out_of_state / federal / private). Hand-copying is fine; it's a public page. Note the retrieval date.
- [ ] **A3. Policy extraction with Claude (by ~8:00).** Download the SFPD ALPR 19B policy PDF and the 2026 surveillance report into `data/raw/`. `scripts/extract_policies.py`: send the PDFs to `claude-fable-5-2` (PDF document blocks) and ask for JSON matching the `policies.json` contract: the rules (retention, who may access, sharing outside CA / with federal agencies, audit requirements) each with an exact short quote. Write `data/policies.json`.
- [ ] **A4. Flags (by ~8:05).** In the same script or `scripts/make_flags.py`: compare portal + agencies against the rules. E.g. agency `type` is `out_of_state` or `federal` while the policy (or CA law SB 34, Civil Code 1798.90.55) restricts sharing; portal retention longer than policy retention. Add each as a flag with severity, quote, source_url, and put the flag ids on the matching agencies. Wording: "possible conflict".
- [ ] **A5. Stretch: Ask the policy.** `scripts/ask_server.py` with `POST /ask {question}` → Claude answers using only the extracted policy text and cites the rule ids. Tell B the URL and response shape: `{"answer": "...", "rule_ids": ["..."]}`.
- [ ] **A6. Demo help (8:10+).** Write 3 to 4 talking points for the demo in `README.md`: what data, how many cameras, the strongest flag and its quote.

## Builder B — Map + UI

Goal: a clean, demo-ready map that reads `data/`. Build against mocks first; never wait on A.

- [ ] **B1. Mocks (first 5 minutes).** Create `data/mock/cameras.geojson`, `portal.json`, `agencies.json`, `policies.json` in the exact contract shapes with ~10 fake SF cameras, 5 agencies (mix of types), 2 flags. In `web/app.js`, one constant `DATA_DIR` set to `../data/mock/` so switching to real data is a one-line change.
- [ ] **B2. Map (by ~7:40).** `web/index.html` + `app.js` + `style.css`: MapLibre (CDN), OpenFreeMap positron basemap, centered on SF, camera dots from `cameras.geojson`. Header: "FlockCast — Track the Flock" plus the camera count from `portal.json`.
- [ ] **B3. Camera popup (by ~7:50).** Click a dot: operator, brand, direction, retention from `portal.json`, link to the OSM source. Bonus: little direction cone or arrow.
- [ ] **B4. "Where the data goes" panel (by ~8:00).** Side panel listing agencies from `agencies.json`, grouped by type (local / out of state / federal / private), with counts. Agencies with flags get a red badge; clicking one shows the flag title, explanation, quote, and source link from `policies.json`.
- [ ] **B5. Switch to real data (when A pushes).** `git pull`, set `DATA_DIR` to `../data/`, fix anything that breaks. If a real file is missing, keep its mock and label it "sample data" in the UI. Never show mock data unlabeled in the demo.
- [ ] **B6. Polish for demo (8:10+).** Readable at projector size, a short "Sources" footer with every source link, "possible conflict" wording, works with no console errors. Stretch: "Ask the policy" box if A5 is up.

---

## Backup idea: Crash Box ("Visualizing the Black Box")

Only if FlockCast is blocked (e.g. no usable data in the first 15 minutes). It fits the **Robotaxis and robots** track ("build an SF robotaxi report card from public crash data").

Pivot plan: data source is the CA DMV autonomous vehicle collision reports (OL 316 PDFs) and NHTSA Standing General Order crash data (CSV), plus the organizers' starter repo. Same split:
- **A:** pull SF robotaxi crashes from the NHTSA SGO CSV into `data/crashes.geojson`; use Claude to read a few DMV OL 316 PDFs into structured JSON (vehicles, speeds, point of impact, narrative, likely cause).
- **B:** map of crash hotspots plus a 2D bird's-eye replay of one crash (two boxes moving along paths on a canvas, using the speeds and impact point A extracted), and a per-company report card.

Note: public crash reports don't include LiDAR distances; use the reported speeds, positions and narrative, and say the replay is an approximation.
