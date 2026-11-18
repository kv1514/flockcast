# FlockCast: rules governing where an SF Flock plate read may go

Research compiled 2026-11-17. Every quote below came from a page or PDF fetched in this session. Quotes are verbatim and kept under 40 words. Things I could not fetch directly are listed under "Unverified leads". This is research for a hackathon, not legal advice.

## Plain-English summary

California's ALPR law (SB 34, 2015; Civil Code §1798.90.5 and following) lets a California public agency such as SFPD share plate-reader data **only with another public agency**. The statute defines "public agency" as the state or a California city, county, or local agency. The Attorney General's October 2023 bulletin spells out what that means: no sharing with out-of-state agencies, federal agencies, or private entities, including through vendor databases such as Flock's. The one carve-out is that a vendor "hosting" the data does not count as sharing. That carve-out is how Flock's cloud and NCRIC's repository fit inside the law.

On top of SB 34:
- **The Values Act (SB 54)** bars giving personal information to anyone for immigration enforcement.
- **The abortion and gender-affirming-care shield law** (Penal Code §13778.3) bars helping out-of-state investigations of legally protected care.
- **SF's surveillance ordinance (Admin Code Ch. 19B)** requires a Board-approved policy. SFPD's ALPR policy (Ordinance 255-23, Dec 2023) repeats the SB 34 sharing limit, keeps data **12 months** (5 years if tied to an investigation), and defers to NCRIC.
- **NCRIC's own policy** shares only with California state and local law enforcement.

In practice the rules were broken twice:
- Flock's "Nationwide Lookup" exposed SF data out of state from about Aug 2024 to Feb 2025.
- NCRIC passed access to WSIN, which ran **299 queries for federal and out-of-state agencies** between May 2025 and May 2026.

No new state ALPR law has passed since 2015. SB 274 was vetoed in October 2025, and SB 1013 died in the Assembly in September 2026.

---

## Core statute: CA Civil Code §1798.90.5–.55 (SB 34, Stats. 2015 ch. 532, effective Jan 1, 2016)

leginfo.legislature.ca.gov returned HTTP 403 to automated fetching. The statute text below is quoted as reproduced verbatim in the AG bulletin (source A) and cross-checked against FindLaw's copy, "current as of January 1, 2026": https://codes.findlaw.com/ca/civil-code/civ-sect-1798-90-55.html and https://codes.findlaw.com/ca/civil-code/civ-sect-1798-90-5.html

| Rule | Exact quote | Cite |
|---|---|---|
| Definition of public agency (state or local only) | "the state, any city, county, or city and county, or any agency or political subdivision of the state or a city, county, or city and county, including, but not limited to, a law enforcement agency." | §1798.90.5(f) |
| ALPR system | "a searchable computerized database resulting from the operation of one or more mobile or fixed cameras combined with computer algorithms to read and convert images of registration plates…" | §1798.90.5(d) |
| ALPR end-user | "a person that accesses or uses an ALPR system" | §1798.90.5(a) |
| Sharing limit | "A public agency shall not sell, share, or transfer ALPR information, except to another public agency, and only as otherwise permitted by law." | §1798.90.55(b) |
| Hosting carve-out | "the provision of data hosting or towing services shall not be considered the sale, sharing, or transferring of ALPR information." | §1798.90.55(b) |
| Public comment before a program starts | "shall provide an opportunity for public comment at a regularly scheduled public meeting of the governing body of the public agency before implementing the program." | §1798.90.55(a) |
| Usage and privacy policy | Operators and end-users must keep security procedures and post a usage and privacy policy. Under §1798.90.51(b)(2) the policy must cover authorized purposes, who has access, monitoring, sharing restrictions, the custodian, accuracy, and **retention length**. FindLaw summary; the fetch tool would not reproduce the full text. | §1798.90.51(a)-(b), §1798.90.53 |
| Access log | Operators must record the date and time, the plate queried, the username and affiliated organization, and the purpose of each access. Paraphrased from the AG bulletin, p.3–4. | §1798.90.52(a) |

