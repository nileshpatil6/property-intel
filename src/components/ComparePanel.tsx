"use client";

import type { EnrichedListing } from "@/lib/data";
import { SourceBadge, ValueScore, fmtPrice } from "./ui";

export function ComparePanel({ items, onClear, onRemove }: {
  items: EnrichedListing[]; onClear: () => void; onRemove: (id: string) => void;
}) {
  if (items.length === 0) return null;
  const bestValue = items.reduce((a, b) => (b.ai.valueScore > a.ai.valueScore ? b : a));
  const cheapest = items.reduce((a, b) => (b.price < a.price ? b : a));
  const biggest = items.reduce((a, b) => ((b.sizeSqft ?? 0) > (a.sizeSqft ?? 0) ? b : a));

  const rows: [string, (l: EnrichedListing) => React.ReactNode, (l: EnrichedListing) => boolean][] = [
    ["Price", (l) => fmtPrice(l.price, l.listingType), (l) => l.id === cheapest.id],
    ["AI value score", (l) => <ValueScore score={l.ai.valueScore} size={32} />, (l) => l.id === bestValue.id],
    ["Verdict", (l) => l.ai.valueVerdict, () => false],
    ["Bedrooms", (l) => l.bedrooms || "—", () => false],
    ["Bathrooms", (l) => l.bathrooms, () => false],
    ["Size", (l) => (l.sizeSqft ? `${l.sizeSqft.toLocaleString()} sqft` : "—"), (l) => l.id === biggest.id],
    ["£/sqft", (l) => (l.sizeSqft && l.listingType === "sale" ? `£${Math.round(l.price / l.sizeSqft)}` : "—"), () => false],
    ["Type", (l) => l.propertyType, () => false],
    ["Tenure", (l) => l.tenure ?? "—", () => false],
    ["Area", (l) => l.area, () => false],
  ];

  return (
    <div className="no-print scrollbar-thin fade-up" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
      background: "var(--surface)", borderTop: "1px solid var(--border-2)",
      borderRadius: "18px 18px 0 0",
      boxShadow: "0 -10px 40px rgba(20,40,30,0.16)", maxHeight: "62vh", overflowY: "auto",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Compare ({items.length})</h3>
          <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: 10 }}>AI highlights the best on each metric</span>
          <button onClick={onClear} style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 600,
            color: "var(--ink-2)", background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>Clear all</button>
        </div>

        <div style={{ overflowX: "auto" }} className="scrollbar-thin">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>
                <th style={{ width: 120 }} />
                {items.map((l) => (
                  <th key={l.id} style={{ padding: 10, textAlign: "left", verticalAlign: "top", minWidth: 150 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <SourceBadge source={l.source} small />
                      <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{l.title.split(",")[0]}</span>
                      <button onClick={() => onRemove(l.id)} style={{ fontSize: 11, color: "var(--warn)",
                        background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>remove</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, render, isBest]) => (
                <tr key={label} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "9px 10px", fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)",
                    textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</td>
                  {items.map((l) => {
                    const best = isBest(l);
                    return (
                      <td key={l.id} style={{ padding: "9px 10px", fontSize: 13,
                        color: best ? "var(--good)" : "var(--ink)", fontWeight: best ? 700 : 500 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          {render(l)}
                          {best && <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--good)",
                            background: "#E7F5EC", padding: "1px 5px", borderRadius: 5 }}>BEST</span>}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
