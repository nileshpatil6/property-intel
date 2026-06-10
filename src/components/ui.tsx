import type { Source } from "@/lib/types";

export const SOURCE_COLOR: Record<Source, string> = {
  Zoopla: "var(--zoopla)",
  Rightmove: "var(--rightmove)",
  OnTheMarket: "var(--onthemkt)",
};

export function fmtPrice(price: number, type: "sale" | "rent") {
  const s = "£" + price.toLocaleString("en-GB");
  return type === "rent" ? `${s}` : s;
}

export function SourceBadge({ source, small }: { source: Source; small?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: small ? 10 : 10.5, fontWeight: 600, letterSpacing: "0.01em",
      color: "#fff", background: SOURCE_COLOR[source],
      padding: small ? "3px 8px" : "4px 9px", borderRadius: 7, whiteSpace: "nowrap",
      boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
    }}>
      {source}
    </span>
  );
}

export function ValueScore({ score, size = 44 }: { score: number; size?: number }) {
  const color = score >= 70 ? "var(--good)" : score >= 50 ? "var(--gold)" : "var(--warn)";
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }} title={`AI value score ${score}/100`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.2,0.7,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
        <span style={{ fontSize: size * 0.30, fontWeight: 700, color }}>{score}</span>
        <span style={{ fontSize: size * 0.15, fontWeight: 600, color: "var(--ink-3)", marginTop: 1 }}>VALUE</span>
      </div>
    </div>
  );
}

const TYPE_GRADIENTS: Record<string, [string, string]> = {
  Flat: ["#3B82F6", "#1E3A8A"], Apartment: ["#3B82F6", "#1E40AF"], Studio: ["#6366F1", "#312E81"],
  "Semi-detached": ["#0E7C66", "#0A4034"], "Semi-detached house": ["#0E7C66", "#0A4034"],
  Detached: ["#047857", "#064E3B"], "Detached house": ["#047857", "#064E3B"],
  Terraced: ["#C2410C", "#7C2D12"], "Terraced house": ["#C2410C", "#7C2D12"],
  "End of terrace": ["#C2773F", "#7C3D1D"], Townhouse: ["#0891B2", "#155E63"],
  Bungalow: ["#9333EA", "#581C87"],
};

export function PropertyThumb({ ptype, height = 168, image, badge }: {
  ptype: string; height?: number; image?: string; badge?: React.ReactNode;
}) {
  const [a, b] = TYPE_GRADIENTS[ptype] ?? ["#475569", "#1E293B"];
  const hasPhoto = image && image.startsWith("http");
  return (
    <div style={{
      height, position: "relative", overflow: "hidden",
      background: hasPhoto
        ? `center / cover no-repeat url("${image}"), linear-gradient(135deg, ${a}, ${b})`
        : `linear-gradient(135deg, ${a}, ${b})`,
    }}>
      {!hasPhoto && (
        <svg viewBox="0 0 100 100" style={{ position: "absolute", right: -6, bottom: -10, width: 110, height: 110, opacity: 0.16 }}>
          <path d="M50 18 L82 44 V82 H18 V44 Z" fill="none" stroke="white" strokeWidth="3" />
          <rect x="42" y="58" width="16" height="24" fill="white" />
        </svg>
      )}
      {/* gradient scrim for legibility */}
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 26%, transparent 62%, rgba(0,0,0,0.42) 100%)" }} />
      {badge}
    </div>
  );
}

export function Stat({ icon, value, sub }: { icon: React.ReactNode; value: React.ReactNode; sub?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--ink-2)" }}>
      <span style={{ color: "var(--ink-3)", display: "inline-flex" }}>{icon}</span>
      <b style={{ color: "var(--ink)", fontWeight: 600 }}>{value}</b>{sub ? <span style={{ color: "var(--ink-3)" }}>{sub}</span> : null}
    </span>
  );
}
