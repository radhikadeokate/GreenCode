import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { analysisApi } from "@/services/api";
import { EstimatedTag, Loading, Metric, PageHeader, Panel, Score, ScoreBar, SeverityBadge, StatusBadge, Table, Td, chartAxis, chartTooltip } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { fmtDate, fmtJ, fmtMs, pctChange } from "@/utils/format";
import type { AnalysisDetail, Comparison } from "@/types";

const TABS = ["overview", "performance", "runtime", "quality", "complexity", "energy", "hotspots", "recommendations", "compare"] as const;
const LABEL: Record<string, string> = { overview: "Overview", performance: "Performance", runtime: "Runtime", quality: "Code Quality", complexity: "Complexity", energy: "Energy", hotspots: "Hotspots", recommendations: "Recommendations", compare: "Before vs After" };

export function AnalysisDetailPage({ id, tab, withId }: { id: string; tab?: string; withId?: string }) {
  const nav = useNavigate();
  const { data: a, error } = useQuery({ queryKey: ["analysis", id], queryFn: () => analysisApi.get(id) });
  const other = useQuery({ queryKey: ["analysis", withId], queryFn: () => analysisApi.get(withId!), enabled: !!withId });
  if (error) return <div className="py-16 text-center text-muted-foreground">Analysis not found. <Link to="/analyses" className="text-info">Back to analyses</Link></div>;
  if (!a) return <Loading />;
  const current = TABS.includes(tab as never) ? tab! : "overview";

  return (
    <>
      <div className="mb-2 text-xs text-muted-foreground"><Link to="/analyses" className="hover:underline">Analyses</Link> / <span className="num">{a.id}</span></div>
      <PageHeader
        title={`${a.projectName}`}
        description={<span className="flex flex-wrap items-center gap-2"><span className="num">{a.id}</span>· {a.language} · {fmtDate(a.date)} <StatusBadge status={a.status} /></span>}
        actions={<Button asChild size="sm" variant="outline"><Link to="/reports/$id" params={{ id: `RPT-${a.id.slice(3)}` }}>View report</Link></Button>}
      />
      {a.status !== "completed" ? (
        <Panel><p className="py-8 text-center text-muted-foreground">This analysis is {a.status}. Results become available once it completes.</p></Panel>
      ) : (
        <Tabs value={current} onValueChange={(v) => nav({ to: "/analyses/$id", params: { id }, search: { tab: v, with: withId }, replace: true })}>
          <TabsList className="mb-4 h-auto flex-wrap justify-start">{TABS.map((t) => <TabsTrigger key={t} value={t}>{LABEL[t]}</TabsTrigger>)}</TabsList>
          <TabsContent value="overview"><Overview a={a} /></TabsContent>
          <TabsContent value="performance"><Performance a={a} /></TabsContent>
          <TabsContent value="runtime"><Runtime a={a} /></TabsContent>
          <TabsContent value="quality"><Quality a={a} /></TabsContent>
          <TabsContent value="complexity"><Complexity a={a} /></TabsContent>
          <TabsContent value="energy"><Energy a={a} /></TabsContent>
          <TabsContent value="hotspots"><HotspotTable a={a} /></TabsContent>
          <TabsContent value="recommendations"><RecList a={a} /></TabsContent>
          <TabsContent value="compare">
            {other.data ? <CompareRuns a={a} b={other.data} /> : <BeforeAfter rows={a.comparison} />}
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}

function Overview({ a }: { a: AnalysisDetail }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Metric label="Efficiency" value={<Score value={a.efficiencyScore} />} /><Metric label="Green Score" value={<Score value={a.greenScore} />} />
        <Metric label="Exec Time" value={fmtMs(a.executionTimeMs)} /><Metric label="CPU" value={`${a.cpuPercent}%`} />
        <Metric label="Memory" value={`${a.memoryMb} MB`} /><Metric label="Energy" value={fmtJ(a.energyJ)} hint={<EstimatedTag measured={a.hardwareMeasured} />} />
        <Metric label="Hotspots / Recs" value={`${a.hotspots.length} / ${a.recommendations.length}`} />
      </div>
      <Panel title="Efficiency Score breakdown" subtitle="Component scores reported by the scoring service">
        <div className="grid gap-4 sm:grid-cols-2">
          <ScoreBar label="Performance Efficiency" value={a.breakdown.performance} /><ScoreBar label="Resource Efficiency" value={a.breakdown.resource} />
          <ScoreBar label="Code Quality" value={a.breakdown.codeQuality} /><ScoreBar label="Energy Efficiency" value={a.breakdown.energy} />
        </div>
      </Panel>
    </div>
  );
}

function Performance({ a }: { a: AnalysisDetail }) {
  const c = a.comparison.slice(0, 3).map((x) => ({ name: x.metric, Baseline: x.before, Optimized: x.after }));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Execution time & CPU trend">
        <ResponsiveContainer width="100%" height={240}><LineChart data={a.performanceTrend}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...chartAxis} /><YAxis yAxisId="l" {...chartAxis} /><YAxis yAxisId="r" orientation="right" {...chartAxis} /><Tooltip {...chartTooltip} /><Legend wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="l" dataKey="executionMs" name="Exec ms" stroke="var(--chart-2)" dot={false} strokeWidth={2} /><Line yAxisId="r" dataKey="cpu" name="CPU %" stroke="var(--chart-3)" dot={false} strokeWidth={2} /></LineChart></ResponsiveContainer>
      </Panel>
      <Panel title="Baseline vs optimized">
        <ResponsiveContainer width="100%" height={240}><BarChart data={c}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="name" {...chartAxis} /><YAxis {...chartAxis} /><Tooltip {...chartTooltip} /><Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Baseline" fill="var(--chart-5)" radius={[3, 3, 0, 0]} /><Bar dataKey="Optimized" fill="var(--chart-1)" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
      </Panel>
    </div>
  );
}

