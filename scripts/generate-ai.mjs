// Generates real AI summaries + market insights via OpenAI gpt-5.4-mini for the
// REAL scraped listings (src/data/scraped.json), caching to src/data/ai-cache.json.
// Value scores are grounded on the median price for the same area + bedroom count
// + listing type (OnTheMarket's grid view has no floor area, so £/sqft isn't
// available — median-by-cohort is the sound alternative).
import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const MODEL = "gpt-5.4-mini";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const listings = JSON.parse(fs.readFileSync(path.join(root, "src/data/scraped.json"), "utf8"));

// Median price per cohort: area | beds | type
const cohorts = {};
for (const l of listings) {
  const k = `${l.area}|${l.bedrooms}|${l.listingType}`;
  (cohorts[k] ??= []).push(l.price);
}
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const cohortMedian = Object.fromEntries(Object.entries(cohorts).map(([k, v]) => [k, median(v)]));

function jsonFromText(t) { const s = t.indexOf("{"); const e = t.lastIndexOf("}"); return JSON.parse(t.slice(s, e + 1)); }

async function summarise(l) {
  const med = cohortMedian[`${l.area}|${l.bedrooms}|${l.listingType}`];
  const unit = l.listingType === "rent" ? "pcm" : "";
  const ctx = med
    ? `For ${l.bedrooms}-bed ${l.listingType} in ${l.area}, the median asking price in this dataset is £${med.toLocaleString()} ${unit}. This one is £${l.price.toLocaleString()} ${unit}.`
    : `This is a ${l.listingType} listing at £${l.price.toLocaleString()} ${unit}.`;

  const prompt = `You are a UK property analyst. Summarise this real listing for a buyer dashboard. British English, concrete, no fluff.
${ctx}

Listing:
${JSON.stringify({ title: l.title, price: l.price, type: l.listingType, area: l.area, postcode: l.postcode,
  beds: l.bedrooms, baths: l.bathrooms, propertyType: l.propertyType, agent: l.agent,
  features: l.keyFeatures }, null, 0)}

Return ONLY JSON with keys:
"headline" (max 8 words, punchy),
"summary" (2-3 sentences, plain English; reference how it compares to the cohort median if relevant),
"pros" (array of 2-4 short phrases drawn from the features),
"watchouts" (array of 1-3 short phrases a buyer should check),
"valueVerdict" (max 6 words, e.g. "Below cohort median, strong value"),
"valueScore" (integer 0-100; higher = better value vs the cohort median; ~50 = at median).`;

  const r = await client.chat.completions.create({
    model: MODEL, messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" },
  });
  return { id: l.id, ...jsonFromText(r.choices[0].message.content) };
}

async function insights(summaries) {
  const prompt = `You are a UK property market analyst. Based on these REAL listings (scraped live from OnTheMarket) and their AI value scores, write a short market intelligence brief for a buyer searching Greater Manchester (Manchester, Salford, Trafford, Stockport).

Listings: ${JSON.stringify(listings.map((l) => ({ id: l.id, area: l.area, type: l.listingType, price: l.price, beds: l.bedrooms, propertyType: l.propertyType })))}
ValueScores: ${JSON.stringify(summaries.map((s) => ({ id: s.id, valueScore: s.valueScore, verdict: s.valueVerdict })))}

Return ONLY JSON with keys:
"summary" (2-3 sentences overview),
"trends" (array of 3-4 concrete observations about price, area, beds or type),
"standouts" (array of up to 3 objects {id, reason} naming the best-value or most notable listings).`;

  const r = await client.chat.completions.create({
    model: MODEL, messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" },
  });
  return jsonFromText(r.choices[0].message.content);
}

console.log(`Generating AI for ${listings.length} REAL listings via ${MODEL}...`);
const summaries = [];
for (const l of listings) {
  process.stdout.write(`  ${l.id} ${l.title.slice(0, 42)}... `);
  try { summaries.push(await summarise(l)); console.log("ok"); }
  catch (e) {
    console.log("FAIL", e.message);
    summaries.push({ id: l.id, headline: l.title.slice(0, 40), summary: l.keyFeatures.join(". ").slice(0, 160),
      pros: l.keyFeatures.slice(0, 3), watchouts: ["Verify details with agent"], valueVerdict: "See listing", valueScore: 50 });
  }
}

console.log("Generating market insights...");
let ins;
try { ins = await insights(summaries); }
catch (e) { console.log("insights FAIL", e.message); ins = { summary: "", trends: [], standouts: [] }; }

fs.writeFileSync(path.join(root, "src/data/ai-cache.json"), JSON.stringify({
  generatedAt: new Date().toISOString(), model: MODEL, summaries,
  insights: { ...ins, generatedAt: new Date().toISOString(), query: "Greater Manchester" },
}, null, 2));
console.log(`Wrote ai-cache.json (${summaries.length} summaries on real data)`);
