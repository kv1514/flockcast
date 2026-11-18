# FlockCast — Track the Flock

Shared brief for both teammates' Claude agents. Read this whole file before doing anything, and re-read the other agent's log (`log/`) at the start of every turn. This file is the single source of truth; if chat instructions conflict with it, ask your human.

**Event:** Claude Impact Lab SF: AI Trust & Safety, Tue Nov 17 2026, Privacy track ("map the surveillance tech deployed in SF and where the data goes"). https://luma.com/claude-sf-impact-lab
**Build window: 60 minutes, 7:30 → 8:30 PM (pencils down 8:30, demos 8:45).** Before that, 25 minutes in the Privacy corner writing one statement card.
**Organizers' starter repo:** https://github.com/sergeicu/trust-safety-impact-lab. The track file is `04-privacy.md`, the dataset catalog is `datasets.md` / `datasets.json`, and the hand-in form is `SUBMISSION.md`. We're closest to Privacy idea **B, "Policy vs promise"** (or "our own").

### What judges score (from the slides and SUBMISSION.md)

Judges read team cards and pick 6 finalists, scoring each 1–3 on:
1. **Real concern:** came from the room, a specific *who* and a failure a neighbor would recognize.
2. **Works on real data:** something runs on real data and shows what it found, as **one measured number with its sample size**.
3. **Honest:** names one limitation and **who is accountable** if it fails.
4. Tiebreak: would someone outside the room use it?

Demo is 3 minutes: the concern → it working on real data → one honest limit. Build every feature toward that.

### Organizer rules that bind us

