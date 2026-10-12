import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analysisApi, performanceApi } from "@/services/api";
import { Loading, Metric, PageHeader, Panel, chartAxis, chartTooltip } from "@/components/common";
import { fmtMs, pctChange } from "@/utils/format";

export function PerformancePage() {
  const trend = useQuery({ queryKey: ["trend"], queryFn: performanceApi.trends });
  const analyses = useQuery({ queryKey: ["analyses"], queryFn: analysisApi.list });
  if (!trend.data || !analyses.data) return <Loading />;
  const t = trend.data; const first = t[0]!; const last = t.at(-1)!;
  const byProject = Object.values(
    analyses.data.filter((a) => a.status === "completed").reduce<Record<string, { name: string; Baseline: number; Optimized: number }>>((acc, a) => {
      acc[a.projectName] ??= { name: a.projectName, Baseline: a.executionTimeMs, Optimized: a.executionTimeMs };
      acc[a.projectName].Baseline = Math.max(acc[a.projectName].Baseline, a.executionTimeMs);
      acc[a.projectName].Optimized = Math.min(acc[a.projectName].Optimized, a.executionTimeMs);
      return acc;
    }, {}),
  );
  const imp = (b: number, a: number) => `${pctChange(b, a).toFixed(1)}%`;

  return (
    <>
      <PageHeader title="Performance" description="Execution time, CPU and memory across all projects (12-week window)." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Median Exec Time" value={fmtMs(last.executionMs)} hint={`${imp(first.executionMs, last.executionMs)} vs baseline`} tone="success" />
        <Metric label="Avg CPU" value={`${last.cpu.toFixed(0)}%`} hint={`${imp(first.cpu, last.cpu)} vs baseline`} />
        <Metric label="Avg Memory" value={`${last.memory.toFixed(0)} MB`} hint={`${imp(first.memory, last.memory)} vs baseline`} />
        <Metric label="Overall Improvement" value={imp(first.executionMs, last.executionMs).replace("-", "")} hint="execution time reduction" tone="success" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Execution time trend (ms)">
          <ResponsiveContainer width="100%" height={240}><LineChart data={t}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...chartAxis} /><YAxis {...chartAxis} /><Tooltip {...chartTooltip} /><Line dataKey="executionMs" name="Exec ms" stroke="var(--chart-2)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
        </Panel>
        <Panel title="CPU (%) and memory (MB)">
          <ResponsiveContainer width="100%" height={240}><LineChart data={t}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...chartAxis} /><YAxis yAxisId="l" {...chartAxis} /><YAxis yAxisId="r" orientation="right" {...chartAxis} /><Tooltip {...chartTooltip} /><Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="l" dataKey="cpu" name="CPU %" stroke="var(--chart-3)" strokeWidth={2} dot={false} /><Line yAxisId="r" dataKey="memory" name="Memory MB" stroke="var(--chart-1)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
        </Panel>
      </div>
      <Panel title="Baseline vs optimized by project" subtitle="Slowest vs fastest completed run (ms)" className="mt-4">
        <ResponsiveContainer width="100%" height={260}><BarChart data={byProject}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="name" {...chartAxis} /><YAxis {...chartAxis} /><Tooltip {...chartTooltip} /><Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Baseline" fill="var(--chart-5)" radius={[3, 3, 0, 0]} /><Bar dataKey="Optimized" fill="var(--chart-1)" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
      </Panel>
    </>
  );
}