**Source A: CA DOJ Information Bulletin 2023-DLE-06, "California Automated License Plate Reader Data Guidance," dated 10/27/2023**
https://oag.ca.gov/system/files/media/2023-dle-06.pdf
- p.2: "the definition of 'public agency' is limited to state or local agencies, including law enforcement agencies, and does not include out-of-state or federal law enforcement agencies."
- p.3: "SB 34 does not permit California LEAs to share ALPR information with private entities or out-of-state or federal agencies, including out-of-state and federal law enforcement agencies."
- p.3: "This prohibition applies to ALPR database(s) that LEAs access through private or public vendors who maintain ALPR information collected from multiple databases and/or public agencies."
- p.3: LEAs should check that data user agreements "do not allow access to agencies other than state and local agencies, or permitted private entities for purposes of data hosting or towing services."

---

## Hop 1: Camera → Flock Safety cloud

| Rule | Summary | Exact quote | Citation | URL |
|---|---|---|---|---|
| SB 34 hosting carve-out | Flock storing SFPD's data does not count as "sharing". | "the provision of data hosting or towing services shall not be considered the sale, sharing, or transferring of ALPR information." | Civ. Code §1798.90.55(b) | AG bulletin p.2 (link above) |
| SFPD policy: data security | SFPD's ALPR data is hosted by NCRIC or vendors, and only authorized SFPD users with accounts can reach it. | "Northern California Regional Intelligence Center (NCRIC) or ALPR vendor(s) utilized by the Department host the ALPR data collected by SFPD equipment. Only Authorized SFPD members with an account can access the repository…" | SFPD ALPR Surveillance Technology Policy, "Data Security", **p.5** | [SFPD ALPR policy PDF](https://www.sanfranciscopolice.org/sites/default/files/2026-10/SFPD%20Surveillance%20Technology%20Policy%20on%20Automated%20License%20Plate%20Readers.pdf) (fetched via the d21zid84h7ha1m.cloudfront.net mirror) |
| SFPD policy covers vendors | The policy binds vendors working for SFPD. | "Employees, consultants, volunteers, and vendors while working on behalf of the City with the Department are required to comply with this Policy." | SFPD ALPR policy, "Purpose and Scope", p.1 | same |
| Flock: the customer owns the data | Flock says the agency, not Flock, owns the reads. | "LPR data gathered by the Flock Safety system on behalf of Flock Safety customers is owned by the customer." | Flock LPR Usage & Privacy Policy, "Last Updated: June 30, 2026" | https://www.flocksafety.com/legal/lpr-policy |
| Flock: no commercial use | Flock won't sell customer data, but it may disclose data where legally required. | Flock will not "Sell, publish, exchange, or disclose customer's LPR data for commercial purposes." | Flock LPR policy | same |
| SF Mayor's Sept 2026 rules | Flock must purge SF data after 30 days; previously Flock had held it for 12 months. | Per the SF Standard (Sept 29, 2026), Flock "had access to the data for 12 months" before the change. These are administrative rules, not a Board ordinance. | Mayor Lurie announcement, Sept 29, 2026 | https://sfstandard.com/2026/09/29/lurie-tightens-police-surveillance-rules-sf-avoids-targeting-flock/ ; https://missionlocal.org/2026/09/san-francisco-flock-cameras-daniel-lurie-guidelines/ |

## Hop 2: Flock → SFPD (internal access and use)

