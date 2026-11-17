# Crash Box: Visualizing the Black Box (backup idea research)

Researched 2026-11-17. Every fact below cites a URL fetched in this session. Counts marked "computed" were calculated by streaming the CSV into memory (nothing saved to disk).

## Summary

- **Best single combo:** NHTSA SGO ADS CSV (narrative, SV speed, pre-crash movements, contact areas, posted limit, injury) **joined on `SGO Report ID`** to **Waymo's Safety Impact "CSV2"**, which publishes the unredacted **intersection text** (for example "17th Street at Mississippi Street") for every Waymo SGO crash. NHTSA redacts the address and lat/long; Waymo's CSV gives the location back, so you can geocode it. That gets you location, speed, and point of impact for about 757 Waymo SF crashes.
- **SF counts (computed):**
  - 2021 to mid-2025 archive: about **740 unique SF ADS incidents**: Waymo 559, Cruise 119, Zoox 55, Apollo 3, WeRide 3, Beep/Navya 1.
  - Current file (Third Amended Order, mid-2025 to now): **437 SF reports**: Waymo 400, Zoox 37.
  - **Tesla: 0 in CA** in the ADS file. All 65 Tesla ADS rows are in TX or FL.
- **CA DMV OL 316 PDFs are no longer the live channel.** Since **April 28, 2026**, CA collision reports follow the NHTSA SGO format as CSV templates (§227.54 / §228.34). The DMV page now links to UC Berkeley TIMS, which requires a login. Old OL 316 PDFs are still online at individual `dmv.ca.gov/portal/file/...` URLs.
- **OL 316 has no speed field.** Its checkbox and damage-diagram values do not come out with `pdftotext`. Use the SGO CSV for speeds and contact areas.
- **Public reports have no LiDAR, video, trajectories or timestamps finer than a minute.** Any replay is a reconstruction from the narrative plus categorical fields. Say so on screen.

## Datasets

### 1. NHTSA Standing General Order 2021-01: ADS incident reports (primary)

- **Current CSV (Third Amended SGO, mid-2025 onward):** https://static.nhtsa.gov/odi/ffdd/sgo-2021-01/SGO-2021-01_Incident_Reports_ADS.csv
  - text/csv, about 3.1 MB, 1,792 rows, 116 columns. Last-modified 16 Nov 2026 (fetched header).
- **Archive CSV (2021 to June 2025, Second Amended era):** https://static.nhtsa.gov/odi/ffdd/sgo-2021-01/Archive-2021-2025/SGO-2021-01_Incident_Reports_ADS.csv
  - 2,295 rows, 137 columns. This file has `Posted Speed Limit (MPH)`, `Lighting` and `Roadway Surface`, which the current file lacks.
- **Also available:**
  - ADAS (Level 2) file, which is where Tesla FSD/Autopilot crashes go: https://static.nhtsa.gov/odi/ffdd/sgo-2021-01/SGO-2021-01_Incident_Reports_ADAS.csv
  - Archive `..._ADAS.csv` and `..._OTHER.csv` (HTTP 200)
  - Data dictionary: https://static.nhtsa.gov/odi/ffdd/sgo-2021-01/SGO-2021-01_Data_Element_Definitions.pdf (archive copy under `/Archive-2021-2025/`)
- **NHTSA landing page:** https://www.nhtsa.gov/laws-regulations/standing-general-order-crash-reporting. It returns 403 to automated fetch, so open it in a browser.
- **Key columns (exact names from the header):**
  - **Who:** `Report ID`, `Report Version`, `Reporting Entity`, `Operating Entity`, `Make`, `Model`, `Model Year`, `Driver / Operator Type`, `Automation System Engaged?`, `Within ODD?`
  - **When/where:** `Incident Date` (month-level only, e.g. `JUL-2026`), `Incident Time (24:00)`, `Same Incident ID`, `Latitude`, `Longitude`, `Address`, `City`, `State`, `Zip Code`, `Roadway Type`, `Roadway-*` flags, `Weather - *` flags. The archive also has `Posted Speed Limit (MPH)`, `Lighting` and `Roadway Surface`.
  - **Dynamics:** `SV Precrash Speed (MPH)`, `SV Pre-Crash Movement`, `Crash With`, `CP Pre-Crash Movement`
  - **Point of impact:** `SV Contact Area - {Rear Left, Left, Front Left, Rear, Top, Front, Rear Right, Right, Front Right, Bottom, Unknown}` and the same `CP Contact Area - ...` set. These are Y flags, which map directly onto an 8-sector car diagram.
  - **Outcome:** `Highest Injury Severity Alleged`, `Any Air Bags Deployed?`, `Was Any Vehicle Towed?`, `Data Availability - Video/EDR/...`, `Investigating Agency`
  - **Narrative:** `Narrative`, `Narrative - CBI?`
