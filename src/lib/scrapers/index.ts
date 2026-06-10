/**
 * Production scraping layer.
 *
 * Each portal (Zoopla, Rightmove, OnTheMarket) actively blocks automated
 * collection with Cloudflare / bot-detection. We go through a residential-proxy
 * unlocker (rotating UK IPs + automatic challenge solving) so the pipeline stays
 * reliable as the sites change defences. Listings are normalised
 * to the single `Listing` shape the whole app consumes, so "3 sites into 1
 * search" is just merging three normalised arrays.
 *
 * OnTheMarket is scraped live with Playwright (scripts/scrape-live.mjs) and the
 * results are cached to src/data/scraped.json, which the app consumes. Zoopla
 * and Rightmove serve 403 / Cloudflare from a datacentre IP, so those two run
 * through the residential-proxy unlocker layer (proxyUnlocker.ts). Same parser,
 * one switch — nothing else in the app changes.
 */
import type { Listing, Source } from "@/lib/types";
import { scrapeZoopla } from "./zoopla";
import { scrapeRightmove } from "./rightmove";
import { scrapeOnTheMarket } from "./onthemarket";

export type SearchParams = {
  location: string;            // e.g. "Manchester" or "M20"
  listingType: "sale" | "rent";
  minBeds?: number;
  maxPrice?: number;
  radiusMiles?: number;
};

const SCRAPERS: Record<Source, (p: SearchParams) => Promise<Listing[]>> = {
  Zoopla: scrapeZoopla,
  Rightmove: scrapeRightmove,
  OnTheMarket: scrapeOnTheMarket,
};

/** Fan out across all portals in parallel, merge + de-duplicate. */
export async function searchAll(params: SearchParams, sources: Source[] = Object.keys(SCRAPERS) as Source[]) {
  const results = await Promise.allSettled(sources.map((s) => SCRAPERS[s](params)));
  const merged = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  return dedupe(merged);
}

/** Same property is often listed on multiple portals; collapse by address+price. */
function dedupe(items: Listing[]): Listing[] {
  const seen = new Map<string, Listing>();
  for (const l of items) {
    const key = `${l.postcode}|${l.bedrooms}|${Math.round(l.price / 1000)}`;
    if (!seen.has(key)) seen.set(key, l);
  }
  return [...seen.values()];
}
