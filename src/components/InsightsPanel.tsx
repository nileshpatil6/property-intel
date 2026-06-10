"use client";

import type { MarketInsights } from "@/lib/types";
import type { EnrichedListing } from "@/lib/data";
import { IconSparkle, IconTrend, IconLayers } from "./icons";

export function InsightsPanel({ insights, listings, model }: {
  insights: MarketInsights; listings: EnrichedListing[]; model: string;
}) {
  const byId = new Map(listings.map((l) => [l.id, l]));
  return (
    <div className="insights-print" style={{
      background: "linear-gradient(150deg, #14213D 0%, #1E3A5F 55%, #182F4D 100%)",
      borderRadius: 18, padding: "20px 22px", color: "#E8EDF5", position: "relative", overflow: "hidden",
    }}>
      {/* glow accent */}
      <div style={{ position: "absolute", top: -60, right: -40, width: 240, height: 240, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(80,130,200,0.20), transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 13, position: "relative" }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(80,130,200,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#7FB0E0" }}>
          <IconSparkle size={16} />
        </span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>AI Market Intelligence</div>
          <div style={{ fontSize: 11, color: "#8AA0C2" }}>Generated across {listings.length} live listings</div>
        </div>
        <span style={{ fontSize: 10, color: "#7E94B8", marginLeft: "auto", fontFamily: "ui-monospace, monospace",
          background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 6 }}>{model}</span>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.65, color: "#D6E0EE", marginBottom: 16, position: "relative", maxWidth: 760 }}>
        {insights.summary}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, position: "relative" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
            <IconTrend size={13} style={{ color: "#7FB0E0" }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "#8AA0C2", textTransform: "uppercase" }}>Trends</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {insights.trends.map((t, i) => (
              <li key={i} style={{ fontSize: 12, lineHeight: 1.5, color: "#D6E0EE", display: "flex", gap: 8 }}>
                <span style={{ color: "#7FB0E0", flexShrink: 0 }}>•</span>{t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
            <IconLayers size={13} style={{ color: "#7FB0E0" }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "#8AA0C2", textTransform: "uppercase" }}>Standout opportunities</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {insights.standouts.map((s, i) => {
              const l = byId.get(s.id);
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10, padding: "9px 11px" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "#fff", display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l ? `${l.propertyType} · ${l.area}` : s.id}
                    </span>
                    {l && <span style={{ color: "#7FB0E0", flexShrink: 0 }}>£{l.price.toLocaleString()}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#A9B8D2", lineHeight: 1.45, marginTop: 3 }}>{s.reason}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