- **Gotchas (verified in the data):**
  - **Location is redacted.** `Latitude`, `Longitude` and `Address` are present as columns, but all 439 current-file SF rows and 1,114 of 1,161 archive SF rows read `[MAY CONTAIN PERSONALLY IDENTIFIABLE INFORMATION]` or are blank. Street names inside narratives are `[XXX]`. City and zip survive.
  - **Dates are month-only** (e.g. `OCT-2025`). Exact dates come from Waymo CSV2 or the news.
  - **Multiple versions per crash.** Keep the max `Report Version` per `Report ID`.
  - **Duplicate reporters per crash.** GM filed duplicates of Cruise crashes. Transdev filed duplicates of Waymo crashes, since it was the operator of Waymo Jaguars. Dedupe by `Same Incident ID` and attribute by `Operating Entity` / `Make`.
  - **CBI redaction.** In SF, Cruise narratives are mostly redacted (156 of 163 Cruise LLC rows have `Narrative - CBI? = Y`). Waymo and Zoox SF narratives are readable (0 CBI). In the current file, 18 of 65 Tesla rows are CBI.
  - **Speeds are mostly low.** In the current file, 300 of 439 SF rows have SV speed 0 (the AV was stopped). The posted limit is 25 mph in 904 of 1,161 archive SF rows.
  - **Corrected values.** Example: the Cruise Oct-2023 report's speed was revised from 17 to 14 mph in v3.
  - **Update cadence:** the files were last modified 16 Nov 2026 (HTTP header). Reports are filed within 5 days for serious crashes and monthly (by the 15th) otherwise, so expect roughly monthly refreshes. Source: Sidley summary below.
