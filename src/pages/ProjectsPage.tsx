import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, FolderOpen, MoreHorizontal, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { analysisApi, projectApi, reportApi } from "@/services/api";
import { Loading, PageHeader, Score, StatusBadge, Table, Td } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fmtDate, fmtJ, fmtMs } from "@/utils/format";

export function ProjectsPage() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data } = useQuery({ queryKey: ["projects"], queryFn: projectApi.list });
  const analyses = useQuery({ queryKey: ["analyses"], queryFn: analysisApi.list });
  const reports = useQuery({ queryKey: ["reports"], queryFn: reportApi.list });
  const del = useMutation({
    mutationFn: projectApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Project deleted"); },
  });
  if (!data) return <Loading />;
  const latestAnalysis = (pid: string) => analyses.data?.find((a) => a.projectId === pid);
  const latestReport = (pid: string) => reports.data?.find((r) => r.projectId === pid);

  return (
    <>
      <PageHeader title="Projects" description={`${data.length} projects · Python and Java supported`} actions={<Button asChild size="sm"><Link to="/projects/new"><Plus className="size-4" />Create project</Link></Button>} />
      <div className="rounded-md border bg-card">
        <Table head={["Project Name", "Language", "Last Analysis", "Efficiency", "Green", "Exec Time", "Energy (est.)", "Issues", "Status", ""]}>
          {data.map((p) => {
            const a = latestAnalysis(p.id); const r = latestReport(p.id);
            return (
              <tr key={p.id} className="hover:bg-muted/40">
                <Td><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.description}</div></Td>
                <Td><span className="num rounded bg-secondary px-1.5 py-0.5 text-xs">{p.language}</span></Td>
                <Td className="text-muted-foreground">{fmtDate(p.lastAnalysis)}</Td>
                <Td><Score value={p.efficiencyScore} /></Td><Td><Score value={p.greenScore} /></Td>
                <Td className="num">{fmtMs(p.executionTimeMs)}</Td><Td className="num">{fmtJ(p.energyJ)}</Td>
                <Td className="num">{p.issues || "—"}</Td><Td><StatusBadge status={p.status} /></Td>
                <Td className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled={!a} onClick={() => a && nav({ to: "/analyses/$id", params: { id: a.id } })}><FolderOpen className="size-4" />Open project</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => nav({ to: "/projects/new", search: { project: p.id } })}><Play className="size-4" />Run analysis</DropdownMenuItem>
                      <DropdownMenuItem disabled={!r} onClick={() => r && nav({ to: "/reports/$id", params: { id: r.id } })}><FileText className="size-4" />View report</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => confirm(`Delete ${p.name}?`) && del.mutate(p.id)}><Trash2 className="size-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Td>
              </tr>
            );
          })}
        </Table>
      </div>
    </>
  );
}
