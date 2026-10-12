import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { analysisApi, reportApi } from "@/services/api";
import { Loading, PageHeader, Score, StatusBadge, Table, Td } from "@/components/common";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtJ, fmtMs } from "@/utils/format";

export function AnalysesPage() {
  const nav = useNavigate();
  const { data } = useQuery({ queryKey: ["analyses"], queryFn: analysisApi.list });
  const reports = useQuery({ queryKey: ["reports"], queryFn: reportApi.list });
  const [compare, setCompare] = useState<string[]>([]);
  if (!data) return <Loading />;
  const toggle = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c.slice(-1), id]));

  return (
    <>
      <PageHeader
        title="Analyses"
        description="Detailed technical results of individual analysis runs."
        actions={compare.length === 2 && <Button size="sm" variant="outline" onClick={() => nav({ to: "/analyses/$id", params: { id: compare[0] }, search: { tab: "compare", with: compare[1] } })}>Compare {compare[0]} ↔ {compare[1]}</Button>}
      />
      <div className="rounded-md border bg-card">
        <Table head={["Analysis ID", "Project", "Language", "Date", "Status", "Exec Time", "Efficiency", "Green", "Energy (est.)", "Issues", "Actions"]}>
          {data.map((a) => {
            const rep = reports.data?.find((r) => r.analysisId === a.id);
            const done = a.status === "completed";
            return (
              <tr key={a.id} className="hover:bg-muted/40">
                <Td><Link to="/analyses/$id" params={{ id: a.id }} className="num text-info hover:underline">{a.id}</Link></Td>
                <Td className="font-medium">{a.projectName}</Td><Td>{a.language}</Td>
                <Td className="text-muted-foreground">{fmtDate(a.date)}</Td><Td><StatusBadge status={a.status} /></Td>
                <Td className="num">{fmtMs(a.executionTimeMs)}</Td><Td><Score value={a.efficiencyScore} /></Td><Td><Score value={a.greenScore} /></Td>
                <Td className="num">{fmtJ(a.energyJ)}</Td><Td className="num">{a.issues || "—"}</Td>
                <Td>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" disabled={!done} onClick={() => nav({ to: "/analyses/$id", params: { id: a.id } })}>View</Button>
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Re-run queued for ${a.projectName}`, { description: "Will start when the analysis backend is connected." })}>Run again</Button>
                    <Button size="sm" variant={compare.includes(a.id) ? "secondary" : "ghost"} disabled={!done} onClick={() => toggle(a.id)}>Compare</Button>
                    <Button size="sm" variant="ghost" disabled={!rep} onClick={() => rep && nav({ to: "/reports/$id", params: { id: rep.id } })}>Report</Button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </Table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Select two completed analyses with “Compare” to view them side by side.</p>
    </>
  );
}
