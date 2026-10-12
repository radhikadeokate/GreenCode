import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analysisApi, hotspotApi, performanceApi, recommendationApi } from "@/services/api";
import { EstimatedTag, Loading, Metric, PageHeader, Panel, Score, SeverityBadge, StatusBadge, Table, Td, chartAxis, chartTooltip } from "@/components/common";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtJ, fmtMs } from "@/utils/format";

export function DashboardPage() {
  const analyses = useQuery({ queryKey: ["analyses"], queryFn: analysisApi.list });
  const trend = useQuery({ queryKey: ["trend"], queryFn: performanceApi.trends });
  const hotspots = useQuery({ queryKey: ["hotspots"], queryFn: hotspotApi.top as () => Promise<import("@/types").Hotspot[]> });
  const recs = useQuery({ queryKey: ["recs"], queryFn: recommendationApi.list });
  if (!analyses.data || !trend.data) return <Loading />;
  const latest = analyses.data.find((a) => a.status === "completed")!;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={<>Latest completed run: <Link to="/analyses/$id" params={{ id: latest.id }} className="num text-info hover:underline">{latest.id}</Link> · {latest.projectName}</>}
        actions={<Button asChild size="sm"><Link to="/projects/new">New analysis</Link></Button>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Efficiency Score" value={<Score value={latest.efficiencyScore} />} hint="out of 100" />
        <Metric label="Green Score" value={<Score value={latest.greenScore} />} hint="out of 100" />
        <Metric label="Execution Time" value={fmtMs(latest.executionTimeMs)} hint="median of runs" />
        <Metric label="CPU Usage" value={`${latest.cpuPercent}%`} hint="avg utilisation" />
        <Metric label="Memory Usage" value={`${latest.memoryMb} MB`} hint="peak RSS" />
        <Metric label="Energy" value={fmtJ(latest.energyJ)} hint={<EstimatedTag measured={latest.hardwareMeasured} />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Performance trends" subtitle="Efficiency and Green Score, last 12 weeks">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend.data}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="t" {...chartAxis} /><YAxis {...chartAxis} domain={[40, 100]} />
              <Tooltip {...chartTooltip} /><Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="efficiency" name="Efficiency" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              <Line dataKey="green" name="Green" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Runtime trends" subtitle="Median execution time (ms)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend.data}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="t" {...chartAxis} /><YAxis {...chartAxis} />
              <Tooltip {...chartTooltip} />
              <Area dataKey="executionMs" name="Execution ms" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.12} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Recent analyses" className="mt-4" action={<Link to="/analyses" className="text-xs text-info hover:underline">View all</Link>}>
        <div className="-m-4">
          <Table head={["ID", "Project", "Date", "Status", "Exec time", "Efficiency", "Green", "Energy"]}>
            {analyses.data.slice(0, 6).map((a) => (
              <tr key={a.id} className="hover:bg-muted/40">
                <Td><Link to="/analyses/$id" params={{ id: a.id }} className="num text-info hover:underline">{a.id}</Link></Td>
                <Td className="font-medium">{a.projectName}</Td><Td className="text-muted-foreground">{fmtDate(a.date)}</Td>
                <Td><StatusBadge status={a.status} /></Td><Td className="num">{fmtMs(a.executionTimeMs)}</Td>
                <Td><Score value={a.efficiencyScore} /></Td><Td><Score value={a.greenScore} /></Td><Td className="num">{fmtJ(a.energyJ)}</Td>
              </tr>
            ))}
          </Table>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top hotspots">
          <div className="-m-4">
            <Table head={["Function", "CPU", "Time", "Severity"]}>
              {hotspots.data?.slice(0, 5).map((h) => (
                <tr key={h.id}><Td><div className="num text-xs">{h.fn}</div><div className="text-xs text-muted-foreground">{h.file}</div></Td>
                  <Td className="num">{h.cpuPct}%</Td><Td className="num">{fmtMs(h.timeMs)}</Td><Td><SeverityBadge severity={h.severity} /></Td></tr>
              ))}
            </Table>
          </div>
        </Panel>
        <Panel title="Important recommendations" action={<Link to="/recommendations" className="text-xs text-info hover:underline">View all</Link>}>
          <ul className="-my-2 divide-y">
            {recs.data?.filter((r) => r.status === "open" && (r.priority === "critical" || r.priority === "high")).slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-start gap-3 py-2.5">
                <SeverityBadge severity={r.priority} />
                <div className="min-w-0"><div className="font-medium">{r.problem}</div><div className="num truncate text-xs text-muted-foreground">{r.projectName} · {r.target}</div></div>
                <span className="ml-auto shrink-0 text-xs text-success">{r.impact}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
