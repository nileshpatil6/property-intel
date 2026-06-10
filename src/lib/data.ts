import scraped from "@/data/scraped.json";
import aiCache from "@/data/ai-cache.json";
import type { Listing, AISummary, MarketInsights } from "@/lib/types";

export type EnrichedListing = Listing & { ai: AISummary };

const listings = scraped as Listing[];

const summaryById = new Map<string, AISummary>(
  (aiCache.summaries as AISummary[]).map((s) => [s.id, s])
);

export function getListings(): EnrichedListing[] {
  return listings.map((l) => ({
    ...l,
    ai: summaryById.get(l.id) ?? {
      id: l.id, headline: l.title, summary: l.description.slice(0, 160),
      pros: l.keyFeatures.slice(0, 3), watchouts: [], valueVerdict: "—", valueScore: 50,
    },
  }));
}

export function getInsights(): MarketInsights & { model: string } {
  return { ...(aiCache.insights as MarketInsights), model: aiCache.model };
}

// Which portals are scraping live in this build vs require the proxy layer.
export function getSourceStatus() {
  const live = new Set(listings.map((l) => l.source));
  return {
    OnTheMarket: live.has("OnTheMarket"),
    Zoopla: live.has("Zoopla"),
    Rightmove: live.has("Rightmove"),
  } as Record<string, boolean>;
}
