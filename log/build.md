# Build log (Agent A, kv1514)

Append only, newest at the bottom. Format: see FLOCKCAST.md section 6.

### [13:40] Build → ALL · UPDATE
**Done:** Pre-event research added: research/flock-laws.md, research/flock-data.md, research/crashbox.md, and a filled-in draft data/hops.json (5 hops). FLOCKCAST.md section 2 points to them.
**Need:** Research: at kickoff, verify the needs_check hop (to-out-of-state) and read the transparency portal numbers by hand.
**Next:** Build starts rendering data/hops.json at 7:15.

### [18:30] Build → ALL · UPDATE
**Done:** FLOCKCAST.md updated from the organizers' starter repo and slides: 60-minute build (7:30–8:30), judging criteria, "the number" is P0, no exact camera locations (camera map replaced by neighborhood counts), SUBMISSION.md and public repo by 8:30.
**Need:** Research: own SUBMISSION.md answers and the headline number.
**Next:** Build starts at 7:30.

### [19:33] Build → Research · UPDATE
**Done:** app/ page is live: header + 4 stat cards (307 partners / 0 outside CA counted live from DeFlock; 299; ~6 mo), 5-step clickable hop diagram from data/hops.json (← → keys work), detail panel (rules+quotes+sources | dated incidents), honest-limit footer, 18 auto-collected sources. Run: python3 -m http.server 8000, open http://localhost:8000/app/
**Need:** (1) Optional per-hop one-liner: add a "plain" string field to each hop in data/hops.json and the page shows it under the step title, no other change needed. (2) Confirm 299 / ~6 mo wording on the stat cards (hardcoded in app/index.html; tell me if a number changes).
**Next:** projector polish, then freeze.

### [19:36] Build → Research · REQUEST
**Done:** Full test of app/: all 5 steps, keyboard, phone width, dark mode, no console errors. Checked every source link: all open except the SFPD ALPR policy PDF, which SFPD's own site links at a dead path (AccessDenied). The page now rewrites it to the working copy.
**Need:** In data/hops.json, replace every
https://www.sanfranciscopolice.org/sites/default/files/2026-10/SFPD%20Surveillance%20Technology%20Policy%20on%20Automated%20License%20Plate%20Readers.pdf
with
https://www.sanfranciscopolice.org/s3fs-public/2026-10/SFPD%20Surveillance%20Technology%20Policy%20on%20Automated%20License%20Plate%20Readers.pdf
(7 places). FindLaw returns 403 to scripts but opens fine in a browser.
**Next:** waiting on your verified hop 4; projector polish.

### [19:41] Build → Research · UPDATE
**Done:** Added a "Plate readers by district" section (kv1514 asked for it): ranked choropleth of SFPD-operated ALPR **counts** per supervisor district, no camera coordinates anywhere (organizer rule). 430 cameras, District 10 most (74), District 4 fewest (21). Data: OpenStreetMap via Overpass + DataSF supervisor districts (cqbw-m5m3), built by app/tools/district_counts.py into app/district_counts.json (totals + outlines only). Also links the Feb 2027 Board vote on the Flock contract (Mission Local). Applied your stat-card wording.
**Need:** Add to SUBMISSION.md "Data we used": OSM ALPR nodes operator=SFPD (430, retrieved 2026-11-17), DataSF cqbw-m5m3 (11 districts). Limitation worth noting: OSM is crowd-sourced, SFPD reports ~400.
**Next:** freeze; demo rehearsal.

### [19:42] Build → Research · ACK
**Done:** Your security review, all fixed except history: (1) HIGH: removed the Overpass point query, example node 4034036876 + photo URL, and camera GeoJSON/tile links from research/flock-data.md and FLOCKCAST.md; counts only now. app/tools/district_counts.py still queries OSM but writes totals only. Git-history rewrite NOT done: needs both humans (force-push on a public repo). (2) MEDIUM: preview server now --bind 127.0.0.1 (.claude/launch.json). Please make README/SUBMISSION run command: python3 -m http.server 8000 --bind 127.0.0.1 then open http://localhost:8000/app/ (3) link() renders https only. (4) 8 s AbortController on DeFlock fetches. (5) If the nodes file fails, the card says the 0 is the 2026-11-16 figure, not live. Also fixed the Flock 7-day date in research/flock-laws.md (Aug 13 2026). "today" wording already gone.
**Need:** nothing.
**Next:** freeze.

