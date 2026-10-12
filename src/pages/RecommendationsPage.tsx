import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { recommendationApi } from "@/services/api";
import { Loading, PageHeader } from "@/components/common";
import { RecCard } from "@/pages/AnalysisDetailPage";
import type { Category } from "@/types";

const CATS: Category[] = ["Performance", "CPU", "Memory", "I/O", "Code Quality", "Complexity", "Energy", "Sustainability"];

export function RecommendationsPage() {
  const { data } = useQuery({ queryKey: ["recs"], queryFn: recommendationApi.list });
  const [f, setF] = useState({ project: "", priority: "", category: "", status: "" });
  const list = useMemo(() => (data ?? []).filter((r) =>
    (!f.project || r.projectName === f.project) && (!f.priority || r.priority === f.priority) && (!f.category || r.category === f.category) && (!f.status || r.status === f.status)), [data, f]);
  if (!data) return <Loading />;
  const projects = [...new Set(data.map((r) => r.projectName))];
  const sel = (k: keyof typeof f, label: string, opts: string[]) => (
    <label className="grid gap-1 text-xs text-muted-foreground">{label}
      <select value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="h-8 rounded border bg-card px-2 text-sm text-foreground capitalize">
        <option value="">All</option>{opts.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
      </select>
    </label>
  );
  return (
    <>
      <PageHeader title="Recommendations" description="Optimization suggestions derived from all analyses." />
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border bg-card p-3">
        {sel("project", "Project", projects)}{sel("priority", "Priority", ["critical", "high", "medium", "low"])}
        {sel("category", "Category", CATS)}{sel("status", "Status", ["open", "in_progress", "resolved", "dismissed"])}
        <span className="ml-auto text-xs text-muted-foreground">{list.length} of {data.length}</span>
      </div>
      <div className="space-y-3">{list.map((r) => <RecCard key={r.id} r={r} />)}</div>
    </>
  );
}
