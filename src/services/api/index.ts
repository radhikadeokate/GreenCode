/**
 * API service layer. Each service currently resolves mock data; set
 * VITE_API_BASE_URL and swap the mock bodies for `http(...)` calls to connect
 * the FastAPI + PostgreSQL backend.
 */
import * as mock from "@/mock/data";
import type {
  Analysis, AnalysisDetail, CreateProjectInput, Project, Recommendation, Report,
} from "@/types";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
export const USE_MOCK = !API_BASE_URL;

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

const delay = <T,>(v: T, ms = 150) => new Promise<T>((res) => setTimeout(() => res(v), ms));
const findAnalysis = (id: string) => {
  const a = mock.analyses.find((x) => x.id === id);
  if (!a) throw new Error("Analysis not found");
  return a;
};

export const authApi = {
  me: () => (USE_MOCK ? delay({ id: "u1", name: "Aarav Sharma", email: "aarav@greencode.dev", role: "Engineer" }) : http("/auth/me")),
};

export const projectApi = {
  list: (): Promise<Project[]> => (USE_MOCK ? delay([...mock.projects]) : http("/projects")),
  get: (id: string): Promise<Project | undefined> => (USE_MOCK ? delay(mock.projects.find((p) => p.id === id)) : http(`/projects/${id}`)),
  create: async (input: CreateProjectInput, file?: File): Promise<Project> => {
    if (!USE_MOCK) {
      const fd = new FormData();
      fd.append("meta", JSON.stringify(input));
      if (file) fd.append("archive", file);
      const res = await fetch(`${API_BASE_URL}/projects`, { method: "POST", body: fd });
      return res.json();
    }
    const p: Project = { id: `p${Date.now()}`, name: input.name, language: input.language, description: input.description, lastAnalysis: new Date().toISOString(), efficiencyScore: 0, greenScore: 0, executionTimeMs: 0, energyJ: 0, issues: 0, status: "queued" };
    mock.projects.unshift(p);
    return delay(p);
  },
  remove: (id: string) => {
    if (!USE_MOCK) return http(`/projects/${id}`, { method: "DELETE" });
    const i = mock.projects.findIndex((p) => p.id === id);
    if (i >= 0) mock.projects.splice(i, 1);
    return delay(true);
  },
};

export const analysisApi = {
  list: (): Promise<Analysis[]> => (USE_MOCK ? delay([...mock.analyses]) : http("/analyses")),
  get: (id: string): Promise<AnalysisDetail> => (USE_MOCK ? delay(mock.makeDetail(findAnalysis(id))) : http(`/analyses/${id}`)),
  start: (projectId: string): Promise<{ analysisId: string }> =>
    USE_MOCK ? delay({ analysisId: mock.analyses[0].id }) : http(`/projects/${projectId}/analyses`, { method: "POST" }),
};

export const performanceApi = { trends: () => (USE_MOCK ? delay(mock.trend) : http<typeof mock.trend>("/performance/trends")) };
export const runtimeApi = { samples: (id: string) => analysisApi.get(id).then((d) => d.runtime) };
export const staticAnalysisApi = { quality: (id: string) => analysisApi.get(id).then((d) => d.quality) };
export const complexityApi = { get: (id: string) => analysisApi.get(id).then((d) => d.complexity) };
export const energyApi = { trends: () => (USE_MOCK ? delay(mock.trend) : http<typeof mock.trend>("/energy/trends")) };
export const greenScoreApi = { trends: () => performanceApi.trends() };
export const hotspotApi = { top: () => (USE_MOCK ? delay(mock.makeHotspots()) : http("/hotspots/top")) };
export const recommendationApi = {
  list: (): Promise<Recommendation[]> => (USE_MOCK ? delay([...mock.recommendations]) : http("/recommendations")),
};
export const reportApi = {
  list: (): Promise<Report[]> => (USE_MOCK ? delay([...mock.reports]) : http("/reports")),
  get: async (id: string) => {
    const reports = await reportApi.list();
    const report = reports.find((r) => r.id === id);
    if (!report) throw new Error("Report not found");
    const analysis = await analysisApi.get(report.analysisId);
    return { report, analysis };
  },
};