- **Third Amended Order (effective June 16, 2025), per Sidley** (https://environmentalhealthsafetybrief.sidley.com/2025/04/29/nhtsa-announces-new-policies-to-promote-autonomous-vehicles/):
  - The 1-day deadline is gone. Fatal, hospital-transport, VRU and airbag/tow crashes are now due within 5 days.
  - Monthly reports are still due by the 15th.
  - ADS monthly scope is narrowed to crashes with more than $1,000 expected damage, single-vehicle crashes, or crashes where the AV struck something. A low-damage hit on an AV by another car is no longer reportable, so counts before and after mid-2025 are **not comparable**.
  - Empty "no crash" monthly reports are eliminated.
  - Only one reporting entity needs to file per crash.

### 2. Waymo Safety Impact Data Hub (location key and benchmarks)

- **Page:** https://waymo.com/safety/impact/
  - Data through June 2026. 271.3M rider-only miles. SF Bay Area 82.4M RO miles.
  - SF Bay Area vs human benchmark: -93.86% serious-injury-or-worse, -90.05% any-injury, -83.69% airbag.
  - The page says updates are aligned with SGO timelines.
- **CSV2 (crashes with SGO ID):** https://storage.googleapis.com/waymo-uploads/files/documents/safety/safety-impact-data/CSV2%20-%20Crashes%20with%20SGO%20ID%20and%20Group%20Membership%20202009-202606-2022benchmark.csv
  - Columns: `SGO Report ID, SGO Report Version, SGO Amendment, Year Month, State, County, Road Type, Crash Type, Is NHTSA Reportable In-Transport, ..., Is Police-Reported, Is Any-Injury-Reported, Is Any Vehicle Airbag Deployment, Is Suspected Serious Injury+, Is Any Fatal Injury, Incident Date, Location Address / Description, Zip Code`
  - Computed: 1,977 rows. 757 are in San Francisco County (2022: 1, 2023: 41, 2024: 217, 2025: 340, 2026: 158). **0 SF rows have a blank location.**
  - Top SF repeat spots: Stevenson St at 3rd St (5); California St at Battery St, Montgomery St near Pacific Ave, and Montgomery St at Broadway (4 each).
  - Crash types: V2V Lateral 193, V2V F2R (front-to-rear) 186, V2V Backing 123, V2V Head-on 84, V2V Intersection 44, Single Vehicle 36, Cyclist 14.
- **CSV1 (RO miles by county):** https://storage.googleapis.com/waymo-uploads/files/documents/safety/safety-impact-data/CSV1%20-%20RO%20Miles%20per%20Location%20202009-202606-2022benchmark.csv
  - San Francisco county: 67.907M miles. Use it as a denominator for "crashes per million miles".
- **CSV3 (counts vs benchmarks):** https://storage.googleapis.com/waymo-uploads/files/documents/safety/safety-impact-data/CSV3%20-%20Collision%20Counts%20and%20Comparison%20to%20Benchmarks%20202009-202606-2022benchmark.csv
  - Gives Waymo IPMM vs benchmark IPMM with confidence intervals. Good for the "report card" grade.
- **CSV4 and release notes:** links are on the page (CSV4 filename ends `_v2.csv`; release notes are `Waymo_Safety_Impact_Data_Hub_Release_Notes_20261002.pdf`).
- **Gotchas:**
  - This is Waymo only.
  - The location is a text description, not coordinates. Geocode "X Street at Y Street" with a geocoder, or match against the DataSF intersection fields (`primary_rd`, `secondary_rd`).
  - Waymo's own grouping is self-reported.

### 3. California DMV OL 316 collision reports (historical PDFs)

- **Status:** The old list page (`.../autonomous-vehicle-collision-reports/`) now returns **404**.
  - The DMV incident-reporting page (https://www.dmv.ca.gov/portal/vehicle-industry-services/autonomous-vehicles/autonomous-vehicles-incident-reporting/) links "See Collision Reports" to **https://tims.berkeley.edu/tools/avsafety.php**.
  - That page describes an AV Crash Dashboard. It uses NHTSA SGO data for CA crashes before 2026-04-28 and SGO-format reports filed directly to DMV after that. It also has an **archived testing-permit crash dashboard covering Oct 2014 to Apr 18, 2026**. Mapping covers only crashes with OL 316 addresses.
  - The detail tools at `/tools/avsafety/crash.php` **require a TIMS login.**
  - Public ArcGIS dashboard: https://experience.arcgis.com/experience/80957b812f8245538a883970ee31d103/page/AV-Crash-Dashboard (not fetched).
- **New regime:** DMV memo AVIM 2026-001A (https://www.dmv.ca.gov/portal/file/avim-2026-001-reporting-requirements-pdf/), effective **April 28, 2026**:
  - Collision reports are filed "in alignment with" NHTSA SGO 2021-01 (June 2025) as 5-day, update and monthly reports, in CSV templates.
  - Rules: drivered and driverless testing under §227.54, deployment under §228.34.
  - New monthly and quarterly reports on braking events, VMT, DDT failures and vehicle immobilizations. Monthly reports start Aug 26, 2026.
- **Individual OL 316 PDFs still resolve** (fetched and parsed):
  - https://www.dmv.ca.gov/portal/file/waymo_032224-pdf/ is the 03/22/2024 Waymo crash at "Church Street at Market Street", San Francisco 94114.
    - Narrative: Waymo stopped behind an SUV loading passengers, then proceeded. A trailing SUV rear-ended it and left the scene.
    - Form rev. 7/2020.
  - https://www.dmv.ca.gov/portal/file/waymo_070624_b-pdf/ is the 07/06/2024 Waymo garage exit on Mission St between 7th and 8th. A cyclist made contact with the stationary AV.
  - https://www.dmv.ca.gov/portal/file/waymo_012526_redacted_1-pdf/ is a 2026 Waymo report (LA).
  - Filenames look like `{company}_{MMDDYY}[_redacted|_b]-pdf`, but guessing them fails often (`waymo_020624-pdf` returned 404). Find them through search instead.
- **OL 316 fields (from the parsed PDF):**
  - Section 1: manufacturer
  - Section 2 (vehicle 1): date and time; year, make and model; **address/location of accident** (often an intersection); city, county, zip; moving or stopped; involved with (pedestrian, bicyclist or other); number of vehicles; **damage severity (none/minor/mod/major)** and a **"shade in damaged area" car diagram**
  - Section 3: the other party's vehicle
  - Section 4: injury, death and property damage
  - Section 5: autonomous or conventional mode, plus a **free-text narrative**
  - Checkbox grid: weather, lighting, roadway surface and conditions, **movement preceding collision** for vehicles 1 and 2 (A–R), **type of collision** (head-on, sideswipe, rear end, broadside, vehicle/pedestrian...), other associated factors
  - **No speed field.** Checkbox and diagram values are not in the `pdftotext` output. You need form-field extraction or a vision model (a good job for Claude).
- **Regulation as published on Cornell LII:** 13 CCR §227.48 requires an OL 316 within 10 days of a collision causing property damage, injury or death (https://www.law.cornell.edu/regulations/california/13-CCR-227.48). Note that the 2026 DMV memo cites the new §227.54 for collisions, so the LII page may be stale.
- **Cleaned datasets already built from OL 316:**
  - **Zenodo**, "An Augmented Dataset of Autonomous Vehicle Collisions in California" (Xu, Jiao, Chen, UT Austin, 2025, CC BY 4.0): https://zenodo.org/records/15937591
    - File `CA_AV_Collision_2019-2024.csv` (669.5 kB).
    - GitHub: https://github.com/xuyimingxym/CA-AV-Collision-Data
    - **646 records, 2019–2024, with address, latitude and longitude**, AV and other-party motion, damage severity and damage area, narrative, weather, lighting and collision type. **No speed.**
    - Includes `pdf2df.py` (pymupdf).
    - **Probably the fastest route to a geocoded CA AV crash map.**
  - **GitHub**: https://github.com/melyabroudi/OL316-Parsing-
    - Contains `California_OL316_Crash_Reports` in .csv, .json and .xlsx, plus a parser notebook and sample reports.
    - Goes with El-Yabroudi et al. 2025, *Electronics* 14(4):651. Record count and schema were not shown on the repo page.

### 4. DataSF: Traffic Crashes Resulting in Injury (human-driven baseline)

- **Page:** https://data.sf.gov/Public-Safety/Traffic-Crashes-Resulting-in-Injury/ubvf-ztfx. The domain moved from data.sfgov.org to **data.sf.gov**, so update any hardcoded API URLs.
- **Metadata:** https://data.sf.gov/api/views/ubvf-ztfx.json
  - Compiled by SFDPH and SFPD. **Updated quarterly.** Rows last updated 2026-10-07.
- **API check:** https://data.sf.gov/resource/ubvf-ztfx.json?$select=count(*),min(collision_datetime),max(collision_datetime) returned **66,384 rows, 2005-01-01 to 2026-08-31**.
- **Columns:**
  - **Location:** `tb_latitude`, `tb_longitude`, `point`, `primary_rd`, `secondary_rd`, `intersection`, `cnn_intrsctn_fkey`
  - **Crash:** `collision_datetime`, `collision_severity`, `type_of_collision`, `mviw`, `ped_action`, `lighting`, `weather_1`, `road_surface`, `control_device`, `vz_pcf_*` (primary collision factor), `number_killed`, `number_injured`
  - **Parties:** `party_at_fault`, `party1_type`, `party1_dir_of_travel`, `party1_move_pre_acc`, `party2_*`
  - **Areas:** `analysis_neighborhood`, `supervisor_district`, `police_district`
- **Gotchas:**
  - Injury crashes only, so it is not comparable to SGO's property-damage-heavy mix.
  - It does not flag AVs. Use it as the human baseline and heatmap layer.
  - On this machine, curl to data.sf.gov failed TLS verification (local CA issue). Use a browser, WebFetch or `curl -k` with care.

### 5. SF Vision Zero High Injury Network

- **2024 HIN:** DataSF id `enwt-3u8m` (https://data.sf.gov/d/enwt-3u8m), per https://catalog.data.gov/dataset/2024-high-injury-network
  - Street segments with 10 or more killed-or-severely-injured per mile, 2020–2024. Published 2026-03-23. No further updates planned.
  - GeoJSON: https://data.sf.gov/api/v3/views/enwt-3u8m/query.geojson?accessType=DOWNLOAD
  - CSV: https://data.sf.gov/api/v3/views/enwt-3u8m/export.csv?accessType=DOWNLOAD
- **Demo idea:** overlay the HIN lines on the AV crash points, then ask "do AV crashes cluster on the HIN?"

## Rules & regulators

- **CA DMV AV regulations:** Title 13 CCR Article 3.7 (testing) and Article 3.8 (deployment). Current orders to adopt are linked from https://www.dmv.ca.gov/portal/vehicle-industry-services/autonomous-vehicles/california-autonomous-vehicle-regulations/. The DMV page lists "AV Testing and Deployment Regulations ... Released January 21, 2026 Second Notice of Modifications". The reporting overhaul took effect **2026-04-28** (AVIM 2026-001A, above).
- **AB 1777 notices of noncompliance**, effective **July 1, 2026**. Source: AVIM 2026-002 (https://www.dmv.ca.gov/portal/file/avim-2026-002-notice-of-autonomous-vehicles-noncompliance-pdf/).
  - Under CVC §38752 and 13 CCR §227.68 / §228.42, peace officers may issue a "Notice of Autonomous Vehicle Noncompliance" to the manufacturer.
  - The manufacturer must forward it to DMV within **72 hours**, or **24 hours** if the officer marks it for priority review.
  - Missing the deadline can lead to permit restriction, suspension or revocation.
  - NBC Bay Area (Apr 29, 2026) describes these as citation-like notices for violations such as running a red light: https://www.nbcbayarea.com/news/local/driverless-cars-new-enforcement-noncompliance-notices/4076574/
- **CPUC permits** (https://www.cpuc.ca.gov/regulatory-services/licensing/transportation-licensing-and-analysis-branch/autonomous-vehicle-programs/autonomous-vehicle-program-permits-issued):
  - Waymo: drivered and driverless pilot, plus driverless deployment (consolidated permit 2023-08-11) and drivered deployment (2025-06-27).
  - Zoox: drivered and driverless pilot (amended 2025-02-20).
  - Also listed: WeRide, Nuro, Tensor.
  - No Tesla or Cruise permits are listed.
  - The CPUC approved fare-charging for Cruise and Waymo in SF on Aug 10, 2023 (https://www.cpuc.ca.gov/regulatory-services/licensing/transportation-licensing-and-analysis-branch/autonomous-vehicle-programs).
- **Cruise collapse:**
  - **Oct 2, 2023:** a hit-and-run Nissan threw a pedestrian into the path of a Cruise AV at **5th & Market**. The AV then dragged her more than 20 ft while pulling over (CBS: https://www.cbsnews.com/sanfrancisco/news/cruise-automation-admits-false-report-sf-pedestrian-dragging/).
  - **Oct 24, 2023:** the DMV immediately suspended Cruise's deployment and driverless testing permits. It cited unreasonable public-safety risk and said Cruise misrepresented its technology and withheld video. Testing with a safety driver was not affected (TechCrunch: https://techcrunch.com/2023/10/24/dmv-immediately-suspends-cruises-robotaxi-permit-in-california/).
  - **Sep 30, 2024:** NHTSA consent order with a **$1.5M** penalty for omitting the dragging from its SGO reports. Terms: corrective action plan, reports every 90 days for 2 years, optional third year (TechCrunch: https://techcrunch.com/2024/09/30/cruise-1-5-million-penalty-omitting-pedestrian-crash-details-regulator).
  - **Nov 14, 2024:** Cruise admitted to a **false report** under a deferred prosecution agreement with a **$500,000** criminal fine (CBS link above).
  - In the SGO data, Cruise's own report 30412-6395 v3 says it filed a voluntary recall on Nov 2, 2023 for the post-collision response.
- **Waymo recall (Dec 2025):** a school-bus software recall. NPR's page timed out on fetch; see Unverified leads.
- **Tesla in CA:** the CPUC said in March 2026 that "Tesla is not operating an autonomous vehicle service". Tesla holds a charter-party (limo) permit, the CPUC treats its system as Level 2, and Tesla is not subject to CPUC AV quarterly reporting (Electrek, Mar 25 2026: https://electrek.co/2026/03/25/california-regulator-confirms-tesla-not-operating-autonomous-vehicle-service/). That matches the SGO ADS file having 0 Tesla CA rows.

## Demo-worthy crashes (SF)

Each crash below joins an SGO Report ID (NHTSA CSV) with Waymo CSV2 or news coverage for the exact location.

1. **Cruise pedestrian drag: Oct 2, 2023, 21:29, 5th St & Market St.** The best "what went wrong" story.
   - SGO 30412-6395 (v4): driverless AV proceeding straight on green, southbound. Posted limit 25. **SV speed 14 mph** (corrected from 17).
   - Crash with a pedestrian (NM crossing roadway). SV contact area: **Bottom**. Severity: Serious. Dark, lighted.
   - Narrative: the pedestrian crossed against the light. The adjacent Nissan hit her and deflected her in front of the AV. The AV braked hard, made contact, then "attempted to pull over... pulling the individual forward, rather than remaining stationary."
   - Sources: CBS link above for intersection and the 20 ft drag, TechCrunch for regulator fallout.
   - Replay: two cars side by side, the pedestrian crosses, the Nissan deflects her, the AV stops, then creeps about 20 ft to the curb. Highlight the second movement in red.
2. **Waymo vs cyclist: Feb 6, 2024, 14:34, 17th St at Mississippi St (Potrero Hill), 4-way stop.**
   - SGO 30270-7075 (v2): Waymo westbound, proceeding straight from the stop. **11 mph** (revised from 7). Contact: Front Right. The cyclist was making a left turn.
   - Narrative: an eastbound delivery truck was in the intersection. The cyclist was occluded behind the truck, then turned sharply left onto northbound Mississippi. The Waymo braked heavily but made contact.
   - Location from Waymo CSV2. Mission Local (https://missionlocal.org/2024/02/cyclist-driverless-car-collide-at-17th-and-mississippi/): non-life-threatening injuries, not hospitalized.
   - Replay: shows **occlusion**, a clean "sensor can't see through trucks" lesson. Draw a vision cone blocked by the truck.
3. **Cruise vs fire truck: Aug 17, 2023, about 22:22, Turk St & Polk St (Tenderloin).**
   - SGO 30412-6144: Cruise westbound through the intersection on green at **13 mph**. A fire truck with emergency lights came southbound.
   - SV contact: Rear Right and Right. CP contact: Front and Front Right. Severity: Serious. The passenger was transported. Narrative partly CBI.
   - ABC7 (https://abc7news.com/cruise-driverless-car-sffd-fire-truck-accident/13666936/): the truck had moved into oncoming lanes to pass traffic. Cruise said buildings occlude the intersection. Afterward the DMV had Cruise cut its fleet 50%.
   - Replay: shows a broadside with emergency-vehicle detection timing.
4. **SoMa 7-car fatal (Waymo was the victim): Jan 19, 2025, 18:07, 6th St near Harrison St.**
   - SGO 30270-9724 (Waymo CSV2 marks it "Secondary Crash", Is Any Fatal Injury = True).
   - The Waymo was unoccupied and stopped in a queue at 0 mph, middle of three lanes, heading northwest. Posted limit 25. Dark, lighted.
   - An SUV at "extreme rate of speed" hit the car behind the Waymo, which pushed into the Waymo. The Waymo spun clockwise, was hit on the passenger side, then struck another car.
   - SV contact areas: Rear Left, Rear, Rear Right, Right, Front Right.
   - CBS (https://www.cbsnews.com/sanfrancisco/news/san-francisco-fatal-multi-vehicle-crash-6th-harrison-highway-280): Waymo data put the Tesla at an estimated **98 mph**. One person and a dog were killed. The driver was charged with vehicular manslaughter.
   - Replay: good "AV was not at fault" contrast, using real speeds of 0 vs about 98 mph.
5. **KitKat the bodega cat: Oct 27, 2025, 23:40, 16th St at Albion St (Mission).**
   - SGO 30270-12070 (location from Waymo CSV2): Waymo stopped at the curb for a pickup, facing east. A cat sat partially under the front right. The AV departed at **5 mph** and the right rear tire struck the cat.
   - Mission Local (https://missionlocal.org/2025/10/waymo-confirms-its-car-killed-kitkat-mission-bodega-cat/): Waymo confirmed. A witness said the cat sat in front of the car for about 7 seconds.
   - Caveat: SGO lists `SV Contact Area` = "Rear Left" while the narrative says the rear right tire. A real data inconsistency, worth showing.
   - Replay: shows the blind zone under the vehicle at low-speed pullout.
- **Backup with a real OL 316 PDF:** Mar 22, 2024, 22:00, Church St at Market St. Waymo was rear-ended by an SUV that left the scene. https://www.dmv.ca.gov/portal/file/waymo_032224-pdf/

## 75-minute build plan suggestion

- **0–15 min, data:**
  - Stream both NHTSA ADS CSVs into pandas.
  - Filter `City == "SAN FRANCISCO"`. Keep the latest `Report Version` per `Report ID`, then dedupe on `Same Incident ID`. Map entity to company via `Operating Entity` and `Make` (cruise, waymo, zoox).
  - Left-join Waymo CSV2 on `SGO Report ID` to get `Location Address / Description` and the exact `Incident Date`.
- **15–30 min, geocode:**
  - Batch-geocode about 757 "X Street at Y Street, San Francisco, CA" strings. Precompute and cache to JSON.
  - Fallback: match `primary_rd` / `secondary_rd` against DataSF injury-crash rows to borrow their lat/long.
  - For Cruise and Zoox (no location), use the Zenodo OL 316 CSV, which already has lat/long for 2019–2024.
- **30–50 min, hotspot map:**
  - Leaflet or deck.gl with AV crash points colored by company.
  - Toggle layers: DataSF injury heatmap and the 2024 HIN GeoJSON.
  - Side panel with the "report card": crashes per million miles using Waymo CSV1 (SF 67.9M RO miles), plus CSV3 benchmark ratios.
- **50–70 min, one hand-built replay:**
  - Pick the cyclist (#2) or Cruise drag (#1).
  - Canvas or SVG, top-down, 2–3 vehicles as rectangles on an intersection sketch.
  - Keyframes come from the narrative, `SV Precrash Speed`, the pre-crash movements and the contact-area flags. Light up the struck sector on an 8-sector car outline.
  - Have Claude turn the narrative into a JSON keyframe script: actors, headings, positions over t.
- **70–75 min:** add a disclaimer that this is a reconstruction from public reports with no LiDAR, video or trajectories and month-level dates, then demo.
- **Do not attempt in 75 minutes:**
  - Parsing hundreds of OL 316 PDFs: checkbox and diagram fields need vision, and the list page is gone.
  - Cruise narrative reconstruction for most crashes, since they are CBI-redacted.
  - Comparing crash counts across the June 2025 order change.

## Unverified leads

- **Waymo school-bus recall:**
  - Search results (not fetched successfully) say the voluntary software recall was announced around Dec 5–10, 2025, covering about 3,067 vehicles (another figure: 2,895), after Austin ISD school-bus passings and a Sept 22, 2025 Atlanta incident.
  - They also say NHTSA later opened a recall query (Nov 2026).
  - Lead: https://www.npr.org/2025/12/06/nx-s1-5635614/waymo-school-buses-recall (timed out).
- **Third Amended SGO CBI rule:** a Consumer Reports comment reportedly criticizes the new allowance for CBI claims on certain fields (https://advocacy.consumerreports.org/wp-content/uploads/2026/05/CR-Comments-to-NHTSA-on-SGO-Extension-5-4-2026.pdf, not fetched). A 2026 PRA extension of the SGO is reportedly in progress (omb.report ICR 202605-2127-005).
- **Tesla in the SF ADAS (L2) file:** not checked. Tesla Bay Area ride-hail crashes would show up in `SGO-2021-01_Incident_Reports_ADAS.csv` if anywhere. Also unconfirmed: whether Tesla holds a DMV drivered-testing permit (reported by Reuters via search snippets, not fetched).
- **Exact Cruise SF crash count:** 119 is computed by `Same Incident ID`, while there are 163 Cruise LLC report rows including versions. Confirm by counting distinct `Report ID`s where `Operating Entity` contains Cruise.
- **Archive/current overlap:** a few mid-2025 crashes may appear in both files.
- **Unopened sources:**
  - TIMS ArcGIS AV Crash Dashboard (link above).
  - CPUC quarterly AV reporting page: https://www.cpuc.ca.gov/regulatory-services/licensing/transportation-licensing-and-analysis-branch/autonomous-vehicle-programs/quarterly-reporting
- **Other CA AV crash corpora** (from search, not opened):
  - https://github.com/MengqiaoYu/Autonomous-Vehicle-Collision-Analysis-System (DMV crawler)
  - https://github.com/saquibmh/automated-california-av-dataset
  - AVOID dataset: https://github.com/ozheng1993/AVOID
  - 2026 preprint on 970 CA DMV reports: https://bazilinskyy.github.io/publications/alam2026collision
- **Waymo dog strike (2023) in SF:** mentioned in search results only.
