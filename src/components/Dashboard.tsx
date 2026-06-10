"use client";

import { useState, useMemo } from "react";
import type { EnrichedListing } from "@/lib/data";
import type { MarketInsights, Source } from "@/lib/types";
import { ListingCard } from "./ListingCard";
import { InsightsPanel } from "./InsightsPanel";
import { ComparePanel } from "./ComparePanel";
import { SOURCE_COLOR } from "./ui";
import { IconSearch, IconDownload, IconChevron } from "./icons";

const SOURCES: Source[] = ["Zoopla", "Rightmove", "OnTheMarket"];

export function Dashboard({ listings, insights, model, sourceStatus }: {
  listings: EnrichedListing[]; insights: MarketInsights; model: string;
  sourceStatus: Record<string, boolean>;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "sale" | "rent">("all");
  const [beds, setBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [activeSources, setActiveSources] = useState<Source[]>(SOURCES);
  const [sort, setSort] = useState<"value" | "price-asc" | "price-desc" | "newest">("value");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let r = listings.filter((l) => {
      if (!activeSources.includes(l.source)) return false;
      if (type !== "all" && l.listingType !== type) return false;
      if (beds && l.bedrooms < beds) return false;
      if (maxPrice && l.price > maxPrice) return false;
      if (q) {
        const hay = `${l.title} ${l.address} ${l.area} ${l.postcode} ${l.propertyType} ${l.keyFeatures.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    r = [...r].sort((a, b) => {
      if (sort === "value") return b.ai.valueScore - a.ai.valueScore;
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return +new Date(b.addedOn) - +new Date(a.addedOn);
    });
    return r;
  }, [listings, q, type, beds, maxPrice, activeSources, sort]);

  const toggleSel = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 4 ? s : [...s, id]));
  const toggleSource = (s: Source) =>
    setActiveSources((a) => (a.includes(s) ? a.filter((x) => x !== s) : [...a, s]));

  const selectedItems = listings.filter((l) => selected.includes(l.id));
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const selectWrap = (children: React.ReactNode) => (
    <div style={{ position: "relative", display: "inline-flex" }}>
      {children}
      <IconChevron size={14} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
        pointerEvents: "none", color: "var(--ink-3)" }} />
    </div>
  );
  const selStyle: React.CSSProperties = { appearance: "none", paddingRight: 28, cursor: "pointer" };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: selectedItems.length ? "64vh" : 48 }}>
      {/* Header */}
      <header className="no-print" style={{ background: "var(--surface)",
        borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 22px", display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, border: "1.5px solid var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: 700, fontSize: 15 }}>P</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>PropIntel</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Unified property search · Greater Manchester</div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 8,
            fontSize: 11.5, fontWeight: 500, color: "var(--ink-2)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "5px 11px" }}>
            {listings.length} listings · updated {today}
          </span>
          <button onClick={() => window.print()} style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 600,
            color: "var(--primary-d)", background: "var(--surface)", border: "1px solid var(--border-2)",
            borderRadius: 6, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconDownload size={14} /> Export report
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "22px" }}>
        {/* Hero line */}
        <div className="no-print" style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Search Zoopla, Rightmove and OnTheMarket in one place
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 5 }}>
            Every listing summarised and value-scored by AI to help you shortlist faster.
          </p>
        </div>

        {/* Search + filters */}
        <div className="no-print card" style={{ padding: 15, marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 280px", minWidth: 200 }}>
              <IconSearch size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
              <input className="field" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search area, postcode or feature — e.g. Salford, M14, garden"
                style={{ width: "100%", paddingLeft: 36 }} />
            </div>
            {selectWrap(<select className="field" value={type} onChange={(e) => setType(e.target.value as typeof type)} style={selStyle}>
              <option value="all">Buy & Rent</option><option value="sale">For sale</option><option value="rent">To rent</option>
            </select>)}
            {selectWrap(<select className="field" value={beds} onChange={(e) => setBeds(+e.target.value)} style={selStyle}>
              <option value={0}>Any beds</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ beds</option>)}
            </select>)}
            {selectWrap(<select className="field" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} style={selStyle}>
              <option value={0}>Any price</option>
              {[1500, 2500, 150000, 250000, 350000, 500000].map((p) =>
                <option key={p} value={p}>{p < 5000 ? `≤ £${p.toLocaleString()} pcm` : `≤ £${(p / 1000)}k`}</option>)}
            </select>)}
            {selectWrap(<select className="field" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} style={selStyle}>
              <option value="value">Best AI value</option><option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option><option value="newest">Newest</option>
            </select>)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 13, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.04em" }}>SOURCES</span>
            {SOURCES.map((s) => {
              const on = activeSources.includes(s);
              const live = sourceStatus[s];
              return (
                <button key={s} onClick={() => toggleSource(s)}
                  title={live ? "Scraping live" : "Behind Cloudflare — enable proxy layer to go live"}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6,
                    color: on ? "#fff" : "var(--ink-2)", background: on ? SOURCE_COLOR[s] : "var(--surface)",
                    border: `1px solid ${on ? SOURCE_COLOR[s] : "var(--border-2)"}`, transition: "all 0.15s",
                  }}>
                  {s}{!live && <span style={{ fontSize: 9, opacity: 0.85, fontWeight: 700 }}>PROXY</span>}
                </button>
              );
            })}
            <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ink-2)" }}>
              <b style={{ color: "var(--ink)" }}>{filtered.length}</b> of {listings.length} shown
            </span>
          </div>
        </div>

        {/* Insights */}
        <div style={{ marginBottom: 20 }}>
          <InsightsPanel insights={insights} listings={listings} model={model} />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 70, color: "var(--ink-3)" }}>No listings match your filters.</div>
        ) : (
          <div className="print-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {filtered.map((l) => (
              <ListingCard key={l.id} l={l} selected={selected.includes(l.id)} onToggle={toggleSel} />
            ))}
          </div>
        )}
      </main>

      <ComparePanel items={selectedItems} onClear={() => setSelected([])}
        onRemove={(id) => setSelected((s) => s.filter((x) => x !== id))} />
    </div>
  );
}
