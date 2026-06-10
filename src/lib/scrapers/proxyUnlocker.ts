/**
 * Residential-proxy unlocker client.
 *
 * Zoopla and Rightmove sit behind Cloudflare and return 403 to datacentre IPs
 * (verified). To collect from them reliably we route the request through a
 * residential-proxy unlocker that rotates UK IPs and solves bot challenges, then
 * return rendered HTML for the per-portal parsers. Provider-agnostic: works with
 * any unlocker endpoint (Bright Data Web Unlocker, ScraperAPI, Zyte, etc.) via
 * env config. OnTheMarket does not need this — it is scraped directly with
 * Playwright (scripts/scrape-live.mjs).
 */
const ENDPOINT = process.env.PROXY_UNLOCKER_ENDPOINT ?? "";

export async function fetchHtml(url: string): Promise<string> {
  const key = process.env.PROXY_UNLOCKER_KEY;
  if (!key || !ENDPOINT) {
    throw new Error("PROXY_UNLOCKER_KEY/ENDPOINT not set — Zoopla/Rightmove live collection disabled (OnTheMarket works without it)");
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, country: "gb", render: true }),
  });
  if (!res.ok) throw new Error(`Unlocker ${res.status}: ${await res.text()}`);
  return res.text();
}

export const LIVE_ENABLED = !!(process.env.PROXY_UNLOCKER_KEY && ENDPOINT);
