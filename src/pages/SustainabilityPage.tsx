import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Info } from "lucide-react";
import { energyApi, projectApi, recommendationApi } from "@/services/api";
import { EstimatedTag, Loading, Metric, PageHeader, Panel, Score, ScoreBar, Table, Td, chartAxis, chartTooltip } from "@/components/common";
import { fmtJ, pctChange } from "@/utils/format";

export function SustainabilityPage() {
  const t = useQuery({ queryKey: ["trend"], queryFn: energyApi.trends });
  const projects = useQuery({ queryKey: ["projects"], queryFn: projectApi.list });
  const recs = useQuery({ queryKey: ["recs"], queryFn: recommendationApi.list });
  if (!t.data || !projects.data) return <Loading />;
  const first = t.data[0]!, last = t.data.at(-1)!;
  const done = projects.data.filter((p) => p.greenScore);
  const avgGreen = Math.round(done.reduce((s, p) => s + p.greenScore, 0) / done.length);

  return (
    <>
      <PageHeader title="Sustainability" description="Energy efficiency and resource footprint of analysed software." />
      <div className="mb-4 flex items-start gap-2 rounded border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
        <Info className="mt-0.5 size-4 shrink-0" />Energy values are ESTIMATED from CPU, memory and I/O utilisation models unless marked hardware-measured (RAPL / external meter).
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Avg Green Score" value={<Score value={avgGreen} />} hint={`${done.length} projects`} />
        <Metric label="Energy / run" value={fmtJ(last.energy)} hint={<EstimatedTag />} />
        <Metric label="Energy reduction" value={`${Math.abs(pctChange(first.energy, last.energy)).toFixed(1)}%`} hint="vs 12 weeks ago" tone="success" />
        <Metric label="Sustainability recs resolved" value={`${recs.data?.filter((r) => (r.category === "Energy" || r.category === "Sustainability") && r.status === "resolved").length ?? 0}`} hint="energy & sustainability" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Estimated energy trend (J / run)">
          <ResponsiveContainer width="100%" height={240}><AreaChart data={t.data}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...chartAxis} /><YAxis {...chartAxis} /><Tooltip {...chartTooltip} /><Area dataKey="energy" name="Energy J (est.)" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} strokeWidth={2} /></AreaChart></ResponsiveContainer>
        </Panel>
        <Panel title="Green Score trend">
          <ResponsiveContainer width="100%" height={240}><LineChart data={t.data}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...chartAxis} /><YAxis {...chartAxis} domain={[40, 100]} /><Tooltip {...chartTooltip} /><Legend wrapperStyle={{ fontSize: 12 }} /><Line dataKey="green" name="Green Score" stroke="var(--chart-1)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Panel title="Resource efficiency">
          <div className="space-y-3"><ScoreBar label="CPU efficiency" value={74} /><ScoreBar label="Memory efficiency" value={66} /><ScoreBar label="I/O efficiency" value={71} /><ScoreBar label="Energy efficiency" value={avgGreen} /></div>
        </Panel>
        <Panel title="Project energy footprint"><div className="-m-4"><Table head={["Project", "Green Score", "Energy / run", "Source"]}>
          {done.sort((a, b) => b.greenScore - a.greenScore).map((p) => <tr key={p.id}><Td className="font-medium">{p.name}</Td><Td><Score value={p.greenScore} /></Td><Td className="num">{fmtJ(p.energyJ)}</Td><Td><EstimatedTag /></Td></tr>)}
        </Table></div></Panel>
      </div>
    </>
  );
}