- **No exact camera locations.** The Privacy track says: "Mapping exact camera locations or helping anyone evade or target a device is out of scope." We show agencies, policies and data flows, plus at most aggregate counts (e.g. per neighborhood), never camera dots.
- **No API keys and no private data** in the repo.
- **Check every number we say out loud** against its source; extraction models make confident mistakes on numbers.
- The repo must be **public** by 8:30 so judges can open it (it's private now; kv1514 flips it).

## 1. What we are building

An interactive Flock data journey map for San Francisco: where a licence-plate read goes after a Flock camera captures it, which rule governs each hop, and where documented practice has diverged from the rule.

The journey (hops):

```
Camera → Flock cloud → SFPD → NCRIC → out-of-state / federal agencies
```

For every hop the app shows:

- **Who holds the data** (private company, local law enforcement, regional fusion centre, federal / out-of-state)
- **The governing rule** (statute, SFPD policy, contract term, retention period)
- **Any documented breach or concern** (audit finding, lawsuit, news report)
- **A source link** for each of the above. No source, no claim.

### Scope is cut to fit the build window (about an hour)

| # | Feature | Status |
|---|---|---|
| P0 | Interactive hop-by-hop flow diagram: click a hop, see its rule + breach + source link | **the whole demo, must ship** |
| P0 | **The number**, one line at the top of the page: e.g. "5 hops, N rules, X possible conflicts, every one sourced", plus the headline finding (299 improper NCRIC/WSIN searches in 12 months). Hand-checked. Judges score this. | must ship (it's a header line, not a feature) |
| P1 | Source list at the bottom of the page (links only, no PDF downloads) | only if P0 works by 8:05 |
| cut | Map of SF camera locations (DeFlock data). Exact locations are also against the organizer rules; at most mention neighborhood counts in the pitch | **cut**, mention in the pitch as "next" |
| cut | Policy vs promise table across SF departments (`sf-surveillance-inventory`) | **cut**, mention in the pitch as "next" |
| cut | "Canary plate" demo: a tracked image that logs who opens it, checked against the policy for that access tier | **cut**, mention in the pitch as "next" |

Do not start anything marked cut. Do not add features. A working hop diagram with real sources beats everything else.

**About the canary demo (cut, pitch only):** we cannot and will not put trackers on real Flock data or real police systems. The demo uses our own test image with a tracking pixel / unique ID, served from our own local server and opened by us on stage, to illustrate the idea: "if every access were logged like this, you could check each open against the rule for that tier." Label it clearly as a simulation in the UI.

## 2. Sources

**Pre-event research is already done (Nov 17, afternoon).** Start from these instead of from scratch:

- [research/flock-laws.md](research/flock-laws.md): every rule per hop (SB 34, AG bulletin, SFPD ALPR policy, NCRIC policy, Values Act, shield law, Flock terms), with exact quotes, page numbers and URLs, plus retention and bill status.
- [research/flock-data.md](research/flock-data.md): camera counts and Overpass queries, the DeFlock sharing-network files, the 2026 surveillance report findings, and documented incidents per hop.
- [data/hops.json](data/hops.json): **a filled-in draft of the contract file**, 5 hops with rules, retention and breaches. Build can render it right away; Research verifies the `needs_check` items and the "Unverified leads" in the two research files.
- [research/crashbox.md](research/crashbox.md): everything for the backup idea (datasets, rules, demo crashes, a one-hour plan).

Known gaps: the Flock transparency portal blocks automated fetching, so read its numbers by hand in a browser. The 1.6 million out-of-state searches figure has disputed attribution.

| Source | What it gives us |
|---|---|
| [SFPD Flock Transparency Portal](https://transparency.flocksafety.com/san-francisco-ca-pd) | Camera counts, retention disclosures, agency access listings |
| [SFPD 2026 Surveillance Report](https://www.sanfranciscopolice.org/pol-biannual-surveillance-report-2026) | Documented incidents and access-policy concerns |
| [SFPD Surveillance Policies (19B)](https://www.sanfranciscopolice.org/your-sfpd/policies/19b-surveillance-technology-policies) | Official rules governing each technology |
| [DeFlock Open Data](https://github.com/flockhopper3/deflock-data) | Camera locations and sharing-network data pipelines |

Handy specifics:

- **Starter-repo datasets worth using:** `sf-surveillance-inventory` (https://www.sf.gov/surveillance-technology-inventory, one policy PDF per department and technology) and `eff-ca-alpr` (scans vs hotlist hits for 89 CA agencies, 2021, historical only).
- **Camera counts (cut for tonight; aggregate only if ever used, never show points):** DeFlock's daily US GeoJSON is at `https://data.dontgetflocked.com/cameras.geojson.gz` (OpenStreetMap ALPR tags). Filter to the SF bounding box: west -122.52, south 37.70, east -122.35, north 37.83. Or query Overpass directly: `node["surveillance:type"="ALPR"](37.70,-122.52,37.83,-122.35);`
- **Sharing network:** the DeFlock repo's `eyesonflock/` folder turns transparency-portal snapshots into agency nodes + who-shares-with-whom adjacency. Good evidence for the out-of-state / federal hops.

**To verify before it appears in the app** (Research owns this): the exact California rule on sharing ALPR data with out-of-state and federal agencies (start with Civil Code §1798.90.5 et seq. / SB 34 and the Attorney General's guidance), including whether and how a California court order or warrant changes it. Quote the statute text and cite the section; do not paraphrase from memory.

## 3. Who does what

Two humans, two Claude sessions. Each session uses the model that suits the job:

| Role | Model | Owns | Writes to |
|---|---|---|---|
| Research | Fable 5.2 | Reading the audit, policies, lawsuit, portal; extracting each hop with sources; downloading the source PDFs | `data/`, `sources/` |
| Build | Opus | The web app: flow diagram, source panel, map, canary demo | `app/` |
| Writing | Sonnet | UI copy, hop explanations in plain English, README, pitch/demo script | `copy/`, `README.md` |

- **Agent A** (human: kv1514) is running **Build** (Opus) — owns `app/`, writes `log/build.md`
- **Agent B** (human: Helen, fanghelen) is running **Research + Writing** (Fable 5.2 for research, Sonnet for writing) — owns `data/`, `sources/`, `copy/`, `README.md`, writes `log/research.md`

If you are an agent reading this: ask your human which of the two they are, then act as that agent.

### Ownership rule

Only write inside the folders your role owns. If you need a change in someone else's folder, ask for it in the Handoff Log. This file is shared: only append to section 7 (Decisions), and only after both humans agree.

### Ground rules (both agents)

- **Public data only.** Read published pages and documents. Never log into, probe, scrape behind a login, or plant anything in Flock's or SFPD's systems.
- **Say "possible conflict" or "concern", not "violation".** We show where public data and public policy don't line up; we don't make legal findings.
- **No API keys in the browser or in git.** Keys live in `.env` (gitignored), read as `ANTHROPIC_API_KEY`.

## 4. Repo layout

```
FLOCKCAST.md          ← this file
CLAUDE.md             ← auto-loaded pointer to this file
log/
  build.md            ← Agent A's handoff entries
  research.md         ← Agent B's handoff entries
data/
  hops.json           ← the contract between Research and Build (schema below)
  camera_counts.json  ← cut for tonight (would be counts per neighborhood, never points)
research/             ← pre-event research notes (read-only reference for both agents)
sources/              ← downloaded PDFs + sources.md index
copy/                 ← UI strings, pitch script
app/                  ← the web app
```

## 5. The data contract: `data/hops.json`

Research produces it, Build consumes it. Build should start immediately against the stub below and not wait for real data. Changing the schema requires a Handoff Log entry and an ack from the other agent.

```json
{
  "updated": "2026-11-17T19:30:00-08:00",
  "hops": [
    {
      "id": "camera-to-flock",
      "order": 1,
      "from": { "name": "Flock camera", "tier": "device" },
      "to":   { "name": "Flock Safety cloud", "tier": "private_company" },
      "what_moves": "Plate image, plate number, time, location, vehicle attributes",
      "rules": [
        {
          "summary": "One-sentence plain-English rule",
          "quote": "Exact text from the source, under 40 words",
          "citation": "SFPD ALPR Policy §4.2",
          "url": "https://…",
          "local_file": "sources/sfpd-alpr-policy.pdf",
          "page": 3
        }
      ],
      "retention": { "summary": "…", "url": "https://…" },
      "breaches": [
        {
          "date": "2025-08",
          "summary": "What happened, one or two sentences",
          "kind": "audit_finding | lawsuit | news_report | official_admission",
          "url": "https://…"
        }
      ],
      "confidence": "verified | needs_check",
      "notes": ""
    }
  ]
}
```

- `tier` is one of: `device`, `private_company`, `local_le`, `regional_fusion`, `out_of_state`, `federal`
- Every `rules[]` and `breaches[]` item must have a `url`. Anything Research could not source goes in with `"confidence": "needs_check"` and Build renders it greyed-out or hides it.
- Allegations in a lawsuit are labelled as allegations, not facts.
- `data/camera_counts.json` (cut for tonight): `{"source_url": "...", "retrieved": "2026-11-17", "areas": [{"name": "Mission", "count": 12}]}`. Counts only, no coordinates.

## 6. How the agents talk to each other

The agents cannot message each other directly. They communicate through files in the shared git repo, with the humans as couriers.

### Both agents run at the same time

- Agent A and Agent B work in parallel from minute one. Neither waits for the other.
- **Build** starts immediately against the stub `hops.json` in section 5 (create it in `app/fixtures/hops.json` if `data/hops.json` doesn't exist yet). Swap to the real file when it lands.
- **Research** starts immediately on the sources in section 2 and pushes `data/hops.json` early and incomplete (`needs_check`), then improves it.
- **Never stop and wait.** If you need something from the other agent, log a `REQUEST` or `BLOCKED` entry, then keep going on everything that doesn't depend on it.
- **Separate log files**, so parallel pushes never conflict: Build appends only to `log/build.md`, Research + Writing appends only to `log/research.md`. Each agent reads the other's log.
- **Push with rebase:** `git pull --rebase` then `git push`. Because folders don't overlap, this should never conflict; if it does, stop and tell your human.
- Within your own role you may fan out to subagents for independent pieces (e.g. Research reading several PDFs at once), as long as they stay in your folders.

### Protocol

1. `git pull --rebase` at the start of every turn. Read the other agent's log from where you last left off.
2. Do your work, in your own folders only.
3. Before you stop, append one entry to your own log file, commit, push. Small commits, often.
4. If you are blocked on the other agent, write a `BLOCKED` entry and tell your human to ping their partner. Then carry on with anything that isn't blocked.
5. Never rewrite or delete someone else's log entry. Never force-push.

### Entry format

```
### [HH:MM] <Role> → <Role or ALL> · <STATUS>
**Done:** what changed, with file paths
**Need:** what you need from the other agent (or "nothing")
**Next:** what you're doing next
```

`STATUS` is one of: `UPDATE`, `REQUEST`, `BLOCKED`, `ACK`, `SCHEMA-CHANGE`, `DONE`

Example:

```
### [19:42] Research → Build · UPDATE
**Done:** data/hops.json now has hops 1–3 verified; hop 4 (NCRIC→federal) is needs_check. Added 3 PDFs to sources/.
**Need:** nothing
**Next:** verifying the out-of-state sharing rule against the statute text.
```

## 7. Decisions (append-only)

Short record of anything both sides must agree on, so nobody re-litigates it mid-build.

- Scope is San Francisco only.
- Every claim needs a source link, or it does not ship.
- Canary demo is a labelled simulation using our own test image.
- **Scope cut (Nov 17):** the hop diagram is the whole demo. The camera map and the canary demo are cut; ignore the MapLibre and `app/canary/` parts of the stack line below. No PDF downloads, links only.
- Stack (proposed, both humans confirm): static site in `app/` (`index.html` + `app.js` + `style.css`), no build step. MapLibre GL from CDN (`https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js` + `.css`) with the OpenFreeMap positron basemap (`https://tiles.openfreemap.org/styles/positron`) for the P1 map; the flow diagram in plain HTML/SVG. Serve with `python3 -m http.server 8000` from the repo root, open http://localhost:8000/app/. Research scripts, if any, in Python inside `data/`. The canary demo, if built, is a tiny local Python server in `app/canary/`.

## 8. Milestones (60-minute build, 7:30 → 8:30)

Before 7:30: in the Privacy corner, write the statement card ("How might we help [who] do [what] so that [outcome]?", build idea B or "our own").

| When | Research + Writing (Agent B) | Build (Agent A) |
|---|---|---|
| 7:30–7:40 | `git pull`; `data/hops.json` is already drafted. Start verifying its `needs_check` items | Single page in `app/` rendering the hop diagram from `data/hops.json`; clicking a hop opens a detail panel |
| 7:40–8:05 | Verify one hop at a time; push after **each** hop (flip to `verified`, add quote + URL). Hand-check the headline number | Show rules, breaches and source links per hop; grey out `needs_check`; the number at the top |
| 8:05–8:15 | Fill in `SUBMISSION.md` (six answers, one limitation, who is accountable); 3-minute demo script in `copy/`. Final `hops.json` push by 8:15, then **stop changing data** | Styling for the projector; source list (P1) if P0 works; click through every hop |
| 8:15–8:25 | **Freeze.** Rehearse the demo once together | Freeze. Bug fixes only. Make the repo public |
| by 8:30 | Final push, team card to a judge | same |

**Time rules**

- Research: 5 minutes per hop, maximum. If a claim can't be sourced in that time, leave it `needs_check` and move on. Links are enough; skip downloading PDFs.
- Build: no framework, no build step, no backend. If something takes more than 5 minutes to get working, drop it.
- If research is late, Build ships with whatever is in `data/hops.json` at 8:15.

## Handoff Log

Lives in two files so both agents can push at once: `log/build.md` (Agent A writes) and `log/research.md` (Agent B writes). Append only, newest at the bottom.
