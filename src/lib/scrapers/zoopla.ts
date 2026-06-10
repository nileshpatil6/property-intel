import type { Listing } from "@/lib/types";
import type { SearchParams } from "./index";
import { fetchHtml } from "./proxyUnlocker";

/**
 * Zoopla scraper. Zoopla embeds a __NEXT_DATA__ JSON blob with the full,
 * structured listing payload — far more reliable than parsing rendered HTML.
 * We fetch the results page through the proxy unlocker, pull that JSON, and
 * normalise each listing to our `Listing` shape.
 */
export async function scrapeZoopla(p: SearchParams): Promise<Listing[]> {
  const path = p.listingType === "sale" ? "for-sale" : "to-rent";
  const url = `https://www.zoopla.co.uk/${path}/property/${slug(p.location)}/`
    + `?beds_min=${p.minBeds ?? 0}${p.maxPrice ? `&price_max=${p.maxPrice}` : ""}`;

  const html = await fetchHtml(url);
  const raw = extractNextData(html);
  const regular = raw?.props?.pageProps?.regularListingsFormatted ?? [];

  return regular.map((r: Record<string, unknown>) => normalise(r, p.listingType));
}

function normalise(r: Record<string, any>, listingType: "sale" | "rent"): Listing {
  return {
    id: `zp-${r.listingId}`,
    source: "Zoopla",
    sourceUrl: `https://www.zoopla.co.uk${r.listingUris?.detail ?? ""}`,
    listingType,
    title: r.title ?? "",
    price: Number(String(r.price).replace(/[^\d]/g, "")) || 0,
    address: r.address ?? "",
    area: r.address?.split(",").pop()?.trim() ?? "",
    postcode: r.outcode ?? "",
    bedrooms: r.beds ?? 0,
    bathrooms: r.baths ?? 0,
    receptions: r.receptions ?? 0,
    sizeSqft: r.floorArea?.value ?? null,
    propertyType: r.propertyType ?? "Property",
    tenure: r.tenure ?? null,
    keyFeatures: r.features ?? [],
    agent: r.branch?.name ?? "",
    agentPhone: r.branch?.phone ?? "",
    description: r.summaryDescription ?? r.shortPriceTitle ?? "",
    addedOn: r.publishedOn ?? new Date().toISOString(),
    image: "zoopla",
  };
}

// --- helpers ---
function slug(s: string) { return s.trim().toLowerCase().replace(/\s+/g, "-"); }
function extractNextData(html: string): any {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  return m ? JSON.parse(m[1]) : null;
}
