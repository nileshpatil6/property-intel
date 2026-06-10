type P = { size?: number; className?: string; style?: React.CSSProperties };
const base = (size: number): React.SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round",
});

export const IconBed = ({ size = 15, style }: P) => (
  <svg {...base(size)} style={style}><path d="M3 7v11M3 12h18v6M21 12V9a2 2 0 0 0-2-2h-7v5" /><path d="M7 12V9a0 0 0 0 1 0 0" /></svg>
);
export const IconBath = ({ size = 15, style }: P) => (
  <svg {...base(size)} style={style}><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" /><path d="M6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2" /><path d="M9 6h2" /><path d="M7 19l-1 2M18 19l1 2" /></svg>
);
export const IconRuler = ({ size = 15, style }: P) => (
  <svg {...base(size)} style={style}><rect x="3" y="8" width="18" height="8" rx="1.5" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></svg>
);
export const IconPin = ({ size = 15, style }: P) => (
  <svg {...base(size)} style={style}><path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const IconTag = ({ size = 15, style }: P) => (
  <svg {...base(size)} style={style}><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" /><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" /></svg>
);
export const IconSearch = ({ size = 16, style }: P) => (
  <svg {...base(size)} style={style}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const IconSparkle = ({ size = 14, style }: P) => (
  <svg {...base(size)} style={style}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /></svg>
);
export const IconCheck = ({ size = 14, style }: P) => (
  <svg {...base(size)} style={style}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconAlert = ({ size = 14, style }: P) => (
  <svg {...base(size)} style={style}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
);
export const IconDownload = ({ size = 15, style }: P) => (
  <svg {...base(size)} style={style}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></svg>
);
export const IconExternal = ({ size = 13, style }: P) => (
  <svg {...base(size)} style={style}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
);
export const IconPhone = ({ size = 13, style }: P) => (
  <svg {...base(size)} style={style}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg>
);
export const IconChevron = ({ size = 16, style }: P) => (
  <svg {...base(size)} style={style}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconLayers = ({ size = 14, style }: P) => (
  <svg {...base(size)} style={style}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></svg>
);
export const IconTrend = ({ size = 14, style }: P) => (
  <svg {...base(size)} style={style}><path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>
);