### [19:43] Build → Research · ACK
**Done:** Decision from kv1514: git history stays as is (no force-push). The old commit with the OSM query is not rewritten; the data is public on OpenStreetMap and current files hold counts only. Closing your HIGH item.
**Need:** nothing.
**Next:** freeze; demo.

### [20:00] Build → Research · UPDATE
- **Done:** (1) Banner: three.js camera-birds over a pixel-art SF sunset skyline (`app/flock.js`, `app/skyline.js`; invented pixel art, no camera locations). (2) New **"Follow the read"** map above the journey (`app/map.js`, `app/us-map.json`): US map, the plate read travels stop by stop (SF camera → Flock cloud, Atlanta → SFPD → NCRIC → other states → federal, DC); SF stops are a schematic inset. Each stop shows **"Is it allowed to have your data?"** (Rule says: allowed / allowed with limits / not allowed, with the hop's first rule + source) and **"What the record shows"** (from breaches). Same verdict line now in the detail card. Play button walks all 5 stops.
- **Need:** Helen, please sanity-check the verdict labels in `app/app.js` `RULE_VERDICT` (by tier): Flock = "allowed, only as SFPD's host", SFPD = "allowed, only for listed uses", NCRIC = "allowed (a California agency)", out-of-state and federal = "not allowed". They paraphrase each hop's first rule in hops.json. Map arcs read `from.name` ("Flock cloud / NCRIC" draws two arcs), so keep those names.
- **Next:** Demo rehearsal. Live: https://kv1514.github.io/flockcast/app/

### [20:15] Build → Research · UPDATE
- **Done:** Page reorganised around **Follow the read** (top of page, biggest thing). Live map (Leaflet, keyless Esri tiles, OSM fallback; no API key anywhere) flies to each stop: frames the hop, a "YOUR PLATE" tag travels the path, then zooms in on the holder. Stops: SFPD HQ (1245 3rd St), Flock HQ street (Howell Mill Rd, Atlanta), NCRIC at **city level only** (address not confirmed), other states (nationwide fan), DC. Camera stop = whole city with per-district counts, no camera points. Card is minimal: one plain line + "Allowed to have it?" + "What happened" chips; "Why?" expands rule + source. Everything else (stats stay visible; step-by-step rules, district map, sources) is folded into collapsible sections. Static SVG map is the fallback if Leaflet can't load.
- **Submission link:** https://kv1514.github.io/flockcast/ (public, no login; redirects to /app/). Helen: please put this in SUBMISSION.md.
- **Need:** if `plain` lines in hops.json change, keep them to one sentence; the map card shows them as the headline.
- **Next:** rehearse the demo: press ▶ Follow the read and talk over the 5 stops.

### [20:37] Build → Research · UPDATE
- **Done:** (1) New video script timed to the map autoplay: `copy/video-script-map.md` (new file; your `video-script.md` untouched). (2) **Check it yourself** section under the stats (`app/check.js`): one click checks SFPD's 307 live sharing partners row by row (all 307 come back Allowed, matching "0 outside CA"; the 5 blank-state partners are hard-coded as CA, as in app.js), or upload any CSV/JSON (e.g. a Flock audit log). Flags: federal agency, out-of-state, immigration-related reason, reproductive-care reason, missing or vague reason/case number. Every flag links to the rule in hops.json. Files never leave the browser.
- **Need:** Tab 5 of the "Ideas Impact lab" Google Doc: my browser's Google account is view-only there, so the script still needs pasting from `copy/video-script-map.md`.
- **Next:** none from Build; demo.
