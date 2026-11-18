// FlockCast: renders data/hops.json as a clickable data journey,
// and counts SFPD's Flock sharing partners live from the DeFlock snapshot.

const HOPS_URL = "../data/hops.json";
const ADJ_URL = "https://deflockdata.dontgetflocked.com/sharing-network-adjacency.json";
const NODES_URL = "https://deflockdata.dontgetflocked.com/sharing-network-nodes.geojson";
const META_URL = "https://deflockdata.dontgetflocked.com/sharing-network-meta.json";
const SF_SLUG = "san-francisco-ca-pd";

const TIER_LABEL = {
  device: "Device",
  private_company: "Private company",
  local_le: "Local police",
  regional_fusion: "Regional fusion centre",
  out_of_state: "Out of state",
  federal: "Federal",
};
const KIND_LABEL = {
  audit_finding: "Audit finding",
  official_admission: "Official admission",
  lawsuit: "Lawsuit (allegation)",
  news_report: "News report",
};

let hops = [];
let current = 0;

// ---------- tiny DOM helper (textContent only, never innerHTML with data) ----------
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}
// SFPD's site links its ALPR policy at a dead path; the file lives under /s3fs-public/.
const URL_FIXES = {
  "https://www.sanfranciscopolice.org/sites/default/files/2026-10/SFPD%20Surveillance%20Technology%20Policy%20on%20Automated%20License%20Plate%20Readers.pdf":
    "https://www.sanfranciscopolice.org/s3fs-public/2026-10/SFPD%20Surveillance%20Technology%20Policy%20on%20Automated%20License%20Plate%20Readers.pdf",
};
const fixUrl = (url) => URL_FIXES[url] || url;
const link = (url, text) =>
  url ? el("a", { href: fixUrl(url), target: "_blank", rel: "noopener" }, text || hostOf(url)) : null;
function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

// ---------- status of a hop ----------
function statusOf(hop) {
  const kinds = (hop.breaches || []).map((b) => b.kind);
  if (kinds.some((k) => k === "audit_finding" || k === "official_admission" || k === "lawsuit")) return "bad";
  if (kinds.length) return "warn";
  return "ok";
}
const STATUS_TEXT = { ok: "Rules followed", warn: "Concern reported", bad: "Possible conflict" };

// ---------- journey ----------
function renderHops() {
  const list = document.getElementById("hops");
  list.replaceChildren();
  hops.forEach((hop, i) => {
    const st = statusOf(hop);
    const btn = el(
      "button",
      {
        class: `hop ${st}${i === current ? " active" : ""}${hop.confidence === "needs_check" ? " unsure" : ""}`,
        "aria-pressed": i === current ? "true" : "false",
        onclick: () => select(i),
      },
      el("span", { class: "step" }, `Step ${hop.order ?? i + 1}`),
      el("span", { class: "from" }, hop.from?.name),
      el("span", { class: "arrow", "aria-hidden": "true" }, "↓"),
      el("span", { class: "to" }, hop.to?.name),
      el("span", { class: "tier" }, TIER_LABEL[hop.to?.tier] || hop.to?.tier || ""),
      el(
        "span",
        { class: "status" },
        el("i", { class: `dot ${st}` }),
        STATUS_TEXT[st],
        (hop.breaches || []).length ? ` · ${hop.breaches.length}` : ""
      ),
      hop.confidence === "needs_check" ? el("i", { class: "tag" }, "needs check") : null
    );
    list.append(el("li", {}, btn));
  });
}

