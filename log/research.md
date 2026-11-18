# Research + Writing log (Agent B, Helen)

Append only, newest at the bottom. Format: see FLOCKCAST.md section 6.

### [19:36] Research → Build · ACK
**Done:** Agent B online (Helen). Read FLOCKCAST.md and log/build.md. data/hops.json draft is renderable as-is; schema unchanged.
**Need:** nothing. Render data/hops.json now; I'll push per-hop updates.
**Next:** verifying hop 4 (to-out-of-state, needs_check) and the headline number (299), then spot-checking quotes on the other hops.

### [19:55] Research → Build · UPDATE
**Done:** data/hops.json: hop 4 (to-out-of-state) now `verified`. 1.6M is the SF Standard's own count of SFPD search logs (not statewide); lawsuit entry reworded as an allegation by Gibbs Mura. Added your requested `plain` one-liner to every hop (ACK on that schema addition).
Checked your stat cards against sources:
- **299**: confirmed. SFPD biannual report gives the dates: "299 queries ... between May 1, 2025 and May 12, 2026", run by **WSIN analysts** using NCRIC's access. KTVU gives no dates, so please cite the biannual report (https://www.sanfranciscopolice.org/pol-biannual-surveillance-report-2026) for that card, or both. Suggest label: "searches run by WSIN analysts, through NCRIC's access, for federal and out-of-state agencies (May 2025 – May 2026)".
- **~6 mo**: confirmed ("approximately August 2024 and February 2025", "without the Department's knowledge or authorization"). Optional extra line: SF Standard counted 1.6M+ out-of-state searches in that window (https://sfstandard.com/2025/09/08/sfpd-flock-alpr-ice-data-sharing/).
- **Card 2 label** reads ambiguously. Suggest: "of them outside California. State law allows zero."
- **307 / 0 live counts**: I can't hand-check those from here; please say "snapshot of <date>" on stage, not "today".
**Need:** nothing blocking.
**Next:** hops 1–3, 5 quote checks (running), then SUBMISSION.md + copy/demo-script.md.

### [20:02] Research → Build · UPDATE
**Done:** All 5 hops in data/hops.json are now checked against sources. Fixes: hop 1 dropped the unsourced "7-day default" claim; hop 2 incident reworded (IA finding, not referral); hop 3 299 summary now matches KTVU ("about a year", 0.005%); hop 5 federal requesters attributed to SFPD, Flock/CBP pause no longer implies causation, HSI dropped. Hops 1, 2 and 5 SFPD-policy quotes rely on the afternoon read (SFPD PDF 403s tonight); all other quotes re-checked verbatim with pages.
**Need:** nothing. Pull data/hops.json. Data is effectively final; only typo fixes from here.
**Next:** SUBMISSION.md + copy/demo-script.md.

### [20:08] Research → ALL · UPDATE
**Done:** SUBMISSION.md (repo root, filled in; TODO: statement number + partner's first name) and copy/demo-script.md (3-min script, number-check list at the bottom). Measured result used: 5/5 hops have a documented incident (10 incidents, 17 rules, 17 unique sources) + 299 headline.
**Need:** Build: if the page says "agencies SFPD shares with today", change to "as of <snapshot date>" so it matches what we say on stage.
**Next:** freeze at 8:15. Typo fixes only.

### [20:24] Research → Build · REQUEST (urgent, before the repo goes public)
**Done:** Security review (read-only) + SFPD policy quotes re-verified (all 5 verbatim against the s3fs-public PDF; hops.json now uses that URL everywhere, per your request). hop 2 retention fixed: the 30-day approval rule is not in the SFPD policy text, now sourced to SF Standard. No secrets in tree or history; no innerHTML/eval; DeFlock data only reaches textContent; all external links rel=noopener.
**Need (Build owns these files):**
1. **HIGH, organizer camera rule:** research/flock-data.md lines ~66-76 contain a ready-to-run Overpass query returning all 430 SFPD camera points, plus one named node (4034036876) with an intersection photo URL (alpr.pictures/.../lincoln ebfs 18th). FLOCKCAST.md:79 and flock-data.md:47-53 also link the camera GeoJSON/tiles. Suggest: delete the query URL and the example-node block, keep only the count table. These lines are also in git history (ea79ff8); rewriting history needs a force-push, so that's a call for both humans, not for me.
2. MEDIUM: `python3 -m http.server` binds all interfaces, so /.git/ is browsable from the venue Wi-Fi during the demo. Use `python3 -m http.server 8000 --bind 127.0.0.1` (and in .claude/launch.json).
3. LOW app/app.js:49 `link()`: only allow `https:` URLs (a `javascript:` URL in hops.json would be clickable).
4. LOW app/app.js:209-213: DeFlock fetch is ~14.6 MB with no timeout; add ~8 s AbortController.
5. LOW app/app.js:211: if the nodes fetch fails, "0 outside California" is shown as a live green result. Show the offline note instead.
**Next:** waiting on functional test + policy-currency check results; will log them.

### [20:30] Research → Build · UPDATE
**Done:** Functional test (Playwright, headless): all pass. No console errors; 5 hops + arrow keys + detail panels OK; live counts independently recomputed (307 outbound partners, 302 CA + 5 blank-state CA agencies, 0 outside CA); DeFlock-blocked fallback works; 18/19 links 200 (FindLaw 403 to bots only); 390px no overflow. Currency check: SFPD policy (no amendment), NCRIC access still off, Flock policy (June 30 2026), CA law (SB 1013 failed, no newer AG bulletin), contract (no vote yet) all STILL CURRENT. Updated hop 4 lawsuit entry: consolidated May 29 2026 into In re Flock Group Inc. ALPR Litigation, no ruling yet.
**Need (FYI, your files):** research/flock-laws.md says Flock's 7-day default was announced Nov 11 2026; it was Aug 13 2026, and existing customers (SF) keep their current retention. Not used on the page. Optional "next" pitch context: San Diego council voted Nov 16 2026 to end its Flock authorization (https://www.kpbs.org/news/public-safety/2026/11/17/city-council-withdraws-sdpds-flock-authorization-but-cameras-remain).
**Next:** data frozen. Still open: the HIGH camera-location item in my 20:24 entry.
