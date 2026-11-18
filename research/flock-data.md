# FlockCast: data and documented incidents

Researched 2026-11-17. Every fact below comes from a page fetched this session; the URL is given next to it. Allegations in lawsuits are labelled as allegations. Anything not confirmed is under "Unverified leads".

## Summary

- **Cameras:** SFPD runs about 400 Flock fixed ALPR cameras, installed starting March 2024 (SFPD Biannual Surveillance Report 2026). The EyesOnFlock snapshot of SFPD's Flock portal lists **475 cameras** (DeFlock data, generated 2026-11-16). OpenStreetMap has **430 ALPR nodes tagged operator=SFPD** in the SF bbox.
- **Flock to out-of-state agencies:** Flock's "Nationwide Lookup" let out-of-state agencies query SFPD's network from about **Aug 2024 to Feb 2025**. SFPD says Flock turned it on without Department authorization. The SF Standard counted **1.6M+ out-of-state searches**, nearly 4,000 out-of-state agencies, and **at least 19 ICE-related searches**.
- **SFPD to NCRIC to WSIN to federal and out-of-state agencies:** SFPD's own May 2026 audit found **299 improper queries** between May 1 2025 and May 12 2026. They were run by WSIN analysts using access that NCRIC had shared, on behalf of federal and out-of-state agencies. Chief Lew cut off NCRIC's access.
- **Official findings:**
  - The HRC (Sept 28 2026) found no Sanctuary Ordinance violation by SFPD, but said Flock's conduct arguably helped federal immigration enforcement.
  - Mayor Lurie's rules (Sept 29 2026) require Flock to delete data after 30 days. SFPD may keep its own copy for up to a year.
  - The Board of Supervisors votes on extending the Flock contract in February 2027.

## Transparency portal numbers

**Direct fetch failed.** https://transparency.flocksafety.com/san-francisco-ca-pd returned HTTP 403 to WebFetch, and curl got a Cloudflare "Just a moment..." JavaScript challenge. I did not try to get past the challenge. The live portal numbers need to be read in a real browser by a person.