| Rule | Summary | Exact quote | Citation | URL |
|---|---|---|---|---|
| SF Admin Code 19B.2(a) | A Board-approved policy ordinance is needed before acquiring or using surveillance technology. | "a Department must obtain Board of Supervisors approval by ordinance of a Surveillance Technology Policy" | SF Admin Code §19B.2(a) (third-party code mirror, text as of 2026-10-19) | https://gocodebook.com/library/us/ca/san-francisco-admin/chapter-19b-acquisition-of-surveillance-technology |
| 19B.2(c) SFPD exception | SFPD can use new technology first and submit a policy within one year. | "the Police Department may acquire and/or use a Surveillance Technology so long as it submits" [a policy within one year] | §19B.2(c); amendment note "Proposition E, 3/5/2024, Eff. 4/12/2024" | same |
| 19B.6 reporting | SFPD must file a surveillance report on each technology: first within 12 months of approval, then every two years by Nov 1. | "must submit to the Board of Supervisors and COIT, and make available on its website, an Annual Surveillance Report" | §19B.6 | same |
| Board approval of the ALPR policy | Ordinance 255-23 (File 231161) approved SFPD's amended ALPR policy and extended it to **stationary** ALPR. That opened the door to Flock's fixed cameras. | The amendment would "allow the policy to be used for systems and technology outside of the traditional vehicle-mounted ALPR system to include stationary, semi-fixed, and smart phone or web applications." | Ord. 255-23 §2(b)(7), **p.3**; approved Dec 12, 2023 (SFPD policy p.1 footer) | https://sfbos.archive.sf.gov/sites/default/files/o0255-23.pdf |
| Authorized uses only | No access outside the listed use cases. | "No SFPD member shall access ALPR data for any use other than the authorized use cases herein" | SFPD ALPR policy, Policy Statement, **p.2** (repeated as Appx A prohibited use #2, p.13) | SFPD ALPR policy PDF |
| No stop on an alert alone | An alert must be verified through CLETS or another source before a stop. | "Officers shall not stop a vehicle solely based on an ALPR alert." | SFPD ALPR policy, "Access", **p.4** | same |
| Who may access | Sworn members, civilian crime analysts, and radio shop technicians (hardware only). | "Sworn members, Civilian Crime analysts, Radio Shop Technicians (access to hardware)" | SFPD ALPR policy, "Access – A. Department employees", **p.5** | same |
| Search reason | DN 26-011 requires a recorded reason for every search. | Members "must enter an incident number, dispatch call number or stated reason for every search" | SFPD Biannual Surveillance Report 2026 | https://www.sanfranciscopolice.org/pol-biannual-surveillance-report-2026 |
| 30-day access gate (Sept 2026) | Officers need leadership approval to reach data older than 30 days. Every search needs an incident report. Logs are reviewed monthly, and DPA audits. | Lurie: "Every active search will have to be connected to a specific incident number" | KQED, Sept 30, 2026 | https://www.kqed.org/news/12101844/san-francisco-keeps-its-flock-cameras-with-new-restrictions |
| Training | No access without training in the past year. | "In no case shall a person utilize the ALPR system if he/she has not completed training in more than a year." | SFPD ALPR policy, Appx A #10, **p.15** | SFPD ALPR policy PDF |
| Compliance owners | Named officers oversee compliance, with Internal Affairs and DPA for discipline and complaints. | "Deputy Chief of Investigations, Lieutenant of Special Investigations Division." | SFPD ALPR policy, "Compliance", **p.9** | same |

## Hop 3: SFPD → NCRIC (regional fusion center)

| Rule | Summary | Exact quote | Citation | URL |
|---|---|---|---|---|
| SB 34 | NCRIC is a California public agency program, so sharing with it is allowed under §1798.90.55(b). | "except to another public agency, and only as otherwise permitted by law." | Civ. Code §1798.90.55(b) | AG bulletin p.2 |
| SFPD names NCRIC as host | SFPD's policy names NCRIC as a data host and its partner agencies as having access. | "NCRIC and/or any other vendors utilized by the Department, NICRIC and/or any other vendors' database and NCRIC partner agencies" | SFPD ALPR policy, Appx A #5, **p.13** | SFPD ALPR policy PDF |
| Central repository | Partner agencies' data is pooled in one central repository. | "Each law enforcement partner's respective ALPR technology will collect ALPR data and house this data into one central repository… The central repository can be accessed by NCRIC approved agencies." | SFPD Surveillance Impact Report (appended to the policy), **SIR p.3** | same |
| Conditions on NCRIC users | NCRIC users must accept the vendor's privacy terms, have a case number, and have a lawful need to know. | "From NCRIC: Only law enforcement personnel that have access to the ALPR database and have: 1. Agreed to the vendors' privacy policies and non-disclosure agreement. 2. A criminal case or incident number/name." | SFPD ALPR policy, Appx A #9, **p.15** | same |
| NCRIC: originator keeps ownership | The agency that collected the data stays its custodian. | "The originating agency retains control and ownership as the official custodian of its records." | NCRIC ALPR Policy (2024) §4.1, **p.3** | https://ncric.ca.gov/wp-content/uploads/2024/05/NCRIC-ALPR-POLICY-2024.pdf |
| NCRIC audit | Every query is logged with user, agency, time, plate, and case number. Logs are reported quarterly, and a sample is audited yearly. | Audit records include "valid case number associated with the investigative effort generating the ALPR data query." | NCRIC ALPR Policy §7.1, **p.4–5** | same |

## Hop 4: NCRIC / SFPD → out-of-state agencies

| Rule | Summary | Exact quote | Citation | URL |
|---|---|---|---|---|
| SB 34 as read by the AG | Out-of-state agencies are not "public agencies". | "SB 34 does not permit California LEAs to share ALPR information with private entities or out-of-state or federal agencies…" | IB 2023-DLE-06, **p.3** | https://oag.ca.gov/system/files/media/2023-dle-06.pdf |
| SFPD policy | SFPD bars out-of-state and federal transfers **unless a California court issues an order or warrant**. That exception is SFPD's own wording; it is not in the statute. | "ALPR information shall not be sold, shared, or transferred to out-of-state or federal agencies without a court order or warrant issued by a California court." | SFPD ALPR policy, Policy Statement, **p.2** | SFPD ALPR policy PDF |
| NCRIC policy | NCRIC shares only with California state or local law enforcement. | "NCRIC may only share, disseminate, or provide access to ALPR information to California state or local law enforcement agencies." | NCRIC ALPR Policy §4.2, **p.3** | NCRIC PDF |
| NCRIC: rule covers partner data | The limits apply to NCRIC's own camera data and to data partners share with it. | "These limitations are equally applicable to ALPR data from NCRIC's ALPR devices as well as ALPR data from other sources that have elected to share their information with the NCRIC." | NCRIC ALPR Policy §4.2, **p.3** | NCRIC PDF |
| Abortion and gender-care shield law | State and local staff may not help out-of-state investigations of legally protected health care. | Staff "shall not cooperate with or provide information to any individual" [or out-of-state agency] in such investigations. | Penal Code §13778.3(b) (AB 1242, 2022, as amended) | https://codes.findlaw.com/ca/penal-code/pen-sect-13778-3.html |
| Flock's California block | Flock says it turned off Nationwide Lookup for CA agencies in March 2025 and blocked out-of-state sharing relationships in June 2025. | "Disabled the National Lookup feature for all California agencies (March 2025)." / "It is no longer possible for California agencies to create sharing relationships with out-of-state or federal agencies" | Flock email to CA agencies, received Feb 3, 2026 | https://www.paloalto.gov/Departments/Police/Public-Information-Portal/Update-to-California-Agencies-from-Flock-Safety |
| AG enforcement | The AG sued El Cajon on Oct 3, 2025 for sharing ALPR data with agencies in 26 states, and filed a further motion on Jan 21, 2026. | Bonta: "California law requires ALPR data to remain within state lines." | People v. City of El Cajon, San Diego Super. Ct. | https://www.oag.ca.gov/news/press-releases/attorney-general-bonta-sues-el-cajon-illegally-sharing-license-plate-data-out ; https://oag.ca.gov/node/617364 |

## Hop 5: → federal agencies (including immigration)

| Rule | Summary | Exact quote | Citation | URL |
|---|---|---|---|---|
| SB 34 | Federal agencies are not "public agencies". | "…does not include out-of-state or federal law enforcement agencies." | IB 2023-DLE-06, **p.2** | AG bulletin |
| Values Act (SB 54) | No personal information, including home or work address, for immigration enforcement. | "California law enforcement agencies shall not:" … "Providing personal information, as defined in Section 1798.3 of the Civil Code, about an individual" | Gov. Code §7284.6(a)(1)(D) | https://codes.findlaw.com/ca/government-code/gov-sect-7284-6.html |
| DOJ guidance linking SB 54 and SB 34 | Even if SB 54 allows a disclosure, SB 34 still restricts ALPR sharing. | "Even where the sharing of license plate data may be for a permitted purpose under SB 54, all agencies should be aware that there are strict privacy limitations on the sharing of license plate reader data under… SB 34" | DOJ IB 23-01-CJIS (10-27-2023), **p.2** | https://www.oag.ca.gov/system/files/media/23-01-cjis.pdf |
| SFPD: no immigration use | SFPD says ALPR is not used for immigration and cites SF's sanctuary ordinance (Admin Code 12H/12I). | "ALPR data collected by SFPD is not used for the enforcement of Immigration Laws. SFPD complies with SF Admin Code Section 12H and 12I." | SFPD ALPR policy, Appx A #9, **p.15** | SFPD ALPR policy PDF |
| NCRIC: no immigration sharing | NCRIC won't share with federal law enforcement or for immigration. | "The NCRIC will not share, disseminate, or sell any law enforcement data to law enforcement agencies outside California, federal law enforcement, any private entities or individuals, or any organization whatsoever for purposes related to immigration enforcement." | NCRIC ALPR Policy §4.2, **p.3** | NCRIC PDF |
| Flock: federal access in CA | Flock's stated California guardrails. | "Federal agencies are not part of statewide or national lookup networks." / "Immigration-related and reproductive-care-related searches are automatically blocked in CA" | Flock blog (published Mar 2, 2026; dated Oct 13, 2026 on page) | https://www.flocksafety.com/blog/flock-implements-enhanced-guardrails-across-california-to-ensure-lawful-and-responsible-use-of-lprs |
| Flock paused federal pilots (Aug 2025) | Flock paused pilots with CBP and HSI and ended blanket national or statewide federal searches. | CEO Garrett Langley: Flock "clearly communicated poorly." | AP, Aug 25, 2025 | https://www.ksat.com/news/national/2025/08/25/license-plate-camera-company-halts-cooperation-with-federal-agencies-among-investigation-concerns/ |

### What actually happened to SF data (violations reported by SFPD itself)
From the SFPD Biannual Surveillance Report 2026 (https://www.sanfranciscopolice.org/pol-biannual-surveillance-report-2026):
- **Nationwide Lookup, about Aug 2024 to Feb 2025:** out-of-state agencies could query SF's network. "Flock enabled the feature without the Department's knowledge or authorization." SFPD says "the Department never approved data sharing with any out-of-state or federal agency."
- **NCRIC to WSIN:** NCRIC shared SFPD ALPR access with the Western States Information Network. WSIN analysts ran **299 queries** of the Flock network from May 1, 2025 to May 12, 2026 for federal and out-of-state agencies. Mission Local names the DEA, IRS, US Marshals, Idaho and Oregon state police, and the US Forest Service. SFPD says ICE and DHS were not among them, and none of the queries referenced immigration or reproductive care. A May 2026 audit found this, and Chief Lew reported it to the Police Commission on June 17, 2026 and "immediately turned off" NCRIC access. Source: https://missionlocal.org/2026/06/federal-agencies-sf-surveillance-flock-data-audit/
- **Human Rights Commission, Sept 2026:** found no Sanctuary Ordinance violation and made 5 recommendations.
- **1.6 million figure:** the SF Standard's September 2025 investigation reported SF data was "illegally accessed 1.6 million times by out-of-state agencies". This is quoted in SF Standard, Sept 29, 2026 (link above).

---

## Retention

| Holder | Rule | Exact quote | Source |
|---|---|---|---|
| **SFPD (Board-approved policy, Ord. 255-23)** | 12 months; 5 years if tied to a criminal investigation or intelligence file. | "SFPD defers to the NCRIC retention standard: ALPR records are maintained for 12 months from capture. If a record is connected to a criminal investigation or criminal intelligence file it may be retained for 5 years." | SFPD ALPR policy, "Data Retention", **p.7–8**; also Appx A #7, p.14 |
| SFPD disposal | Purged after 1 year. | "ALPR data are cleared after 1 year from capture unless associated with a criminal investigation." | SFPD ALPR policy, "Data Disposal", **p.8** |
| **SFPD under the Mayor's Sept 2026 rules** | Still 12 months at SFPD, but access after 30 days needs leadership approval. Flock must purge its copy at 30 days. | "In most cases, SFPD will be required to delete the data after 12 months." | SF Standard, Sept 29, 2026 |
| **NCRIC (2024 policy)** | Up to 365 days, but the shortest applicable limit wins, and NCRIC's vendor caps retention at 30 days. | "The NCRIC supports a maximum retention period of 365 days for ALPR data… In a conflict, the shortest retention period prevails." / "the NCRIC's chosen ALPR technology vendor imposes a 30 day maximum retention period." | NCRIC ALPR Policy §6, **p.4** |
| **Flock default** | Now a **7-day** rolling hard delete by default (formerly 30). Customers can change it. | "LPR data is hard deleted on a rolling 7-day basis by default." | Flock LPR policy, Last Updated June 30, 2026, https://www.flocksafety.com/legal/lpr-policy |
| State law | SB 34 sets no retention cap; it only requires the policy to state one (§1798.90.51(b)(2)(G)). SB 274 (60-day cap) was **vetoed**. | n/a | see below |

Note the contradiction: SFPD's 12-month rule says it "defers to the NCRIC retention standard". NCRIC's own 2024 policy, however, says its vendor's 30-day cap prevails.

---

## State legislation since 2015 (status)

| Bill | What it did | Status | Source |
|---|---|---|---|
| SB 34 (Hill, 2015) | ALPR privacy statute (above). | **Chaptered**, Stats. 2015 ch. 532; effective Jan 1, 2016. | AG IB 2023-DLE-06 p.1 |
| AB 1242 (Bauer-Kahan, 2022) | Abortion shield; added PC §13778.3 among other changes. | **Signed** Sept 27, 2022. PC §13778.3 later amended (search results mention SB 345 (2023) and AB 82 (2025); not independently verified). | FindLaw §13778.3 text; WebSearch |
| SB 274 (Cervantes, 2025) | 60-day cap on non-hit data, training, DOJ audits. Enrolled text: "A public agency shall not retain ALPR information that does not match information on an authorized hot list" for more than 60 days. | **Vetoed** by Gov. Newsom (reported Oct 4, 2025). Veto message: "it may not be apparent, particularly with respect to cold cases, that license plate data is needed". Digital Democracy marks it "Failed (2026-03-02: Stricken from file.)" | https://laist.com/news/gov-gavin-newsom-veto-bill-regulate-license-plate-readers ; https://calmatters.digitaldemocracy.org/bills/ca_202520260sb274 |
| SB 1013 (Cervantes, 2026) | 30-day retention, later weakened to archiving after 60 days with a warrant to search the archive; no default access for federal or out-of-state agencies; AG audits. | **Died.** Passed the Senate 28-9, then was held in the Assembly on the last night of session (CalMatters, Sept 3, 2026). | https://calmatters.org/economy/technology/2026/09/california-kills-flock-camera-regulation-again/ ; https://timesofsandiego.com/crime/2026/08/03/lawmakers-license-plate-reader-technology/ |
| Haney/Lurie proposal | Criminal penalties for improper sharing of ALPR data. | Not introduced; December 2026 at the earliest. | Mission Local, Sept 29, 2026 |

CalMatters reports that every bill proposed since 2022 to regulate police use of plate readers has failed.

---

## Unverified leads (not confirmed by a fetched primary source)

- **Official leginfo text and history** for Civ. Code §1798.90.5–.55, SB 274 (veto date) and SB 1013: leginfo.legislature.ca.gov returned 403. The statute text above comes from the AG bulletin and FindLaw.
- **SF Admin Code Ch. 19B official text** (codelibrary.amlegal.com returned 403). Quotes above come from a gocodebook.com mirror. What Prop E (Mar 5, 2024) changed in 19B.2 is not confirmed; the mirror shows only "Proposition E, 3/5/2024" in amendment notes.
- **SFPD's Flock contract** (amount, term, data-ownership and retention clauses): not found. Starbridge lists CCSF–Flock Group agreements dated Feb 20, 2024 and Sep 22, 2025, unverified. The biannual report says the 400 fixed cameras were "first installed in March 2024". The Board vote on extending the contract is reportedly in **Feb 2027** (Mission Local).
- **Flock transparency portal for SFPD** (https://transparency.flocksafety.com/san-francisco-ca-pd) returned 403.
- **Flock 7-day default timing:** Flock's LPR policy page says "Last Updated: June 30, 2026", and Flock announced the cut from 30 to 7 days on Aug 13, 2026 (corrected by Agent B). Existing customers, including SF, keep their current retention.
- **Javorsky v. Flock** class action (Feb 2026) alleging SB 34 violations via out-of-state and federal access: complaint at https://www.courthousenews.com/wp-content/uploads/2026/02/javorsky-vs-flock-complaint.pdf (not read). The biannual report mentions a separate December 2025 federal Fourth Amendment suit that was dismissed.
- **AG letters to 18 agencies since 2024** (reported in news; not verified on oag.ca.gov).
- **EFF/ACLU Sept 2025 demand letter to SFPD**: mentioned in the biannual report; not fetched.
- **SB 345 (2023)** and **AB 82 (2025)** amendments to the shield-law framework: search-snippet only.
