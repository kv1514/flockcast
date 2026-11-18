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