function Runtime({ a }: { a: AnalysisDetail }) {
  const chart = (title: string, keys: [string, string, string][]) => (
    <Panel title={title}>
      <ResponsiveContainer width="100%" height={200}><AreaChart data={a.runtime}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...chartAxis} unit="s" /><YAxis {...chartAxis} /><Tooltip {...chartTooltip} /><Legend wrapperStyle={{ fontSize: 12 }} />
        {keys.map(([k, n, c]) => <Area key={k} dataKey={k} name={n} stroke={c} fill={c} fillOpacity={0.1} strokeWidth={1.5} />)}</AreaChart></ResponsiveContainer>
    </Panel>
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {chart("CPU over time (%)", [["cpu", "CPU %", "var(--chart-2)"]])}
        {chart("RAM over time (MB)", [["ram", "RSS MB", "var(--chart-1)"]])}
        {chart("Disk I/O (MB/s)", [["diskRead", "Read", "var(--chart-2)"], ["diskWrite", "Write", "var(--chart-3)"]])}
        {chart("Network I/O (MB/s)", [["netIn", "In", "var(--chart-1)"], ["netOut", "Out", "var(--chart-5)"]])}
      </div>
      <Panel title="Process information"><div className="-m-4"><Table head={["PID", "Process", "Threads", "Peak RSS", "CPU time"]}>
        {a.processes.map((p) => <tr key={p.pid}><Td className="num">{p.pid}</Td><Td className="num">{p.name}</Td><Td className="num">{p.threads}</Td><Td className="num">{p.peakRssMb} MB</Td><Td className="num">{p.cpuTimeS} s</Td></tr>)}
      </Table></div></Panel>
    </div>
  );
}

function Quality({ a }: { a: AnalysisDetail }) {
  const q = a.quality;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Metric label="Bugs" value={q.bugs} tone={q.bugs ? "destructive" : "success"} /><Metric label="Code Smells" value={q.codeSmells} tone="warning" />
      <Metric label="Vulnerabilities" value={q.vulnerabilities} tone={q.vulnerabilities ? "destructive" : "success"} /><Metric label="Duplication" value={`${q.duplicationPct}%`} />
      <Metric label="Maintainability" value={q.maintainability} tone={q.maintainability === "A" ? "success" : "info"} /><Metric label="Cyclomatic (total)" value={q.cyclomatic} />
    </div>
  );
}

function Complexity({ a }: { a: AnalysisDetail }) {
  return (
    <div className="space-y-4">
      <Panel title="Theoretical complexity"><div className="-m-4"><Table head={["Function", "File", "Time", "Space", "Runtime @ n=10k"]}>
        {a.complexity.map((c) => <tr key={c.fn}><Td className="num">{c.fn}</Td><Td className="text-muted-foreground">{c.file}</Td><Td className="num font-medium">{c.time}</Td><Td className="num">{c.space}</Td><Td className="num">{fmtMs(c.runtimeMs.at(-1)!)}</Td></tr>)}
      </Table></div></Panel>
      <Panel title="Complexity vs actual runtime" subtitle="Measured runtime (ms) across input sizes">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={a.complexity[0]!.inputSize.map((n, i) => Object.fromEntries([["n", n], ...a.complexity.map((c) => [c.fn, c.runtimeMs[i]])]))}>
            <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="n" {...chartAxis} /><YAxis {...chartAxis} scale="log" domain={["auto", "auto"]} /><Tooltip {...chartTooltip} /><Legend wrapperStyle={{ fontSize: 12 }} />
            {a.complexity.map((c, i) => <Line key={c.fn} dataKey={c.fn} name={`${c.fn} ${c.time}`} stroke={`var(--chart-${[4, 2, 1][i] ?? 5})`} strokeWidth={2} />)}
          </LineChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function Energy({ a }: { a: AnalysisDetail }) {
  const e = a.comparison.find((c) => c.metric.startsWith("Energy"))!;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Energy / execution" value={fmtJ(a.energyJ)} hint={<EstimatedTag measured={a.hardwareMeasured} />} />
        <Metric label="Before" value={fmtJ(e.before)} /><Metric label="After" value={fmtJ(e.after)} tone="success" />
        <Metric label="Hardware validation" value={a.hardwareMeasured ? "Available" : "N/A"} hint={a.hardwareMeasured ? "RAPL counters" : "No power meter on runner"} />
      </div>
      <Panel title="Energy trend (J)" subtitle={<EstimatedTag measured={a.hardwareMeasured} />}>
        <ResponsiveContainer width="100%" height={240}><AreaChart data={a.energyTrend}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...chartAxis} /><YAxis {...chartAxis} /><Tooltip {...chartTooltip} />
          <Area dataKey="energy" name="Energy J" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} strokeWidth={2} /></AreaChart></ResponsiveContainer>
      </Panel>
    </div>
  );
}

