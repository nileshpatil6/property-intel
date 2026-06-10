import type { Listing } from "@/lib/types";
import type { SearchParams } from "./index";
import { fetchHtml } from "./proxyUnlocker";

/**
 * OnTheMarket scraper. OTM ships a Redux preloaded-state JSON blob on the
 * search page. We fetch through the proxy unlocker, read the properties array, and
 * normalise to the shared shape.
 */
export async function scrapeOnTheMarket(p: SearchParams): Promise<Listing[]> {
  const path = p.listingType === "sale" ? "for-sale" : "to-rent";
  const url = `https://www.onthemarket.com/${path}/property/${slug(p.location)}/`
    + `?min-bedrooms=${p.minBeds ?? ""}&max-price=${p.maxPrice ?? ""}`;

  const html = await fetchHtml(url);
  const state = extractPreloadedState(html);
  const props = state?.properties?.properties ?? [];
  return props.map((r: Record<string, unknown>) => normalise(r, p.listingType));
}

function normalise(r: Record<string, any>, listingType: "sale" | "rent"): Listing {
  return {
    id: `otm-${r.id}`,
    source: "OnTheMarket",
    sourceUrl: `https://www.onthemarket.com${r.property_link ?? ""}`,
    listingType,
    title: r.property_title ?? "",
    price: Number(String(r.price).replace(/[^\d]/g, "")) || 0,
    address: r.display_address ?? "",
    area: r.display_address?.split(",").pop()?.trim() ?? "",
    postcode: r.outcode ?? "",
    bedrooms: r.bedrooms ?? 0,
    bathrooms: r.bathrooms ?? 0,
    receptions: r.reception_rooms ?? 0,
    sizeSqft: r.floorarea_sqft ?? null,
    propertyType: r.property_type ?? "Property",
    tenure: r.tenure ?? null,
    keyFeatures: r.key_features ?? [],
    agent: r.agent?.name ?? "",
    agentPhone: r.agent?.phone ?? "",
    description: r.summary ?? "",
    addedOn: r.added_on ?? new Date().toISOString(),
    image: "onthemarket",
  };
}

function slug(s: string) { return s.trim().toLowerCase().replace(/\s+/g, "-"); }
function extractPreloadedState(html: string): any {
  const m = html.match(/window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/);
  return m ? JSON.parse(m[1]) : null;
}
