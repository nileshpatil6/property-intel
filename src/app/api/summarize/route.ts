import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import scraped from "@/data/scraped.json";
import type { Listing } from "@/lib/types";

const listings = scraped as Listing[];

// Live AI summary endpoint — same model the cache was built with.
// POST { id } -> regenerates that listing's summary on demand.
const MODEL = "gpt-5.4-mini";

export async function POST(req: NextRequest) {
  const { id } = await req.json().catch(() => ({}));
  const l = listings.find((x) => x.id === id);
  if (!l) return NextResponse.json({ error: "unknown listing" }, { status: 404 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });

  const client = new OpenAI({ apiKey: key });
  const ppsf = l.sizeSqft ? Math.round(l.price / l.sizeSqft) : null;

  const prompt = `You are a UK property analyst. Summarise this listing for a buyer dashboard. British English, concrete, no fluff.
${ppsf ? `This works out at £${ppsf}/sqft.` : ""}
Listing: ${JSON.stringify({ title: l.title, price: l.price, type: l.listingType, area: l.area,
  beds: l.bedrooms, baths: l.bathrooms, sizeSqft: l.sizeSqft, propertyType: l.propertyType,
  features: l.keyFeatures, description: l.description })}
Return ONLY JSON: {"headline","summary","pros":[],"watchouts":[],"valueVerdict","valueScore"}.`;

  try {
    const r = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    const txt = r.choices[0].message.content ?? "{}";
    const obj = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
    return NextResponse.json({ id, ...obj, live: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 502 });
  }
}
