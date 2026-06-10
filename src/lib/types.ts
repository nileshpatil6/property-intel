export type Source = "Zoopla" | "Rightmove" | "OnTheMarket";
export type Listing = {
  id: string;
  source: Source;
  sourceUrl: string;
  listingType: "sale" | "rent";
  title: string;
  price: number;            // GBP. For rent, this is pcm.
  address: string;
  area: string;             // town/city
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  sizeSqft: number | null;
  propertyType: string;     // Flat, Terraced, Semi-detached, Detached, etc.
  tenure: string | null;
  keyFeatures: string[];
  agent: string;
  agentPhone: string;
  description: string;
  addedOn: string;          // ISO date
  image: string;            // gradient seed / placeholder key
};

export type AISummary = {
  id: string;
  headline: string;         // one-line hook
  summary: string;          // 2-3 sentence plain-English summary
  pros: string[];
  watchouts: string[];
  valueVerdict: string;     // e.g. "Below area average — strong value"
  valueScore: number;       // 0-100
};

export type MarketInsights = {
  generatedAt: string;
  query: string;
  trends: string[];
  standouts: { id: string; reason: string }[];
  summary: string;
};
