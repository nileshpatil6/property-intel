"use client";

import type { MarketInsights } from "@/lib/types";
import type { EnrichedListing } from "@/lib/data";
import { IconSparkle, IconTrend, IconLayers } from "./icons";

export function InsightsPanel({ insights, listings, model }: {
  insights: MarketInsights; listings: EnrichedListing[]; model: string;
}) {
  const byId = new Map(listings.map((l) => [l.id, l]));
  return (
    <div className="insights-print card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12,
        borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        <IconSparkle size={15} style={{ color: "var(--primary)" }} />
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>Market summary</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Generated across {listings.length} listings</div>
        </div>
        <span style={{ fontSize: 10, color: "var(--ink-3)", marginLeft: "auto", fontFamily: "ui-monospace, monospace",
          background: "var(--surface-2)", padding: "3px 8px", borderRadius: 5, border: "1px solid var(--border)" }}>{model}</span>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink-2)", marginBottom: 16, maxWidth: 760 }}>
        {insights.summary}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
            <IconTrend size={13} style={{ color: "var(--ink-3)" }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-3)", textTransform: "uppercase" }}>Trends</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {insights.trends.map((t, i) => (
              <li key={i} style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-2)", display: "flex", gap: 8 }}>
                <span style={{ color: "var(--ink-3)", flexShrink: 0 }}>—</span>{t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
            <IconLayers size={13} style={{ color: "var(--ink-3)" }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-3)", textTransform: "uppercase" }}>Standout opportunities</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {insights.standouts.map((s, i) => {
              const l = byId.get(s.id);
              return (
                <div key={i} style={{ background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 6, padding: "9px 11px" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)", display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l ? `${l.propertyType} · ${l.area}` : s.id}
                    </span>
                    {l && <span style={{ color: "var(--primary)", flexShrink: 0 }}>£{l.price.toLocaleString()}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.45, marginTop: 3 }}>{s.reason}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
