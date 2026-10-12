import { toast } from "sonner";
import { API_BASE_URL, USE_MOCK } from "@/services/api";
import { PageHeader, Panel } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Workspace, analysis defaults and integrations." />
      <div className="grid max-w-4xl gap-4">
        <Panel title="Profile"><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-1.5"><Label>Name</Label><Input defaultValue="Aarav Sharma" /></div><div className="grid gap-1.5"><Label>Email</Label><Input defaultValue="aarav@greencode.dev" /></div></div></Panel>
        <Panel title="Analysis defaults">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5"><Label>Benchmark iterations</Label><Input type="number" defaultValue={5} /></div>
            <div className="grid gap-1.5"><Label>Timeout (s)</Label><Input type="number" defaultValue={120} /></div>
            <div className="grid gap-1.5"><Label>Sandbox memory limit (MB)</Label><Input type="number" defaultValue={2048} /></div>
          </div>
          <div className="mt-4 space-y-3">
            {[["Run static analysis", true], ["Collect runtime metrics", true], ["Use hardware energy counters when available", true], ["Email me when an analysis completes", false]].map(([l, v]) => (
              <label key={l as string} className="flex items-center justify-between text-sm">{l}<Switch defaultChecked={v as boolean} /></label>
            ))}
          </div>
        </Panel>
        <Panel title="Backend connection">
          <dl className="grid grid-cols-[180px_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">VITE_API_BASE_URL</dt><dd className="num">{API_BASE_URL || "not set"}</dd>
            <dt className="text-muted-foreground">Mode</dt><dd>{USE_MOCK ? "Demo data (mock services)" : "Live API"}</dd>
            {["FastAPI", "PostgreSQL", "Docker sandbox", "SonarQube", "Runtime monitoring", "Energy estimation"].map((s) => (
              <div key={s} className="contents"><dt className="text-muted-foreground">{s}</dt><dd className={USE_MOCK ? "text-muted-foreground" : "text-success"}>{USE_MOCK ? "Not connected" : "Via API"}</dd></div>
            ))}
          </dl>
        </Panel>
        <div><Button onClick={() => toast.success("Settings saved locally")}>Save changes</Button></div>
      </div>
    </>
  );
}

const docs: [string, string][] = [
  ["Getting started", "Create a project, upload a Python (.py/.zip) or Java (.java/.jar/.zip) archive, configure the entry point and iterations, then start the analysis."],
  ["Analysis pipeline", "Preparing → Static Analysis → Runtime Analysis → Performance Analysis → Energy Estimation → Score Generation → Hotspot Detection → Recommendations → Completed. Code executes inside an isolated sandbox container."],
  ["Efficiency Score", "A 0–100 score composed of Performance Efficiency, Resource Efficiency, Code Quality and Energy Efficiency. The formula and weights are computed by the backend scoring service."],
  ["Green Score", "A 0–100 sustainability score reflecting estimated energy use and resource footprint per execution."],
  ["Energy measurement", "Energy is ESTIMATED from CPU, memory and I/O utilisation models. When the runner exposes hardware counters (e.g. Intel RAPL), values are labelled hardware-measured."],
  ["Analyses vs Reports", "Analyses hold the full technical detail of each run. Reports are final summaries of the important findings, suitable for export and sharing."],
  ["Data privacy", "Your source code is temporarily stored only for analysis and automatically removed after processing. The UI never permanently displays source code."],
  ["API integration", "Set VITE_API_BASE_URL to the FastAPI server. Services: authApi, projectApi, analysisApi, performanceApi, runtimeApi, staticAnalysisApi, complexityApi, energyApi, greenScoreApi, hotspotApi, recommendationApi, reportApi."],
];

export function DocsPage() {
  return (
    <>
      <PageHeader title="Documentation" description="How GreenCode measures and scores software." />
      <div className="grid max-w-4xl gap-3">{docs.map(([t, b]) => <Panel key={t} title={t}><p className="text-sm leading-relaxed text-muted-foreground">{b}</p></Panel>)}</div>
    </>
  );
}
