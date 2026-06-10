"use client";

import { useState } from "react";
import type { EnrichedListing } from "@/lib/data";
import { SourceBadge, ValueScore, PropertyThumb, fmtPrice, Stat } from "./ui";
import { IconBed, IconBath, IconPin, IconTag, IconSparkle, IconCheck, IconAlert, IconPhone, IconExternal, IconChevron } from "./icons";

export function ListingCard({ l, selected, onToggle }: {
  l: EnrichedListing; selected: boolean; onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isRent = l.listingType === "rent";

  return (
    <div className="card fade-up" style={{
      overflow: "hidden", display: "flex", flexDirection: "column",
      borderColor: selected ? "var(--primary)" : undefined,
      boxShadow: selected ? "0 0 0 3px var(--primary-l)" : undefined,
    }}>
      {/* Photo */}
      <div className="listing-photo" style={{ position: "relative" }}>
        <PropertyThumb ptype={l.propertyType} image={l.image} badge={
          <>
            <div style={{ position: "absolute", top: 11, left: 11 }}><SourceBadge source={l.source} /></div>
            <button onClick={() => onToggle(l.id)} title="Add to compare" style={{
              position: "absolute", top: 11, right: 11, width: 30, height: 30, borderRadius: 9,
              border: "none", background: selected ? "var(--primary)" : "rgba(255,255,255,0.92)",
              color: selected ? "#fff" : "var(--ink-2)", fontSize: 16, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)", backdropFilter: "blur(6px)",
            }}>{selected ? "✓" : "+"}</button>
            {/* price + type on photo */}
            <div style={{ position: "absolute", left: 12, bottom: 10, right: 12, display: "flex",
              alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em",
                  textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}>
                  {fmtPrice(l.price, l.listingType)}
                  {isRent && <span style={{ fontSize: 12.5, fontWeight: 500, opacity: 0.92 }}> pcm</span>}
                </div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#fff", textTransform: "uppercase",
                letterSpacing: "0.05em", background: isRent ? "rgba(192,65,12,0.92)" : "rgba(14,110,84,0.92)",
                padding: "3px 8px", borderRadius: 6, backdropFilter: "blur(4px)" }}>
                {isRent ? "To Let" : "For Sale"}
              </span>
            </div>
          </>
        } />
      </div>

      {/* Body */}
      <div style={{ padding: "13px 15px 15px", display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
        {/* print-only price header */}
        <div className="listing-printhead" style={{ alignItems: "center", justifyContent: "space-between",
          gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 19, fontWeight: 700, color: "var(--ink)" }}>
            {fmtPrice(l.price, l.listingType)}{isRent && <span style={{ fontSize: 12, fontWeight: 500 }}> pcm</span>}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)" }}>
            {l.source} · {isRent ? "To Let" : "For Sale"}
          </span>
        </div>
        {/* address + score */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3,
              display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {l.propertyType}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 2, display: "flex",
              alignItems: "center", gap: 4 }}>
              <IconPin size={13} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.area}{l.postcode ? ` · ${l.postcode}` : ""}
              </span>
            </div>
          </div>
          <ValueScore score={l.ai.valueScore} />
        </div>

        {/* stats */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", paddingBottom: 11,
          borderBottom: "1px solid var(--border)" }}>
          <Stat icon={<IconBed />} value={l.bedrooms || "—"} sub="bed" />
          <Stat icon={<IconBath />} value={l.bathrooms} sub="bath" />
          {l.sizeSqft && <Stat icon={<IconTag />} value={l.sizeSqft.toLocaleString()} sub="sqft" />}
        </div>

        {/* AI summary */}
        <div style={{ background: "var(--primary-l)", borderRadius: 11, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <IconSparkle size={13} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.07em", color: "var(--primary-d)",
              textTransform: "uppercase" }}>AI Analysis</span>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--primary-d)", marginLeft: "auto",
              textAlign: "right" }}>{l.ai.valueVerdict}</span>
          </div>
          <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink)" }}>{l.ai.summary}</p>
        </div>

        <button onClick={() => setOpen(!open)} style={{
          fontSize: 12, fontWeight: 600, color: "var(--primary-d)", background: "none", border: "none",
          display: "flex", alignItems: "center", gap: 4, padding: 0, marginTop: -1,
        }}>
          <IconChevron size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          {open ? "Hide detail" : "Pros, watch-outs & agent"}
        </button>

        {open && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                  <IconCheck size={12} style={{ color: "var(--good)" }} />
                  <b style={{ color: "var(--good)", fontSize: 10, letterSpacing: "0.05em" }}>PROS</b>
                </div>
                <ul style={{ margin: 0, paddingLeft: 15, color: "var(--ink-2)", lineHeight: 1.6 }}>
                  {l.ai.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                  <IconAlert size={12} style={{ color: "var(--warn)" }} />
                  <b style={{ color: "var(--warn)", fontSize: 10, letterSpacing: "0.05em" }}>WATCH-OUTS</b>
                </div>
                <ul style={{ margin: 0, paddingLeft: 15, color: "var(--ink-2)", lineHeight: 1.6 }}>
                  {l.ai.watchouts.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              borderTop: "1px solid var(--border)", paddingTop: 9, color: "var(--ink-2)", fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                <IconPhone size={12} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.agent} · {l.agentPhone}
                </span>
              </span>
              <a href={l.sourceUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--primary-d)", fontWeight: 600, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0, marginLeft: 8 }}>
                View <IconExternal size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
