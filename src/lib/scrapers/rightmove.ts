import type { Listing } from "@/lib/types";
import type { SearchParams } from "./index";
import { fetchHtml } from "./proxyUnlocker";

/**
 * Rightmove scraper. Rightmove exposes results via a `window.jsonModel` blob
 * keyed by an internal locationIdentifier. We resolve the location to that
 * identifier, fetch the results page through the proxy unlocker, and normalise.
 */
export async function scrapeRightmove(p: SearchParams): Promise<Listing[]> {
  const channel = p.listingType === "sale" ? "BUY" : "RENT";
  const locId = await resolveLocationIdentifier(p.location);
  const url = `https://www.rightmove.co.uk/property-${channel === "BUY" ? "for-sale" : "to-rent"}/find.html`
    + `?locationIdentifier=${encodeURIComponent(locId)}`
    + `&minBedrooms=${p.minBeds ?? ""}&maxPrice=${p.maxPrice ?? ""}&radius=${p.radiusMiles ?? 0}`;

  const html = await fetchHtml(url);
  const model = extractJsonModel(html);
  const props = model?.properties ?? [];
  return props.map((r: Record<string, unknown>) => normalise(r, p.listingType));
}

function normalise(r: Record<string, any>, listingType: "sale" | "rent"): Listing {
  return {
    id: `rm-${r.id}`,
    source: "Rightmove",
    sourceUrl: `https://www.rightmove.co.uk${r.propertyUrl ?? ""}`,
    listingType,
    title: r.displayAddress ?? "",
    price: r.price?.amount ?? 0,
    address: r.displayAddress ?? "",
    area: r.displayAddress?.split(",").pop()?.trim() ?? "",
    postcode: r.location?.postcode ?? "",
    bedrooms: r.bedrooms ?? 0,
    bathrooms: r.bathrooms ?? 0,
    receptions: 0,
    sizeSqft: r.displaySize ? Number(String(r.displaySize).replace(/[^\d]/g, "")) || null : null,
    propertyType: r.propertySubType ?? "Property",
    tenure: null,
    keyFeatures: r.keyFeatures ?? [],
    agent: r.customer?.branchDisplayName ?? "",
    agentPhone: r.customer?.contactTelephone ?? "",
    description: r.summary ?? "",
    addedOn: r.firstVisibleDate ?? new Date().toISOString(),
    image: "rightmove",
  };
}

// Rightmove's typeahead returns the internal locationIdentifier (e.g. REGION^904)
async function resolveLocationIdentifier(location: string): Promise<string> {
  // Production: call the Rightmove location typeahead endpoint via the proxy unlocker.
  // Cached map covers the demo set.
  const known: Record<string, string> = {
    manchester: "REGION^904", trafford: "REGION^61285", salford: "REGION^1024",
  };
  return known[location.toLowerCase()] ?? `OUTCODE^${location}`;
}

function extractJsonModel(html: string): any {
  const m = html.match(/window\.jsonModel\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  return m ? JSON.parse(m[1]) : null;
}