function renderDetail() {
  const hop = hops[current];
  const box = document.getElementById("detail");
  if (!hop) { box.replaceChildren(); return; }
  const st = statusOf(hop);

  const rules = (hop.rules || []).map((r) =>
    el(
      "li",
      { class: "rule" },
      el("p", { class: "summary" }, r.summary),
      r.quote ? el("blockquote", {}, `“${r.quote}”`) : null,
      el(
        "p",
        { class: "cite" },
        r.citation || "",
        r.page ? `, p. ${r.page}` : "",
        r.url ? " · " : "",
        link(r.url, "source ↗")
      )
    )
  );

  const breaches = (hop.breaches || [])
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((b) =>
      el(
        "li",
        { class: `breach ${b.kind}` },
        el("span", { class: "when" }, b.date || ""),
        el("span", { class: "kind" }, KIND_LABEL[b.kind] || b.kind),
        el("p", {}, b.summary),
        link(b.url, `${hostOf(b.url)} ↗`)
      )
    );

  box.replaceChildren(
    el(
      "div",
      { class: `card ${st}` },
      el(
        "div",
        { class: "head" },
        el("span", { class: "step" }, `Step ${hop.order ?? current + 1} of ${hops.length}`),
        el("h2", {}, `${hop.from?.name} → ${hop.to?.name}`),
        hop.plain ? el("p", { class: "plain" }, hop.plain) : null,
        el(
          "p",
          { class: "moves" },
          el("strong", {}, "What moves: "),
          hop.what_moves || "—",
          "  ·  ",
          el("strong", {}, "Who holds it next: "),
          TIER_LABEL[hop.to?.tier] || hop.to?.tier || "—"
        ),
        hop.confidence === "needs_check"
          ? el("p", { class: "unsure-note" }, "Some claims on this step are still being verified against their sources.")
          : null
      ),
      el(
        "div",
        { class: "cols" },
        el(
          "section",
          {},
          el("h3", {}, "The rules"),
          rules.length ? el("ol", { class: "rules" }, rules) : el("p", { class: "empty" }, "No rule found yet."),
          hop.retention
            ? el(
                "div",
                { class: "retention" },
                el("h4", {}, "How long it's kept"),
                el("p", {}, hop.retention.summary, " ", link(hop.retention.url, "source ↗"))
              )
            : null
        ),
        el(
          "section",
          {},
          el("h3", {}, "What actually happened"),
          breaches.length
            ? el("ol", { class: "breaches" }, breaches)
            : el("p", { class: "empty" }, "Nothing documented on this step."),
          hop.notes ? el("p", { class: "notes" }, el("strong", {}, "Note: "), hop.notes) : null
        )
      )
    )
  );
}

function select(i) {
  current = Math.max(0, Math.min(hops.length - 1, i));
  renderHops();
  renderDetail();
}

function renderSources() {
  const urls = new Map();
  for (const h of hops) {
    for (const r of h.rules || []) if (r.url) urls.set(r.url, r.citation || hostOf(r.url));
    if (h.retention?.url && !urls.has(h.retention.url)) urls.set(h.retention.url, hostOf(h.retention.url));
    for (const b of h.breaches || []) if (b.url && !urls.has(b.url)) urls.set(b.url, hostOf(b.url));
  }
  urls.set("https://github.com/flockhopper3/deflock-data", "DeFlock open data (sharing network)");
  const ul = document.getElementById("sources");
  ul.replaceChildren(...[...urls].map(([u, t]) => el("li", {}, link(u, t))));
}

// ---------- live sharing-network count ----------
async function loadSharing() {
  const partnersEl = document.querySelector("#stat-partners [data-live]");
  const outsideEl = document.querySelector("#stat-outside [data-live]");
  try {
    const [adj, nodes, meta] = await Promise.all([
      fetch(ADJ_URL).then((r) => r.json()),
      fetch(NODES_URL).then((r) => r.json()).catch(() => null),
      fetch(META_URL).then((r) => r.json()).catch(() => null),
    ]);
    const outbound = new Set(adj[SF_SLUG] || []);
    const stateOf = new Map();
    for (const f of nodes?.features || []) {
      const p = f.properties || {};
      if (p.id) stateOf.set(p.id, p.state);
      if (p.portalSlug) stateOf.set(p.portalSlug, p.state);
    }
    // A partner counts as in-state if its record says CA, or its slug is a "-ca-" slug.
    const inCA = (slug) => stateOf.get(slug) === "CA" || /(^|-)ca(-|$)/.test(slug);
    // Outside = a partner whose record names a state other than CA. A few CA bodies
    // (Cal Fire, UC, a tribal PD) have a blank state; checked by hand, all Californian.
    const outside = [...outbound].filter((s) => !inCA(s) && stateOf.get(s) && stateOf.get(s) !== "CA");
    partnersEl.textContent = outbound.size.toLocaleString();
    outsideEl.textContent = outside.length.toLocaleString();
    document.getElementById("stat-outside").classList.add(outside.length ? "bad" : "good");
    const when = meta?.generatedAt || meta?.generated_at;
    if (when) document.querySelector("[data-snapshot]").textContent = ` of ${String(when).slice(0, 10)}`;
  } catch (e) {
    partnersEl.textContent = "307";
    outsideEl.textContent = "0";
    document.querySelector("[data-snapshot]").textContent = " (offline: showing the figures from 2026-11-16)";
    console.warn("Live sharing fetch failed, using cached numbers", e);
  }
}

// ---------- boot ----------
async function boot() {
  const data = await fetch(HOPS_URL).then((r) => r.json());
  hops = (data.hops || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  select(0);
  renderSources();
  loadSharing();
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); select(current + 1); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); select(current - 1); }
  });
}
boot().catch((e) => {
  document.getElementById("detail").replaceChildren(
    el("p", { class: "error" }, "Could not load data/hops.json. Serve the repo root with: python3 -m http.server 8000")
  );
  console.error(e);
});
