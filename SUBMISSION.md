# Submission: FlockCast

## Team card

**Team name:** FlockCast

**Statement number:** TODO (from the card written in the Privacy corner)

**First names:** Helen, TODO

**Statement:** How might we help **San Francisco residents and the supervisors who vote on SFPD's Flock contract** **see where a license-plate read goes after a Flock camera captures it, and which rule governs each step** so that **the contract vote (due Feb 2027) is decided on documented practice, not on promises**? Build idea: **B, "Policy vs promise"**. We'll know it worked if **someone outside the room can name, in one minute, the step where SF plate data reached out-of-state or federal agencies, and the rule it conflicts with.**

## Six short answers

**1. The concern:** An SF driver whose plate is read by one of SFPD's ~400 Flock cameras. State law (SB 34) says that read may only go to California state or local agencies. But between Aug 2024 and Feb 2025, Flock's Nationwide Lookup left SF's data open to out-of-state police. Separately, an SFPD audit found 299 searches run for federal and out-of-state agencies through a regional fusion center. Nobody outside SFPD could see either until after the fact.

**2. What we built:** An interactive, clickable map of one plate read's journey: Camera → Flock cloud → SFPD → NCRIC (fusion center) → out-of-state → federal. Each step shows who holds the data, the governing rule (exact quote + citation), retention, and documented incidents, every one with a source link. Run it with `python3 -m http.server 8000` from the repo root, then open http://localhost:8000/app/

**3. Data we used:** Public documents, hand-extracted into `data/hops.json`: CA Civil Code §1798.90.5–.55 (SB 34) via the AG's bulletin 2023-DLE-06, SFPD's ALPR policy and 2026 Biannual Surveillance Report, NCRIC's 2024 ALPR policy, SF Admin Code 19B, plus news and court reporting (17 unique sources, Oct 2023 to Nov 2026). Starter dataset related: `sf-surveillance-inventory`. Live sharing-network counts come from the DeFlock / EyesOnFlock snapshot. No camera locations are used or shown.

**4. What it found:** All **5 of 5** steps in the journey have at least one documented incident (10 incidents against 17 rules, every one sourced). Headline: SFPD's own audit found **299 searches in about a year (May 1 2025 to May 12 2026)** run by WSIN analysts through NCRIC's access, on behalf of federal and out-of-state agencies, which state law and NCRIC's own policy do not allow. That was 0.005% of all searches over that period, and it was only found because someone audited.

**5. One honest limitation:** We can only see what SFPD, NCRIC and Flock chose to publish or audit. Search logs aren't public, so any improper search that was never audited is invisible to us. The data is hand-extracted from documents and is a snapshot (Nov 17, 2026). It doesn't update itself when policies change. We report "possible conflicts" between practice and published rules, not legal findings. One SFPD policy PDF blocked fetching tonight, so three of its quotes come from an earlier read the same day.

**6. If this were deployed and it failed:** The FlockCast maintainers (us) are accountable for the accuracy of every claim; each one links to its source so anyone can check it, and corrections come in as GitHub issues. Accountable for the underlying data flows: SFPD (the data's legal custodian), Flock (the vendor that enabled Nationwide Lookup), and NCRIC (which shared access). The SF Board of Supervisors and the Police Commission oversee them. They would find out from SFPD's biannual surveillance reports and audits; we'd find out when a new report or audit is published and the map no longer matches it.
