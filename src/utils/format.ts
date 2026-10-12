export const fmtMs = (ms: number) => (!ms ? "—" : ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`);
export const fmtJ = (j: number) => (!j ? "—" : `${j.toFixed(1)} J`);
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
export const pctChange = (before: number, after: number) => (before ? ((after - before) / before) * 100 : 0);
export const scoreTone = (s: number) => (s >= 75 ? "success" : s >= 60 ? "info" : s >= 45 ? "warning" : "destructive");