export function HotspotTable({ a, limit }: { a: AnalysisDetail; limit?: number }) {
  return (
    <div className="rounded-md border bg-card"><Table head={["File / Function", "CPU", "Memory", "Exec Time", "I/O ops", "Energy (est.)", "Severity"]}>
      {a.hotspots.slice(0, limit).map((h) => <tr key={h.id}><Td><div className="num text-xs">{h.fn}</div><div className="text-xs text-muted-foreground">{h.file}</div></Td>
        <Td className="num">{h.cpuPct}%</Td><Td className="num">{h.memoryMb} MB</Td><Td className="num">{fmtMs(h.timeMs)}</Td><Td className="num">{h.ioOps.toLocaleString()}</Td><Td className="num">{fmtJ(h.energyJ)}</Td><Td><SeverityBadge severity={h.severity} /></Td></tr>)}
    </Table></div>
  );
}

function RecList({ a }: { a: AnalysisDetail }) {
  if (!a.recommendations.length) return <Panel><p className="text-muted-foreground">No recommendations for this run.</p></Panel>;
  return <div className="space-y-3">{a.recommendations.map((r) => <RecCard key={r.id} r={r} />)}</div>;
}

export function RecCard({ r }: { r: AnalysisDetail["recommendations"][number] }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2"><SeverityBadge severity={r.priority} /><span className="rounded bg-secondary px-1.5 py-0.5 text-[11px]">{r.category}</span><StatusBadge status={r.status} /><span className="ml-auto num text-xs text-muted-foreground">{r.target}</span></div>
      <h3 className="mt-2 font-semibold">{r.problem}</h3>
      <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-sm md:grid-cols-[110px_1fr]">
        <dt className="text-muted-foreground">Metric</dt><dd className="num">{r.metric}</dd>
        <dt className="text-muted-foreground">Explanation</dt><dd>{r.explanation}</dd>
        <dt className="text-muted-foreground">Action</dt><dd>{r.action}</dd>
        <dt className="text-muted-foreground">Expected</dt><dd className="font-medium text-success">{r.impact}</dd>
      </dl>
    </div>
  );
}

export function BeforeAfter({ rows }: { rows: Comparison[] }) {
  return (
    <div className="rounded-md border bg-card"><Table head={["Metric", "Before", "After", "Change"]}>
      {rows.map((c) => { const p = pctChange(c.before, c.after); const good = c.lowerIsBetter ? p < 0 : p > 0;
        return <tr key={c.metric}><Td className="font-medium">{c.metric}</Td><Td className="num">{c.before} {c.unit}</Td><Td className="num">{c.after} {c.unit}</Td>
          <Td className={cn("num font-medium", good ? "text-success" : "text-destructive")}>{p > 0 ? "+" : ""}{p.toFixed(1)}%</Td></tr>; })}
    </Table></div>
  );
}

function CompareRuns({ a, b }: { a: AnalysisDetail; b: AnalysisDetail }) {
  const rows: Comparison[] = [
    { metric: "Execution Time", unit: "ms", before: a.executionTimeMs, after: b.executionTimeMs, lowerIsBetter: true },
    { metric: "CPU", unit: "%", before: a.cpuPercent, after: b.cpuPercent, lowerIsBetter: true },
    { metric: "Memory", unit: "MB", before: a.memoryMb, after: b.memoryMb, lowerIsBetter: true },
    { metric: "Energy (est.)", unit: "J", before: a.energyJ, after: b.energyJ, lowerIsBetter: true },
    { metric: "Efficiency Score", unit: "", before: a.efficiencyScore, after: b.efficiencyScore, lowerIsBetter: false },
    { metric: "Green Score", unit: "", before: a.greenScore, after: b.greenScore, lowerIsBetter: false },
  ];
  return <><p className="mb-2 text-sm text-muted-foreground">Comparing <span className="num">{a.id}</span> (before) with <span className="num">{b.id}</span> (after).</p><BeforeAfter rows={rows} /></>;
}
