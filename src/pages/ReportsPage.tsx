import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Download, Eye } from "lucide-react";
import { reportApi } from "@/services/api";
import { Loading, PageHeader, Score, StatusBadge, Table, Td } from "@/components/common";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/utils/format";

export function ReportsPage() {
  const { data } = useQuery({ queryKey: ["reports"], queryFn: reportApi.list });
  if (!data) return <Loading />;
  return (
    <>
      <PageHeader title="Reports" description="Final summarized results for completed analyses." />
      <div className="rounded-md border bg-card">
        <Table head={["Report ID", "Project", "Analysis", "Date", "Efficiency", "Green", "Status", "Actions"]}>
          {data.map((r) => (
            <tr key={r.id} className="hover:bg-muted/40">
              <Td className="num">{r.id}</Td><Td className="font-medium">{r.projectName}</Td>
              <Td><Link to="/analyses/$id" params={{ id: r.analysisId }} className="num text-info hover:underline">{r.analysisId}</Link></Td>
              <Td className="text-muted-foreground">{fmtDate(r.date)}</Td><Td><Score value={r.efficiencyScore} /></Td><Td><Score value={r.greenScore} /></Td><Td><StatusBadge status={r.status} /></Td>
              <Td><div className="flex gap-1">
                <Button size="sm" variant="ghost" asChild><Link to="/reports/$id" params={{ id: r.id }}><Eye className="size-4" />View</Link></Button>
                <Button size="sm" variant="ghost" asChild><Link to="/reports/$id" params={{ id: r.id }} search={{ print: 1 }}><Download className="size-4" />Download</Link></Button>
              </div></Td>
            </tr>
          ))}
        </Table>
      </div>
    </>
  );
}
