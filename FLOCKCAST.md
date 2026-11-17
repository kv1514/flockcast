# FlockCast — Track the Flock

Shared brief for both teammates' Claude agents. Read this whole file before doing anything, and re-read the other agent's log (`log/`) at the start of every turn. This file is the single source of truth; if chat instructions conflict with it, ask your human.

**Event:** Claude Impact Lab SF: AI Trust & Safety, Tue Nov 17 2026, Privacy track ("map the surveillance tech deployed in SF and where the data goes"). https://luma.com/claude-sf-impact-lab
**Build window: about 75 minutes.** Build starts 7:15 PM, submissions close 8:30 PM, demos 8:45. The organizers share a starter repo with public datasets at kickoff; if your human pastes it, check it first.

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

### Features, in priority order

| # | Feature | Status |
|---|---|---|
| P0 | Interactive hop-by-hop flow diagram with rule + breach + source per hop | must ship |
| P0 | Source library: the actual policies / reports (PDFs, links) each claim cites | must ship |
| P1 | Map of SF camera locations (DeFlock data) | if time |
| P2 | "Canary plate" demo: a tracked image that logs who opens it, checked against the policy for that access tier | stretch |

**About the P2 canary demo:** we cannot and will not put trackers on real Flock data or real police systems. The demo uses our own test image with a tracking pixel / unique ID, served from our own local server and opened by us on stage, to illustrate the idea: "if every access were logged like this, you could check each open against the rule for that tier." Label it clearly as a simulation in the UI.

## 2. Sources

**Pre-event research is already done (Nov 17, afternoon).** Start from these instead of from scratch:

- [research/flock-laws.md](research/flock-laws.md): every rule per hop (SB 34, AG bulletin, SFPD ALPR policy, NCRIC policy, Values Act, shield law, Flock terms), with exact quotes, page numbers and URLs, plus retention and bill status.
- [research/flock-data.md](research/flock-data.md): camera counts and Overpass queries, the DeFlock sharing-network files, the 2026 surveillance report findings, and documented incidents per hop.
- [data/hops.json](data/hops.json): **a filled-in draft of the contract file**, 5 hops with rules, retention and breaches. Build can render it right away; Research verifies the `needs_check` items and the "Unverified leads" in the two research files.
- [research/crashbox.md](research/crashbox.md): everything for the backup idea (datasets, rules, demo crashes, a 75-minute plan).

Known gaps: the Flock transparency portal blocks automated fetching, so read its numbers by hand in a browser. The 1.6 million out-of-state searches figure has disputed attribution.

| Source | What it gives us |
|---|---|
| [SFPD Flock Transparency Portal](https://transparency.flocksafety.com/san-francisco-ca-pd) | Camera counts, retention disclosures, agency access listings |
| [SFPD 2026 Surveillance Report](https://www.sanfranciscopolice.org/pol-biannual-surveillance-report-2026) | Documented incidents and access-policy concerns |
| [SFPD Surveillance Policies (19B)](https://www.sanfranciscopolice.org/your-sfpd/policies/19b-surveillance-technology-policies) | Official rules governing each technology |
| [DeFlock Open Data](https://github.com/flockhopper3/deflock-data) | Camera locations and sharing-network data pipelines |

Handy specifics:

- **Camera locations (P1):** DeFlock's daily US GeoJSON is at `https://data.dontgetflocked.com/cameras.geojson.gz` (OpenStreetMap ALPR tags). Filter to the SF bounding box: west -122.52, south 37.70, east -122.35, north 37.83. Or query Overpass directly: `node["surveillance:type"="ALPR"](37.70,-122.52,37.83,-122.35);`
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
  cameras.geojson     ← from DeFlock, SF only (P1)
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
- `data/cameras.geojson` (P1): a GeoJSON FeatureCollection of points; each feature's `properties` has at least `id`, `operator`, `brand`, `direction`, `source_url`.

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
- Stack (proposed, both humans confirm): static site in `app/` (`index.html` + `app.js` + `style.css`), no build step. MapLibre GL from CDN (`https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js` + `.css`) with the OpenFreeMap positron basemap (`https://tiles.openfreemap.org/styles/positron`) for the P1 map; the flow diagram in plain HTML/SVG. Serve with `python3 -m http.server 8000` from the repo root, open http://localhost:8000/app/. Research scripts, if any, in Python inside `data/`. The canary demo, if built, is a tiny local Python server in `app/canary/`.

## 8. Milestones (75-minute build, 7:15 → 8:30)

| When | Research + Writing (Agent B) | Build (Agent A) |
|---|---|---|
| 7:15–7:30 | Push stub `data/hops.json` with all 4 hops (`needs_check`); start downloading sources into `sources/` | Scaffold `app/`; render the flow diagram from the fixture |
| 7:30–7:55 | Verify hops against sources; fill rules + breaches with quotes and URLs | Hop detail panel with rules, breaches, source links; switch to real `data/hops.json` |
| 7:55–8:10 | Plain-English copy per hop in `copy/`; SF-only `cameras.geojson` if time | Source library page; map (P1) if P0 is solid |
| 8:10–8:20 | Pitch script + README | Polish for the projector; canary demo (P2) only if everything else works |
| 8:20–8:30 | **Freeze.** Bug fixes only. Final push, submit, rehearse the demo. | same |

## Handoff Log

Lives in two files so both agents can push at once: `log/build.md` (Agent A writes) and `log/research.md` (Agent B writes). Append only, newest at the bottom.
