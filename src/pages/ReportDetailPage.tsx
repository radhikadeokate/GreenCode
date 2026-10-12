import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Download, FileDown, Printer } from "lucide-react";
import { reportApi } from "@/services/api";
import { EstimatedTag, Loading, PageHeader, Score, ScoreBar, SeverityBadge, StatusBadge } from "@/components/common";
import { BeforeAfter } from "@/pages/AnalysisDetailPage";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtJ, fmtMs, pctChange } from "@/utils/format";

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid border-t py-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide"><span className="num mr-2 text-muted-foreground">{String(n).padStart(2, "0")}</span>{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
const KV = ({ items }: { items: [string, ReactNode][] }) => (
  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">{items.map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="num font-medium">{v}</dd></div>)}</dl>
);

export function ReportDetailPage({ id, print }: { id: string; print?: boolean }) {
  const { data, error } = useQuery({ queryKey: ["report", id], queryFn: () => reportApi.get(id) });
  useEffect(() => { if (data && print) setTimeout(() => window.print(), 300); }, [data, print]);
  if (error) return <div className="py-16 text-center text-muted-foreground">Report not found. <Link to="/reports" className="text-info">Back to reports</Link></div>;
  if (!data) return <Loading />;
  const { report: r, analysis: a } = data;
  const exec = a.comparison[0]!; const energy = a.comparison.find((c) => c.metric.startsWith("Energy"))!;
  const top = a.hotspots.slice(0, 3); const keyRecs = a.recommendations.filter((x) => x.priority === "critical" || x.priority === "high").slice(0, 4);

  return (
    <>
      <div className="mb-2 text-xs text-muted-foreground print:hidden"><Link to="/reports" className="hover:underline">Reports</Link> / <span className="num">{r.id}</span></div>
      <PageHeader title={`Efficiency Report — ${r.projectName}`} description={<span className="flex items-center gap-2"><span className="num">{r.id}</span> · {fmtDate(r.date)} <StatusBadge status={r.status} /></span>}
        actions={<div className="flex gap-2 print:hidden">
          <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}><FileDown className="size-4" />Export PDF</Button>
          <Button size="sm" onClick={() => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const u = URL.createObjectURL(blob); const l = document.createElement("a"); l.href = u; l.download = `${r.id}.json`; l.click(); URL.revokeObjectURL(u); }}><Download className="size-4" />Download</Button>
        </div>} />
      <article className="max-w-4xl rounded-md border bg-card px-8 pb-4">
        <Section n={1} title="Executive Summary">
          <p><b>{r.projectName}</b> achieved an Efficiency Score of <b>{a.efficiencyScore}</b> and a Green Score of <b>{a.greenScore}</b>. The analysis identified {a.hotspots.length} hotspots and {a.recommendations.length} recommendations; the dominant hotspot is <span className="num">{top[0]?.fn}</span> ({top[0]?.cpuPct}% CPU). Applying the optimized build reduced execution time by <b>{Math.abs(pctChange(exec.before, exec.after)).toFixed(0)}%</b> and estimated energy by <b>{Math.abs(pctChange(energy.before, energy.after)).toFixed(0)}%</b>.</p>
        </Section>
        <Section n={2} title="Project Information"><KV items={[["Project", r.projectName], ["Language", a.language], ["Analysis", a.id], ["Date", fmtDate(a.date)]]} /></Section>
        <Section n={3} title="Overall Scores">
          <div className="mb-4 flex gap-10"><div><div className="text-xs text-muted-foreground">Efficiency Score</div><div className="text-3xl"><Score value={a.efficiencyScore} /></div></div><div><div className="text-xs text-muted-foreground">Green Score</div><div className="text-3xl"><Score value={a.greenScore} /></div></div></div>
          <div className="grid gap-3 sm:grid-cols-2"><ScoreBar label="Performance Efficiency" value={a.breakdown.performance} /><ScoreBar label="Resource Efficiency" value={a.breakdown.resource} /><ScoreBar label="Code Quality" value={a.breakdown.codeQuality} /><ScoreBar label="Energy Efficiency" value={a.breakdown.energy} /></div>
        </Section>
        <Section n={4} title="Performance Summary"><KV items={[["Execution time", fmtMs(a.executionTimeMs)], ["Optimized", fmtMs(exec.after)], ["Improvement", `${Math.abs(pctChange(exec.before, exec.after)).toFixed(1)}%`], ["Iterations", 5]]} /></Section>
        <Section n={5} title="Resource Usage"><KV items={[["Avg CPU", `${a.cpuPercent}%`], ["Peak memory", `${a.memoryMb} MB`], ["Disk I/O", "412 MB"], ["Network I/O", "36 MB"]]} /></Section>
        <Section n={6} title="Code Quality Summary"><KV items={[["Bugs", a.quality.bugs], ["Code smells", a.quality.codeSmells], ["Vulnerabilities", a.quality.vulnerabilities], ["Maintainability", a.quality.maintainability]]} /></Section>
        <Section n={7} title="Complexity Analysis">
          <ul className="list-disc pl-5">{a.complexity.map((c) => <li key={c.fn}><span className="num">{c.fn}</span> — {c.time} time, {c.space} space; {fmtMs(c.runtimeMs.at(-1)!)} at n=10,000.</li>)}</ul>
        </Section>
        <Section n={8} title="Energy Analysis">
          <div className="mb-2"><EstimatedTag measured={a.hardwareMeasured} /></div>
          <KV items={[["Per execution", fmtJ(a.energyJ)], ["Optimized", fmtJ(energy.after)], ["Reduction", `${Math.abs(pctChange(energy.before, energy.after)).toFixed(1)}%`], ["Hardware validated", a.hardwareMeasured ? "Yes" : "No"]]} />
        </Section>
        <Section n={9} title="Top Hotspots">
          <ol className="space-y-1.5">{top.map((h) => <li key={h.id} className="flex items-center gap-3"><SeverityBadge severity={h.severity} /><span className="num">{h.file}::{h.fn}</span><span className="ml-auto num text-muted-foreground">{h.cpuPct}% CPU · {fmtMs(h.timeMs)}</span></li>)}</ol>
        </Section>
        <Section n={10} title="Key Recommendations">
          <ol className="list-decimal space-y-1.5 pl-5">{keyRecs.map((x) => <li key={x.id}><b>{x.problem}</b> — {x.action} <span className="text-success">({x.impact})</span></li>)}</ol>
        </Section>
        <Section n={11} title="Before vs After"><BeforeAfter rows={a.comparison} /></Section>
        <Section n={12} title="Conclusion">
          <p>The project shows {a.efficiencyScore >= 75 ? "good" : a.efficiencyScore >= 60 ? "moderate" : "limited"} overall efficiency. Addressing the {keyRecs.length} high-priority recommendations above is expected to deliver the largest gains in runtime and estimated energy consumption. Re-run the analysis after changes to validate improvements.</p>
        </Section>
      </article>
    </>
  );
}