**Proxy: EyesOnFlock snapshot via DeFlock** (https://deflockdata.dontgetflocked.com/sharing-network-nodes.geojson, meta `generatedAt` 2026-11-16T15:01:39Z, source `https://eyesonflock.com/api/v1/data`). The node for `san-francisco-ca-pd`:

| Field | Value | Note |
|---|---|---|
| cameras | 475 | |
| searches | 0 | Field present but zero: either SFPD does not publish it, or the scrape missed it. Not a real zero. |
| vehiclesCaptured | 0 | Same caveat as `searches`. |
| hotlistHits | 0 | Same caveat as `searches`. |
| connectionCount | 322 | Size of the union of inbound and outbound sharing edges. |
| population | 836,321 | |

**Sharing edges** (computed from https://deflockdata.dontgetflocked.com/sharing-network-adjacency.json):
- SFPD declares **307 outbound** sharing partners and **147 inbound**.
- All are California entities. 302 carry state "CA". The 5 with a blank state are also Californian: Cal Fire, the University of California, CSU Long Beach PD, the Monterey County DA, and Blue Lake Rancheria Tribal PD.
- **No out-of-state agency and no federal agency** appears in SFPD's current portal sharing list.
- **NCRIC is not in SFPD's current outbound list**, which matches Chief Lew cutting NCRIC off. In the wider graph, NCRIC appears as node `ncric` with 93 connections, and WSIN appears as `western-states-information-network-ca` with 13.
- Notable statewide entities on SFPD's outbound list: California Highway Patrol, CA Dept of Corrections, CA Dept of Fish & Wildlife, LAPD, LA County SD, and several District Attorney offices.

**Retention and policy statements:** I could not read them from the portal itself. The documented policy is in "SF approval history" below.

## Camera counts (aggregate only)

Organizer rule for the Privacy track: no mapping of exact camera locations. This section keeps **counts only**; pointers to point-level camera data were removed on purpose.

Source of the counts: OpenStreetMap surveillance tags (crowd-sourced, ODbL), queried 2026-11-17 for the SF bounding box.

| Filter | Count |
|---|---|
| All license-plate readers (ALPR) | **547** |
| Manufacturer Flock | **460** |
| Operator San Francisco Police Department | **430** |

The 547 includes non-Flock readers, such as the Golden Gate Bridge toll plaza.

Per supervisor district counts are in `app/district_counts.json` (totals and district outlines only), built by `app/tools/district_counts.py`.

Caveat: OSM is crowd-sourced. These are counts of mapped cameras, not an official SFPD list (SFPD reports about 400).

## Sharing network data

Source: the `eyesonflock/` README, https://raw.githubusercontent.com/flockhopper3/deflock-data/main/eyesonflock/README.md

The pipeline runs weekly on GitHub Actions. It turns an EyesOnFlock snapshot of Flock transparency portals into three files:

| File | Content |
|---|---|
| `https://deflockdata.dontgetflocked.com/sharing-network-nodes.geojson` | GeoJSON FeatureCollection, gzip-encoded. One Point per agency, 6,889 features in the current run. |
| `https://deflockdata.dontgetflocked.com/sharing-network-adjacency.json` | `{portalSlug: [slugs it declares sharing to]}`. Outbound edges only. 1,015 keys, 508,735 directed edges. |
| `https://deflockdata.dontgetflocked.com/sharing-network-meta.json` | Run summary: snapshotPortals 1685, portalCount 1683, likelyAggregators 258, inactive 101, runId 43891914045. |

The 18 node properties (read from the file):
`aliases, cameras, city, connectionCount, geocodeMethod, hotlistHits, id, isInactive, isJunk, isLikelyAggregator, isPortal, name, population, portalSlug, searches, state, type, vehiclesCaptured`

Notes:
- `connectionCount` is the size of the union of inbound and outbound edges.
- Use `curl --compressed`. The README says these went live on R2 on 2026-09-10.

## Surveillance report findings

Source: SFPD "POL Biannual Surveillance Report 2026", https://www.sanfranciscopolice.org/pol-biannual-surveillance-report-2026. It is an HTML page updated 2026-11-17, with data through 2026-09-06. **It has no PDF, so there are no page numbers; findings are cited by section.**

**Cameras and tools**
- 400 fixed Flock ALPR cameras, first installed March 2024.
- 2 Motorola vehicle-mounted ALPRs, in testing since June 2026.
- Plate searches are also available through Thomson Reuters CLEAR, which draws on the Motorola/Vigilant network.

**Searches and search rules**
- The report gives **no total search count**.
- Department Notice 26-011 requires an incident number, dispatch call number, or stated reason for every search.

**Data sharing**
- NCRIC shared SFPD ALPR access with WSIN.
- WSIN analysts ran **299 queries (May 1 2025 to May 12 2026) for federal and out-of-state agencies**. The report says none referenced immigration enforcement or reproductive health care.
- Flock's "Nationwide Lookup" let out-of-state agencies query the network from about **Aug 2024 to Feb 2025**. The report says Flock **enabled it without Department authorization**. It has since been disabled for all California agencies.

**Violations listed (3 in the last year)**
1. An officer searched Flock for a spouse's stolen car and posted Flock images on social media. This was a conflict-of-interest violation, sent to Internal Affairs and reported in the Q3 2025 Disciplinary Review Board report.
2. The NCRIC/WSIN sharing. Chief Lew reported it to the Police Commission on 2026-06-17, and the DPA and HRC were notified.
3. Nationwide Lookup. The HRC found no Sanctuary Ordinance violation.

**Audits and reviews**
- May 2026: a routine compliance audit found the NCRIC/WSIN issue.
- Sept 2025: EFF and ACLU sent a demand letter.
- Nov 2025: an HRC Request for Inquiry was filed.
- Sept 2026: the HRC report was released.

**Lawsuit:** A federal suit filed in Dec 2025 alleging a Fourth Amendment violation is listed as **dismissed**.

**Crime statistics the report cites**
- Jan 1 to Nov 16 2025: motor vehicle theft 2,730 vs 4,907 the year before (-44%).
- Jan 1 to Sep 6 2026: motor vehicle theft -22%.
- The report says "Multiple factors" contributed to the declines, so it does not credit ALPR alone.

**Internal inconsistencies:** burglary is given as both -28% and -29%. The Department's HRC response is dated Aug 26 2026, before the HRC report.

The 19B annual ALPR surveillance impact report PDFs were not fetched (see Unverified leads).

## Documented incidents by hop

### Camera → Flock cloud

| Date | Kind | Summary | URL |
|---|---|---|---|
| 2024-02-20 to 2027-02-19 | news_report | SFPD's Flock contract is worth more than $3.9M, with about 400 cameras on major roadways. | https://sfstandard.com/2025/09/08/sfpd-flock-alpr-ice-data-sharing/ |
| 2026-09-29 | news_report | Flock previously kept SF data for 12 months. New rule: Flock deletes after 30 days and SFPD keeps sole control for up to a year. | https://sfstandard.com/2026/09/29/lurie-tightens-police-surveillance-rules-sf-avoids-targeting-flock/ ; https://www.nbcbayarea.com/news/local/san-francisco-flock-cameras-data-access/4150306/ |
| 2026-08-14 | news_report | Flock now recommends 7-day retention instead of a 30-day default, but it does not apply automatically to existing customers. Flock also announced case codes and an audit tool required by year's end, plus "offense filtering". | https://www.route-fifty.com/digital-government/2026/08/flock-safety-tightens-safeguards-states-cities-question-surveillance-network/415455/ |
| 2026-07-16 | news_report | Flock units are classed as ALPRs, not "public safety cameras", so they skip that ordinance's hearing and reporting rules. Per Gazetteer, ALPR data is kept 1 year, up to 5 years if tied to an investigation. | https://sf.gazetteer.co/the-sfpd-technicality-that-may-bring-a-flock-to-your-street |

### Flock → SFPD / Flock → out-of-state (Nationwide Lookup)

| Date | Kind | Summary | URL |
|---|---|---|---|
| Aug 2024 to Feb 2025 | official_admission | SFPD's report says Flock enabled Nationwide Lookup without Department authorization, letting out-of-state agencies query SF data. | https://www.sanfranciscopolice.org/pol-biannual-surveillance-report-2026 |
| 2025-09-08 | news_report | Public-records logs showed **1.6M+ out-of-state searches** by about 4,000 agencies, and logs show no out-of-state access after Feb 11 2025. At least 19 searches were marked ICE-related ("ICE Fugitive", "Assist ICE"), by Franklin County GA, Dallas PD and Milford MA, mostly Oct 23 to Dec 27 2024. | https://sfstandard.com/2025/09/08/sfpd-flock-alpr-ice-data-sharing/ |
| 2025-06-25 | news_report | Flock removed CA, IL and VA cameras from Nationwide Lookup after reports of ICE lookups and a Texas abortion-related search. | https://www.404media.co/flock-removes-states-from-national-lookup-tool-after-ice-and-abortion-searches-revealed/ |
| 2025-09-18 | news_report | EFF and ACLU NorCal sent SFPD a demand letter: audit, compliance protocols, sanctions. They argue the sharing violates SB 34 and SB 54. | https://www.eff.org/deeplinks/2025/09/eff-aclu-sfpd-stop-illegally-sharing-data-ice-and-anti-abortion-states |
| 2026-02-26 | lawsuit | **Allegation:** Javorsky et al. v. Flock (Gibbs Mura) allege out-of-state and federal agencies accessed SFPD's database more than 1.6M times over 7 months, in violation of the CA ALPR Privacy Act. Flock says it will "vigorously defend". | https://sfist.com/2026/02/28/lawsuit-says-flock-allowed-out-of-state-agencies-access-to-sfpd-database-1-6-million-times |
| 2026-09-28 | audit_finding | The HRC report, after a 10-month investigation, found no sanctuary violation by SFPD: Flock is a contractor and turned on national search without police knowledge. Its 5 recommendations: documented reason per search, SFPD control of Nationwide Lookup, enable all transparency options, 30-day deletion, regular reviews with Flock. | https://missionlocal.org/2026/09/sfpd-flock-cameras-human-rights-commission-report-sanctuary/ |

### SFPD → NCRIC → WSIN

| Date | Kind | Summary | URL |
|---|---|---|---|
| 2026-06-17 | audit_finding / official_admission | A May 2026 compliance audit found NCRIC had queried SFPD's Flock network for federal and out-of-state agencies: **299 improper inquiries** in about a year, 0.005% of all inquiries. The searches were run by WSIN analysts. The same requests went to 531 to 763 other agencies. Chief Lew cut NCRIC's access. Flock says it was not a system failure and attributes the searches to "authorized users at a California state agency". | https://www.ktvu.com/news/sfpd-audit-shows-flock-cameras-accessed-behalf-federal-out-of-state-agencies |
| 2026-02-26 | news_report (advocacy) | Footnote4a / Have I Been Flocked compared NCRIC policies. The 2024 policy dropped MFA and encryption requirements and the "justification for access" audit field, and moved retention to a "maximum of 365 days". Its claims that NCRIC shares out of state are the author's inference. | https://footnote4a.org/news/ncric |

### → Federal (ICE / CBP / HSI)

| Date | Kind | Summary | URL |
|---|---|---|---|
| 2025-05-27 | news_report | Danville, IL logs show 4,000+ nationwide and statewide lookups run by local police for or about ICE ("side door" access). ICE has no Flock contract. | https://www.404media.co/ice-taps-into-nationwide-ai-enabled-camera-network-data-shows |
| 2025-08-25 | official_admission | Flock paused pilots with CBP and HSI after an Illinois audit found CBP had accessed Illinois data. CEO Langley: "We clearly communicated poorly." Federal users are now excluded from statewide and nationwide lookup. | https://abc7news.com/post/flock-safety-license-plate-camera-company-halts-cooperation-federal-agencies-among-investigation-concerns-including-il/17653876/ ; https://www.flocksafety.com/blog/ensuring-local-compliance |
| 2025-10-21 | audit_finding (academic) | UW Center for Human Rights: Border Patrol searched data from 17+ Washington agencies. 8 had 1:1 sharing turned on; 10 show "back door" searches without explicit sharing. | https://jsis.washington.edu/humanrights/2025/10/21/leaving-the-door-wide-open/ |

### Statewide context: CA enforcement

| Date | Kind | Summary | URL |
|---|---|---|---|
| 2025-10-03 | lawsuit | **Allegation:** CA AG Bonta sued El Cajon (San Diego Superior Court, writ of mandate) for sharing ALPR data with agencies in 26 states despite warnings, in violation of SB 34. AG bulletin Oct 2023: "public agency" excludes out-of-state and federal agencies. | https://www.oag.ca.gov/news/press-releases/attorney-general-bonta-sues-el-cajon-illegally-sharing-license-plate-data-out |
| 2025-12-28 | lawsuit | **Allegation:** a proposed class action in N.D. Cal. claims SFPD unlawfully shared data from "nearly 500" Flock cameras with state and federal agencies. SFPD's biannual report says the Dec 2025 Fourth Amendment suit was dismissed. | https://news.bloombergtax.com/esg/san-franciscos-license-plate-cameras-data-sharing-draw-suit |

## SF approval history

| Date | Event | Source |
|---|---|---|
| 2023 | The Board of Supervisors approved SFPD's Chapter 19B ALPR policy, which let SFPD adopt Flock. | https://sf.gazetteer.co/the-sfpd-technicality-that-may-bring-a-flock-to-your-street |
| 2024-02-20 | Flock contract starts: more than $3.9M, Feb 20 2024 to Feb 19 2027, funded by a Sept 2023 BSCC organized-retail-theft grant. | https://sfstandard.com/2025/09/08/sfpd-flock-alpr-ice-data-sharing/ ; https://www.sanfranciscopolice.org/node/49946 |
| 2024-03-19 | Install begins; about 90 days to roll out "hundreds" of cameras. Department Notice 24-052 limits phase 1 to designated, trained personnel. | https://www.sanfranciscopolice.org/node/49946 |
| 2024-03-05 | **Prop E** passed: 54.1% yes, 45.9% no (Mission Local, Mar 15 2024 update). | https://missionlocal.org/2024/03/election-results-march-2024-dccc-assembly-props-court-maps-live-updates/ |
| 2026-09-29 | Mayor Lurie's administrative rules (no Board vote): Flock deletes after 30 days; SFPD keeps up to 1 year, with leadership approval needed after 30 days; incident number on every search; monthly log reviews; annual DPA audits. EFF calls them weak safeguards. Board vote on contract extension expected Feb 2027. | https://missionlocal.org/2026/09/san-francisco-flock-cameras-daniel-lurie-guidelines/ ; https://www.kqed.org/news/12101844/san-francisco-keeps-its-flock-cameras-with-new-restrictions ; https://www.eff.org/deeplinks/2026/09/while-country-rejects-alpr-mass-surveillance-sf-settles-weak-safeguards |

What Prop E changed (https://missionlocal.org/2024/02/prop-e-police-surveillance-sf/):
- It exempts new police drones and surveillance cameras from the city's surveillance technology ordinance, so no Board-approved policy is needed for them.
- It lets SFPD use new surveillance technology for up to a year before the Board approves a policy.
- The City Attorney said it creates a loophole around the 2019 facial-recognition ban; EFF disagreed.

Note: Flock ALPRs themselves were approved under the 2023 Chapter 19B ALPR policy, not under Prop E (Gazetteer).

## Unverified leads

- **Live SFPD transparency portal:** camera count, retention, 30-day searches, and the agency list could not be read (Cloudflare 403). Open https://transparency.flocksafety.com/san-francisco-ca-pd in a browser.
- **SFPD 19B annual ALPR surveillance impact reports (PDFs):** not fetched, so there are no page-numbered quotes.
- **HRC report PDF:** not fetched. https://media.api.sf.gov/documents/2026_gdCw4CP.09.28_HRC_12H_Report_COMPLETE.pdf
- **Board of Supervisors 2023 ALPR ordinance:** a search result points to https://www.sfbos.org/sites/default/files/o0255-23.pdf (snippet: passed on first reading Dec 5 2023, policy "modeled off" NCRIC's 12-month retention). The PDF was not fetched.
- **Prop E certified result:** a search snippet attributed to Ballotpedia gives 120,529 yes (54.09%) to 102,288 no. Ballotpedia returned an empty page when fetched.
- **Camera counts disagree:** "nearly 500" (SF Standard 2026, Bloomberg suit), 475 (EyesOnFlock portal snapshot), 400 (SFPD report), 430 to 460 (OSM).
- **The 1.6M figure:** attributed both to the SF Standard's log analysis and to the plaintiffs' lawyers; Techdirt reportedly says it is statewide. The SF Standard article itself says 1.6M+ searches of SFPD data.
- **Dismissal of the Dec 2025 suit:** stated only in SFPD's report. The docket was not checked.
- **Javorsky v. Flock:** search snippets say it was amended Apr 3 2026 into federal court, case 4:26-cv-02382-HSG. Not fetched.
- **Marin County Sheriff:** EFF mentions an update that the Marin County Sheriff shared Flock data out of state and with federal agencies. Not fetched.
- **NCRIC's 1-year / 5-year retention:** a BlueLeaks document reportedly shows NCRIC keeping ALPR data up to 1 year, or 5 if linked to an investigation. Seen only in search snippets.
- **Method note:** to compute the sharing edges, the two DeFlock JSON files were briefly written to a temp directory and deleted right after.
