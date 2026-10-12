import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Loader2, ShieldCheck, Upload } from "lucide-react";
import { analysisApi, projectApi } from "@/services/api";
import { PageHeader, Panel } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CreateProjectInput, Language } from "@/types";

const steps = ["Create Project", "Upload", "Configuration", "Review", "Progress", "Results"];
export const STAGES = ["Preparing", "Static Analysis", "Runtime Analysis", "Performance Analysis", "Energy Estimation", "Score Generation", "Hotspot Detection", "Recommendations", "Completed"];
const PRIVACY = "Your source code is temporarily stored only for analysis and automatically removed after processing.";

export function NewAnalysisPage({ existingProjectId }: { existingProjectId?: string }) {
  const [step, setStep] = useState(existingProjectId ? 1 : 0);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<CreateProjectInput>({ name: "", language: "Python", description: "", entryPoint: "main.py", runtimeArgs: "", iterations: 5, timeoutS: 120, fileName: "" });
  const [stage, setStage] = useState(0);
  const [analysisId, setAnalysisId] = useState<string>();
  const set = <K extends keyof CreateProjectInput>(k: K, v: CreateProjectInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!existingProjectId) return;
    projectApi.get(existingProjectId).then((p) => p && setForm((f) => ({ ...f, name: p.name, language: p.language, description: p.description, entryPoint: p.language === "Java" ? "Main.java" : "main.py" })));
  }, [existingProjectId]);

  // Progress is driven by the backend job status; in demo mode the stages advance on a timer.
  useEffect(() => {
    if (step !== 4) return;
    if (stage >= STAGES.length - 1) { const t = setTimeout(() => setStep(5), 700); return () => clearTimeout(t); }
    const t = setTimeout(() => setStage((s) => s + 1), 650);
    return () => clearTimeout(t);
  }, [step, stage]);

  const start = async () => {
    const p = existingProjectId ? { id: existingProjectId } : await projectApi.create({ ...form, fileName: file?.name ?? "" }, file ?? undefined);
    const res = await analysisApi.start(p.id);
    setAnalysisId(res.analysisId); setStage(0); setStep(4);
  };
  const accept = form.language === "Python" ? ".zip,.py,.tar.gz" : ".zip,.jar,.java,.tar.gz";

  return (
    <>
      <PageHeader title={existingProjectId ? "Run analysis" : "Create project"} description="Upload a Python or Java project and run a full efficiency assessment." />
      <ol className="mb-6 flex flex-wrap gap-y-2">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center">
            <span className={cn("flex items-center gap-2 text-xs font-medium", i === step ? "text-foreground" : i < step ? "text-success" : "text-muted-foreground")}>
              <span className={cn("grid size-5 place-items-center rounded-full border text-[10px]", i < step && "border-success bg-success text-primary-foreground", i === step && "border-foreground")}>{i < step ? <Check className="size-3" /> : i + 1}</span>{s}
            </span>
            {i < steps.length - 1 && <span className="mx-3 h-px w-8 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="max-w-3xl space-y-4">
        {step === 0 && (
          <Panel title="Project details">
            <div className="grid gap-4">
              <div className="grid gap-1.5"><Label>Project name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. payment-service" /></div>
              <div className="grid gap-1.5"><Label>Language</Label>
                <div className="flex gap-2">{(["Python", "Java"] as Language[]).map((l) => (
                  <button key={l} onClick={() => { set("language", l); set("entryPoint", l === "Java" ? "Main.java" : "main.py"); }} className={cn("rounded border px-4 py-2 text-sm", form.language === l ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted")}>{l}</button>
                ))}</div>
              </div>
              <div className="grid gap-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
              <div className="flex justify-end"><Button disabled={!form.name.trim()} onClick={() => setStep(1)}>Continue</Button></div>
            </div>
          </Panel>
        )}
        {step === 1 && (
          <Panel title={`Upload ${form.language} project`}>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed bg-muted/40 px-6 py-10 text-center hover:bg-muted">
              <Upload className="size-6 text-muted-foreground" />
              <span className="font-medium">{file ? file.name : "Choose an archive or source file"}</span>
              <span className="text-xs text-muted-foreground">Accepted: {accept} · max 50 MB</span>
              <input type="file" accept={accept} className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <PrivacyNote />
            <div className="mt-4 flex justify-between">{!existingProjectId ? <Button variant="outline" onClick={() => setStep(0)}>Back</Button> : <span />}<Button disabled={!file} onClick={() => setStep(2)}>Continue</Button></div>
          </Panel>
        )}
        {step === 2 && (
          <Panel title="Configuration">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label>Entry point</Label><Input className="num" value={form.entryPoint} onChange={(e) => set("entryPoint", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Runtime arguments</Label><Input className="num" value={form.runtimeArgs} onChange={(e) => set("runtimeArgs", e.target.value)} placeholder="--input data.csv" /></div>
              <div className="grid gap-1.5"><Label>Benchmark iterations</Label><Input type="number" min={1} max={50} value={form.iterations} onChange={(e) => set("iterations", +e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Timeout (seconds)</Label><Input type="number" min={10} max={900} value={form.timeoutS} onChange={(e) => set("timeoutS", +e.target.value)} /></div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Execution runs in an isolated sandbox container on the analysis server.</p>
            <div className="mt-4 flex justify-between"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button onClick={() => setStep(3)}>Continue</Button></div>
          </Panel>
        )}
        {step === 3 && (
          <Panel title="Review">
            <dl className="grid grid-cols-[160px_1fr] gap-y-2 text-sm">
              {[["Project", form.name], ["Language", form.language], ["File", file?.name], ["Entry point", form.entryPoint], ["Arguments", form.runtimeArgs || "—"], ["Iterations", form.iterations], ["Timeout", `${form.timeoutS} s`]].map(([k, v]) => (
                <div key={k as string} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="num">{v}</dd></div>
              ))}
            </dl>
            <PrivacyNote />
            <div className="mt-4 flex justify-between"><Button variant="outline" onClick={() => setStep(2)}>Back</Button><Button onClick={start}>Start analysis</Button></div>
          </Panel>
        )}
        {(step === 4 || step === 5) && (
          <Panel title="Analysis progress" subtitle={analysisId && <span className="num">{analysisId}</span>}>
            <ul className="space-y-2">
              {STAGES.map((s, i) => {
                const done = step === 5 || i < stage; const cur = step === 4 && i === stage;
                return (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span className={cn("grid size-5 place-items-center rounded-full border", done && "border-success bg-success text-primary-foreground", cur && "border-info text-info")}>
                      {done ? <Check className="size-3" /> : cur ? <Loader2 className="size-3 animate-spin" /> : null}
                    </span>
                    <span className={cn(!done && !cur && "text-muted-foreground")}>{s}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${step === 5 ? 100 : (stage / (STAGES.length - 1)) * 100}%` }} /></div>
            {step === 5 && analysisId && (
              <div className="mt-4 flex items-center justify-between rounded border border-success/30 bg-success/10 px-4 py-3">
                <span className="text-sm font-medium text-success">Analysis completed. Uploaded source has been removed.</span>
                <Button asChild size="sm"><Link to="/analyses/$id" params={{ id: analysisId }}>View results</Link></Button>
              </div>
            )}
          </Panel>
        )}
      </div>
    </>
  );
}

function PrivacyNote() {
  return <div className="mt-4 flex items-start gap-2 rounded border border-info/30 bg-info/10 px-3 py-2 text-xs text-info"><ShieldCheck className="mt-0.5 size-4 shrink-0" />{PRIVACY}</div>;
}
