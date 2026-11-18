# FlockCast: technical script (about 75 seconds)

For Kausthubh: the "how it works" part of the demo, or answers when judges ask. Every number below is on the live site with a source link.

---

## 1. How Flock tracks a car (about 15 s)

A Flock camera is a box on a pole. It photographs every car that passes and reads the plate, plus details like make and colour. Each read (plate, photo, time, place) goes straight to Flock's cloud. Flock doesn't follow you live. But search a plate and you get every camera that saw it, which shows where that car has been.

## 2. How we built FlockCast (about 25 s)

FlockCast is a static website: no server, no login, no API keys. It joins three kinds of public data.

- **The path.** We read SFPD's ALPR policy, NCRIC's policy, state law SB 34 and the Attorney General's bulletin. Each of the five stops has the exact rule quoted word for word, with the page number and a link.
- **The rule check.** The code sorts every holder into a type: private company, local police, California fusion center, out-of-state, or federal. State law then gives a yes or no for each type.
- **What actually happened.** Next to each rule we show what audits and news reports found at that stop.

The map flies your plate to each stop. Then it shows the rule, the yes or no, and what the record shows.

## 3. The measured number (about 15 s)

When the page loads, it pulls SFPD's current list of sharing partners from the DeFlock / EyesOnFlock open data. Today that's **307 agencies, and 0 outside California**. So the list looks legal. But SFPD's own audit found **299 searches** run for federal and out-of-state agencies through NCRIC's access. The problem isn't the list. It's the access you can't see on it.

Then **Check it yourself** runs all 307 partners through the same rules, one row at a time. You can also drop in your own CSV, like a search log from a public records request. It flags federal or out-of-state agencies, immigration or abortion-related reasons, and searches with no stated reason. The file never leaves your browser.

## 4. One limit, and who is accountable (about 15 s)

**Limit:** we only see what was published or audited. Flock's internal access logs aren't public. Our camera map counts 430 SFPD cameras that volunteers mapped on OpenStreetMap. We show them only as counts per supervisor district, never exact locations.

**Accountable:** SFPD answers for who it shares with, Flock for what its system allows, and NCRIC for who it gives access to. The Board of Supervisors votes on extending Flock's contract in February 2027.

---

## If judges ask

- **"Where's the data from?"** SFPD's ALPR policy and its 2026 surveillance report. NCRIC's 2024 policy. The CA Attorney General's 2023 bulletin on SB 34. DeFlock / EyesOnFlock for the partner list. OpenStreetMap plus DataSF district outlines for the camera counts. Every claim on the site links to its source.
- **"Is the 307 live?"** Yes. The page fetches the DeFlock files when it loads, so the count updates when their data updates.
- **"Did you touch Flock or SFPD systems?"** No. Public documents and open data only.
- **"Why not show camera locations?"** It's the event's rule. District counts make the point without making a map of where the cameras are.
- **"What would you build next?"** Load the search logs people get through public records requests, and flag every search that breaks a rule, not just the 299 that were audited.

Say "possible conflict", never "violation" or "illegal".
