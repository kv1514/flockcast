// "Check it yourself": run any agency list or search log through the same rules, row by row.
// Real data: SFPD's sharing partners from the DeFlock snapshot. Or the visitor's own CSV/JSON
// (for example a Flock audit log from a public records request). Files are read in the browser
// and never uploaded. Uses globals from app.js: hops, el, link. Map focus via window.FlockMap.
(function () {
  const section = document.getElementById("check");
  if (!section) return;
  const ADJ = "https://deflockdata.dontgetflocked.com/sharing-network-adjacency.json";
  const NODES = "https://deflockdata.dontgetflocked.com/sharing-network-nodes.geojson";
  const MAX_ROWS = 400;
  const $ = (id) => document.getElementById(id);
  const out = $("check-out"), sum = $("check-sum"), filtersEl = $("check-filters"), q = $("check-q");
  const tbody = $("check-rows"), more = $("check-more"), status = $("check-status");

  const RESULT = {
    no: "Not allowed",
    bad: "Possible conflict",
    warn: "Concern",
    ok: "Allowed",
    unk: "Can't tell",
  };
  const ORDER = ["no", "bad", "warn", "unk", "ok"];

  // rules come from data/hops.json, so every flag links to its source
  function rule(hopId, re) {
    const h = (typeof hops !== "undefined" ? hops : []).find((x) => x.id === hopId);
    return (h?.rules || []).find((r) => re.test(r.summary)) || h?.rules?.[0] || null;
  }

  // ---------- deflock directory (lazy, cached) ----------
  let dir = null;
  function directory() {
    if (!dir) {
      dir = Promise.all([
        fetch(ADJ).then((r) => r.json()),
        fetch(NODES).then((r) => r.json()),
      ]).then(([adj, nodes]) => {
        const byId = new Map(), byName = new Map();
        for (const f of nodes.features || []) {
          const p = f.properties || {}, c = f.geometry?.coordinates;
          const rec = { name: p.name, state: p.state, city: p.city, type: p.type, ll: c ? [c[1], c[0]] : null };
          if (p.id) byId.set(p.id, rec);
          if (p.portalSlug) byId.set(p.portalSlug, rec);
          for (const n of [p.name, ...(p.aliases || [])]) if (n) byName.set(norm(n), rec);
        }
        return { adj, byId, byName };
      });
      dir.catch(() => { dir = null; });
    }
    return dir;
  }
  const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  // ---------- parsing ----------
  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", inQ = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQ) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') inQ = false;
        else cell += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); cell = "";
        if (row.some((c) => c.trim() !== "")) rows.push(row);
        row = [];
      } else cell += ch;
    }
    row.push(cell);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
    const head = (rows.shift() || []).map((h) => h.trim());
    return rows.map((r) => Object.fromEntries(head.map((h, k) => [h, (r[k] ?? "").trim()])));
  }
  function pickCols(keys) {
    const find = (re, not) => keys.find((k) => re.test(k.toLowerCase()) && !(not && not.test(k.toLowerCase())));
    return {
      name: find(/agency|org|organi[sz]ation|department|requester|partner|^name$|name/, /user|officer|file/),
      state: find(/^state$|state|^st$/),
      reason: find(/reason|purpose|justification|description/),
      case: find(/case|incident|dispatch|report ?#|report num/),
      date: find(/date|time|when/),
    };
  }

  // ---------- the checks ----------
  const FEDERAL = /\b(federal|fbi|dea|atf|ice|hsi|cbp|usms|u\.? ?s\.? marshals?|marshals service|irs|homeland security|dhs|border patrol|secret service|postal inspection|us attorney|department of justice(?! ?- ?ca)|tsa|nps|us army|us navy|military police)\b/i;
  const VAGUE = /^(inv|invest|investigation|investigations|test|testing|n\/?a|na|none|-+|\.+|x+|tbd|other|check|lookup|search)$/i;
  const IMMIGRATION = /\b(ice|immigration|deport\w*|removal|ero)\b/i;
  const REPRO = /\b(abortion|reproductive|gender[- ]affirming)\b/i;
  const STATES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC PR".split(" "));
  // DeFlock leaves the state blank for these SFPD partners; all are Californian (checked by hand).
  const KNOWN_CA = new Set(["blue-lake-rancheria-tribal-pd", "cal-fire", "california-state-university-long-beach-campus-pd", "monterey-county-district-attorneys-office", "university-of-california"]);
  function stateOf(r) {
    if (r.state) return r.state.toUpperCase().slice(0, 2);
    if (r.slug && (KNOWN_CA.has(r.slug) || /(^|-)ca(-|$)/.test(r.slug))) return "CA";
    const m = /(?:,\s*|\s|-)([A-Z]{2})(?:\s+(?:PD|SO|DA))?\s*$/.exec(r.name || "");
    return m && STATES.has(m[1]) ? m[1] : "";
  }
  function check(r, hasLog) {
    const flags = [];
    const st = stateOf(r);
    if (FEDERAL.test(r.name) || r.type === "federal") flags.push({ v: "no", why: "Federal agency. State law does not allow sharing plate reads with federal agencies.", rule: rule("to-federal", /federal agencies are not/i) });
    else if (st && st !== "CA") flags.push({ v: "no", why: `Agency in ${st}, outside California. State law does not allow out-of-state sharing.`, rule: rule("to-out-of-state", /attorney general/i) });
    if (hasLog) {
      const reason = (r.reason || "").trim(), cs = (r.case || "").trim();
      if (IMMIGRATION.test(reason)) flags.push({ v: "bad", why: `Reason mentions immigration ("${reason}"). SFPD says its plate data is not used for immigration enforcement.`, rule: rule("to-federal", /immigration/i) });
      if (REPRO.test(reason)) flags.push({ v: "bad", why: `Reason mentions reproductive or gender-affirming care ("${reason}"). California bars helping out-of-state investigations of that care.`, rule: rule("to-out-of-state", /abortion|gender/i) });
      if (!reason && !cs) flags.push({ v: "warn", why: "No case number and no reason. SFPD requires one or the other for its own searches.", rule: rule("flock-to-sfpd", /incident number|stated reason/i) });
      else if (!cs && VAGUE.test(reason)) flags.push({ v: "warn", why: `Vague reason ("${reason}") and no case number. Hard to audit.`, rule: rule("flock-to-sfpd", /incident number|stated reason/i) });
    }
    if (!flags.length) {
      if (st === "CA" || /california|\bca\b/i.test(r.name || "")) flags.push({ v: "ok", why: hasLog ? "California agency, with a case number or reason." : "California agency. State law allows sharing with California public agencies.", rule: rule("sfpd-to-ncric", /california public agency/i) });
      else flags.push({ v: "unk", why: "No state found for this agency, so the out-of-state rule can't be checked.", rule: null });
    }
    const v = ORDER.find((o) => flags.some((f) => f.v === o));
    return { ...r, st, v, flags };
  }

  // ---------- render ----------
  let rows = [], filter = "all", hasLog = false, label = "";
  function run(data, opts) {
    hasLog = opts.hasLog;
    label = opts.label;
    rows = data.map((r) => check(r, hasLog));
    filter = "all";
    q.value = "";
    out.hidden = false;
    render();
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function counts(list) {
    const c = Object.fromEntries(ORDER.map((o) => [o, 0]));
    for (const r of list) c[r.v]++;
    return c;
  }
  function render() {
    const c = counts(rows);
    const flagged = c.no + c.bad + c.warn;
    sum.replaceChildren(
      el("strong", {}, `${label}: `),
      `${rows.length.toLocaleString()} rows checked. `,
      el("strong", { class: flagged ? "neg" : "pos" }, `${flagged.toLocaleString()} flagged`),
      c.unk ? ` · ${c.unk} can't tell (no state)` : ""
    );
    filtersEl.replaceChildren(
      ...[["all", `All ${rows.length}`], ...ORDER.filter((o) => c[o]).map((o) => [o, `${RESULT[o]} ${c[o]}`])].map(([k, t]) =>
        el("button", { type: "button", class: `fchip ${k}`, "aria-pressed": filter === k ? "true" : "false", onclick: () => { filter = k; render(); } }, t)
      )
    );
    const term = norm(q.value);
    const shown = rows
      .filter((r) => filter === "all" || r.v === filter)
      .filter((r) => !term || norm([r.name, r.st, r.city, r.reason, r.case, r.date].join(" ")).includes(term))
      .sort((a, b) => ORDER.indexOf(a.v) - ORDER.indexOf(b.v));
    tbody.replaceChildren(...shown.slice(0, MAX_ROWS).flatMap(rowEls));
    more.textContent = shown.length > MAX_ROWS ? `Showing ${MAX_ROWS} of ${shown.length.toLocaleString()}. Type in the box to track something specific.` : shown.length ? "" : "Nothing matches.";
  }
  function rowEls(r) {
    const detail = el("tr", { class: "check-detail", hidden: true },
      el("td", { colspan: "5" },
        el("ul", {}, r.flags.map((f) => el("li", { class: f.v }, el("strong", {}, RESULT[f.v] + ": "), f.why, f.rule ? [" ", link(f.rule.url, `${f.rule.citation || "source"} ↗`)] : null))),
        el("div", { class: "check-act" },
          r.ll && window.FlockMap ? el("button", { type: "button", onclick: () => window.FlockMap.focus(r.ll, r.name, r.v, r.flags[0].why) }, "Show on map") : null,
          el("button", { type: "button", onclick: () => { q.value = r.name; render(); } }, "Track this agency"))));
    const tr = el("tr", {
      class: `check-row ${r.v}`, tabindex: "0",
      onclick: () => { detail.hidden = !detail.hidden; tr.setAttribute("aria-expanded", String(!detail.hidden)); },
      onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tr.click(); } },
      "aria-expanded": "false",
    },
      el("td", {}, el("span", { class: `vchip ${r.v}` }, RESULT[r.v])),
      el("td", {}, r.name || "(no name)", r.city ? el("small", {}, ` ${r.city}`) : null),
      el("td", {}, r.st || "?"),
      el("td", {}, [r.reason, r.case].filter(Boolean).join(" · ") || (hasLog ? "(none)" : "")),
      el("td", {}, r.date || ""));
    return [tr, detail];
  }
  q.addEventListener("input", render);

  // ---------- sources of data ----------
  $("check-sfpd").addEventListener("click", async () => {
    status.textContent = "Loading the live DeFlock snapshot…";
    try {
      const d = await directory();
      const slugs = [...new Set(d.adj["san-francisco-ca-pd"] || [])];
      const data = slugs.map((s) => {
        const n = d.byId.get(s) || {};
        return { name: n.name || s, state: n.state || "", city: n.city || "", type: n.type, ll: n.ll, slug: s };
      });
      status.textContent = "";
      run(data, { hasLog: false, label: "SFPD's Flock sharing partners (live)" });
    } catch (e) {
      status.textContent = "Couldn't reach the DeFlock snapshot. Try again, or upload a file.";
      console.warn(e);
    }
  });

  const file = $("check-file");
  $("check-upload").addEventListener("click", () => file.click());
  file.addEventListener("change", async () => {
    const f = file.files?.[0];
    if (!f) return;
    if (f.size > 25e6) { status.textContent = "That file is over 25 MB. Try a smaller export."; return; }
    status.textContent = `Reading ${f.name} in your browser…`;
    try {
      const text = await f.text();
      let recs = /\.json$/i.test(f.name) || /^\s*[[{]/.test(text) ? JSON.parse(text) : parseCSV(text);
      if (!Array.isArray(recs)) recs = recs.rows || recs.data || recs.records || Object.values(recs).find(Array.isArray) || [];
      if (!recs.length) throw new Error("no rows");
      const cols = pickCols(Object.keys(recs[0]));
      if (!cols.name) throw new Error("no agency column");
      const has = (k) => !!cols[k];
      let d = null;
      try { d = await directory(); } catch {}
      const data = recs.map((x) => {
        const name = String(x[cols.name] ?? "").trim();
        const hit = d?.byName.get(norm(name));
        return {
          name,
          state: (has("state") ? String(x[cols.state] ?? "") : "") || hit?.state || "",
          city: hit?.city || "",
          type: hit?.type,
          ll: hit?.ll || null,
          reason: has("reason") ? String(x[cols.reason] ?? "") : "",
          case: has("case") ? String(x[cols.case] ?? "") : "",
          date: has("date") ? String(x[cols.date] ?? "") : "",
        };
      });
      const used = Object.entries(cols).filter(([, v]) => v).map(([k, v]) => `${k} = "${v}"`).join(", ");
      status.textContent = `Columns used: ${used}.`;
      run(data, { hasLog: has("reason") || has("case"), label: f.name });
    } catch (e) {
      status.textContent = e.message === "no agency column"
        ? "Couldn't find an agency or organization column. Name one of the columns \"agency\" and try again."
        : "Couldn't read that file. Use a CSV with a header row, or a JSON list of records.";
      console.warn(e);
    } finally {
      file.value = "";
    }
  });
})();
