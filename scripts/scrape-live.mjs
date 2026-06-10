// REAL live scraper. Pulls genuine listings from OnTheMarket via Playwright
// (verified working: 200, full structured data in __NEXT_DATA__). Zoopla and
// Rightmove return 403/Cloudflare from a datacentre IP, so in production those
// run through the residential-proxy unlocker layer (see src/lib/scrapers).
// For listings we have live access to, this writes REAL data to
// src/data/scraped.json which the app then consumes.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const AREAS = ["manchester", "salford", "trafford", "stockport"];
const CHANNELS = [
  { type: "sale", path: "for-sale" },
  { type: "rent", path: "to-rent" },
];

function findList(nextData) {
  let best = null;
  const seen = new Set();
  (function walk(o) {
    if (!o || typeof o !== "object" || seen.has(o)) return;
    seen.add(o);
    if (Array.isArray(o)) {
      if (o.length > 2 && o[0] && typeof o[0] === "object") {
        const k = Object.keys(o[0]);
        if (k.includes("price") && k.includes("bedrooms") && k.includes("details-url")) {
          if (!best || o.length > best.length) best = o;
        }
      }
      o.forEach(walk);
    } else for (const key of Object.keys(o)) walk(o[key]);
  })(nextData);
  return best ?? [];
}

function parsePrice(r) {
  if (typeof r.price === "number") return r.price;
  // rent comes as "£1,050 pcm (£242 pw)" — take the first £ figure only
  const s = r["short-price"] ?? String(r.price ?? "");
  const m = String(r.price ?? s).match(/£\s*([\d,]+)/);
  let n = m ? Number(m[1].replace(/,/g, "")) : 0;
  // short-price may be "£375k"
  if (!n && /k/i.test(s)) n = Math.round(parseFloat(s.replace(/[£,\s]/g, "")) * 1000);
  return n;
}

function normalise(r, type, area) {
  const price = parsePrice(r);
  const addr = r.address ?? "";
  const pc = (addr.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?)\b/) || [])[1] ?? "";
  return {
    id: `otm-${r.id}`,
    source: "OnTheMarket",
    sourceUrl: "https://www.onthemarket.com" + (r["details-url"] ?? ""),
    listingType: type,
    title: `${r["property-title"] ?? r["humanised-property-type"] ?? "Property"}, ${addr.split(",").slice(-2).join(",").trim()}`.slice(0, 90),
    price,
    address: addr,
    area: area.charAt(0).toUpperCase() + area.slice(1),
    postcode: pc,
    bedrooms: r.bedrooms ?? 0,
    bathrooms: r.bathrooms ?? 1,
    receptions: r.receptions ?? 1,
    sizeSqft: r["floor-area-sq-ft"] ?? null,
    propertyType: r["humanised-property-type"] ?? "Property",
    tenure: null,
    keyFeatures: (r.features ?? []).slice(0, 6),
    agent: r.agent?.name ?? "",
    agentPhone: r.agent?.telephone ?? "",
    description: (r.features ?? []).join(". ") || (r["property-title"] ?? ""),
    addedOn: new Date().toISOString().slice(0, 10),
    image: (r.images?.[0]?.default) ?? r["cover-image"] ?? "",
  };
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ userAgent: UA, locale: "en-GB", viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();

// bucket[area][type] = listings, so we can interleave for a balanced set
const buckets = {};
for (const area of AREAS) {
  for (const ch of CHANNELS) {
    const url = `https://www.onthemarket.com/${ch.path}/property/${area}/?view=grid`;
    process.stdout.write(`  ${ch.type.padEnd(4)} ${area.padEnd(11)} ... `);
    try {
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(1500);
      const list = await page.evaluate(() => {
        const el = document.getElementById("__NEXT_DATA__");
        return el ? JSON.parse(el.textContent) : null;
      });
      const rows = list ? findList(list) : [];
      const norm = rows
        .filter((r) => r.price && r.bedrooms !== undefined && !r["spotlight?"])
        .map((r) => normalise(r, ch.type, area))
        .filter((l) => (l.listingType === "rent" ? l.price > 200 && l.price < 12000 : l.price > 40000));
      (buckets[`${area}|${ch.type}`] = norm);
      console.log(`${resp?.status()} -> ${norm.length} listings`);
    } catch (e) {
      console.log("FAIL", e.message.split("\n")[0]);
    }
  }
}
await browser.close();

// Interleave: take ~3 per (area,channel) bucket so the set spreads across all
// areas and has a healthy sale/rent mix.
const byId = new Map();
const PER_BUCKET = 4;
for (const key of Object.keys(buckets)) {
  for (const l of buckets[key].slice(0, PER_BUCKET)) {
    if (!byId.has(l.id)) byId.set(l.id, l);
  }
}
let listings = [...byId.values()];

fs.writeFileSync(path.join(root, "src/data/scraped.json"), JSON.stringify(listings, null, 2));
console.log(`\nWrote src/data/scraped.json — ${listings.length} REAL listings from OnTheMarket`);
console.log("sources:", { OnTheMarket: listings.length });
